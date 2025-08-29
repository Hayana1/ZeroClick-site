// backend/routes/clicks.js
const express = require("express");
const crypto = require("crypto");
const router = express.Router();

const Target = require("../models/Target");
const Batch = require("../models/Batch");
const Employee = require("../models/Employee");
const Tenant = require("../models/Tenant");
const ClickEvent = require("../models/ClickEvent");
const { notifyDiscord } = require("../utils/discord");

// ---------- CONFIG ----------
const HMAC_SECRET = process.env.CLICK_HMAC_SECRET || "dev-secret-change-me";
const CONFIRM_TTL_MS = Number(process.env.CLICK_CONFIRM_TTL_MS || 60_000);
const MIN_DWELL_MS = Number(process.env.CLICK_MIN_DWELL_MS || 350);
const REDIRECT_URL = process.env.CLICK_REDIRECT_URL || "/ok";

// anti rafales (soft)
const IP_BURST_WINDOW_MS = 5_000; // fenêtre d’observation IP
const IP_BURST_MAX = 6; // nb de tokens distincts confirmés dans la fenêtre
const TOKEN_MIN_GAP_MS = 2_000; // anti double confirm trop rapide
const GRACE_WINDOW_MS = 60_000; // après l’envoi, exige interaction forte

// ---------- IN-MEMORY STATE (soft) ----------
const ipHits = new Map(); // ip -> { last: ts, tokens: Map<token, ts> }
const tokenLast = new Map(); // token -> lastConfirmTs
const probedTokens = new Set(); // tokens qui ont touché le honeypot

// ---------- UTILS ----------
function sign(payload) {
  return crypto
    .createHmac("sha256", HMAC_SECRET)
    .update(payload)
    .digest("base64url");
}
const nowMs = () => Date.now();

const NOTIFY_SUSPECT =
  String(process.env.DISCORD_NOTIFY_SUSPECT || "").toLowerCase() === "true";

const lastNotify = new Map();
function shouldNotify(key, cooldownMs = 10000) {
  const now = Date.now();
  const prev = lastNotify.get(key) || 0;
  if (now - prev < cooldownMs) return false;
  lastNotify.set(key, now);
  return true;
}
function tail(s = "", n = 8) {
  const x = String(s);
  return x.length > n ? x.slice(-n) : x;
}

function getClientInfo(req) {
  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.socket?.remoteAddress ||
    "";
  const ua = req.headers["user-agent"] || "";
  return { ip, ua };
}

function isSuspiciousUA(ua) {
  if (!ua) return true;
  const s = ua.toLowerCase();
  return (
    s.includes("linkpreview") ||
    s.includes("facebookexternalhit") ||
    s.includes("slackbot") ||
    s.includes("twitterbot") ||
    s.includes("discordbot") ||
    s.includes("skypeuripreview") ||
    s.includes("curl") ||
    s.includes("wget") ||
    s.includes("python-requests") ||
    s.includes("axios/") ||
    s.includes("node-fetch") ||
    s.includes("go-http-client") ||
    s.includes("guzzlehttp") ||
    s.includes("httpclient") ||
    s.includes("monitor") ||
    s.includes("uptime")
  );
}

function looksHumanHeaders(req) {
  const h = req.headers || {};
  const lang = h["accept-language"];
  const sfs = h["sec-fetch-site"];
  const purpose = (
    h["sec-purpose"] ||
    h["purpose"] ||
    h["x-purpose"] ||
    ""
  ).toLowerCase();
  const isPrefetch =
    purpose.includes("prefetch") || purpose.includes("preview");
  const hasLang = typeof lang === "string" && lang.length > 0;
  return hasLang && sfs !== "none" && !isPrefetch;
}

// On ne compte JAMAIS HEAD/OPTIONS
router.use((req, res, next) => {
  if (req.method === "HEAD" || req.method === "OPTIONS") {
    return res.status(204).end();
  }
  next();
});

/* ---------------- GET /api/clicks/:token (handshake) ---------------- */
router.get("/:token", async (req, res) => {
  const { token } = req.params;

  res.set({
    "Cache-Control": "no-store, max-age=0",
    "X-Robots-Tag": "noindex, nofollow, noarchive",
    "Permissions-Policy": "interest-cohort=()",
    "Referrer-Policy": "no-referrer",
    "Content-Security-Policy":
      "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'",
    "Content-Type": "text/html; charset=utf-8",
  });

  const ts = nowMs();
  const nonce = crypto.randomBytes(12).toString("base64url");
  const toSign = `${token}|${ts}|${nonce}`;
  const hmac = sign(toSign);

  const html = `<!doctype html>
  <html lang="fr">
  <head>
    <meta charset="utf-8">
    <meta name="robots" content="noindex,nofollow">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>Vérification de sécurité - ZeroClick</title>
    <style>
      :root {
        --primary: #3b82f6;
        --primary-dark: #2563eb;
        --success: #10b981;
        --light: #f8fafc;
        --dark: #1e293b;
        --gray: #64748b;
        --radius: 16px;
        --shadow: 0 10px 25px rgba(0, 0, 0, 0.05), 0 5px 10px rgba(0, 0, 0, 0.05);
      }
      
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
        font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
      }
      
      body {
        background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
        color: #334155;
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 20px;
      }
      
      .container {
        max-width: 440px;
        width: 100%;
        background: white;
        border-radius: var(--radius);
        box-shadow: var(--shadow);
        overflow: hidden;
        transition: transform 0.3s ease;
      }
      
      .container:hover {
        transform: translateY(-5px);
      }
      
      .header {
        background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
        color: white;
        padding: 25px 20px;
        text-align: center;
        position: relative;
      }
      
      .logo {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
        margin-bottom: 15px;
      }
      
      .logo-icon {
        width: 48px;
        height: 48px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 22px;
        backdrop-filter: blur(10px);
      }
      
      h1 {
        font-size: 24px;
        font-weight: 700;
        margin-bottom: 8px;
      }
      
      .subtitle {
        font-size: 14px;
        opacity: 0.9;
        max-width: 320px;
        margin: 0 auto;
      }
      
      .content {
        padding: 30px;
        text-align: center;
      }
      
      .status {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
        margin-bottom: 20px;
      }
      
      .status-text {
        font-size: 16px;
        font-weight: 500;
        color: var(--dark);
      }
      
      .spinner {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        border: 3px solid rgba(59, 130, 246, 0.2);
        border-top-color: var(--primary);
        animation: spin 1s linear infinite;
      }
      
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
      
      .progress-container {
        height: 8px;
        background: rgba(59, 130, 246, 0.1);
        border-radius: 4px;
        overflow: hidden;
        margin: 25px 0;
      }
      
      .progress-bar {
        height: 100%;
        width: 0%;
        background: linear-gradient(90deg, var(--primary), var(--primary-dark));
        border-radius: 4px;
        transition: width 0.5s ease;
      }
      
      .btn {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 14px 24px;
        border-radius: 12px;
        background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
        color: white;
        border: 0;
        cursor: pointer;
        font-size: 16px;
        font-weight: 600;
        transition: all 0.3s ease;
        box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
      }
      
      .btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 15px rgba(37, 99, 235, 0.3);
      }
      
      .btn:disabled {
        opacity: 0.7;
        cursor: not-allowed;
        transform: none;
        box-shadow: none;
      }
      
      .btn-spinner {
        width: 18px;
        height: 18px;
        border-radius: 50%;
        border: 2px solid transparent;
        border-top-color: white;
        animation: spin 1s linear infinite;
      }
      
      .footer {
        text-align: center;
        padding: 20px;
        font-size: 12px;
        color: var(--gray);
        border-top: 1px solid rgba(0, 0, 0, 0.05);
      }
      
      .security-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: var(--light);
        padding: 6px 12px;
        border-radius: 20px;
        margin-top: 10px;
      }
      
      a.hny {
        position: absolute;
        left: -9999px;
        top: auto;
        width: 1px;
        height: 1px;
        overflow: hidden;
      }
      
      @media (max-width: 480px) {
        .container {
          border-radius: 20px;
        }
        
        .content {
          padding: 25px 20px;
        }
      }
    </style>
  </head>
  <body>
    <a class="hny" href="/api/clicks/${encodeURIComponent(token)}/probe">.</a>
    
    <div class="container">
      <div class="header">
        <div class="logo">
          <div class="logo-icon">Z</div>
        </div>
        <h1>Vérification de sécurité</h1>
        <p class="subtitle">ZeroClick protège votre entreprise contre les accès non autorisés</p>
      </div>
      
      <div class="content">
        <div class="status">
          <div class="spinner"></div>
          <div class="status-text">Analyse en cours...</div>
        </div>
        
        <div class="progress-container">
          <div class="progress-bar" id="progressBar"></div>
        </div>
        
        <p id="msg" style="color: var(--gray); margin-bottom: 20px; font-size: 15px;">
          Vérification du navigateur pour éviter les robots.
        </p>
        
        <button id="go" class="btn" disabled>
          <span id="sp" class="btn-spinner"></span>
          <span id="label">Continuer</span>
        </button>
      </div>
      
      <div class="footer">
        <div class="security-badge">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
          </svg>
          Sécurisé par ZeroClick
        </div>
      </div>
    </div>
  
    <script>
    (() => {
      const token = ${JSON.stringify(token)};
      const sig = ${JSON.stringify(hmac)};
      const ts = ${JSON.stringify(ts)};
      const nonce = ${JSON.stringify(nonce)};
      const minDwell = ${JSON.stringify(MIN_DWELL_MS)};
      const redirectUrl = ${JSON.stringify(REDIRECT_URL)};
  
      const btn = document.getElementById('go');
      const msg = document.getElementById('msg');
      const sp = document.getElementById('sp');
      const progressBar = document.getElementById('progressBar');
  
      let interacted = false;
      let dwellReached = false;
      let confirmed = false;
      let visibleSince = performance.now();
      let visibleAccum = 0;
      let hadFocus = (document.visibilityState === 'visible');
  
      const onInteract = () => { 
        interacted = true; 
        updateProgress();
        tryAuto(); 
      };
      
      window.addEventListener('pointerdown', onInteract, { once:true, passive:true });
      window.addEventListener('keydown', onInteract, { once:true });
      window.addEventListener('mousemove', onInteract, { once:true, passive:true });
      window.addEventListener('touchstart', onInteract, { once:true, passive:true });
  
      document.addEventListener('visibilitychange', () => {
        const v = (document.visibilityState === 'visible');
        if (v) { 
          visibleSince = performance.now(); 
          hadFocus = true; 
        } else { 
          visibleAccum += Math.max(0, performance.now() - visibleSince); 
        }
      });
  
      function enable(){ 
        btn.disabled = false; 
        sp.style.display = 'none'; 
      }
      
      function disable(){ 
        btn.disabled = true;  
        sp.style.display = 'inline-block'; 
      }
  
      function updateProgress() {
        const progress = Math.min(100, (interacted ? 50 : 0) + (dwellReached ? 50 : 0));
        progressBar.style.width = progress + '%';
      }
  
      async function confirm() {
        if (confirmed) return;
        confirmed = true;
        disable();
        updateProgress();
  
        // finalize visible time
        if (document.visibilityState === 'visible') {
          visibleAccum += Math.max(0, performance.now() - visibleSince);
        }
  
        const payload = {
          ts, nonce, sig,
          dwellMs: Date.now() - ts,
          visibilityDur: Math.round(visibleAccum),
          hadFocus: !!hadFocus,
          ua: navigator.userAgent || '',
          lang: navigator.language || ''
        };
  
        try {
          await fetch(\`/api/clicks/\${encodeURIComponent(token)}/confirm\`, {
            method: 'POST',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify(payload),
            credentials: 'omit'
          });
        } catch(_) {}
        window.location.replace(redirectUrl);
      }
  
      function tryAuto(){
        const canAuto = interacted && dwellReached;
        if (canAuto) confirm();
      }
  
      // UX: bouton cliquable très vite si auto ne part pas
      setTimeout(() => {
        msg.textContent = "Cliquez si la page ne continue pas automatiquement.";
        enable();
        updateProgress();
      }, 120);
  
      // Dwell min + jitter
      setTimeout(() => { 
        dwellReached = true; 
        updateProgress();
        tryAuto(); 
      }, minDwell + Math.floor(Math.random()*140));
  
      // clic manuel : on exige un vrai geste humain
      btn.addEventListener('click', () => {
        const ua = navigator.userActivation;
        if (ua && ua.isActive === false) {
          return;
        }
        confirm();
      });
      
      // Animation initiale de la barre de progression
      setTimeout(() => updateProgress(), 300);
    })();
    </script>
  </body>
  </html>`;

  res.status(200).send(html);
});

/* ---------------- GET /api/clicks/:token/probe (honeypot) ---------------- */
router.get("/:token/probe", async (req, res) => {
  try {
    const { token } = req.params;
    probedTokens.add(token);
    // Log minimal, sans casser l’UX
    await ClickEvent.create({
      token,
      isLikelyBot: true,
      userAgent: req.headers["user-agent"],
      ip: req.headers["x-forwarded-for"] || req.socket?.remoteAddress,
      kind: "probe",
    }).catch(() => {});
    return res.status(204).end();
  } catch {
    return res.status(204).end();
  }
});

/* ---------------- POST /api/clicks/:token/confirm ---------------- */
router.post("/:token/confirm", async (req, res) => {
  try {
    const { token } = req.params;
    const { ts, nonce, sig, dwellMs, visibilityDur, hadFocus } = req.body || {};
    if (!token || !ts || !nonce || !sig) {
      return res.status(400).json({ error: "payload incomplet" });
    }

    // HMAC + TTL + dwell
    const expected = sign(`${token}|${ts}|${nonce}`);
    if (sig !== expected)
      return res.status(401).json({ error: "signature invalide" });
    if (nowMs() - Number(ts) > CONFIRM_TTL_MS)
      return res.status(408).json({ error: "confirm expiré" });
    if (Number(dwellMs) < MIN_DWELL_MS)
      return res.status(428).json({ error: "latence insuffisante" });

    const target = await Target.findOne({ token }).lean();
    if (!target) return res.status(404).json({ error: "token inconnu" });

    const { ip, ua } = getClientInfo(req);

    // Heuristiques d’entêtes
    const humanish = looksHumanHeaders(req);
    const uaSuspect = isSuspiciousUA(ua);

    // Fenêtre de grâce post-envoi (bloque scanners immédiats)
    const batch = target.batchId
      ? await Batch.findById(target.batchId).lean()
      : null;
    const sentAt =
      batch?.sentAt || batch?.createdAt || batch?.dateCreated || null;
    const withinGrace = sentAt
      ? nowMs() - new Date(sentAt).getTime() < GRACE_WINDOW_MS
      : false;

    // Interaction “forte” attendue si: grace window OU token a touché le honeypot
    const needsStrongInteraction = withinGrace || probedTokens.has(token);
    const hasStrongInteraction =
      Boolean(hadFocus) || Number(visibilityDur) >= 250;

    // Rate-limit soft par token
    const lastT = tokenLast.get(token) || 0;
    if (nowMs() - lastT < TOKEN_MIN_GAP_MS) {
      return res.status(202).json({ ok: false, reason: "token-ratelimit" });
    }
    tokenLast.set(token, nowMs());

    // Rate-limit soft par IP (tokens distincts dans la fenêtre)
    if (ip) {
      const slot = ipHits.get(ip) || { last: 0, tokens: new Map() };
      const tnow = nowMs();
      // purge
      for (const [tk, t] of slot.tokens) {
        if (tnow - t > IP_BURST_WINDOW_MS) slot.tokens.delete(tk);
      }
      slot.tokens.set(token, tnow);
      slot.last = tnow;
      ipHits.set(ip, slot);
      if (slot.tokens.size > IP_BURST_MAX) {
        // trop de tokens uniques depuis la même IP en quelques secondes
        await ClickEvent.create({
          tenantId: target.tenantId,
          batchId: target.batchId,
          employeeId: target.employeeId,
          targetId: target._id,
          token,
          userAgent: ua,
          ip,
          isLikelyBot: true,
          kind: "ip-burst",
        }).catch(() => {});
        return res.status(202).json({ ok: false, reason: "ip-burst" });
      }
    }

    // Filtrage principal (soft deny)
    if (
      !ip ||
      !ua ||
      uaSuspect ||
      !humanish ||
      (needsStrongInteraction && !hasStrongInteraction)
    ) {
      await ClickEvent.create({
        tenantId: target.tenantId,
        batchId: target.batchId,
        employeeId: target.employeeId,
        targetId: target._id,
        token,
        userAgent: ua || undefined,
        ip: ip || undefined,
        isLikelyBot: true,
        kind:
          !ip || !ua
            ? "missing-ip-ua"
            : uaSuspect
            ? "ua-suspect"
            : !humanish
            ? "headers-robotic"
            : "needs-strong-interaction",
      }).catch(() => {});
      return res.status(202).json({ ok: false, reason: "suspect" });
    }

    // Idempotence
    if ((target.clickCount || 0) > 0) {
      console.log(
        `[CLICK-IGNORED] | ${new Date().toISOString()} | token=${token} already clicked`
      );
      return res.status(200).json({ ok: true, alreadyCounted: true });
    }

    // Enrichissement
    const [employee, batchFull, tenant] = await Promise.all([
      Employee.findById(target.employeeId).lean(),
      Batch.findById(target.batchId).lean(),
      target.tenantId ? Tenant.findById(target.tenantId).lean() : null,
    ]);

    // Log “valide”
    await ClickEvent.create({
      tenantId: target.tenantId || tenant?._id,
      batchId: target.batchId,
      employeeId: target.employeeId,
      targetId: target._id,
      token,
      userAgent: ua || undefined,
      ip: ip || undefined,
      isLikelyBot: false,
      kind: "counted",
      dwellMs: Number(dwellMs),
      visibilityDur: Number(visibilityDur),
      hadFocus: Boolean(hadFocus),
    }).catch(() => {});

    await Target.updateOne(
      { _id: target._id },
      {
        $inc: { clickCount: 1 },
        $set: {
          lastClickedAt: new Date(),
          lastUserAgent: ua || null,
          lastIp: ip || null,
        },
      }
    );

    try {
      const short = (s, n = 80) =>
        (s && s.length > n ? s.slice(0, n) + "…" : s) || "—";
      const tokenShort = (token || "").slice(0, 8) + "…";

      const embed = {
        title: "Click validé",
        description: "Un nouvel évènement a été enregistré dans ZeroClick.",
        color: 0x2563eb, // bleu moderne
        timestamp: new Date().toISOString(),
        fields: [
          {
            name: "Entreprise",
            value: `${tenant?.name || "Non spécifié"}\n\`${
              tenant?._id || target.tenantId || "N/A"
            }\``,
            inline: true,
          },
          {
            name: "Campagne",
            value: `${batchFull?.name || "Non spécifié"}\n\`${
              batchFull?._id || target.batchId || "N/A"
            }\``,
            inline: true,
          },
          {
            name: "Employé",
            value: `${employee?.name || "Non spécifié"}\n${
              employee?.email || "—"
            }`,
            inline: true,
          },
          {
            name: "Département",
            value: employee?.department || "—",
            inline: true,
          },
          {
            name: "Token",
            value: `\`${tokenShort}\``,
            inline: true,
          },
          {
            name: "IP",
            value: ip || "—",
            inline: true,
          },
          {
            name: "User-Agent",
            value: ua ? `\`\`\`${short(ua, 160)}\`\`\`` : "—",
            inline: false,
          },
        ],
        footer: {
          text: "ZeroClick • Système de sécurité",
        },
      };

      notifyDiscord({
        content: "Nouveau clic validé.",
        embeds: [embed],
      });
    } catch (e) {
      console.warn("[discord] notify error (non-bloquant):", e?.message || e);
    }

    console.log(
      `[CLICK] | ${new Date().toISOString()} | tenant="${
        tenant?.name || "?"
      }" (${tenant?._id || target.tenantId || "?"}) | batch="${
        batchFull?.name || "?"
      }" (${batchFull?._id || target.batchId}) | employee="${
        employee?.name || "?"
      }" <${employee?.email || "?"}> | dept="${
        employee?.department || "?"
      }" | token=${token} | ip=${ip} | ua="${ua}" | verdict=counted`
    );

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("CLICK confirm error:", err);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});

module.exports = router;
