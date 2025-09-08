// backend/routes/pulse.js
const express = require('express');
const mongoose = require('mongoose');
const PulseItem = require('../models/PulseItem');
const Tenant = require('../models/Tenant');
const { requireAuth } = require('../middleware/requireAuth');
const { createRateLimiter } = require('../middleware/rateLimit');

const router = express.Router({ mergeParams: true });
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

async function fetchNews(query, fromISO, pageSize = 20) {
  const NEWS_API_KEY = process.env.NEWS_API_KEY;
  if (!NEWS_API_KEY) return [];
  const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&from=${encodeURIComponent(fromISO)}&sortBy=publishedAt&pageSize=${Math.min(pageSize, 50)}`;
  try {
    const r = await fetch(url, { headers: { 'X-Api-Key': NEWS_API_KEY } });
    if (!r.ok) return [];
    const data = await r.json();
    const out = [];
    for (const a of (data.articles || [])) {
      out.push({ title: a.title || '', url: a.url || '', source: (a.source && a.source.name) || '', publishedAt: a.publishedAt ? new Date(a.publishedAt) : new Date(), summary: a.description || '' });
    }
    return out;
  } catch { return []; }
}

router.get('/tenants/:tenantId/pulse', requireAuth, async (req, res) => {
  const { tenantId } = req.params;
  if (!isValidId(tenantId)) return res.status(400).json({ error: 'tenantId invalide' });
  const items = await PulseItem.find({ tenantId }).sort({ publishedAt: -1 }).limit(50).lean();
  res.json({ items });
});

router.post('/tenants/:tenantId/pulse:refresh', requireAuth, createRateLimiter({ windowMs: 60_000, limit: 10, key: 'pulse-refresh' }), async (req, res) => {
  const { tenantId } = req.params;
  if (!isValidId(tenantId)) return res.status(400).json({ error: 'tenantId invalide' });
  const days = Math.max(1, Math.min(Number(req.body?.days || 7), 30));
  const q = String(req.body?.q || '').trim();

  const tenant = await Tenant.findById(tenantId, { name: 1 }).lean();
  const brand = tenant?.name || '';
  const query = q || `${brand} (politique OR webinaire OR sécurité OR RGPD OR partenaire OR facture OR agenda)`;
  const fromISO = new Date(Date.now() - days*24*3600*1000).toISOString();
  const articles = await fetchNews(query, fromISO, 30);
  let saved = 0;
  for (const a of articles) {
    if (!a.url) continue;
    try {
      await PulseItem.updateOne({ tenantId, url: a.url }, { $setOnInsert: { tenantId, ...a } }, { upsert: true });
      saved += 1;
    } catch {}
  }
  const items = await PulseItem.find({ tenantId }).sort({ publishedAt: -1 }).limit(50).lean();
  res.json({ ok: true, saved, items });
});

module.exports = router;

