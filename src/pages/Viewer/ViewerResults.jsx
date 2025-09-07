import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../../ZeroClickApp/lib/api';

export default function ViewerResults() {
  const [me, setMe] = useState(null);
  const [overview, setOverview] = useState([]);
  const [activeBatchId, setActiveBatchId] = useState(null);
  const [batchData, setBatchData] = useState({});
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [reason, setReason] = useState('');
  const [weekStart, setWeekStart] = useState(() => new Date(Date.now()-7*24*3600*1000).toISOString().slice(0,10));
  const [weekEnd, setWeekEnd] = useState(() => new Date().toISOString().slice(0,10));

  useEffect(() => {
    (async () => {
      try {
        const m = await api.viewerMe();
        setMe(m);
        const ov = await api.viewerOverview();
        setOverview(ov);
        setActiveBatchId(ov[0]?._id || null);
      } catch (e) {
        setErr('Accès refusé ou expiré');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (!activeBatchId || batchData[activeBatchId]) return;
      try {
        const d = await api.viewerBatchResults(activeBatchId);
        setBatchData((s) => ({ ...s, [activeBatchId]: d }));
      } catch (e) {
        // ignore
      }
    })();
  }, [activeBatchId, batchData]);

  const rows = batchData[activeBatchId]?.rows || [];

  if (loading) return null;
  if (err) return <div className="min-h-screen flex items-center justify-center text-red-600">{err}</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <header className="bg-white rounded-xl shadow p-4 mb-4 flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-500">Entreprise</div>
            <div className="text-lg font-semibold text-gray-800">{me?.tenantName || me?.tenantId}</div>
          </div>
          <a
            href={api.viewerWeeklyCsvUrl(weekStart, weekEnd)}
            className="px-3 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700"
          >Exporter CSV (7j)</a>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <aside className="bg-white rounded-xl shadow p-3 md:col-span-1">
            <div className="text-sm font-medium text-gray-800 mb-2">Campagnes</div>
            <div className="space-y-2 max-h-[70vh] overflow-auto pr-1">
              {overview.map((b) => (
                <div
                  key={b._id}
                  onClick={() => setActiveBatchId(b._id)}
                  className={`p-3 rounded-lg border cursor-pointer ${activeBatchId===b._id? 'border-blue-500 bg-blue-50':'border-gray-200 hover:border-gray-300'}`}
                >
                  <div className="font-medium text-gray-900">{b.name}</div>
                  <div className="text-xs text-gray-500">{new Date(b.dateCreated).toLocaleDateString('fr-FR')}</div>
                  <div className="text-xs text-gray-600 mt-1">{b.clickCount} clics</div>
                </div>
              ))}
              {overview.length===0 && <div className="text-gray-500 text-sm">Aucune campagne</div>}
            </div>
            <div className="mt-4 border-t pt-3">
              <div className="text-sm font-medium text-gray-800 mb-1">Arrêter la simulation</div>
              <textarea className="w-full border rounded p-2 text-sm" rows={3} placeholder="Message optionnel à l'équipe support" value={reason} onChange={(e)=>setReason(e.target.value)} />
              <button
                onClick={async ()=>{ try{ await api.viewerStop(reason); alert('Demande envoyée à support@zeroclick.tech'); } catch { alert('Erreur envoi de la demande'); } }}
                className="w-full mt-2 px-3 py-2 rounded-lg bg-red-600 text-white text-sm hover:bg-red-700"
              >Arrêter la simulation</button>
            </div>
          </aside>

          <main className="md:col-span-2 bg-white rounded-xl shadow p-4">
            <div className="text-lg font-semibold text-gray-800 mb-3">Détails des clics</div>
            {!activeBatchId && <div className="text-gray-500">Choisissez une campagne</div>}
            {activeBatchId && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left p-2">Département</th>
                      <th className="text-left p-2">Employés (clics)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => (
                      <tr key={r.department} className="border-t">
                        <td className="p-2 align-top font-medium">{r.department}</td>
                        <td className="p-2">
                          <ul className="space-y-1">
                            {(r.employees||[]).map((e) => (
                              <li key={e._id} className="text-gray-700">
                                <span className="font-medium">{e.name}</span>
                                <span className="text-gray-500"> · {e.email}</span>
                                <span className="text-gray-500"> · {e.firstClickAt ? new Date(e.firstClickAt).toLocaleString('fr-FR') : '—'}</span>
                                <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${e.trainingCompleted? 'bg-emerald-100 text-emerald-700':'bg-gray-100 text-gray-700'}`}>{e.trainingCompleted? 'Formé' : 'Non formé'}</span>
                              </li>
                            ))}
                          </ul>
                        </td>
                      </tr>
                    ))}
                    {rows.length===0 && (
                      <tr><td colSpan={2} className="p-4 text-center text-gray-500">Aucun clic</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

