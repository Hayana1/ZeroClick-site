// app.js (CommonJS)
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

const { decideAntiBot } = require("./utils/antiBot");

/* -------------------- CONFIG -------------------- */
const PORT = process.env.PORT || 7300;
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/email-campaigns";
const MONGODB_DB = process.env.MONGODB_DB || "email-campaigns";

// FRONTEND_URL peut être une CSV: "http://localhost:5173,https://zeroclick.tech/"
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
// Origine propre du backend (utile pour /api/clicks handshake servi depuis le backend)
const SELF_ORIGIN =
  (process.env.BASE_URL && stripSlash(process.env.BASE_URL)) ||
  `http://localhost:${PORT}`;

/* -------------------- HELPERS -------------------- */
function stripSlash(u) {
  // retire uniquement un slash final éventuel (https://site.com/ -> https://site.com)
  return String(u || "").replace(/\/+$/, "");
}
function buildAllowlist(csv) {
  return csv
    .split(",")
    .map((s) => stripSlash(s.trim()))
    .filter(Boolean);
}
const ALLOWLIST = buildAllowlist(FRONTEND_URL);

const mask = (s) => (s ? s.slice(0, 32) + "..." + s.slice(-6) : "MISSING");
console.log(
  "[env] DISCORD_WEBHOOK_URL:",
  mask(process.env.DISCORD_WEBHOOK_URL)
);

// Optionnel: log pour debug
console.log("CORS allowlist:", ALLOWLIST);
console.log("CORS self origin:", SELF_ORIGIN);

/* -------------------- MIDDLEWARE -------------------- */
app.set("trust proxy", 1);
app.use(express.json({ limit: '512kb' }));

// CORS: autorise dynamiquement l'origine du serveur (même domaine)
// pour éviter des 403 en prod si BASE_URL est manquant/mal configuré.
app.use((req, res, next) => {
  const reqOrigin = `${req.protocol}://${stripSlash(req.get("host"))}`;
  return cors({
    origin: (origin, cb) => {
      // Autoriser:
      // - Requêtes sans origin (curl, health, server-to-server)
      // - Les origines listées dans FRONTEND_URL
      // - L’origine de cette requête (page handshake -> POST confirm en same-origin)
      if (
        !origin ||
        ALLOWLIST.includes(stripSlash(origin)) ||
        stripSlash(origin) === SELF_ORIGIN ||
        stripSlash(origin) === reqOrigin
      ) {
        return cb(null, true);
      }
      return cb(new Error(`Not allowed by CORS: ${origin}`));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  })(req, res, next);
});

// (facultatif) handler d’erreurs CORS pour éviter un crash non-catché
app.use((err, _req, res, next) => {
  if (err && /Not allowed by CORS/.test(err.message)) {
    return res.status(403).json({ error: err.message });
  }
  next(err);
});

/* -------------------- DB + ROUTES -------------------- */
async function start() {
  // Étape 1: connexion DB
  try {
    await mongoose.connect(MONGODB_URI, { dbName: MONGODB_DB });
    console.log(
      `✅ MongoDB Connected: ${mongoose.connection.host}/${mongoose.connection.name}`
    );
  } catch (err) {
    console.error("❌ MongoDB connection error:", err?.message || err);
    console.error(err?.stack || "");
    process.exit(1);
  }

  // Étape 2: initialisation des routes + server
  try {
    // --- ROUTES ---
    app.use("/api/tenants", require("./routes/tenants"));
    app.use("/api/tenants", require("./routes/tenants.employees"));
    app.use("/api/tenants", require("./routes/tenants.batches"));

    app.use("/api/employees", require("./routes/employees"));
    app.use("/api/batches", require("./routes/batches"));
    app.use("/api/clicks", require("./routes/clicks"));
    app.use("/api", require("./routes/results"));
    app.use("/api/tenants", require("./routes/tenants.scenarios"));
    app.use("/api/tracking", require("./routes/tracking.misc"));
    app.use(require("./routes/training"));

    // Health
    app.get("/api/health", (_req, res) => res.json({ ok: true }));
    app.get("/", (_req, res) => res.send("ZeroClick API live"));

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Server startup error:", err?.message || err);
    console.error(err?.stack || "");
    process.exit(1);
  }
}

start();
