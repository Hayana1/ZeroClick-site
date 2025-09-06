// backend/middleware/requireAuth.js
const jwt = require('jsonwebtoken');

function parseCookies(header) {
  const out = {};
  if (!header) return out;
  const parts = header.split(';');
  for (const p of parts) {
    const idx = p.indexOf('=');
    if (idx === -1) continue;
    const k = p.slice(0, idx).trim();
    const v = decodeURIComponent(p.slice(idx + 1).trim());
    if (k) out[k] = v;
  }
  return out;
}

function requireAuth(req, res, next) {
  try {
    const cookies = parseCookies(req.headers.cookie || '');
    const token = cookies['zc_auth'];
    if (!token) return res.status(401).json({ error: 'unauthorized' });

    const secret = process.env.AUTH_JWT_SECRET;
    if (!secret) return res.status(500).json({ error: 'server-misconfigured' });

    const payload = jwt.verify(token, secret);
    if (!payload || payload.sub !== 'owner') {
      return res.status(401).json({ error: 'unauthorized' });
    }
    req.user = { role: 'owner' };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'unauthorized' });
  }
}

module.exports = { requireAuth };

