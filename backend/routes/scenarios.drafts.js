// backend/routes/scenarios.drafts.js
const express = require('express');
const mongoose = require('mongoose');
const ScenarioDraft = require('../models/ScenarioDraft');
const TrainingModule = require('../models/TrainingModule');
const TenantKnowledge = require('../models/TenantKnowledge');
const IntelItem = require('../models/IntelItem');
const { requireAuth } = require('../middleware/requireAuth');

const router = express.Router({ mergeParams: true });
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// List drafts for a tenant
router.get('/tenants/:tenantId/scenarios/drafts', requireAuth, async (req, res) => {
  const { tenantId } = req.params;
  if (!isValidId(tenantId)) return res.status(400).json({ error: 'tenantId invalide' });
  const drafts = await ScenarioDraft.find({ tenantId }).sort({ createdAt: -1 }).lean();
  res.json(drafts);
});

// Approve a draft -> generate training module
router.patch('/scenarios/drafts/:id/approve', requireAuth, async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) return res.status(400).json({ error: 'id invalide' });
  const draft = await ScenarioDraft.findById(id);
  if (!draft) return res.status(404).json({ error: 'draft introuvable' });

  // Build training content via AI if available, else fallback
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.AI_MODEL || 'gpt-4o-mini';
  const knowledge = await TenantKnowledge.findOne({ tenantId: draft.tenantId }).lean();
  const intel = await IntelItem.find({ tenantId: draft.tenantId }).sort({ addedAt: -1 }).limit(6).lean();

  let title = draft.title || 'Formation – Sensibilisation';
  let outline = [];
  let bestPractices = [];
  let redFlags = [];
  let quiz = [];

  if (apiKey) {
    try {
      const sys = 'Tu crées un module de formation concis à partir d\'un scénario de phishing.';
      const user = `SCENARIO:\nSujet: ${draft.email?.subject}\nRésumé: ${draft.summary}\nLiens: ${(draft.links||[]).map(l=>l.displayUrl).join(', ')}\nPJ: ${(draft.attachments||[]).map(a=>a.filename).join(', ')}\n\nContexte entreprise: ${(knowledge?.summary || '')}\nFaits clés: ${(knowledge?.keyFacts||[]).join('; ')}\n\nAttendu JSON strict: { title, outline: [{ heading, bullets[] }], bestPractices[], redFlags[], quiz: [{ question, options[], correctIndex, explanation }] }`;
      const r = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
        body: JSON.stringify({ model, messages: [ { role:'system', content: sys }, { role:'user', content: user } ], temperature: 0.5 })
      });
      if (r.ok) {
        const data = await r.json();
        const content = data.choices?.[0]?.message?.content || '';
        const obj = JSON.parse(content);
        title = obj.title || title;
        outline = Array.isArray(obj.outline) ? obj.outline : [];
        bestPractices = Array.isArray(obj.bestPractices) ? obj.bestPractices : [];
        redFlags = Array.isArray(obj.redFlags) ? obj.redFlags : [];
        quiz = Array.isArray(obj.quiz) ? obj.quiz : [];
      }
    } catch {}
  }

  if (!outline.length) {
    outline = [
      { heading: 'Contexte du message', bullets: ['Pourquoi ce message semble légitime', 'Références à l\'entreprise'] },
      { heading: 'Indices de phishing', bullets: ['Liens d\'apparence crédible', 'Urgence / ton', 'Pièce jointe suspecte'] },
      { heading: 'Que faire ?', bullets: ['Ne pas cliquer', 'Signaler à l\'équipe', 'Consulter la politique interne'] },
    ];
    bestPractices = ['Vérifier l\'URL réelle avant de cliquer', 'Se méfier de l\'urgence et des demandes inhabituelles', 'Passer par les canaux internes connus'];
    redFlags = ['Liens externes masqués', 'Demandes de connexion/mot de passe', 'Erreurs de style ou de destinataire'];
    quiz = [
      { question: 'Que faire en priorité si vous recevez un message inattendu vous demandant une action urgente ?', options: ['Cliquer pour vérifier', 'Répondre pour demander plus d\'infos', 'Signaler selon la procédure interne', 'Ignorer'], correctIndex: 2, explanation: 'Suivre la procédure interne et vérifier via les canaux officiels.' }
    ];
  }

  const moduleDoc = await TrainingModule.create({
    tenantId: draft.tenantId,
    scenarioDraftId: draft._id,
    title: `Formation – ${title}`,
    outline,
    bestPractices,
    redFlags,
    quiz,
    status: 'ready',
  });

  draft.status = 'approved';
  await draft.save();
  res.json({ ok: true, draftId: draft._id, trainingModuleId: moduleDoc._id });
});

// Reject a draft
router.patch('/scenarios/drafts/:id/reject', requireAuth, async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) return res.status(400).json({ error: 'id invalide' });
  const draft = await ScenarioDraft.findById(id);
  if (!draft) return res.status(404).json({ error: 'draft introuvable' });
  draft.status = 'rejected';
  draft.reviewNotes = String(req.body?.reason || '');
  await draft.save();
  res.json({ ok: true });
});

module.exports = router;

