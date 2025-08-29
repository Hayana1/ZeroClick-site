// backend/routes/tenants.scenarios.js
const express = require("express");
const mongoose = require("mongoose");
const router = express.Router({ mergeParams: true });

const Target = require("../models/Target");

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// GET /api/tenants/:tenantId/scenario-usage?employeeIds=ID,ID
// Répond: { [employeeId]: [scenarioId, ...] }
router.get("/:tenantId/scenario-usage", async (req, res) => {
  const { tenantId } = req.params;
  const { employeeIds } = req.query;
  if (!isValidId(tenantId)) {
    return res.status(400).json({ error: "tenantId invalide" });
  }
  try {
    const filter = { tenantId }; 
    if (employeeIds) {
      const ids = String(employeeIds)
        .split(",")
        .map((s) => s.trim())
        .filter(isValidId);
      if (ids.length) filter.employeeId = { $in: ids };
    }
    filter.scenarioId = { $ne: null };

    const docs = await Target.find(filter, { employeeId: 1, scenarioId: 1 }).lean();
    const out = {};
    for (const d of docs) {
      const k = String(d.employeeId);
      if (!out[k]) out[k] = [];
      if (d.scenarioId && !out[k].includes(d.scenarioId)) out[k].push(d.scenarioId);
    }
    res.json(out);
  } catch (e) {
    res.status(500).json({ error: e.message || "Erreur usage scénarios" });
  }
});

module.exports = router;

