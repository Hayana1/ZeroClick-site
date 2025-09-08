// backend/middleware/rateLimit.js
// Lightweight in-memory rate limiter per IP + key
// Not cluster-safe; suitable for single-process or low-traffic deployments.

const buckets = new Map();

function now() { return Date.now(); }

function makeKey(ip, key) {
  return `${ip || 'unknown'}::${key}`;
}

function createRateLimiter({ windowMs = 60_000, limit = 30, key = 'global' } = {}) {
  return (req, res, next) => {
    try {
      const ip = (req.ip || req.connection?.remoteAddress || '').toString();
      const k = makeKey(ip, key);
      const t = now();
      let b = buckets.get(k);
      if (!b || (t - b.start) > windowMs) {
        b = { start: t, count: 0 };
        buckets.set(k, b);
      }
      b.count += 1;
      if (b.count > limit) {
        res.setHeader('Retry-After', Math.ceil((b.start + windowMs - t) / 1000));
        return res.status(429).json({ error: 'rate-limited' });
      }
      next();
    } catch (e) {
      next();
    }
  };
}

module.exports = { createRateLimiter };

