// backend/routes/ideas.js
const express = require('express');
const mongoose = require('mongoose');
const IntelItem = require('../models/IntelItem');
const TenantKnowledge = require('../models/TenantKnowledge');
const Tenant = require('../models/Tenant');
const { hashKey, getAiCache, setAiCache } = require('../utils/aicache');
const { requireAuth } = require('../middleware/requireAuth');

const router = express.Router({ mergeParams: true });
const { createRateLimiter } = require('../middleware/rateLimit');
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

function mulberry32(seed) {
  let t = seed >>> 0;
  return function() {
    t += 0x6D2B79F5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffleWith(rng, arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

router.post('/tenants/:tenantId/ideas:generate', requireAuth, createRateLimiter({ windowMs: 60_000, limit: 20, key: 'ideas-gen' }), async (req, res) => {
  try {
    const { tenantId } = req.params;
    if (!isValidId(tenantId)) return res.status(400).json({ error: 'tenantId invalide' });
    const { departments = [], role = '', tone = 'neutre', risk = 'moyen', count = 8, intelIds = [],
      factsUnique = true, distributeByDept = true, persona = 'external', seed, maxPerDept = 100 } = req.body || {};
    const limit = Math.max(1, Math.min(Number(count) || 8, 20));
    let intel = await IntelItem.find({ tenantId, ...(Array.isArray(intelIds) && intelIds.length ? { _id: { $in: intelIds } } : {}) })
      .sort({ addedAt: -1 })
      .limit(200)
      .lean();
  const knowledge = await TenantKnowledge.findOne({ tenantId }).lean();
    const tenant = await Tenant.findById(tenantId, { name: 1 }).lean();
    // Freshness pulse (recent news) to boost originality
    let pulseFacts = [];
    try {
      const PulseItem = require('../models/PulseItem');
      const since = new Date(Date.now() - 14*24*3600*1000);
      const pulse = await PulseItem.find({ tenantId, publishedAt: { $gte: since } }).sort({ publishedAt: -1 }).limit(30).lean();
      pulseFacts = pulse.map(p => p.title).filter(Boolean).slice(0, 20);
    } catch {}

    // Optional RAG: if embeddings exist and body.useRag !== false, pick top-K most relevant intel
  const useRag = req.body?.useRag !== false;
    if (useRag && intel.some(x => Array.isArray(x.embedding) && x.embedding.length)) {
      try {
        const { embedTexts, cosine } = require('../utils/embeddings');
        const q = [
          `Entreprise ${tenant?.name || ''}`,
          `Départements: ${(departments||[]).join(', ')}`,
          `Rôle: ${role || ''}`,
          `Ton: ${tone}`,
          `Risque: ${risk}`,
          `Connaissance: ${(knowledge?.summary || '')} ${(knowledge?.keyFacts||[]).join(' ')}`,
        ].join('\n');
        const [qVec] = await embedTexts([q]);
        const scored = intel
          .filter(x => Array.isArray(x.embedding) && x.embedding.length)
          .map(x => ({ ...x, _score: cosine(qVec, x.embedding) }));
        scored.sort((a,b) => b._score - a._score);
        intel = scored.slice(0, Math.max(6, Math.min(14, limit)))
          .map(({ _score, embedding, ...rest }) => rest);
      } catch (e) {
        // ignore RAG failure
      }
    }

    // If OpenAI key present, bias the model to enforce creativity/diversity with a seed hint
    const diversityHint = `Semence: ${seed || Math.floor(Math.random()*1e9)}. Favorise des approches différentes (agenda, sécurité, facture, webinaire, partenaire tiers, RGPD, paie), varie le ton (neutre/pro/urgent) sans répétition.`;

    const apiKey = process.env.OPENAI_API_KEY;
    const model = process.env.AI_MODEL || 'gpt-4o-mini';
    if (!apiKey) {
      // Fallback mock ideas without external call — generate diverse templates
      const deptList = (departments && departments.length ? departments.map(s=>String(s).trim()).filter(Boolean) : ['RH','IT','Finance','Com','Ops','Direction']).slice(0, 8);
      const topicsExternal = [
        { t: 'Invitation à webinaire partenaire', ch: 'email+video', badges: ['YouTube factice'] },
        { t: 'Renouvellement d\'abonnement SaaS', ch: 'email+pdf', badges: ['PDF facture'] },
        { t: 'Approbation fournisseur / bon de commande', ch: 'email+drive', badges: ['Drive factice'] },
        { t: 'Créneau de démo (Calendly)', ch: 'email+calendar', badges: ['Calendly factice'] },
        { t: 'Alerte de sécurité (portail tiers)', ch: 'email+internal', badges: ['Portail externe factice'] },
        { t: 'Mise à jour RGPD par le cabinet', ch: 'email+pdf', badges: ['PDF conformité'] },
        { t: 'Demande d\'avis client (partenaire)', ch: 'email+form', badges: ['Formulaire factice'] },
        { t: 'Validation d\'accès Teams/SharePoint (partenaire)', ch: 'email+internal', badges: ['Portail externe factice'] },
        { t: 'Offre emploi partenaire / cooptation', ch: 'email+drive', badges: ['Drive factice'] },
        { t: 'Changement d\'horaires prestataire', ch: 'email+calendar', badges: ['Calendly factice'] },
      ];
      const topicsInternal = [
        { t: 'Invitation à une visio interne', ch: 'email+video', badges: ['YouTube factice'] },
        { t: 'Nouvelle politique à signer', ch: 'email+pdf', badges: ['PDF politique'] },
        { t: 'Mise à jour fiche de paie', ch: 'email+drive', badges: ['Drive factice'] },
        { t: 'Enquête interne de satisfaction', ch: 'email+form', badges: ['Formulaire factice'] },
        { t: 'Changement de planning / astreinte', ch: 'email+calendar', badges: ['Calendly factice'] },
      ];
      const topics = persona === 'external' ? topicsExternal : topicsInternal;
      const synthPhrases = [
        (dept, brand, fact) => `Message ${dept} pour ${brand}. Focus: ${fact}.`,
        (dept, brand, fact) => `Action requise (${dept}) – ${fact}.`,
        (dept, brand, fact) => `Information ${dept} liée à ${brand}: ${fact}.`,
        (dept, brand, fact) => `Annonce ${dept}: ${fact}.`,
      ];
      const rng = mulberry32(Number.isFinite(Number(seed)) ? Number(seed) : Math.floor(Math.random()*1e9));
      const topicsShuffled = shuffleWith(rng, topics);
      const deptsShuffled = shuffleWith(rng, deptList);
      const intelTitles = (intel || []).map(x => x.title).filter(Boolean);
      const intelText = (intel || []).map(x => `${x.title} ${x.source} ${x.content}`).join(' ').slice(0, 600);
      const facts = (knowledge?.keyFacts || []).filter(s => s && !/^import:|^scrape$/i.test(s) && s.length > 4).slice(0, 8);
      const fresh = pulseFacts.slice(0, 6);
      const brand = tenant?.name || 'l’entreprise';
      const toneHint = tone === 'urgent' ? 'IMPORTANT' : tone === 'pro' ? 'Professionnel' : 'Neutre';
      const riskHint = risk;
      const ideas = [];
      const usedFacts = new Set();
      const perDeptCount = Object.create(null);
      for (let i = 0; i < limit; i++) {
        const topic = topicsShuffled[i % topicsShuffled.length];
        let dept = distributeByDept ? deptsShuffled[i % deptsShuffled.length] : (deptsShuffled[0] || 'Tous');
        if ((perDeptCount[dept] || 0) >= maxPerDept) {
          // pick another with capacity
          const candidate = deptsShuffled.find(d => (perDeptCount[d]||0) < maxPerDept) || dept;
          dept = candidate;
        }
        // Mix fresh pulse facts with knowledge facts and intel titles
        let fact = fresh[i % Math.max(1, fresh.length || 1)] || facts[i % Math.max(1, facts.length || 1)] || intelTitles[i % Math.max(1, intelTitles.length || 1)] || '';
        if (factsUnique && facts.length > 0) {
          let tries = 0;
          while (usedFacts.has(fact) && tries < facts.length) {
            const idx = Math.floor(rng() * facts.length);
            fact = facts[idx];
            tries++;
          }
          usedFacts.add(fact);
        }
        const kw = fact ? ` – ${fact.slice(0, 90)}` : (knowledge?.summary ? ' – contexte entreprise' : '');
        const synth = synthPhrases[Math.floor(Math.random() * synthPhrases.length)](dept, brand, fact || 'contexte');
        ideas.push({
          title: `${topic.t} – ${dept}${kw}`,
          summary: `${toneHint}: ${synth}`,
          channel: topic.ch,
          departments: [dept],
          risk: riskHint,
          badges: shuffleWith(rng, topic.badges).slice(0, 1 + Math.floor(rng()*Math.min(2, topic.badges.length))),
          score: { relevance: 0.8, credibility: 0.85, variety: 0.8, risk: riskHint },
        });
        perDeptCount[dept] = (perDeptCount[dept] || 0) + 1;
      }
      // Deduplicate by normalized title
      const seen = new Set();
      const unique = [];
      for (const it of ideas) {
        const key = (it.title || '').toLowerCase().replace(/\s+/g,' ').trim();
        if (seen.has(key)) continue;
        seen.add(key);
        unique.push(it);
      }
      return res.json({ ideas: unique, ai: { mocked: true, seedUsed: seed ?? null } });
    }

    const context = intel.map((x) => `- ${x.title || ''} ${x.source ? '('+x.source+')':''}\n${(x.content || '').slice(0,400)}`).join('\n');
    const knowledgeBlock = knowledge ? `Résumé: ${knowledge.summary}\nFaits clés: ${(knowledge.keyFacts||[]).join('; ')}` : '';
    const sys = `Tu es un expert en ingénierie sociale pour des simulations internes d'entreprise. Tu proposes des idées d'appâts corporates ultra-crédibles, sans liens externes réels. Toujours du point de vue d'un expéditeur ${persona==='external'?'EXTERNE (partenaire/fournisseur/autorité)':'INTERNE'}. Les liens sont factices visuellement (ex: youtube.com/...), mais techniquement seront remplacés par {{trackingUrl}}. N'évoque jamais qu'il s'agit d'une simulation.`;
    const user = `Entreprise: ${tenant?.name || 'Société'}\n${knowledgeBlock}\n\nNotes sélectionnées:\n${context || '(peu d\'infos)'}\n\nActualités récentes: ${(pulseFacts||[]).slice(0,6).join(' | ') || '(aucune)'}\n\nCible: départements=${departments.join(',')||'tous'}, rôle=${role||'générique'}, ton=${tone}, niveau de risque=${risk}, persona=${persona}.\n${diversityHint}\nContraintes de diversité: 1) Répartis les idées sur les départements fournis (${distributeByDept?'oui':'non'}) 2) Utilise un FAIT DIFFÉRENT (de la connaissance/notes/actualité) par idée (${factsUnique?'oui':'non'}).\nGénère ${limit} idées DISTINCTES et adaptées à cette entreprise. Pour chaque idée, retourne JSON strict: { title, summary, channel, departments[], badges[], score: { relevance, credibility, variety, risk } }.`;

    // Cache key (respect persona, departments, tone, risk, RAG fingerprints)
    const cacheKey = hashKey({ t: tenantId, persona, departments: [...departments].sort(), role, tone, risk, seed: seed || null, intelIds: (intelIds||[]).sort(), ksum: knowledge?.summary?.slice(0,200) || '', kfacts: (knowledge?.keyFacts||[]).slice(0,6) });
    if (!req.query.noCache) {
      const cached = await getAiCache(`ideas:${cacheKey}`);
      if (cached) return res.json(cached);
    }

    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model,
        messages: [ { role: 'system', content: sys }, { role: 'user', content: user } ],
        temperature: 0.8,
        top_p: 0.9,
        presence_penalty: 0.2,
        response_format: { type: 'json_object' },
      }),
    });
    if (!r.ok) {
      const text = await r.text().catch(()=> '');
      return res.status(502).json({ error: 'ai-failed', details: text.slice(0,512) });
    }
    const data = await r.json();
    const content = data.choices?.[0]?.message?.content || '';
    let ideas = [];
    try {
      const parsed = JSON.parse(content);
      ideas = Array.isArray(parsed) ? parsed : (Array.isArray(parsed.ideas) ? parsed.ideas : []);
    } catch {
      // try to extract JSON array fallback
      const m = content.match(/\[[\s\S]*\]/);
      if (m) ideas = JSON.parse(m[0]);
    }
    if (!Array.isArray(ideas)) ideas = [{ title: 'Idée: Présentation interne', summary: content.slice(0,300), channel: 'email', departments: departments, badges: [], score: { relevance: 0.7, credibility: 0.8, variety: 0.6, risk } }];
    const payload = { ideas, ai: { model } };
    await setAiCache(`ideas:${cacheKey}`, payload, 1800);
    return res.json(payload);
  } catch (e) {
    return res.status(500).json({ error: 'ideas-error', details: e?.message || String(e) });
  }
});

module.exports = router;
