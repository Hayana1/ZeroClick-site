// backend/routes/tenant-auth.js
const express = require('express');
const jwt = require('jsonwebtoken');
const { requireAuth } = require('../middleware/requireAuth');
const { requireTenantViewer } = require('../middleware/requireTenantViewer');
const Tenant = require('../models/Tenant');

const router = express.Router();
const { createRateLimiter } = require('../middleware/rateLimit');

function isSecure(req) {
  return req.secure || (req.get('x-forwarded-proto') || '').includes('https');
}

// Owner creates a magic link for a tenant viewer
router.post('/api/tenant-auth/create-link', requireAuth, createRateLimiter({ windowMs: 60_000, limit: 20, key: 'create-link' }), async (req, res) => {
  try {
    const { tenantId, expiresInHours = 24 * 7 } = req.body || {};
    if (!tenantId) return res.status(400).json({ error: 'missing-tenantId' });
    const secret = process.env.AUTH_JWT_SECRET;
    if (!secret) return res.status(500).json({ error: 'server-misconfigured' });

    const tenant = await Tenant.findById(tenantId, { name: 1 }).lean();
    if (!tenant) return res.status(404).json({ error: 'tenant-not-found' });

    const token = jwt.sign({ sub: 'tenant_viewer_link', tenantId }, secret, {
      expiresIn: `${expiresInHours}h`,
    });
    // Build link on BACKEND origin so the consume hit always reaches the API
    const host = req.get('host');
    const proto = isSecure(req) ? 'https' : 'http';
    const beOrigin = (process.env.BASE_URL && process.env.BASE_URL.replace(/\/$/, '')) || `${proto}://${host}`;
    const url = `${beOrigin}/api/tenant-auth/consume?token=${encodeURIComponent(token)}`;
    return res.json({ ok: true, url, tenant: { _id: tenantId, name: tenant.name || '' } });
  } catch (e) {
    return res.status(500).json({ error: 'create-link-failed' });
  }
});

// IT clicks the link → set viewer cookie and redirect to /viewer
router.get('/api/tenant-auth/consume', async (req, res) => {
  try {
    const token = String(req.query.token || '');
    if (!token) return res.status(400).send('missing token');
    const secret = process.env.AUTH_JWT_SECRET;
    if (!secret) return res.status(500).send('server misconfigured');
    const payload = jwt.verify(token, secret);
    if (!payload || payload.sub !== 'tenant_viewer_link' || !payload.tenantId) {
      return res.status(400).send('invalid token');
    }
    const viewer = jwt.sign({ role: 'tenant_viewer', tenantId: String(payload.tenantId) }, secret, { expiresIn: '7d' });
    const sameSiteCfg = (process.env.AUTH_COOKIE_SAMESITE || '').toLowerCase();
    const sameSite = sameSiteCfg === 'none' ? 'None' : sameSiteCfg === 'lax' ? 'Lax' : 'Strict';
    const secure = isSecure(req) || sameSite === 'None';
    res.cookie('zc_tenant', viewer, {
      httpOnly: true,
      sameSite: sameSite.toLowerCase(),
      secure,
      maxAge: 7*24*3600*1000,
      path: '/',
    });
    console.log(`[tenant-auth] viewer cookie -> SameSite=${sameSite} Secure=${secure}`);
    // Redirect to frontend viewer UI
    const feCsv = String(process.env.FRONTEND_URL || '').split(',').map(s => s.trim()).filter(Boolean);
    const feOrigin = feCsv[0] || `${isSecure(req) ? 'https' : 'http'}://${req.get('host')}`;
    return res.redirect(`${feOrigin.replace(/\/$/, '')}/viewer`);
  } catch (e) {
    return res.status(400).send('invalid or expired link');
  }
});

router.get('/api/viewer/me', requireTenantViewer, async (req, res) => {
  try {
    const t = await Tenant.findById(req.viewerTenantId, { name: 1 }).lean();
    return res.json({ tenantId: req.viewerTenantId, tenantName: t?.name || '' });
  } catch {
    return res.status(500).json({ error: 'failed' });
  }
});

module.exports = router;
