// backend/routes/training.js
const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const Target = require("../models/Target");
const Batch = require("../models/Batch");

const WEB_URL = process.env.FRONTEND_URL?.split(",")[0]?.trim() || "http://localhost:5173";
const ENABLE_TRAINING_REWARD = String(process.env.ENABLE_TRAINING_REWARD || "true") === "true";

// GET /t/:token -> marque le clic et redirige vers /training/:scenarioId?send=:id
router.get("/t/:token", async (req, res) => {
  const { token } = req.params;
  const ua = req.headers["user-agent"] || "";
  const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.connection.remoteAddress || req.ip;

  try {
    const target = await Target.findOne({ token }).populate("employeeId");
    if (!target) return res.status(404).send("Lien invalide ou expiré.");

    // Assure scenarioId (peut être appliqué après création du batch)
    // Ne pas auto-assigner un scenarioId depuis la config de groupe au moment du clic,
    // afin d'éviter les doublons cross-batch. Si absent, on redirige vers "unknown".

    // Marque clic (basique)
    target.clickCount = (target.clickCount || 0) + 1;
    target.lastClickedAt = new Date();
    if (ua) target.lastUserAgent = ua;
    if (ip) target.lastIp = ip;
    await target.save();

    const scenarioId = target.scenarioId || "unknown";
    const sendId = String(target._id);
    const loc = `${WEB_URL.replace(/\/+$/, "")}/training/${encodeURIComponent(scenarioId)}?send=${encodeURIComponent(sendId)}`;
    res.redirect(302, loc);
  } catch (e) {
    console.error("/t redirect error:", e);
    res.status(500).send("Erreur de redirection");
  }
});

// POST /api/training/complete { sendId, scenarioId, totalScore }
router.post("/api/training/complete", async (req, res) => {
  const { sendId, scenarioId, totalScore } = req.body || {};
  if (!sendId || !mongoose.Types.ObjectId.isValid(sendId)) {
    return res.status(400).json({ error: "sendId invalide" });
  }
  try {
    const target = await Target.findById(sendId);
    if (!target) return res.status(404).json({ error: "Envoi introuvable" });

    // Met à jour info de formation
    target.trainingCompletedAt = new Date();
    if (scenarioId) target.scenarioId = scenarioId; // lock-in scenario si manquant
    if (typeof totalScore === "number") target.quizScore = totalScore;

    let rewardXp = 0;
    if (ENABLE_TRAINING_REWARD) {
      rewardXp = 30; // MVP
      target.xpEarned = (target.xpEarned || 0) + rewardXp;
    }

    await target.save();
    return res.json({ ok: true, rewardXp });
  } catch (e) {
    console.error("/api/training/complete error:", e);
    return res.status(500).json({ error: e.message || "Erreur interne" });
  }
});

module.exports = router;
