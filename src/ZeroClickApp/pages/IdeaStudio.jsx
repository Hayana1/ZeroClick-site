import React, { useEffect, useMemo, useState } from 'react';
import { useTenantStore } from '../store/useTenantStore';
import { api } from '../lib/api';

export default function IdeaStudio() {
  const { tenantId, fetchTenants, tenants } = useTenantStore();
  const [intel, setIntel] = useState([]);
  const [sel, setSel] = useState({ departments: [], role: '', tone: 'neutre', risk: 'moyen', count: 8, intelIds: [] });
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [newIntel, setNewIntel] = useState({ title: '', source: '', url: '', tags: '', content: '' });
  const [urlsText, setUrlsText] = useState('');
  const [pasteText, setPasteText] = useState('');
  const [knowledge, setKnowledge] = useState(null);
  const [scrapeUrl, setScrapeUrl] = useState('');
  const [scrapeMax, setScrapeMax] = useState(8);
  const [webQuery, setWebQuery] = useState('');
  const [webResults, setWebResults] = useState([]);
  const [useFresh, setUseFresh] = useState(true);
  const [pulse, setPulse] = useState([]);

  useEffect(() => { fetchTenants(); }, [fetchTenants]);
  useEffect(() => { (async ()=>{ if (!tenantId) return; try { const it = await api.listIntel(tenantId); setIntel(it); const k = await api.getKnowledge(tenantId); setKnowledge(k); } catch {} })(); }, [tenantId]);
  useEffect(() => { (async ()=>{ if (!tenantId) return; try { const p = await api.getPulse(tenantId); setPulse(p.items||[]); } catch {} })(); }, [tenantId]);

  const toggleIntel = (id) => setSel(s => ({ ...s, intelIds: s.intelIds.includes(id) ? s.intelIds.filter(x => x!==id) : [...s.intelIds, id] }));

  const [factsUnique, setFactsUnique] = useState(true);
  const [distribDept, setDistribDept] = useState(true);
  const [useRag, setUseRag] = useState(true);
  const [persona, setPersona] = useState('external');
  const [seed, setSeed] = useState('');

  const onGenerate = async () => {
    if (!tenantId) return;
    setLoading(true); setError(''); setIdeas([]);
    try {
      const r = await api.generateIdeas(tenantId, {
        departments: sel.departments,
        role: sel.role,
        tone: sel.tone,
        risk: sel.risk,
        count: sel.count,
        intelIds: sel.intelIds,
        factsUnique,
        distributeByDept: distribDept,
        useRag,
        persona,
        seed: seed ? Number(seed) : undefined,
        useFreshness: useFresh,
      });
      setIdeas(r.ideas || []);
    } catch (e) {
      setError(e?.message || 'Erreur génération');
    } finally { setLoading(false); }
  };

  const onAddIntel = async (e) => {
    e.preventDefault();
    if (!tenantId) return;
    try {
      const body = { ...newIntel, tags: newIntel.tags ? newIntel.tags.split(',').map(s=>s.trim()).filter(Boolean) : [] };
      const created = await api.addIntel(tenantId, body);
      setIntel([created, ...intel]);
      setNewIntel({ title: '', source: '', url: '', tags: '', content: '' });
    } catch (e) {
      alert('Erreur ajout intel');
    }
  };

  const onImportUrls = async (e) => {
    e.preventDefault();
    if (!tenantId) return;
    const urls = urlsText.split(/\n|,|;+/).map(s=>s.trim()).filter(Boolean);
    if (!urls.length) return;
    setLoading(true);
    try {
      const r = await api.importIntelUrls(tenantId, urls);
      const createdIds = (r.imported||[]).filter(x=>x.ok).map(x=>x._id);
      if (createdIds.length) {
        const it = await api.listIntel(tenantId);
        setIntel(it);
        setSel(s=> ({...s, intelIds: [...new Set([...s.intelIds, ...createdIds])] }));
      }
      setUrlsText('');
    } catch {
      alert('Import URLs échoué');
    } finally { setLoading(false); }
  };

  const onImportText = async (e) => {
    e.preventDefault();
    if (!tenantId || !pasteText.trim()) return;
    setLoading(true);
    try {
      const created = await api.importIntelText(tenantId, { content: pasteText });
      setIntel([created, ...intel]);
      setSel(s=> ({...s, intelIds: [...new Set([...s.intelIds, created._id])] }));
      setPasteText('');
    } catch {
      alert('Import texte échoué');
    } finally { setLoading(false); }
  };

  const onBuildKnowledge = async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      const k = await api.buildKnowledge(tenantId, 12);
      setKnowledge(k);
    } catch {
      alert('Synthèse échouée');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
        <aside className="bg-white rounded-xl shadow p-4 md:col-span-1">
          <div className="text-sm text-gray-600">Entreprise</div>
          <div className="font-semibold text-gray-900 mb-3">{tenants.find(t=>t._id===tenantId)?.name || '—'}</div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-600">Départements (séparés par virgules)</label>
              <input className="w-full border rounded px-2 py-1" placeholder="RH, IT, Finance" value={sel.departments.join(', ')} onChange={(e)=> setSel(s=> ({...s, departments: e.target.value.split(',').map(x=>x.trim()).filter(Boolean)}))} />
            </div>
            <div>
              <label className="block text-xs text-gray-600">Rôle / Poste</label>
              <input className="w-full border rounded px-2 py-1" value={sel.role} onChange={(e)=> setSel(s=> ({...s, role: e.target.value}))} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-600">Ton</label>
                <select className="w-full border rounded px-2 py-1" value={sel.tone} onChange={(e)=> setSel(s=> ({...s, tone: e.target.value}))}>
                  <option>neutre</option>
                  <option>pro</option>
                  <option>urgent</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-600">Risque</label>
                <select className="w-full border rounded px-2 py-1" value={sel.risk} onChange={(e)=> setSel(s=> ({...s, risk: e.target.value}))}>
                  <option>bas</option>
                  <option>moyen</option>
                  <option>élevé</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-600">Nombre d'idées</label>
              <input type="number" min={1} max={20} className="w-full border rounded px-2 py-1" value={sel.count} onChange={(e)=> setSel(s=> ({...s, count: Number(e.target.value||8)}))} />
            </div>

            <div className="mt-3">
              <div className="text-sm font-medium text-gray-800 mb-1">Sélection Intel</div>
              <div className="max-h-40 overflow-auto border rounded">
                {intel.map(it => (
                  <label key={it._id} className="flex items-start gap-2 p-2 border-b last:border-b-0 text-sm">
                    <input type="checkbox" checked={sel.intelIds.includes(it._id)} onChange={()=> toggleIntel(it._id)} />
                    <div>
                      <div className="font-medium text-gray-800">{it.title || it.source || 'Note'}</div>
                      <div className="text-gray-500 text-xs truncate max-w-[220px]">{it.content}</div>
                    </div>
                  </label>
                ))}
                {intel.length===0 && <div className="p-2 text-gray-500 text-sm">Aucune note encore</div>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-2 text-xs text-gray-700">
              <div className="flex items-center gap-2">
                <label className="text-gray-600">Persona</label>
                <select className="border rounded px-2 py-1" value={persona} onChange={(e)=> setPersona(e.target.value)}>
                  <option value="external">Externe</option>
                  <option value="internal">Interne</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-gray-600">Seed</label>
                <input className="border rounded px-2 py-1 w-full" placeholder="aléatoire" value={seed} onChange={(e)=> setSeed(e.target.value)} />
              </div>
            </div>

            <div className="flex items-center gap-3 mt-2 text-xs text-gray-700">
              <label className="inline-flex items-center gap-1"><input type="checkbox" checked={factsUnique} onChange={(e)=> setFactsUnique(e.target.checked)} /> Faits uniques</label>
              <label className="inline-flex items-center gap-1"><input type="checkbox" checked={distribDept} onChange={(e)=> setDistribDept(e.target.checked)} /> Répartir par département</label>
              <label className="inline-flex items-center gap-1"><input type="checkbox" checked={useRag} onChange={(e)=> setUseRag(e.target.checked)} /> RAG (Intel auto)</label>
              <label className="inline-flex items-center gap-1"><input type="checkbox" checked={useFresh} onChange={(e)=> setUseFresh(e.target.checked)} /> Fraîcheur (news)</label>
            </div>

            <button
              onClick={async ()=>{ if (!tenantId) return; setLoading(true); try { const r = await api.embedIntel(tenantId, 100); alert(`Embeddings: ${r.embedded||0} item(s)`); } catch { alert('Embeddings échoués'); } finally { setLoading(false); } }}
              className="w-full bg-gray-900 hover:bg-black text-white rounded-lg py-2 mt-2"
            >Indexer l'intel (RAG)</button>

            <button onClick={onGenerate} disabled={loading || !tenantId} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg py-2 mt-2 disabled:opacity-60">
              {loading ? 'Génération…' : 'Générer des idées'}
            </button>

            {error && <div className="text-red-600 text-sm mt-2">{error}</div>}

            <form onSubmit={onAddIntel} className="mt-4 border-t pt-3 space-y-2">
              <div className="text-sm font-medium text-gray-800">Ajouter une note</div>
              <input className="w-full border rounded px-2 py-1" placeholder="Titre" value={newIntel.title} onChange={(e)=> setNewIntel(s=> ({...s, title: e.target.value}))} />
              <input className="w-full border rounded px-2 py-1" placeholder="Source (LinkedIn, Site…)" value={newIntel.source} onChange={(e)=> setNewIntel(s=> ({...s, source: e.target.value}))} />
              <input className="w-full border rounded px-2 py-1" placeholder="URL" value={newIntel.url} onChange={(e)=> setNewIntel(s=> ({...s, url: e.target.value}))} />
              <input className="w-full border rounded px-2 py-1" placeholder="Tags (virgules)" value={newIntel.tags} onChange={(e)=> setNewIntel(s=> ({...s, tags: e.target.value}))} />
              <textarea className="w-full border rounded px-2 py-1" rows={3} placeholder="Contenu / notes" value={newIntel.content} onChange={(e)=> setNewIntel(s=> ({...s, content: e.target.value}))} />
              <button className="w-full bg-gray-800 hover:bg-black text-white rounded-lg py-2">Ajouter</button>
            </form>

            <div className="mt-4 border-t pt-3 space-y-2">
              <div className="text-sm font-medium text-gray-800">Importer par URLs</div>
              <textarea className="w-full border rounded px-2 py-1" rows={3} placeholder="https://exemple.com\nhttps://linkedin.com/..." value={urlsText} onChange={(e)=> setUrlsText(e.target.value)} />
              <button onClick={onImportUrls} className="w-full bg-gray-700 hover:bg-gray-800 text-white rounded-lg py-2">Importer</button>
            </div>

            <div className="mt-4 border-t pt-3 space-y-2">
              <div className="text-sm font-medium text-gray-800">Coller du texte brut</div>
              <textarea className="w-full border rounded px-2 py-1" rows={4} placeholder="Collez ici des infos de la société (procédures, annonces, outils…)" value={pasteText} onChange={(e)=> setPasteText(e.target.value)} />
              <button onClick={onImportText} className="w-full bg-gray-700 hover:bg-gray-800 text-white rounded-lg py-2">Ajouter</button>
            </div>

            <div className="mt-4 border-t pt-3 space-y-2">
              <div className="text-sm font-medium text-gray-800">Scraper un site</div>
              <input className="w-full border rounded px-2 py-1" placeholder="https://www.societe.com" value={scrapeUrl} onChange={(e)=> setScrapeUrl(e.target.value)} />
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <label>Pages max</label>
                <input type="number" min={1} max={25} className="w-20 border rounded px-2 py-1" value={scrapeMax} onChange={(e)=> setScrapeMax(Number(e.target.value||8))} />
              </div>
              <button
                onClick={async ()=>{
                  if (!tenantId || !scrapeUrl) return;
                  setLoading(true);
                  try {
                    const r = await api.scrapeSite(tenantId, { url: scrapeUrl, maxPages: scrapeMax });
                    const it = await api.listIntel(tenantId);
                    setIntel(it);
                    alert(`${r.count||0} page(s) importée(s)`);
                  } catch { alert('Scrape échoué'); } finally { setLoading(false); }
                }}
                className="w-full bg-gray-700 hover:bg-gray-800 text-white rounded-lg py-2"
              >Lancer</button>
            </div>

            <div className="mt-4 border-t pt-3 space-y-2">
              <div className="text-sm font-medium text-gray-800">Recherche web (inspiration)</div>
              <input className="w-full border rounded px-2 py-1" placeholder="mot-clé + entreprise (ex: AHQ webinaire politique)" value={webQuery} onChange={(e)=> setWebQuery(e.target.value)} />
              <div className="flex gap-2">
                <button
                  onClick={async ()=>{
                    if (!tenantId || !webQuery.trim()) return;
                    setLoading(true);
                    try { const r = await api.discoverSearch(tenantId, webQuery, 10); setWebResults(r.results||[]); }
                    catch { alert('Recherche échouée'); }
                    finally { setLoading(false); }
                  }}
                  className="flex-1 bg-gray-700 hover:bg-gray-800 text-white rounded-lg py-2"
                >Chercher</button>
                <button
                  onClick={async ()=>{
                    if (!tenantId || !webResults.length) return;
                    try {
                      const urls = webResults.map(r=>r.url);
                      await api.importIntelUrls(tenantId, urls);
                      const it = await api.listIntel(tenantId);
                      setIntel(it);
                      alert(`${urls.length} source(s) importée(s)`);
                    } catch { alert('Import découverte échoué'); }
                  }}
                  className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
                >Tout importer</button>
              </div>
              <div className="max-h-40 overflow-auto border rounded">
                {webResults.map((r,i)=>(
                  <div key={i} className="p-2 border-b text-xs">
                    <div className="font-medium text-gray-800 truncate">{r.title}</div>
                    <div className="text-gray-500 truncate">{r.url}</div>
                  </div>
                ))}
                {(!webResults || !webResults.length) && <div className="p-2 text-gray-500 text-sm">Aucun résultat pour l'instant.</div>}
              </div>
              <div className="mt-2 text-xs text-gray-600">News récentes</div>
              <div className="max-h-28 overflow-auto border rounded">
                {(pulse||[]).slice(0,8).map((p,i)=>(
                  <div key={i} className="p-2 border-b text-xs">
                    <div className="font-medium text-gray-800 truncate">{p.title}</div>
                  </div>
                ))}
                {(pulse||[]).length===0 && <div className="p-2 text-gray-500 text-sm">Aucune news. Rafraîchir ci-dessous.</div>}
              </div>
              <button
                onClick={async ()=>{ if (!tenantId) return; setLoading(true); try { const r = await api.refreshPulse(tenantId, (tenants.find(t=>t._id===tenantId)?.name||''), 7); setPulse(r.items||[]); } catch { alert('Refresh news échoué'); } finally { setLoading(false); } }}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg py-2"
              >Rafraîchir news (7 jours)</button>
            </div>

            <div className="mt-4 border-t pt-3">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-gray-800">Connaissance entreprise</div>
                <button onClick={onBuildKnowledge} className="px-2 py-1 text-xs rounded bg-emerald-600 text-white hover:bg-emerald-700">Synthétiser</button>
              </div>
              <div className="mt-2 text-xs text-gray-700 whitespace-pre-wrap max-h-40 overflow-auto border rounded p-2 bg-gray-50">
                {knowledge?.summary ? knowledge.summary : 'Pas encore de synthèse.'}
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {(knowledge?.keyFacts||[]).map((k, i) => (
                  <span key={i} className="px-2 py-0.5 text-xs rounded-full bg-emerald-100 text-emerald-700">{k}</span>
                ))}
              </div>
            </div>
          </div>
        </aside>

        <main className="md:col-span-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {ideas.map((idea, idx) => (
              <div key={idx} className="bg-white rounded-xl shadow p-4 border border-gray-100">
                <div className="text-sm text-gray-500">Idée #{idx+1}</div>
                <div className="font-semibold text-gray-900 mt-1">{idea.title}</div>
                <div className="text-gray-700 text-sm mt-2">{idea.summary}</div>
                <div className="flex flex-wrap gap-1 mt-3">
                  {(idea.departments||sel.departments||[]).slice(0,4).map((d,i)=>(<span key={i} className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700">{d}</span>))}
                  {idea.risk && (<span className="px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-700">risque: {idea.risk}</span>)}
                  {Array.isArray(idea.badges) && idea.badges.map((b,i)=>(<span key={`b-${i}`} className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700">{b}</span>))}
                </div>
                <div className="text-xs text-gray-500 mt-3">Canal: {idea.channel}</div>
                <div className="mt-3 flex gap-2">
                  <button className="px-3 py-1.5 text-sm rounded-lg bg-white border hover:bg-gray-50"
                    onClick={async ()=>{
                      try {
                        const v = await api.variantIdea(tenantId, idea, { persona, department: (idea.departments||sel.departments||['Tous'])[0], tone: sel.tone });
                        setIdeas((arr)=> [v.idea, ...arr]);
                      } catch { alert('Variante échouée'); }
                    }}
                  >Varier</button>
                  <button
                    onClick={async ()=>{
                      try {
                        if (!tenantId) return;
                        const payload = { idea, intelIds: sel.intelIds, tone: sel.tone, risk: sel.risk, persona };
                        const draft = await api.developScenario(tenantId, payload);
                        alert('Brouillon créé: ' + (draft.title || 'Scénario'));
                      } catch (e) { alert('Échec développement'); }
                    }}
                    className="px-3 py-1.5 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                  >
                    Développer en brouillon
                  </button>
                </div>
              </div>
            ))}
            {!ideas.length && (
              <div className="text-gray-500 text-sm">Aucune idée pour l'instant. Ajoute quelques notes et lance une génération.</div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
