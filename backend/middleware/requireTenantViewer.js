// backend/middleware/requireTenantViewer.js
const jwt = require('jsonwebtoken');

function parseCookies(header) {
  const out = {};
  if (!header) return out;
  for (const part of header.split(';')) {
    const i = part.indexOf('=');
    if (i === -1) continue;
    const k = part.slice(0, i).trim();
    const v = decodeURIComponent(part.slice(i + 1).trim());
    if (k) out[k] = v;
  }
  return out;
}

function requireTenantViewer(req, res, next) {
  try {
    const cookies = parseCookies(req.headers.cookie || '');
    const token = cookies['zc_tenant'];
    if (!token) return res.status(401).json({ error: 'unauthorized' });
    const secret = process.env.AUTH_JWT_SECRET;
    if (!secret) return res.status(500).json({ error: 'server-misconfigured' });
    const payload = jwt.verify(token, secret);
    if (!payload || payload.role !== 'tenant_viewer' || !payload.tenantId) {
      return res.status(401).json({ error: 'unauthorized' });
    }
    req.viewerTenantId = String(payload.tenantId);
    next();
  } catch (e) {
    return res.status(401).json({ error: 'unauthorized' });
  }
}

module.exports = { requireTenantViewer };

