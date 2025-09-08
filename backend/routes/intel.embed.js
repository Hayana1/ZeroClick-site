// backend/routes/intel.embed.js
const express = require('express');
const mongoose = require('mongoose');
const IntelItem = require('../models/IntelItem');
const { requireAuth } = require('../middleware/requireAuth');
const { embedTexts } = require('../utils/embeddings');
const { createRateLimiter } = require('../middleware/rateLimit');

const router = express.Router({ mergeParams: true });
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// Build embeddings for latest intel items (batch)
router.post('/tenants/:tenantId/intel:embed', requireAuth, createRateLimiter({ windowMs: 60_000, limit: 5, key: 'intel-embed' }), async (req, res) => {
  const { tenantId } = req.params;
  if (!isValidId(tenantId)) return res.status(400).json({ error: 'tenantId invalide' });
  const limit = Math.max(1, Math.min(Number(req.body?.limit || 50), 200));
  const missing = await IntelItem.find({ tenantId, embedding: { $exists: false } }, { content: 1, title: 1 }).sort({ addedAt: -1 }).limit(limit).lean();
  if (!missing.length) return res.json({ ok: true, embedded: 0 });
  const texts = missing.map((m) => `${m.title || ''}\n${m.content || ''}`);
  try {
    const vecs = await embedTexts(texts);
    const ops = missing.map((m, i) => ({ updateOne: { filter: { _id: m._id }, update: { $set: { embedding: vecs[i] } } } }));
    await IntelItem.bulkWrite(ops);
    res.json({ ok: true, embedded: missing.length });
  } catch (e) {
    res.status(500).json({ error: 'embed-failed', details: e?.message || String(e) });
  }
});

module.exports = router;

