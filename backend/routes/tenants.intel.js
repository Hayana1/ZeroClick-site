// backend/routes/tenants.intel.js
const express = require('express');
const mongoose = require('mongoose');
const IntelItem = require('../models/IntelItem');
const TenantKnowledge = require('../models/TenantKnowledge');
const { requireAuth } = require('../middleware/requireAuth');

const router = express.Router({ mergeParams: true });

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// List intel for a tenant
router.get('/tenants/:tenantId/intel', requireAuth, async (req, res) => {
  const { tenantId } = req.params;
  if (!isValidId(tenantId)) return res.status(400).json({ error: 'tenantId invalide' });
  const items = await IntelItem.find({ tenantId }).sort({ addedAt: -1 }).lean();
  res.json(items);
});

// Add an intel item
router.post('/tenants/:tenantId/intel', requireAuth, async (req, res) => {
  const { tenantId } = req.params;
  if (!isValidId(tenantId)) return res.status(400).json({ error: 'tenantId invalide' });
  const { title, source, url, tags, content } = req.body || {};
  const doc = await IntelItem.create({ tenantId, title: title||'', source: source||'', url: url||'', tags: Array.isArray(tags)? tags: [], content: content||'', addedBy: 'owner' });
  res.status(201).json(doc.toObject());
});

// --------- Helpers for scraping & summarizing ---------
function stripHtml(html) {
  if (!html) return '';
  return String(html)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function isDisallowedHost(u) {
  try {
    const url = new URL(u);
    const host = url.hostname || '';
    if (host === 'localhost' || host === '127.0.0.1' || host === '::1') return true;
    if (/^\d+\.\d+\.\d+\.\d+$/.test(host)) {
      // IPv4 private ranges
      const [a,b] = host.split('.').map(n=>parseInt(n,10));
      if (a === 10) return true;
      if (a === 172 && b >= 16 && b <= 31) return true;
      if (a === 192 && b === 168) return true;
    }
    return false;
  } catch { return true; }
}

async function fetchText(url) {
  try {
    if (isDisallowedHost(url)) return null;
    const r = await fetch(url, { method: 'GET', redirect: 'follow' });
    if (!r.ok) return null;
    const ct = r.headers.get('content-type') || '';
    if (!/text\//i.test(ct) && !/html/i.test(ct)) return null;
    const t = await r.text();
    return String(t).slice(0, 200_000); // cap to 200KB
  } catch {
    return null;
  }
}

async function searchWeb(query, count = 10) {
  const out = [];
  const SERP_API_KEY = process.env.SERP_API_KEY;
  const NEWS_API_KEY = process.env.NEWS_API_KEY;
  try {
    if (SERP_API_KEY) {
      const url = `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(query)}&num=${Math.min(count,10)}&api_key=${encodeURIComponent(SERP_API_KEY)}`;
      const r = await fetch(url);
      if (r.ok) {
        const data = await r.json();
        const organic = data.organic_results || [];
        for (const it of organic) {
          if (it.link && it.title) out.push({ url: it.link, title: it.title });
        }
      }
    } else if (NEWS_API_KEY) {
      const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&pageSize=${Math.min(count,20)}`;
      const r = await fetch(url, { headers: { 'X-Api-Key': NEWS_API_KEY } });
      if (r.ok) {
        const data = await r.json();
        for (const a of (data.articles || [])) {
          if (a.url && a.title) out.push({ url: a.url, title: a.title });
        }
      }
    } else {
      // Fallback: DuckDuckGo HTML (best-effort, may break)
      const r = await fetch(`https://duckduckgo.com/html/?q=${encodeURIComponent(query)}`);
      if (r.ok) {
        const html = await r.text();
        const re = /<a rel="nofollow" class="result__a" href="([^"#]+)[^"]*">([\s\S]*?)<\/a>/g;
        let m;
        while ((m = re.exec(html)) && out.length < count) {
          const url = m[1];
          const title = stripHtml(m[2]).slice(0, 140);
          if (url && title) out.push({ url, title });
        }
      }
    }
  } catch {}
  return out.slice(0, count);
}

// Bulk import intel from URLs
router.post('/tenants/:tenantId/intel:import-urls', requireAuth, async (req, res) => {
  const { tenantId } = req.params;
  if (!isValidId(tenantId)) return res.status(400).json({ error: 'tenantId invalide' });
  const urls = (req.body?.urls || []).map(String).map(s => s.trim()).filter(Boolean).slice(0, 12);
  if (!urls.length) return res.status(400).json({ error: 'no-urls' });

  const results = [];
  for (const url of urls) {
    const html = await fetchText(url);
    if (!html) { results.push({ url, ok: false }); continue; }
    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const metaMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["'][^>]*>/i);
    const title = titleMatch ? stripHtml(titleMatch[1]).slice(0, 140) : (url.slice(0, 140));
    const desc = metaMatch ? metaMatch[1] : '';
    const text = stripHtml(html);
    const content = [desc, text].filter(Boolean).join('\n').slice(0, 4000);
    const item = await IntelItem.create({ tenantId, title, source: 'url', url, tags: ['import:url'], content, addedBy: 'owner' });
    results.push({ url, ok: true, _id: item._id, title });
  }
  res.json({ imported: results });
});

// Web discovery: search and return candidate URLs (no storage)
router.post('/tenants/:tenantId/discover:search', requireAuth, async (req, res) => {
  const { tenantId } = req.params; // tenantId is only for scoping/permissions
  const query = String(req.body?.query || '').trim();
  const count = Math.max(1, Math.min(Number(req.body?.count || 10), 20));
  if (!query) return res.status(400).json({ error: 'missing-query' });
  const results = await searchWeb(query, count);
  res.json({ results });
});

// Import raw pasted text as one intel item
router.post('/tenants/:tenantId/intel:import-text', requireAuth, async (req, res) => {
  const { tenantId } = req.params;
  if (!isValidId(tenantId)) return res.status(400).json({ error: 'tenantId invalide' });
  const { title, content, tags, source } = req.body || {};
  if (!content || !String(content).trim()) return res.status(400).json({ error: 'missing-content' });
  const item = await IntelItem.create({ tenantId, title: title || (String(content).slice(0, 80) + '...'), source: source || 'paste', url: '', tags: Array.isArray(tags)? tags: ['import:paste'], content: String(content).slice(0, 8000), addedBy: 'owner' });
  res.status(201).json(item.toObject());
});

// --------- Site scraping (same-host, shallow crawl) ---------
function extractLinks(html, baseUrl) {
  const out = [];
  if (!html) return out;
  const re = /<a\b[^>]*href=["']([^"']+)["'][^>]*>/gi;
  let m;
  while ((m = re.exec(html))) {
    const href = m[1] || '';
    try {
      const abs = new URL(href, baseUrl);
      out.push(abs.toString());
    } catch {}
  }
  return out;
}

router.post('/tenants/:tenantId/scrape:site', requireAuth, async (req, res) => {
  const { tenantId } = req.params;
  if (!isValidId(tenantId)) return res.status(400).json({ error: 'tenantId invalide' });
  const startUrl = String(req.body?.url || '').trim();
  let maxPages = Number(req.body?.maxPages || 8);
  const includePaths = Array.isArray(req.body?.includePaths) ? req.body.includePaths : [];
  const excludePatterns = Array.isArray(req.body?.excludePatterns) ? req.body.excludePatterns : [];
  if (!/^https?:\/\//i.test(startUrl)) return res.status(400).json({ error: 'invalid-url' });
  maxPages = Math.max(1, Math.min(maxPages, 25));

  const start = new URL(startUrl);
  const host = start.host;
  const visited = new Set();
  const q = [startUrl];
  const saved = [];

  while (q.length && saved.length < maxPages) {
    const url = q.shift();
    if (!url || visited.has(url)) continue;
    if (isDisallowedHost(url)) continue;
    visited.add(url);
    try {
      const r = await fetch(url, { headers: { 'User-Agent': 'ZeroClickScraper/1.0' } });
      if (!r.ok) continue;
      const ct = r.headers.get('content-type') || '';
      if (!/text\//i.test(ct) && !/html/i.test(ct)) continue;
      const html = await r.text();
      const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
      const metaMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["'][^>]*>/i);
      const title = titleMatch ? stripHtml(titleMatch[1]).slice(0, 140) : url.slice(0, 140);
      const desc = metaMatch ? metaMatch[1] : '';
      const text = stripHtml(html);
      const content = [desc, text].filter(Boolean).join('\n').slice(0, 8000);

      // Upsert by (tenantId, url)
      const doc = await IntelItem.findOneAndUpdate(
        { tenantId, url },
        { $setOnInsert: { tenantId, title, source: 'scrape', url, tags: ['import:scrape'], content, addedBy: 'owner' } },
        { upsert: true, new: true }
      );
      saved.push({ _id: doc._id, url, title });

      // Enqueue same-host links
      const links = extractLinks(html, url);
      for (const l of links) {
        try {
          const u = new URL(l);
          if (u.host !== host) continue;
          if (isDisallowedHost(u.toString())) continue;
          const path = u.pathname || '/';
          if (excludePatterns.some((p) => new RegExp(p).test(path))) continue;
          if (includePaths.length && !includePaths.some((p) => path.startsWith(p))) continue;
          if (!visited.has(u.toString())) q.push(u.toString());
        } catch {}
      }
      // Gentle throttle
      await new Promise((r2) => setTimeout(r2, 80));
    } catch {
      // ignore failures
    }
  }

  res.json({ ok: true, saved, count: saved.length });
});

// Build tenant knowledge (summary + key facts) from latest intel
router.post('/tenants/:tenantId/knowledge:build', requireAuth, async (req, res) => {
  const { tenantId } = req.params;
  if (!isValidId(tenantId)) return res.status(400).json({ error: 'tenantId invalide' });
  const limit = Math.min(Math.max(Number(req.body?.limit || 12), 3), 30);
  const items = await IntelItem.find({ tenantId }).sort({ addedAt: -1 }).limit(limit).lean();
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.AI_MODEL || 'gpt-4o-mini';

  let summary = '';
  let keyFacts = [];
  if (apiKey && items.length) {
    const bullets = items.map((x, i) => `- [${i+1}] ${x.title || x.source || 'Note'}: ${String(x.content||'').slice(0, 400)}`).join('\n');
    const sys = 'Tu synthétises des informations d\'entreprise en points clés actionnables pour de la simulation de phishing (ne divulgue pas de PII).';
    const user = `Synthétise en 6-10 phrases claires et liste 8-12 faits clés\n\nDONNÉES:\n${bullets}`;
    try {
      const r = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
        body: JSON.stringify({ model, messages: [ { role: 'system', content: sys }, { role: 'user', content: user } ], temperature: 0.3 })
      });
      const data = await r.json();
      const content = data.choices?.[0]?.message?.content || '';
      // try split content: first paragraph summary, then key facts lines starting with - or *
      const parts = content.split(/\n\n+/);
      summary = parts[0] || content.slice(0, 1000);
      keyFacts = (content.match(/^[\-*]\s+(.+)$/gmi) || []).map(s => s.replace(/^[\-*]\s+/, '').trim()).slice(0, 12);
    } catch (e) {
      summary = items.map(x => x.title).filter(Boolean).join('; ').slice(0, 800);
      keyFacts = items.map(x => (x.source || 'Note')).slice(0, 8);
    }
  } else {
    const titles = items.map(x => x.title || '').filter(Boolean);
    const hosts = items.map(x => { try { return x.url ? new URL(x.url).host : ''; } catch { return ''; } }).filter(Boolean);
    const uniq = (arr) => Array.from(new Set(arr.filter(Boolean)));
    summary = uniq(titles).join('; ').slice(0, 800) || uniq(hosts).join(', ').slice(0, 800) || 'Synthèse indisponible (ajoutez des titres ou du texte).';
    const rawFacts = uniq([
      ...titles.map(t => t.slice(0, 120)),
      ...hosts,
    ]);
    keyFacts = rawFacts
      .filter(s => s && s.toLowerCase() !== 'scrape' && s.toLowerCase() !== 'paste' && s.length > 6)
      .slice(0, 12);
  }

  const doc = await TenantKnowledge.findOneAndUpdate(
    { tenantId },
    { summary, keyFacts, itemsUsed: items.map(x => x._id), model: apiKey ? (process.env.AI_MODEL || 'gpt-4o-mini') : 'mock' },
    { upsert: true, new: true }
  );
  res.json(doc.toObject());
});

// Get tenant knowledge
router.get('/tenants/:tenantId/knowledge', requireAuth, async (req, res) => {
  const { tenantId } = req.params;
  if (!isValidId(tenantId)) return res.status(400).json({ error: 'tenantId invalide' });
  const doc = await TenantKnowledge.findOne({ tenantId }).lean();
  res.json(doc || { tenantId, summary: '', keyFacts: [] });
});

module.exports = router;
