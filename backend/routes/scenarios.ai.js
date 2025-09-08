// backend/routes/scenarios.ai.js
const express = require('express');
const mongoose = require('mongoose');
const IntelItem = require('../models/IntelItem');
const TenantKnowledge = require('../models/TenantKnowledge');
const ScenarioDraft = require('../models/ScenarioDraft');
const { requireAuth } = require('../middleware/requireAuth');
const { sanitizeEmailHtml } = require('../utils/sanitizeEmail');

const router = express.Router({ mergeParams: true });
const { createRateLimiter } = require('../middleware/rateLimit');
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

router.post('/tenants/:tenantId/scenarios/ai/develop', requireAuth, createRateLimiter({ windowMs: 60_000, limit: 10, key: 'scen-develop' }), async (req, res) => {
  try {
    const { tenantId } = req.params;
    if (!isValidId(tenantId)) return res.status(400).json({ error: 'tenantId invalide' });
    const { idea = {}, intelIds = [], tone = 'neutre', risk = 'moyen', persona = 'external' } = req.body || {};
    const apiKey = process.env.OPENAI_API_KEY;
    const model = process.env.AI_MODEL || 'gpt-4o-mini';

    const intel = Array.isArray(intelIds) && intelIds.length
      ? await IntelItem.find({ tenantId, _id: { $in: intelIds } }).lean()
      : await IntelItem.find({ tenantId }).sort({ addedAt: -1 }).limit(8).lean();
    const knowledge = await TenantKnowledge.findOne({ tenantId }).lean();

    let title = idea.title || 'Message interne';
    let summary = idea.summary || '';
    let email = { subject: '', preheader: '', html: '' };
    let links = [];
    let attachments = [];

    if (apiKey) {
      const intelBullets = intel.map((x,i)=>`- [${i+1}] ${x.title||x.source||'Note'}: ${String(x.content||'').slice(0,250)}`).join('\n');
      const sys = `Tu écris un email d'appât pour une simulation interne. Persona expéditeur: ${persona==='external'?'EXTERNE (partenaire/fournisseur/autorité)':'INTERNE'}. Tu produis un email HTML complet avec placeholders et liens factices. N'évoque jamais qu'il s'agit d'une formation ou simulation.`;
      const user = `Contexte entreprise (résumé): ${knowledge?.summary || '(peu)'}\nFaits clés: ${(knowledge?.keyFacts||[]).join('; ')}\nNotes sélectionnées:\n${intelBullets || '(aucune)'}\n\nIdée: ${idea.title || ''} — ${idea.summary || ''}\nCanal: ${idea.channel || ''}\nDépartements: ${(idea.departments||[]).join(',')||'(tous)'}\nTon: ${tone}\nRisque: ${risk}\n\nExigences: Retourne un JSON strict avec les champs exacts: { title, summary, email: { subject, preheader, html, fromName, fromEmail }, links: [{ label, type, displayUrl }], attachments: [{ filename, mime, contentText }] }.\nContraintes: 1) Persona ${persona} crédible (externe => nom/nom de domaine générique ou partenaire plausible), 2) Pas de liens externes réels: tous les href sont remplacés côté système par {{trackingUrl}} (ne fournis que displayUrl), 3) Placeholders requis dans le HTML: {{employee.name}}, {{brand.name}}, {{trackingUrl}}, 4) Style professionnel crédible, 5) Aucune mention de formation/simulation.`;
      // Simple response cache (DB + memory)
      const { hashKey, getAiCache, setAiCache } = require('../utils/aicache');
      const cacheKey = hashKey({ t: tenantId, persona, idea: { t: idea.title||'', s: idea.summary||'', ch: idea.channel||'' }, tone, risk, ksum: knowledge?.summary?.slice(0,200)||'', kfacts: (knowledge?.keyFacts||[]).slice(0,6), intel: intel.map(x=>String(x._id)).sort() });
      const cached = !req.query.noCache ? (await getAiCache(`dev:${cacheKey}`)) : null;
      if (cached) {
        title = cached.title || title;
        summary = cached.summary || summary;
        email = cached.email || email;
        links = cached.links || links;
        attachments = cached.attachments || attachments;
      } else {
        const r = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST', headers: { 'Content-Type':'application/json', 'Authorization':`Bearer ${apiKey}` },
          body: JSON.stringify({ model, messages: [ { role:'system', content: sys }, { role:'user', content: user } ], temperature: 0.7, top_p: 0.9, response_format: { type: 'json_object' } })
        });
        if (!r.ok) {
          const t = await r.text().catch(()=> '');
          console.error('ai develop failed', r.status, t.slice(0,200));
        } else {
          const data = await r.json();
          const content = data.choices?.[0]?.message?.content || '';
          try {
            const obj = JSON.parse(content);
            title = obj.title || title;
            summary = obj.summary || summary;
            email = obj.email || email;
            links = Array.isArray(obj.links) ? obj.links : [];
            attachments = Array.isArray(obj.attachments) ? obj.attachments : [];
            await setAiCache(`dev:${cacheKey}`, { title, summary, email, links, attachments }, 3600);
          } catch {}
        }
      }
    }

    // Fallback if AI missing/failed — inject key facts for personalization
    if (!email.subject) {
      const brand = (knowledge?.summary && (knowledge?.summary.match(/^[^;,.]+/)||[])[0]) ? (knowledge?.summary.match(/^[^;,.]+/)||[])[0] : '{{brand.name}}';
      email.subject = persona==='external' ? `[Action requise] Confirmation d'accès – ${brand}` : `[Information] Présentation interne – ${brand}`;
      email.preheader = persona==='external' ? 'Votre action est requise pour valider l\'accès.' : 'Accédez à la présentation et confirmez votre disponibilité.';
      const factLines = (knowledge?.keyFacts||[]).slice(0,3).map(f=>`<li>${String(f).slice(0,120)}</li>`).join('');
      email.html = `
        <div style="font-family:system-ui,Segoe UI,Arial,sans-serif;font-size:15px;color:#111">
          <p>Bonjour {{employee.name}},</p>
          ${persona==='external'
            ? `<p>Nous vous contactons concernant l'accès à des documents partagés. Afin de confirmer votre identité, merci de procéder à la validation ci-dessous.</p>
               <p><a href="{{trackingUrl}}" target="_blank">microsoftonline.com/consent</a></p>
               <p><a href="{{trackingUrl}}" target="_blank">dropbox.com/s/document</a></p>`
            : `<p>Dans le cadre des activités de {{brand.name}}, une courte présentation interne est disponible. Merci de la consulter puis d'indiquer votre disponibilité.</p>
               <p><a href="{{trackingUrl}}" target="_blank">youtube.com/watch?v=ajout-interne</a></p>
               <p><a href="{{trackingUrl}}" target="_blank">calendly.com/{{brand.name}}/présentation</a></p>`}
          ${factLines ? `<div style="margin:12px 0 6px;color:#374151">Contexte (interne):</div><ul style="color:#374151">${factLines}</ul>` : ''}
          <p>${persona==='external' ? 'Document partagé' : 'Document joint'}: Ordre du jour (PDF).</p>
          <p style="color:#6b7280">Message automatisé – Équipe {{brand.name}}</p>
        </div>`;
      links = [
        ...(persona==='external'
          ? [ { label: 'Portail Microsoft', type: 'identity', displayUrl: 'microsoftonline.com/consent' }, { label: 'Document Dropbox', type: 'drive', displayUrl: 'dropbox.com/s/document' } ]
          : [ { label: 'Vidéo interne', type: 'youtube', displayUrl: 'youtube.com/watch?v=...' }, { label: 'Calendrier', type: 'calendar', displayUrl: 'calendly.com/...' } ]),
      ];
      attachments = [ { filename: 'Ordre-du-jour.pdf', mime: 'application/pdf', contentText: 'Ordre du jour – présentation' } ];
      if (persona==='external') {
        email.fromName = 'Support Accès Document';
        email.fromEmail = 'no-reply@document-access.co';
      }
    }

    // Ensure placeholders
    if (!/\{\{trackingUrl\}\}/.test(email.html)) email.html += '\n<p><a href="{{trackingUrl}}">Ouvrir</a></p>';
    if (!/\{\{employee\.name\}\}/.test(email.html)) email.html = email.html.replace('<div', '<div data-emp="{{employee.name}}" ');
    if (!/\{\{brand\.name\}\}/.test(email.html)) email.html = email.html.replace('</div>', '<p>{{brand.name}}</p></div>');

    // Sanitize email HTML before saving
    email.html = sanitizeEmailHtml(email.html || '');

    const draft = await ScenarioDraft.create({
      tenantId,
      departments: Array.isArray(idea.departments) && idea.departments.length ? idea.departments : [],
      riskLevel: risk,
      persona,
      lureCategory: idea.channel || '',
      title: title || idea.title || 'Scénario',
      summary: summary || idea.summary || '',
      email,
      links,
      attachments,
      checks: { policyOk: true, comments: [] },
      status: 'draft',
    });

    return res.status(201).json(draft.toObject());
  } catch (e) {
    console.error('develop error', e);
    return res.status(500).json({ error: 'develop-failed' });
  }
});

module.exports = router;
