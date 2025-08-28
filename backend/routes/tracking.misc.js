// backend/routes/tracking.misc.js
const express = require("express");
const router = express.Router();
const Target = require("../models/Target");

// POST /api/tracking/mark-copied  { token }
router.post("/mark-copied", async (req, res) => {
  const { token } = req.body || {};
  if (!token) return res.status(400).json({ error: "token requis" });

  const t = await Target.findOneAndUpdate(
    { token },
    { $set: { copiedAt: new Date() } },
    { new: true }
  );
  if (!t) return res.status(404).json({ error: "token inconnu" });

  res.json({
    ok: true,
    employeeId: t.employeeId,
    batchId: t.batchId,
    copiedAt: t.copiedAt,
  });
});

module.exports = router;
