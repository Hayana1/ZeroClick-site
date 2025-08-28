// backend/routes/tenants.batches.js
const express = require("express");
const mongoose = require("mongoose");
const router = express.Router({ mergeParams: true });

const Batch = require("../models/Batch");
const Employee = require("../models/Employee");
const Target = require("../models/Target");

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

/* -------------------------------------------
 * LISTE des campagnes d'un tenant
 * GET /api/tenants/:tenantId/batches
 * ----------------------------------------- */
router.get("/:tenantId/batches", async (req, res) => {
  const { tenantId } = req.params;
  if (!isValidId(tenantId)) {
    return res.status(400).json({ error: "tenantId invalide" });
  }
  try {
    const rows = await Batch.find({ tenantId })
      .sort({ dateCreated: -1 })
      .lean();

    // Convertir les Map mongoose en objets simples pour le front
    const mapped = rows.map((b) => ({
      ...b,
      selections: Object.fromEntries(Object.entries(b.selections || {})),
      themesByGroup: Object.fromEntries(Object.entries(b.themesByGroup || {})),
    }));

    res.json(mapped);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* -------------------------------------------
 * CRÉER une campagne
 * POST /api/tenants/:tenantId/batches
 * body: { name, description?, scheduledDate?, employeeIds?: [], trainingUrl? }
 * ----------------------------------------- */
router.post("/:tenantId/batches", async (req, res) => {
  const { tenantId } = req.params;
  const {
    name,
    description,
    scheduledDate,
    employeeIds = [],
    trainingUrl,
  } = req.body || {};

  if (!isValidId(tenantId)) {
    return res.status(400).json({ error: "tenantId invalide" });
  }
  if (!name) return res.status(400).json({ error: "name requis" });

  try {
    // employés du tenant
    let employees = [];
    if (Array.isArray(employeeIds) && employeeIds.length) {
      employees = await Employee.find({ _id: { $in: employeeIds }, tenantId });
    } else {
      employees = await Employee.find({ tenantId });
    }

    const batch = await Batch.create({
      tenantId,
      name,
      description,
      scheduledDate,
      employees: employees.map((e) => e._id),
      trainingUrl,
      totalEmployees: employees.length,
      selections: {}, // Map vide (coté mongoose)
      themesByGroup: {}, // Map vide (coté mongoose)
    });

    // Génère les cibles (token) pour le tracking
    const crypto = require("crypto");
    const newToken = () => crypto.randomBytes(16).toString("base64url");

    if (employees.length) {
      await Target.insertMany(
        employees.map((e) => ({
          batchId: batch._id,
          employeeId: e._id,
          token: newToken(),
          markedSent: false,
          sentAt: null,
        }))
      );
    }

    // renvoie le batch avec Maps "vidées"
    res.status(201).json({
      ...batch.toObject(),
      selections: {},
      themesByGroup: {},
    });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

/* -------------------------------------------
 * GET la map des sélections (rehydratation front)
 * GET /api/tenants/:tenantId/batches/:batchId/selection
 * -> { "<employeeId>": true|false, ... }
 * ----------------------------------------- */
router.get("/:tenantId/batches/:batchId/selection", async (req, res) => {
  const { tenantId, batchId } = req.params;
  if (!isValidId(tenantId) || !isValidId(batchId)) {
    return res.status(400).json({ error: "IDs invalides" });
  }
  const batch = await Batch.findOne({ _id: batchId, tenantId });
  if (!batch) return res.status(404).json({ error: "Batch introuvable" });

  const out = {};
  for (const [k, v] of (batch.selections || new Map()).entries()) {
    out[k.toString()] = !!v;
  }
  res.json(out);
});

/* -------------------------------------------
 * PATCH cocher/décocher un employé (persist + sentAt)
 * PATCH /api/tenants/:tenantId/batches/:batchId/selection
 * body: { employeeId, sent }
 * ----------------------------------------- */
router.patch("/:tenantId/batches/:batchId/selection", async (req, res) => {
  const { tenantId, batchId } = req.params;
  const { employeeId, sent } = req.body || {};

  const ok = (id) => mongoose.Types.ObjectId.isValid(id);
  if (!ok(tenantId) || !ok(batchId) || !ok(employeeId)) {
    return res.status(400).json({ error: "IDs invalides" });
  }
  if (typeof sent !== "boolean") {
    return res.status(400).json({ error: "`sent` (boolean) requis" });
  }

  const batch = await Batch.findOne({ _id: batchId, tenantId });
  if (!batch) return res.status(404).json({ error: "Batch introuvable" });

  // 1) Persiste dans Batch.selections (Map)
  batch.selections.set(employeeId.toString(), sent);
  batch.markModified("selections");
  await batch.save();

  // 2) Persiste dans Target (historique + coherence globale)
  const update = sent
    ? { $set: { markedSent: true, sentAt: new Date() } }
    : { $set: { markedSent: false }, $unset: { sentAt: 1 } };

  const updated = await Target.findOneAndUpdate(
    { batchId, employeeId },
    update,
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  res.json({
    ok: true,
    employeeId,
    sent,
    markedSent: updated.markedSent,
    sentAt: updated.sentAt || null,
  });
});

/* -------------------------------------------
 * (Optionnel) PUT toutes les sélections d'un coup
 * PUT /api/tenants/:tenantId/batches/:batchId/selections
 * body: { selections: { "<employeeId>": true|false, ... } }
 * Met à jour Batch.selections ET les Targets correspondants
 * ----------------------------------------- */
router.put("/:tenantId/batches/:batchId/selections", async (req, res) => {
  const { tenantId, batchId } = req.params;
  const { selections } = req.body || {};
  if (!isValidId(tenantId) || !isValidId(batchId)) {
    return res.status(400).json({ error: "IDs invalides" });
  }
  if (!selections || typeof selections !== "object") {
    return res.status(400).json({ error: "`selections` objet requis" });
  }

  const batch = await Batch.findOne({ _id: batchId, tenantId });
  if (!batch) return res.status(404).json({ error: "Batch introuvable" });

  // 1) reconstruire la Map (Batch.selections)
  batch.selections = new Map(
    Object.entries(selections).map(([k, v]) => [k.toString(), !!v])
  );
  batch.markModified("selections");
  await batch.save();

  // 2) Met à jour les Targets en conséquence
  const ops = [];
  for (const [employeeId, val] of Object.entries(selections)) {
    const update = val
      ? { $set: { markedSent: true, sentAt: new Date() } }
      : { $set: { markedSent: false }, $unset: { sentAt: 1 } };
    ops.push(
      Target.updateOne({ batchId, employeeId }, update, {
        upsert: true,
        setDefaultsOnInsert: true,
      })
    );
  }
  if (ops.length) await Promise.all(ops);

  res.json({ ok: true });
});

/* -------------------------------------------
 * PATCH un thème pour un groupe
 * PATCH /api/tenants/:tenantId/batches/:batchId/theme
 * body: { groupName, value }
 * ----------------------------------------- */
router.patch("/:tenantId/batches/:batchId/theme", async (req, res) => {
  const { tenantId, batchId } = req.params;
  const { groupName, value } = req.body || {};
  if (!groupName) return res.status(400).json({ error: "groupName requis" });

  const batch = await Batch.findOne({ _id: batchId, tenantId });
  if (!batch) return res.status(404).json({ error: "Batch introuvable" });

  batch.themesByGroup.set(groupName, value || "");
  batch.markModified("themesByGroup");
  await batch.save();

  // renvoyer la map normalisée
  const out = {};
  for (const [k, v] of (batch.themesByGroup || new Map()).entries()) {
    out[k] = v;
  }
  res.json({ ok: true, themesByGroup: out });
});

/* -------------------------------------------
 * (Optionnel) PUT tous les thèmes d'un coup
 * PUT /api/tenants/:tenantId/batches/:batchId/themes
 * body: { themes: { "RH": "Bulletin de paie", ... } }
 * ----------------------------------------- */
router.put("/:tenantId/batches/:batchId/themes", async (req, res) => {
  const { tenantId, batchId } = req.params;
  const { themes } = req.body || {};
  if (!themes || typeof themes !== "object") {
    return res.status(400).json({ error: "`themes` objet requis" });
  }

  const batch = await Batch.findOne({ _id: batchId, tenantId });
  if (!batch) return res.status(404).json({ error: "Batch introuvable" });

  batch.themesByGroup = new Map(Object.entries(themes));
  batch.markModified("themesByGroup");
  await batch.save();

  const out = {};
  for (const [k, v] of (batch.themesByGroup || new Map()).entries()) {
    out[k] = v;
  }
  res.json({ ok: true, themesByGroup: out });
});

// GET /api/tenants/:tenantId/batches/:batchId/targets
router.get("/:tenantId/batches/:batchId/targets", async (req, res) => {
  const { tenantId, batchId } = req.params;
  if (!isValidId(tenantId) || !isValidId(batchId)) {
    return res.status(400).json({ error: "IDs invalides" });
  }
  const batch = await Batch.findOne({ _id: batchId, tenantId }).lean();
  if (!batch) return res.status(404).json({ error: "Batch introuvable" });

  const targets = await Target.find(
    { batchId },
    { employeeId: 1, token: 1 }
  ).lean();
  const BASE = process.env.PUBLIC_TRACK_BASE_URL || "http://localhost:7300/api";
  res.json(
    targets.map((t) => ({
      employeeId: t.employeeId.toString(),
      token: t.token,
      url: `${BASE}/clicks/${t.token}`,
    }))
  );
});

module.exports = router;
