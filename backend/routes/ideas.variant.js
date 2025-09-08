// backend/routes/ideas.variant.js
const express = require('express');
const { requireAuth } = require('../middleware/requireAuth');
const { createRateLimiter } = require('../middleware/rateLimit');

const router = express.Router({ mergeParams: true });

router.post('/tenants/:tenantId/ideas:variant', requireAuth, createRateLimiter({ windowMs: 60_000, limit: 30, key: 'ideas-variant' }), async (req, res) => {
  try {
    const base = req.body?.idea || {};
    const tone = req.body?.tone || 'neutre';
    const persona = req.body?.persona || 'external';
    const dept = req.body?.department || (base.departments && base.departments[0]) || 'Tous';
    const tweaks = [
      { channel: 'email+calendar', title: base.title?.replace(/Invitation|Inviter/i, 'Créneau agenda') || `Créneau agenda – ${dept}` },
      { channel: 'email+video', title: base.title?.replace(/(Politique|Note)/i, 'Présentation courte') || `Présentation courte – ${dept}` },
      { channel: 'email+pdf', title: base.title?.replace(/(Accès|Validation)/i, 'Mise à jour politique') || `Mise à jour politique – ${dept}` },
      { channel: 'email+form', title: base.title?.replace(/(Info|Note)/i, 'Formulaire à compléter') || `Formulaire à compléter – ${dept}` },
      { channel: 'email+drive', title: base.title?.replace(/(Visio|Agenda)/i, 'Document partagé') || `Document partagé – ${dept}` },
    ];
    const pick = tweaks[Math.floor(Math.random() * tweaks.length)];
    const badgesByChannel = {
      'email+calendar': ['Calendly factice'],
      'email+video': ['YouTube factice'],
      'email+pdf': ['PDF politique'],
      'email+form': ['Formulaire factice'],
      'email+drive': ['Drive factice'],
    };
    const idea = {
      title: pick.title,
      summary: `${tone}: variante ciblée ${dept}.`,
      channel: pick.channel,
      departments: [dept],
      badges: badgesByChannel[pick.channel] || [],
      score: base.score || { relevance: 0.8, credibility: 0.85, variety: 0.8, risk: 'moyen' },
      persona,
    };
    res.json({ idea });
  } catch (e) {
    res.status(500).json({ error: 'variant-failed' });
  }
});

module.exports = router;

