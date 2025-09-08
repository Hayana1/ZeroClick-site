import React, { useEffect, useState } from 'react';
import { useTenantStore } from '../store/useTenantStore';
import { api } from '../lib/api';

export default function Drafts() {
  const { tenantId, fetchTenants, tenants } = useTenantStore();
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [preview, setPreview] = useState(null);

  useEffect(() => { fetchTenants(); }, [fetchTenants]);
  useEffect(() => { (async()=>{
    if (!tenantId) return;
    setLoading(true);
    try { setDrafts(await api.listDrafts(tenantId)); } catch(e){ setErr(e?.message||'Erreur'); }
    finally { setLoading(false); }
  })(); }, [tenantId]);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-sm text-gray-600">Entreprise</div>
            <div className="text-lg font-semibold text-gray-900">{tenants.find(t=>t._id===tenantId)?.name || '—'}</div>
          </div>
        </div>

        {loading ? null : err ? (
          <div className="text-red-600">{err}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {drafts.map(d => (
              <div key={d._id} className="bg-white rounded-xl shadow p-4 border">
                <div className="text-xs text-gray-500">Brouillon</div>
                <div className="font-semibold text-gray-900">{d.title || 'Scénario'}</div>
                <div className="text-xs text-gray-500 mt-1">Status: {d.status}</div>
                <div className="text-gray-700 text-sm mt-2 line-clamp-3">{d.summary}</div>
                <div className="mt-3 flex gap-2">
                  <button onClick={()=> setPreview(d)} className="px-3 py-1.5 text-sm rounded bg-white border hover:bg-gray-50">Aperçu</button>
                  {d.status !== 'approved' && (
                    <button onClick={async ()=>{ try{ await api.approveDraft(d._id); alert('Formation générée'); setDrafts(await api.listDrafts(tenantId)); } catch{ alert('Erreur approbation'); } }} className="px-3 py-1.5 text-sm rounded bg-emerald-600 text-white hover:bg-emerald-700">Approuver</button>
                  )}
                </div>
              </div>
            ))}
            {drafts.length===0 && <div className="text-gray-500">Aucun brouillon</div>}
          </div>
        )}

        {preview && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4" onClick={()=> setPreview(null)}>
            <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[85vh] overflow-auto p-4" onClick={(e)=> e.stopPropagation()}>
              <div className="flex items-center justify-between mb-3">
                <div className="font-semibold text-gray-900">{preview.title}</div>
                <button onClick={()=> setPreview(null)} className="px-3 py-1 bg-gray-100 rounded">Fermer</button>
              </div>
              <div className="text-sm text-gray-600 mb-2">Sujet: {preview.email?.subject}</div>
              <div className="border rounded p-3">
                <div dangerouslySetInnerHTML={{ __html: preview.email?.html || '' }} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

