// backend/routes/tenants.batches.js
const express = require("express");
const mongoose = require("mongoose");
const router = express.Router({ mergeParams: true });

const Batch = require("../models/Batch");
const Employee = require("../models/Employee");
const Target = require("../models/Target");
const crypto = require("crypto");

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
      groupConfigs: Object.fromEntries(Object.entries(b.groupConfigs || {})),
      emailTemplates: Object.fromEntries(Object.entries(b.emailTemplates || {})),
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
      groupConfigs: {}, // Map vide (coté mongoose)
      emailTemplates: {}, // Map vide (coté mongoose)
    });

    // Génère les cibles (token) pour le tracking
    const crypto = require("crypto");
    const newToken = () => crypto.randomBytes(16).toString("base64url");

    if (employees.length) {
      await Target.insertMany(
        employees.map((e) => ({
          tenantId,
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
      groupConfigs: {},
      emailTemplates: {},
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
    { tenantId, batchId, employeeId },
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
      Target.updateOne({ tenantId, batchId, employeeId }, update, {
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
 * PATCH config de groupe (theme/scenario)
 * PATCH /api/tenants/:tenantId/batches/:batchId/group-config
 * body: { groupName, config: { theme?, scenarioId?, category? }, merge?: boolean }
 * Par défaut merge=true (n’écrase pas les champs absents)
 * ----------------------------------------- */
router.patch("/:tenantId/batches/:batchId/group-config", async (req, res) => {
  const { tenantId, batchId } = req.params;
  const { groupName, config, merge = true } = req.body || {};
  if (!groupName) return res.status(400).json({ error: "groupName requis" });
  if (!config || typeof config !== "object") {
    return res.status(400).json({ error: "config objet requis" });
  }

  const batch = await Batch.findOne({ _id: batchId, tenantId });
  if (!batch) return res.status(404).json({ error: "Batch introuvable" });

  const prev = (batch.groupConfigs && batch.groupConfigs.get(groupName)) || {};
  const next = merge ? { ...prev, ...config } : config;
  batch.groupConfigs.set(groupName, next);
  batch.markModified("groupConfigs");

  // Compatibilité ascendante: si un theme est fourni, alimente aussi themesByGroup
  if (Object.prototype.hasOwnProperty.call(config, "theme")) {
    batch.themesByGroup.set(groupName, config.theme || "");
    batch.markModified("themesByGroup");
  }

  await batch.save();

  // Si un scenarioId est fourni, propager aux Targets du groupe (département)
  if (config && config.scenarioId) {
    try {
      const employees = await Employee.find(
        { tenantId, department: groupName },
        { _id: 1 }
      ).lean();
      const empIds = employees.map((e) => e._id);
      if (empIds.length) {
        // Exclure ceux ayant déjà reçu ce scenarioId par le passé (tous batches)
        const already = await Target.distinct("employeeId", {
          tenantId,
          employeeId: { $in: empIds },
          scenarioId: config.scenarioId,
        });
        const alreadySet = new Set((already || []).map(String));
        const eligible = empIds.filter((id) => !alreadySet.has(String(id)));
        if (eligible.length) {
          await Target.updateMany(
            { batchId, tenantId, employeeId: { $in: eligible } },
            { $set: { scenarioId: config.scenarioId } }
          );
        }
      }
    } catch (e) {
      console.warn("Propagation scenarioId -> Targets échouée:", e.message);
    }
  }

  const outConfigs = {};
  for (const [k, v] of (batch.groupConfigs || new Map()).entries()) {
    outConfigs[k] = v;
  }
  const outThemes = {};
  for (const [k, v] of (batch.themesByGroup || new Map()).entries()) {
    outThemes[k] = v;
  }

  res.json({ ok: true, groupConfigs: outConfigs, themesByGroup: outThemes });
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
  // Déterminer dynamiquement l'origine si l'env n'est pas défini
  const fromEnv = process.env.PUBLIC_TRACK_BASE_URL;
  const ROOT = fromEnv
    ? fromEnv.replace(/\/?api$/, "")
    : `${(req.get("x-forwarded-proto") || req.protocol)}://${req.get("host")}`;
  res.json(
    targets.map((t) => ({
      employeeId: t.employeeId.toString(),
      token: t.token,
      url: `${ROOT}/t/${t.token}`,
    }))
  );
});

module.exports = router;
/* -------------------------------------------
 * MJML: rendu et sauvegarde de template par groupe
 * POST   /api/tenants/:tenantId/batches/:batchId/mjml/render
 * PATCH  /api/tenants/:tenantId/batches/:batchId/mjml/save
 * ----------------------------------------- */

// Simple rate limit IP: 10/min
const mjmlIpHits = new Map(); // ip -> [timestamps]
function allowMjml(ip, limit = 10, windowMs = 60_000) {
  const now = Date.now();
  const arr = mjmlIpHits.get(ip) || [];
  const recent = arr.filter((t) => now - t < windowMs);
  recent.push(now);
  mjmlIpHits.set(ip, recent);
  return recent.length <= limit;
}

async function callMjmlRender({ mjmlSource }) {
  const APP_ID = process.env.MJML_APP_ID;
  const API_SECRET = process.env.MJML_API_SECRET;
  if (!APP_ID || !API_SECRET) throw new Error("MJML credentials missing");
  const auth = Buffer.from(`${APP_ID}:${API_SECRET}`).toString("base64");
  const r = await fetch("https://api.mjml.io/v1/render", {
    method: "POST",
    headers: {
      "Authorization": `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      mjml: String(mjmlSource || ""),
      keepComments: false,
      validationLevel: "strict",
    }),
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) {
    const msg = data && (data.message || data.error) ? `${data.message || data.error}` : `MJML HTTP ${r.status}`;
    throw new Error(msg);
  }
  return { html: data.html || "", errors: data.errors || [] };
}

router.post("/:tenantId/batches/:batchId/mjml/render", async (req, res) => {
  try {
    const { tenantId, batchId } = req.params;
    const { groupName = "", mjmlSource = "" } = req.body || {};
    if (!isValidId(tenantId) || !isValidId(batchId)) {
      return res.status(400).json({ error: "IDs invalides" });
    }
    const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket?.remoteAddress || "";
    if (!allowMjml(ip)) return res.status(429).json({ error: "Rate limit" });
    if (typeof mjmlSource !== "string" || mjmlSource.length === 0) {
      return res.status(400).json({ error: "mjmlSource requis" });
    }
    if (mjmlSource.length > 200_000) {
      return res.status(413).json({ error: "MJML trop volumineux (max 200KB)" });
    }
    // Optionnel: strip <script>
    const sanitized = mjmlSource.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "");
    const out = await callMjmlRender({ mjmlSource: sanitized });
    return res.json(out);
  } catch (e) {
    return res.status(500).json({ error: e.message || "Erreur rendu MJML" });
  }
});

router.patch("/:tenantId/batches/:batchId/mjml/save", async (req, res) => {
  try {
    const { tenantId, batchId } = req.params;
    const { groupName = "", mjmlSource = "", htmlRendered = "", textRendered } = req.body || {};
    if (!isValidId(tenantId) || !isValidId(batchId)) {
      return res.status(400).json({ error: "IDs invalides" });
    }
    if (!groupName) return res.status(400).json({ error: "groupName requis" });
    if (typeof mjmlSource !== "string") {
      return res.status(400).json({ error: "mjmlSource string requis" });
    }
    const batch = await Batch.findOne({ _id: batchId, tenantId });
    if (!batch) return res.status(404).json({ error: "Batch introuvable" });

    const entry = {
      mjmlSource,
      htmlRendered: String(htmlRendered || ""),
      updatedAt: new Date(),
    };
    if (typeof textRendered === "string") entry.textRendered = textRendered;

    batch.emailTemplates.set(groupName, entry);
    batch.markModified("emailTemplates");
    await batch.save();

    const out = {};
    for (const [k, v] of (batch.emailTemplates || new Map()).entries()) {
      out[k] = v;
    }
    return res.json({ ok: true, emailTemplates: out });
  } catch (e) {
    return res.status(500).json({ error: e.message || "Erreur sauvegarde MJML" });
  }
});
