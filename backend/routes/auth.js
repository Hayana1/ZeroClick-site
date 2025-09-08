// backend/routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const router = express.Router();
const { createRateLimiter } = require('../middleware/rateLimit');

function strip(u) { return String(u || '').replace(/\/+$/, ''); }

function isSecure(req) {
  // trust proxy is enabled in app.js
  return req.secure || (req.get('x-forwarded-proto') || '').includes('https');
}

router.post('/api/auth/login', createRateLimiter({ windowMs: 60_000, limit: 10, key: 'auth-login' }), async (req, res) => {
  try {
    const { email, password } = req.body || {};
    const ownerEmail = (process.env.OWNER_EMAIL || '').toLowerCase();
    const hash = process.env.OWNER_PASSWORD_HASH || '';
    if (!ownerEmail || !hash) {
      return res.status(500).json({ error: 'server-misconfigured' });
    }
    if (!email || !password) {
      return res.status(400).json({ error: 'missing-credentials' });
    }
    if (email.toLowerCase() !== ownerEmail) {
      return res.status(401).json({ error: 'invalid-credentials' });
    }
    const ok = await bcrypt.compare(password, hash);
    if (!ok) return res.status(401).json({ error: 'invalid-credentials' });

    const secret = process.env.AUTH_JWT_SECRET || process.env.JWT_SECRET;
    if (!secret) return res.status(500).json({ error: 'server-misconfigured' });

    const token = jwt.sign({ sub: 'owner' }, secret, { expiresIn: '12h' });
    const sameSiteCfg = (process.env.AUTH_COOKIE_SAMESITE || '').toLowerCase();
    const sameSite = sameSiteCfg === 'none' ? 'None' : sameSiteCfg === 'lax' ? 'Lax' : 'Strict';
    const secure = isSecure(req) || sameSite === 'None';
    const maxAge = 12 * 60 * 60; // seconds
    // Use Express cookie helper for correct serialization
    res.cookie('zc_auth', token, {
      httpOnly: true,
      sameSite: sameSite.toLowerCase(),
      secure,
      maxAge: maxAge * 1000,
      path: '/',
    });
    console.log(`[auth] login cookie -> SameSite=${sameSite} Secure=${secure}`);
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: 'login-failed' });
  }
});

router.post('/api/auth/logout', (req, res) => {
  // Clear cookie with broad attributes
  const sameSiteCfg = (process.env.AUTH_COOKIE_SAMESITE || '').toLowerCase();
  const sameSite = sameSiteCfg === 'none' ? 'None' : sameSiteCfg === 'lax' ? 'Lax' : 'Strict';
  const secure = isSecure(req) || sameSite === 'None';
  res.cookie('zc_auth', '', {
    httpOnly: true,
    sameSite: sameSite.toLowerCase(),
    secure,
    maxAge: 0,
    path: '/',
  });
  return res.json({ ok: true });
});

router.get('/api/auth/me', (req, res) => {
  const { requireAuth } = require('../middleware/requireAuth');
  // Call the middleware inline to reuse logic without double-mounting
  requireAuth(req, res, () => {
    return res.json({ user: { role: 'owner' } });
  });
});

module.exports = router;
