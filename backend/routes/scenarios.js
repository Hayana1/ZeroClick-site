// backend/routes/scenarios.js
const express = require("express");
const router = express.Router();

const {
  readRawScenarios,
  validateAll,
  renderEmail,
} = require("../utils/scenarios");

// GET /api/scenarios
router.get("/scenarios", (_req, res) => {
  const list = readRawScenarios();
  res.json(list);
});

// GET /api/scenarios/validate
router.get("/scenarios/validate", (_req, res) => {
  const list = readRawScenarios();
  const report = validateAll(list);
  const ok = report.every((r) => (r.errors || []).length === 0);
  res.json({ ok, count: list.length, report });
});

// GET /api/scenarios/:id
router.get("/scenarios/:id", (req, res) => {
  const { id } = req.params;
  const s = readRawScenarios().find((x) => x.id === id);
  if (!s) return res.status(404).json({ error: "Scénario introuvable" });
  res.json(s);
});

// POST /api/scenarios/:id/preview  { trackingUrl?, employee?, brand? }
router.post("/scenarios/:id/preview", (req, res) => {
  const { id } = req.params;
  const s = readRawScenarios().find((x) => x.id === id);
  if (!s) return res.status(404).json({ error: "Scénario introuvable" });
  const out = renderEmail(s, req.body || {});
  res.json(out);
});

module.exports = router;

