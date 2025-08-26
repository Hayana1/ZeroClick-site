// routes/clicks.js
const express = require("express");
const router = express.Router();

const Click = require("../models/Click");
const Batch = require("../models/Batch");
const Employee = require("../models/Employee");
const Target = require("../models/Target");
const { notifyDiscord } = require("../utils/discord");

const DEFAULT_TRAINING_URL =
  process.env.TRAINING_URL_DEFAULT || "http://localhost:5173/oups";

// ===== Helpers =====

// Récupère la meilleure IP "réelle" derrière proxy/CDN
function getRealIp(req) {
  const xff = req.headers["x-forwarded-for"];
  const cf = req.headers["cf-connecting-ip"];
  const xri = req.headers["x-real-ip"];

  if (cf) return Array.isArray(cf) ? cf[0] : cf;
  if (xri) return Array.isArray(xri) ? xri[0] : xri;

  if (Array.isArray(xff)) return xff[0];
  if (typeof xff === "string" && xff.length > 0) {
    return xff.split(",")[0].trim();
  }
  return req.ip || (req.socket && req.socket.remoteAddress) || "";
}

// Détection "bot" conservative : n’étiquette pas les vrais humains
function looksLikeBot(req) {
  const ua = (req.get("User-Agent") || "").toLowerCase();
  const ip = getRealIp(req);
  const method = req.method;

  const isPrivateIP =
    /^10\./.test(ip) ||
    /^192\.168\./.test(ip) ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(ip) ||
    ip === "::1" ||
    ip === "127.0.0.1";

  // Méthodes non humaines ou prélectures
  const isPreFetchMethod = method === "HEAD" || method === "OPTIONS";

  // UAs fréquemment vus sur passerelles
  const isSecurityGateway =
    /proofpoint|mimecast|barracuda|symantec|ironport|trendmicro|msproxy|safelinks|urlscan|linkscanner/.test(
      ua
    );

  // Chrome très ancien souvent utilisé par des robots de sandbox
  const isOldChrome81 = /chrome\/81\.0\.4044\.138/.test(ua);

  // Permettre un bypass pour tester facilement (ex: ?forceHuman=1)
  if (req.query.forceHuman === "1") return false;

  return isPrivateIP || isPreFetchMethod || isSecurityGateway || isOldChrome81;
}

// Déduplication simple en mémoire (fenêtre courte)
const RECENT_FP = new Map(); // key -> ts
const DEDUP_WINDOW_MS = Number(process.env.CLICK_DEDUP_WINDOW_MS || 15000);
function makeFingerprint({ token, ip, ua }) {
  return `${token}|${ip}|${ua}`.slice(0, 512);
}
function seenRecently(fp) {
  const now = Date.now();
  const last = RECENT_FP.get(fp) || 0;
  const seen = now - last < DEDUP_WINDOW_MS;
  RECENT_FP.set(fp, now);
  // GC approximatif
  if (RECENT_FP.size > 5000) {
    for (const [k, ts] of RECENT_FP) {
      if (now - ts > DEDUP_WINDOW_MS * 4) RECENT_FP.delete(k);
    }
  }
  return seen;
}

// ===== Routes =====

// Tracker un clic "pixel" (tu peux garder tel quel)
router.get("/track", async (req, res) => {
  const { batchId, employeeId, link } = req.query;
  if (!batchId || !employeeId || !link) {
    return res.status(400).json({ message: "Missing parameters" });
  }

  try {
    const now = new Date();
    const timeStr = now.toLocaleString("fr-CA", {
      timeZone: "America/Toronto",
      dateStyle: "short",
      timeStyle: "medium",
    });

    const batch = await Batch.findById(batchId);
    const employee = await Employee.findById(employeeId);
    if (!batch || !employee)
      return res.status(404).json({ message: "Batch or employee not found" });
    if (!batch.employees.includes(employeeId)) {
      return res.status(400).json({ message: "Employee not in this batch" });
    }

    await Click.create({
      batchId,
      employeeId,
      linkUrl: link,
      ipAddress: getRealIp(req),
      userAgent: req.get("User-Agent"),
      clickTime: now,
      isBot: false, // pixel open : tu peux le séparer si besoin
    });

    // pixel 1x1
    res.set("Content-Type", "image/png");
    res.send(
      Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
        "base64"
      )
    );
  } catch (err) {
    console.error("Error tracking click:", err);
    res.set("Content-Type", "image/png");
    res.send(
      Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
        "base64"
      )
    );
  }
});

// Stats batch
router.get("/batch/:batchId", async (req, res) => {
  try {
    const clicks = await Click.find({ batchId: req.params.batchId })
      .populate("employeeId", "name email department")
      .sort({ clickTime: -1 });

    res.json(clicks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Stats employé
router.get("/employee/:employeeId", async (req, res) => {
  try {
    const clicks = await Click.find({ employeeId: req.params.employeeId })
      .populate("batchId", "name dateCreated")
      .sort({ clickTime: -1 });

    res.json(clicks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Suivi via token unique (filtrage bot + dédup + comptage humain)
router.get("/:token", async (req, res) => {
  const now = new Date();
  const token = req.params.token;

  try {
    // Récupérer le target + employé pour notifier
    const t = await Target.findOne({ token }).populate(
      "employeeId",
      "name email"
    );
    if (!t) return res.status(404).send("Invalid link");

    const batch = await Batch.findById(t.batchId);
    const trainingUrl = batch?.trainingUrl || DEFAULT_TRAINING_URL;

    const ip = getRealIp(req);
    const ua = req.get("User-Agent") || "";
    const method = req.method;

    // Déduplication courte (évite double compteur sur HEAD/GET/préfetch)
    const fp = makeFingerprint({ token, ip, ua });
    const duplicateShortWindow = seenRecently(fp);

    // Détection bot conservative
    const isBot = looksLikeBot(req);

    // Log Click (audit) — on garde tout, on tague isBot
    await Click.create({
      batchId: t.batchId,
      employeeId: t.employeeId,
      token,
      linkUrl: `${req.protocol}://${req.get("host")}${req.originalUrl}`,
      ipAddress: ip,
      userAgent: ua,
      method,
      clickTime: now,
      isBot,
      duplicateShortWindow,
    }).catch((e) => {
      // ignore duplicate key si tu as un index unique maison
      if (e?.code !== 11000) console.error("[click log] error:", e);
    });

    // Si c'est un BOT ou un duplicat immédiat → on ne compte pas
    if (isBot || duplicateShortWindow) {
      return res.redirect(302, trainingUrl);
    }

    // ----- À partir d’ici : CLIC HUMAIN -----

    // Premier clic humain : on fige clickedAt
    const firstUpdate = await Target.updateOne(
      { _id: t._id, clickedAt: null },
      {
        $set: {
          clickedAt: now,
          firstClickIp: ip,
          firstClickUA: ua,
        },
      }
    );

    // Incrémente le compteur "humain" (sur Target)
    await Target.updateOne({ _id: t._id }, { $inc: { clickCount: 1 } });

    // Si c’est le premier clic humain : incrémente le Batch et notifie
    if (firstUpdate.modifiedCount === 1) {
      await Batch.findByIdAndUpdate(t.batchId, { $inc: { clickCount: 1 } });

      const emp = t.employeeId || {};
      const timeStr = now.toLocaleString("fr-CA", {
        timeZone: "America/Toronto",
        dateStyle: "short",
        timeStyle: "medium",
      });

      // Notification Discord (optionnelle)
      notifyDiscord({
        content: `✅ ZeroClick — ${
          emp.name || emp.email || "Employé"
        } à ${timeStr}`,
        embeds: [
          {
            title: "Clic humain détecté",
            color: 0x2ecc71,
            fields: [
              { name: "Campagne", value: batch?.name || "-", inline: true },
              {
                name: "Employé",
                value: `${emp.name || "-"} (${emp.email || "-"})`,
                inline: true,
              },
              { name: "Heure (Toronto)", value: timeStr, inline: true },
              { name: "IP", value: ip || "—", inline: true },
              {
                name: "User-Agent",
                value: ua.slice(0, 200) || "—",
                inline: false,
              },
            ],
            timestamp: now.toISOString(),
          },
        ],
      }).catch((e) => console.error("Discord notif error:", e));
    }

    // Redirection finale
    return res.redirect(302, trainingUrl);
  } catch (err) {
    console.error("Token click error:", err);
    return res.redirect(302, DEFAULT_TRAINING_URL);
  }
});

module.exports = router;
