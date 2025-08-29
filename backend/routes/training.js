// backend/routes/training.js
const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const Target = require("../models/Target");
const Batch = require("../models/Batch");
const Employee = require("../models/Employee");

const WEB_URL = process.env.FRONTEND_URL?.split(",")[0]?.trim() || "http://localhost:5173";
const ENABLE_TRAINING_REWARD = String(process.env.ENABLE_TRAINING_REWARD || "true") === "true";

// GET /api/training/send/:sendId -> infos employé pour affichage formation
router.get("/api/training/send/:sendId", async (req, res) => {
  const { sendId } = req.params;
  if (!sendId || !mongoose.Types.ObjectId.isValid(sendId)) {
    return res.status(400).json({ error: "sendId invalide" });
  }
  try {
    const t = await Target.findById(sendId).populate("employeeId");
    if (!t || !t.employeeId) return res.status(404).json({ error: "Envoi/Employé introuvable" });
    const e = t.employeeId;
    const history = Array.isArray(e.trainingHistory) ? e.trainingHistory.slice(-5).reverse() : [];
    return res.json({
      employee: {
        _id: String(e._id),
        name: e.name || "",
        trainingPoints: e.trainingPoints || 0,
        trainingHistory: history,
      },
      scenarioId: t.scenarioId || null,
    });
  } catch (e) {
    return res.status(500).json({ error: e.message || "Erreur chargement envoi" });
  }
});

// GET /t/:token -> marque le clic et redirige vers /training/:scenarioId?send=:id
router.get("/t/:token", async (req, res) => {
  const { token } = req.params;
  try {
    // Laisse la route de handshake anti‑bot gérer la validation + redirection
    return res.redirect(302, `/api/clicks/${encodeURIComponent(token)}`);
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

    // Points gamifiés (employé)
    let pointsEarned = 10; // +10 par scénario complété (MVP)
    if (typeof totalScore === "number" && totalScore > 0) {
      // Bonus léger si quiz > 0
      pointsEarned += 0; // garder simple; ajuster si besoin
    }

    let rewardXp = 0;
    if (ENABLE_TRAINING_REWARD) {
      rewardXp = 30; // XP parallèle (optionnel)
      target.xpEarned = (target.xpEarned || 0) + rewardXp;
    }

    await target.save();

    // Incrémente les points de l'employé
    const emp = await Employee.findById(target.employeeId);
    if (emp) {
      emp.trainingPoints = (emp.trainingPoints || 0) + pointsEarned;
      try {
        emp.trainingHistory = emp.trainingHistory || [];
        emp.trainingHistory.push({ scenarioId: target.scenarioId || scenarioId || "unknown", score: totalScore || 0, date: new Date() });
      } catch (_) {}
      await emp.save();
    }

    return res.json({
      success: true,
      employeeId: String(target.employeeId),
      scenarioId: target.scenarioId || scenarioId || "unknown",
      pointsEarned,
      totalPoints: emp ? emp.trainingPoints : pointsEarned,
      rewardXp,
    });
  } catch (e) {
    console.error("/api/training/complete error:", e);
    return res.status(500).json({ error: e.message || "Erreur interne" });
  }
});

module.exports = router;
