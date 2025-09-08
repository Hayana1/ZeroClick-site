const crypto = require('crypto');
const AiCache = require('../models/AiCache');

const mem = new Map(); // simple in-memory cache { key -> { value, expireAt } }

function hashKey(payload) {
  const s = typeof payload === 'string' ? payload : JSON.stringify(payload);
  return crypto.createHash('sha256').update(s).digest('hex');
}

async function getAiCache(key) {
  const now = Date.now();
  const m = mem.get(key);
  if (m && m.expireAt > now) return m.value;
  const doc = await AiCache.findOne({ key }).lean();
  if (doc) {
    const expireAt = now + (doc.ttlSeconds || 1800) * 1000;
    mem.set(key, { value: doc.value, expireAt });
    return doc.value;
  }
  return null;
}

async function setAiCache(key, value, ttlSeconds = 1800) {
  const expireAt = Date.now() + (ttlSeconds || 1800) * 1000;
  mem.set(key, { value, expireAt });
  await AiCache.updateOne({ key }, { $set: { key, value, ttlSeconds } }, { upsert: true });
}

module.exports = { hashKey, getAiCache, setAiCache };

