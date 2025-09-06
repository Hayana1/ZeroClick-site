// backend/routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const router = express.Router();

function isSecure(req) {
  // trust proxy is enabled in app.js
  return req.secure || (req.get('x-forwarded-proto') || '').includes('https');
}

router.post('/api/auth/login', async (req, res) => {
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

    const secret = process.env.AUTH_JWT_SECRET;
    if (!secret) return res.status(500).json({ error: 'server-misconfigured' });

    const token = jwt.sign({ sub: 'owner' }, secret, { expiresIn: '12h' });
    const cookieOpts = {
      httpOnly: true,
      sameSite: 'strict',
      secure: isSecure(req),
      // 12h
      maxAge: 12 * 60 * 60 * 1000,
      path: '/',
    };
    res.setHeader(
      'Set-Cookie',
      `zc_auth=${encodeURIComponent(token)}; HttpOnly; Path=/${cookieOpts.secure ? '; Secure' : ''}; SameSite=Strict; Max-Age=${Math.floor(cookieOpts.maxAge/1000)}`
    );
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: 'login-failed' });
  }
});

router.post('/api/auth/logout', (req, res) => {
  // Clear cookie
  const secure = isSecure(req);
  res.setHeader(
    'Set-Cookie',
    `zc_auth=; HttpOnly; Path=/; ${secure ? 'Secure; ' : ''}SameSite=Strict; Max-Age=0`
  );
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

