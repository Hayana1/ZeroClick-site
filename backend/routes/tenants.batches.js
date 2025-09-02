// backend/routes/tenants.batches.js
const express = require("express");
const mongoose = require("mongoose");
const router = express.Router({ mergeParams: true });

const Batch = require("../models/Batch");
const Employee = require("../models/Employee");
const Target = require("../models/Target");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

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
      emailTemplates: Object.fromEntries(
        Object.entries(b.emailTemplates || {})
      ),
      attachmentsByGroup: Object.fromEntries(
        Object.entries(b.attachmentsByGroup || {})
      ),
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
    : `${req.get("x-forwarded-proto") || req.protocol}://${req.get("host")}`;
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
 * Pièces jointes par groupe (upload JSON base64)
 * ----------------------------------------- */

function sanitizeFilename(name = "") {
  return String(name || "")
    .replace(/[^a-zA-Z0-9_.-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-.]+|[-.]+$/g, "");
}
function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

// GET list
router.get(
  "/:tenantId/batches/:batchId/attachments/:groupName",
  async (req, res) => {
    const { tenantId, batchId, groupName } = req.params;
    if (!isValidId(tenantId) || !isValidId(batchId) || !groupName) {
      return res.status(400).json({ error: "Paramètres invalides" });
    }
    const batch = await Batch.findOne({ _id: batchId, tenantId });
    if (!batch) return res.status(404).json({ error: "Batch introuvable" });
    const list = batch.attachmentsByGroup?.get(groupName) || [];
    res.json(Array.isArray(list) ? list : []);
  }
);

// POST upload JSON { filename, contentBase64, mimeType }
router.post(
  "/:tenantId/batches/:batchId/attachments/:groupName",
  async (req, res) => {
    try {
      const { tenantId, batchId, groupName } = req.params;
      const { filename, contentBase64, mimeType } = req.body || {};
      if (!isValidId(tenantId) || !isValidId(batchId) || !groupName) {
        return res.status(400).json({ error: "Paramètres invalides" });
      }
      if (!filename || !contentBase64) {
        return res.status(400).json({ error: "filename et contentBase64 requis" });
      }
      const batch = await Batch.findOne({ _id: batchId, tenantId });
      if (!batch) return res.status(404).json({ error: "Batch introuvable" });

      const safe = sanitizeFilename(filename);
      const baseDir = path.join(__dirname, "../uploads", String(tenantId), String(batchId), String(groupName));
      ensureDir(baseDir);
      const filepath = path.join(baseDir, safe);

      // contentBase64 may be data URL or plain base64
      let b64 = String(contentBase64);
      const idx = b64.indexOf(",");
      if (b64.startsWith("data:") && idx !== -1) b64 = b64.slice(idx + 1);
      const buf = Buffer.from(b64, "base64");
      if (!buf || buf.length === 0) {
        return res.status(400).json({ error: "Base64 invalide" });
      }
      // Simple limit (10MB)
      if (buf.length > 10 * 1024 * 1024) {
        return res.status(413).json({ error: "Fichier trop volumineux (>10MB)" });
      }
      fs.writeFileSync(filepath, buf);

      const reqOrigin = `${req.protocol}://${req.get("host")}`.replace(/\/$/, "");
      const url = `${reqOrigin}/uploads/${encodeURIComponent(tenantId)}/${encodeURIComponent(batchId)}/${encodeURIComponent(groupName)}/${encodeURIComponent(safe)}`;
      const entry = {
        filename: safe,
        originalName: filename,
        mimeType: mimeType || null,
        size: buf.length,
        url,
        uploadedAt: new Date().toISOString(),
      };

      const list = batch.attachmentsByGroup?.get(groupName) || [];
      list.push(entry);
      batch.attachmentsByGroup.set(groupName, list);
      batch.markModified("attachmentsByGroup");
      await batch.save();

      return res.status(201).json(entry);
    } catch (e) {
      return res.status(500).json({ error: e.message || "Erreur upload" });
    }
  }
);

// DELETE by filename
router.delete(
  "/:tenantId/batches/:batchId/attachments/:groupName/:filename",
  async (req, res) => {
    const { tenantId, batchId, groupName, filename } = req.params;
    if (!isValidId(tenantId) || !isValidId(batchId) || !groupName || !filename) {
      return res.status(400).json({ error: "Paramètres invalides" });
    }
    const batch = await Batch.findOne({ _id: batchId, tenantId });
    if (!batch) return res.status(404).json({ error: "Batch introuvable" });

    const list = Array.isArray(batch.attachmentsByGroup?.get(groupName))
      ? batch.attachmentsByGroup.get(groupName)
      : [];
    const next = list.filter((x) => x.filename !== filename);
    batch.attachmentsByGroup.set(groupName, next);
    batch.markModified("attachmentsByGroup");
    await batch.save();

    // delete file on disk
    try {
      const baseDir = path.join(__dirname, "../uploads", String(tenantId), String(batchId), String(groupName));
      const filepath = path.join(baseDir, filename);
      fs.unlinkSync(filepath);
    } catch {}

    res.json({ ok: true });
  }
);
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
  const src = String(mjmlSource || "");
  const looksHtml = /<\s*(html|body|table|div|p|span)/i.test(src) && !/^\s*<mjml[\s>]/i.test(src);
  if (looksHtml) {
    // Basic guard
    const hasScript = /<script[\s>]/i.test(src) || /javascript\s*:/i.test(src);
    if (hasScript) throw new Error("HTML non conforme (script détecté)");
    return { html: src, errors: [] };
  }
  const APP_ID = process.env.MJML_APP_ID;
  const API_SECRET = process.env.MJML_API_SECRET;
  if (!APP_ID || !API_SECRET) throw new Error("MJML credentials missing");
  const auth = Buffer.from(`${APP_ID}:${API_SECRET}`).toString("base64");
  const r = await fetch("https://api.mjml.io/v1/render", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      mjml: src,
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
    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
      req.socket?.remoteAddress ||
      "";
    if (!allowMjml(ip)) return res.status(429).json({ error: "Rate limit" });
    if (typeof mjmlSource !== "string" || mjmlSource.length === 0) {
      return res.status(400).json({ error: "mjmlSource requis" });
    }
    if (mjmlSource.length > 200_000) {
      return res
        .status(413)
        .json({ error: "MJML trop volumineux (max 200KB)" });
    }
    const sanitized = String(mjmlSource || "");
    const out = await callMjmlRender({ mjmlSource: sanitized });
    return res.json(out);
  } catch (e) {
    return res.status(500).json({ error: e.message || "Erreur rendu MJML" });
  }
});

router.patch("/:tenantId/batches/:batchId/mjml/save", async (req, res) => {
  try {
    const { tenantId, batchId } = req.params;
    const {
      groupName = "",
      mjmlSource = "",
      htmlRendered = "",
      textRendered,
      metadata,
    } = req.body || {};
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
    if (metadata && typeof metadata === "object") entry.metadata = metadata;

    batch.emailTemplates.set(groupName, entry);
    batch.markModified("emailTemplates");
    await batch.save();

    const out = {};
    for (const [k, v] of (batch.emailTemplates || new Map()).entries()) {
      out[k] = v;
    }
    return res.json({ ok: true, emailTemplates: out });
  } catch (e) {
    return res
      .status(500)
      .json({ error: e.message || "Erreur sauvegarde MJML" });
  }
});

/* -------------------------------------------
 * AI: Génération MJML depuis scénario/brand
 * POST /api/tenants/:tenantId/batches/:batchId/ai/generate-mjml
 * body: { groupName, scenarioId, brandId?, locale?, tone?, ctaLabel?, actionUrl, fallbackLogoUrl?, dryRun? }
 * ----------------------------------------- */
const aiIpHits = new Map(); // ip -> [timestamps]
function allowAI(ip, limit = 5, windowMs = 60_000) {
  const now = Date.now();
  const arr = aiIpHits.get(ip) || [];
  const recent = arr.filter((t) => now - t < windowMs);
  recent.push(now);
  aiIpHits.set(ip, recent);
  return recent.length <= limit;
}

function loadScenarios() {
  try {
    const p = path.join(__dirname, "../data/scenarios.json");
    const raw = fs.readFileSync(p, "utf8");
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

function loadBrands() {
  try {
    const p = path.join(__dirname, "../data/brands.json");
    const raw = fs.readFileSync(p, "utf8");
    const data = JSON.parse(raw);
    // normalize to flat list
    if (Array.isArray(data)) return data;
    if (data && typeof data === "object") {
      if (Array.isArray(data.items)) return data.items;
      if (data.pools && typeof data.pools === "object") {
        const list = [];
        for (const [pool, arr] of Object.entries(data.pools)) {
          if (Array.isArray(arr))
            list.push(...arr.map((b) => ({ ...b, pool })));
        }
        return list;
      }
    }
    return [];
  } catch (e) {
    return [];
  }
}

function hashSeed(str = "") {
  return crypto
    .createHash("sha256")
    .update(String(str))
    .digest("hex")
    .slice(0, 12);
}

function mapCategoryToAllowedPayloads(category = "") {
  const c = String(category || "").toLowerCase();
  if (c.includes("finance") || c.includes("achats"))
    return ["pdf", "excel", "cta", "form"];
  if (c.includes("legal")) return ["docx", "cta", "login"];
  if (c.includes("it") || c.includes("saas"))
    return ["login", "cta", "gdrive", "onedrive"];
  if (c.includes("rh")) return ["form", "docx", "cta"];
  if (c.includes("support") || c.includes("ops") || c.includes("operations"))
    return ["attachment", "cta"];
  return ["cta", "pdf"]; // fallback sobre
}

function candidateDesignsFor(category = "", styleHint = "") {
  const base = new Set(["sobre", "institutionnel"]);
  if ((styleHint || "").toLowerCase() === "marketing") base.add("marketing");
  if ((styleHint || "").toLowerCase() === "startup") base.add("saas");
  if (
    String(category || "")
      .toLowerCase()
      .includes("it")
  )
    base.add("saas");
  return Array.from(base);
}

function brandPoolFor(category = "") {
  // Map simple vers un pool par défaut
  const cat = String(category || "").toLowerCase();
  if (cat.includes("it")) return "global_it";
  if (cat.includes("finance") || cat.includes("achats"))
    return "global_finance";
  if (cat.includes("rh")) return "global_rh";
  return null;
}

function fallbackPoolsFor(category = "") {
  const cat = String(category || "").toLowerCase();
  if (cat.includes("finance") || cat.includes("achats")) return ["global_finance", "global_it", "global_rh"];
  if (cat.includes("it") || cat.includes("saas")) return ["global_it", "global_finance", "global_rh"];
  if (cat.includes("rh")) return ["global_rh", "global_it", "global_finance"];
  return ["global_it", "global_finance", "global_rh"];
}

// In-memory cache (5 min) for selector results to improve responsiveness and stability
const selectorCache = new Map(); // key -> { t, selection }
const SELECTOR_CACHE_TTL = 5 * 60 * 1000;

function cacheGet(key) {
  const e = selectorCache.get(key);
  if (!e) return null;
  if (Date.now() - e.t > SELECTOR_CACHE_TTL) {
    selectorCache.delete(key);
    return null;
  }
  return e.selection;
}
function cacheSet(key, selection) {
  selectorCache.set(key, { t: Date.now(), selection });
}

function withinCooldown(history = [], cooldownDays = 3, payloadType) {
  if (!payloadType) return false;
  const now = Date.now();
  const win = Number(cooldownDays || 0) * 24 * 3600 * 1000;
  return (history || []).some((h) => {
    if (!h || h.payloadType !== payloadType) return false;
    const d = h.date ? new Date(h.date).getTime() : null;
    if (!d || isNaN(d)) return false;
    return now - d < win;
  });
}

function diversityViolated(history = [], payloadType, targets = {}, windowN = 10) {
  if (!payloadType) return false;
  const n = Math.max(1, Number(windowN || 10));
  const recent = (history || []).slice(0, n);
  const count = recent.filter((h) => h && h.payloadType === payloadType).length;
  const ratio = count / (recent.length || 1);
  const max = Number(targets[payloadType] || 0);
  return max > 0 && ratio > max;
}

function chooseAlternatePayload(allowed = [], avoidSet = new Set()) {
  for (const p of allowed) if (!avoidSet.has(p)) return p;
  return allowed[0] || 'cta';
}

/* -------------------------------------------
 * AI Selector: choisit payloadType/design/brand
 * POST /api/tenants/:tenantId/batches/:batchId/ai/select
 * body: { scenario, scenarioId?, employee, history?, constraints? }
 * ----------------------------------------- */
router.post("/:tenantId/batches/:batchId/ai/select", async (req, res) => {
  try {
    const { tenantId, batchId } = req.params;
    const {
      scenario: scenarioObj,
      scenarioId,
      employee = {},
      history = [], // [{ payloadType, designVariant, date }]
      constraints = { cooldownDays: 3, diversityTargets: { login: 0.3 } },
    } = req.body || {};

    if (!isValidId(tenantId) || !isValidId(batchId)) {
      return res.status(400).json({ error: "IDs invalides" });
    }

    // Build scenario info
    let picked = null;
    if (scenarioObj && typeof scenarioObj === "object") picked = scenarioObj;
    if (!picked && scenarioId) {
      const scenarios = loadScenarios();
      picked = (scenarios || []).find((s) => s.id === scenarioId) || null;
    }
    if (!picked) return res.status(400).json({ error: "scenario requis" });

    const scen = {
      id: picked.id,
      name: picked.name || picked.id,
      category: picked.category || "",
      styleHint: picked.styleHint || "",
      payloadType: picked.payloadType || "",
      email: picked.email || {},
    };

    // Rules
    const allowedPayloads = Array.from(
      new Set([
        ...(scen.payloadType ? [scen.payloadType] : []),
        ...mapCategoryToAllowedPayloads(scen.category),
      ])
    );
    const candidateDesigns = candidateDesignsFor(scen.category, scen.styleHint);

    // Brand shortlist
    const brands = loadBrands();
    const poolName = brandPoolFor(scen.category);
    const pool = poolName
      ? brands.filter((b) => String(b.pool) === poolName)
      : brands;
    // fallback if pool empty
    const brandPool = pool && pool.length ? pool : brands;

    // Deterministic seed
    // Seed principal stable = employé + scénario (batch pour la variation est géré plus tard)
    const seedStr = `${employee.id || employee._id || "emp"}:${scen.id}`;
    const seed = hashSeed(seedStr);

    // Cache check (5 minutes)
    const cacheKey = `${tenantId}:${batchId}:${employee.id || employee._id || 'emp'}:${scen.id}`;
    const cached = cacheGet(cacheKey);
    if (cached) return res.json({ ok: true, selection: cached, context: { scenario: scen, allowedPayloads, candidateDesigns } });

    // Prepare OpenAI prompt
    const SELECTOR_SYSTEM = [
      "You are a B2B phishing-simulation selector.",
      "Return ONLY valid JSON matching the schema.",
      "Respect constraints and business logic. Prefer the most plausible option for a professional context.",
    ].join(" ");

    const selectorInput = {
      scenario: scen,
      allowedPayloads,
      candidateDesigns,
      brandPool: brandPool.map((b) => ({
        id: b.id || b._id || b.slug,
        name: b.displayName || b.name,
      })),
      employee,
      history,
      constraints,
      seed,
    };

    const SELECTOR_USER = [
      `Context:`,
      `- Scenario: ${JSON.stringify(scen)}`,
      `- AllowedPayloads: ${JSON.stringify(allowedPayloads)}`,
      `- CandidateDesigns: ${JSON.stringify(candidateDesigns)}`,
      `- BrandPool: ${JSON.stringify(selectorInput.brandPool)}`,
      `- Employee: ${JSON.stringify(employee)}`,
      `- HistorySummary: ${JSON.stringify(history)}`,
      `- Constraints: ${JSON.stringify(constraints)}`,
      `\nTask:`,
      `1) Choose the SINGLE best combination (payloadType, designVariant, brandId) for B2B realism.`,
      `2) Generate subject + preheader aligned to brand & scenario.`,
      `3) Ensure cooldown/diversity are respected; if conflict, pick next-best.`,
      `4) Keep tone professional (prefer French if locale=fr-CA).`,
      `\nOutput JSON schema:`,
      `{ "payloadType": "pdf|docx|excel|cta|login|gdrive|onedrive|form|plaintext", "designVariant": "institutionnel|sobre|saas|marketing|plain", "brandId": "string", "subject": "string", "preheader": "string", "tone": "formel|neutre|pressant", "cooldownOK": true, "rationale": "string", "seed": "string" }`,
      `\nReturn ONLY JSON.`,
    ].join("\n");

    let selection = null;
    try {
      const OPENAI_API = process.env.OPENAI_API || process.env.OPENAI_API_KEY;
      if (!OPENAI_API) throw new Error("OPENAI_API manquant");
      const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
      const rr = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENAI_API}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          temperature: 0.4,
          messages: [
            { role: "system", content: SELECTOR_SYSTEM },
            { role: "user", content: SELECTOR_USER },
          ],
          max_tokens: 1000,
          response_format: { type: "json_object" },
        }),
      });
      const data = await rr.json().catch(() => ({}));
      if (!rr.ok)
        throw new Error(data?.error?.message || `OpenAI HTTP ${rr.status}`);
      const txt = String(data?.choices?.[0]?.message?.content || "").trim();
      try {
        selection = JSON.parse(txt);
      } catch {
        throw new Error("Réponse IA non‑JSON");
      }
    } catch (e) {
      // fallback déterministe
      const last = (history || [])[0] || {};
      const pt =
        allowedPayloads.find((p) => p !== last.payloadType) ||
        allowedPayloads[0] ||
        "cta";
      const dv =
        candidateDesigns.find((d) => d !== last.designVariant) ||
        candidateDesigns[0] ||
        "sobre";
      const b =
        brandPool[
          parseInt(seed.slice(0, 6), 16) % Math.max(1, brandPool.length)
        ];
      selection = {
        payloadType: pt,
        designVariant: dv,
        brandId: b ? b.id || b._id || b.slug || "" : "",
        subject: scen.email?.subject || scen.name,
        preheader: scen.email?.preheader || "Veuillez confirmer ou commenter.",
        tone: "formel",
        cooldownOK: true,
        rationale: "fallback-rules",
        seed,
        _fallback: true,
        _error: e?.message || String(e),
      };
    }

    // post-checks & enforcement
    if (!allowedPayloads.includes(selection.payloadType)) {
      selection.payloadType = allowedPayloads[0] || "cta";
    }
    if (!candidateDesigns.includes(selection.designVariant)) {
      selection.designVariant = candidateDesigns[0] || "sobre";
    }
    if (!selection.seed) selection.seed = seed;

    // Enforce cooldown/diversity server-side
    const cdDays = Number((constraints && constraints.cooldownDays) || 0);
    const diversity = (constraints && constraints.diversityTargets) || {};
    const avoid = new Set();
    if (cdDays > 0 && withinCooldown(history, cdDays, selection.payloadType)) {
      avoid.add(selection.payloadType);
    }
    if (diversity && Object.keys(diversity).length) {
      if (diversityViolated(history, selection.payloadType, diversity, 10)) {
        avoid.add(selection.payloadType);
      }
    }
    if (avoid.size) {
      const alt = chooseAlternatePayload(allowedPayloads, avoid);
      selection.payloadType = alt;
      selection.rationale = `${selection.rationale || 'enforced'}; server-adjusted payloadType`;
    }

    // Ensure brand is in a plausible pool; try fallback pools sequence if empty
    const enforcePoolName = brandPoolFor(scen.category);
    let shortlist = [];
    if (enforcePoolName) {
      // reuse loaded brands from above scope when possible
      shortlist = brands.filter((b) => String(b.pool) === enforcePoolName);
      if (!shortlist.length) {
        for (const fn of fallbackPoolsFor(scen.category)) {
          shortlist = brands.filter((b) => String(b.pool) === fn);
          if (shortlist.length) break;
        }
      }
    }
    if (!selection.brandId && shortlist.length) {
      const pick = shortlist[parseInt(seed.slice(0, 6), 16) % shortlist.length];
      selection.brandId = pick ? (pick.id || pick._id || pick.slug || '') : '';
    }

    cacheSet(cacheKey, selection);

    return res.json({ ok: true, selection, context: selectorInput });
  } catch (e) {
    return res.status(500).json({ error: e.message || "Erreur selector" });
  }
});

function pickScenarioInfo(scenarios, scenarioId) {
  const s = (scenarios || []).find((x) => x.id === scenarioId);
  if (!s) return null;
  return {
    id: s.id,
    name: s.name || s.id,
    category: s.category || "",
    emailSubject: (s.email && s.email.subject) || "",
    trainingTitle: (s.training && s.training.title) || "",
  };
}

router.post(
  "/:tenantId/batches/:batchId/ai/generate-mjml",
  async (req, res) => {
    try {
      const { tenantId, batchId } = req.params;
      const {
        groupName = "",
        scenarioId = "",
        scenario: scenarioObj,
        brandId,
        brand: brandObj,
        identity,
        locale = "fr",
        tone = "formal",
        ctaLabel = "Confirmer la mise à jour",
        actionUrl = "https://example.com/action",
        fallbackLogoUrl = "https://via.placeholder.com/120x40?text=Logo",
        trackingUrl,
        assets = {},
        seed,
        designVariant,
        dryRun = false,
      } = req.body || {};

      if (!isValidId(tenantId) || !isValidId(batchId)) {
        return res.status(400).json({ error: "IDs invalides" });
      }
      const ip =
        req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
        req.socket?.remoteAddress ||
        "";
      if (!allowAI(ip)) return res.status(429).json({ error: "Rate limit" });

      // Charger scénario (garder une version complète pour overrides éventuels)
      let scen = null;
      let scenFull = null;
      if (scenarioObj && typeof scenarioObj === "object") {
        scen = {
          id: scenarioObj.id,
          name: scenarioObj.name || scenarioObj.id,
          category: scenarioObj.category || "",
          emailSubject: (scenarioObj.email && scenarioObj.email.subject) || "",
          preheader: (scenarioObj.email && scenarioObj.email.preheader) || "",
          styleHint: scenarioObj.styleHint || "",
          payloadType: scenarioObj.payloadType || "",
        };
      } else {
        if (!scenarioId)
          return res.status(400).json({ error: "scenarioId requis" });
        const scenarios = loadScenarios();
        const picked =
          (scenarios || []).find((x) => x.id === scenarioId) || null;
        if (!picked) return res.status(404).json({ error: "Scenario inconnu" });
        scenFull = picked;
        scen = {
          id: picked.id,
          name: picked.name || picked.id,
          category: picked.category || "",
          emailSubject: (picked.email && picked.email.subject) || "",
          preheader: (picked.email && picked.email.preheader) || "",
          styleHint: picked.styleHint || "",
          payloadType: picked.payloadType || "",
        };
      }

      // Brand: charger depuis brands.json si brandId fourni, sinon fallback ou objet fourni
      let brand =
        brandObj && typeof brandObj === "object"
          ? {
              displayName:
                brandObj.displayName ||
                brandObj.name ||
                groupName ||
                "Votre entreprise",
              logoUrl: brandObj.logoUrl || fallbackLogoUrl,
              colorPrimary: brandObj.colorPrimary || "#2563eb",
              colorAccent: brandObj.colorAccent || "#111827",
            }
          : {
              displayName: groupName || "Votre entreprise",
              logoUrl: fallbackLogoUrl,
              colorPrimary: "#2563eb",
              colorAccent: "#111827",
            };
      if (brandId) {
        const brands = loadBrands();
        const b = (Array.isArray(brands) ? brands : []).find(
          (x) => String(x.id || x._id || x.slug) === String(brandId)
        );
        if (b) {
          brand = {
            displayName:
              b.displayName || b.name || groupName || "Votre entreprise",
            logoUrl: b.logoUrl || fallbackLogoUrl,
            colorPrimary: b.colorPrimary || "#2563eb",
            colorAccent: b.colorAccent || "#111827",
          };
        }
      }

      // Si le scénario fournit un HTML prêt à l'emploi, le privilégier (pas d'IA)
      if (scenFull?.email && typeof scenFull.email.html === 'string' && scenFull.email.html.trim().length) {
        const today = new Date();
        const pad = (n) => String(n).padStart(2, '0');
        const todayStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
        const vars = {
          trackingUrl: trackingUrl || actionUrl,
          subject: scen.emailSubject || scen.name || scen.id,
          preheader: scen.preheader || '',
          'brand.name': brand.displayName || 'Votre entreprise',
          'brand.logoUrl': brand.logoUrl || fallbackLogoUrl,
          'brand.colorPrimary': brand.colorPrimary || '#2563eb',
          'brand.colorAccent': brand.colorAccent || '#111827',
          today: todayStr,
        };
        const replaceVars = (str) => String(str || '').replace(/\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g, (_, key) => (Object.prototype.hasOwnProperty.call(vars, key) ? vars[key] : ''));
        let htmlText = replaceVars(String(scenFull.email.html));
        const hasScript = /<script[\s>]/i.test(htmlText) || /javascript\s*:/i.test(htmlText);
        if (hasScript) {
          return res.status(422).json({ error: 'Template HTML non conforme dans le scénario.' });
        }
        // Le front attend { mjml }, on renvoie l'HTML dans ce champ (éditeur en mode HTML)
        return res.json({ mjml: htmlText });
      }

      // Si le scénario fournit un MJML prêt à l'emploi, le privilégier (pas d'IA)
      if (scenFull?.email && typeof scenFull.email.mjml === 'string' && scenFull.email.mjml.trim().length) {
        const today = new Date();
        const pad = (n) => String(n).padStart(2, '0');
        const todayStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
        const vars = {
          trackingUrl: trackingUrl || actionUrl,
          subject: scen.emailSubject || scen.name || scen.id,
          preheader: scen.preheader || '',
          'brand.name': brand.displayName || 'Votre entreprise',
          'brand.logoUrl': brand.logoUrl || fallbackLogoUrl,
          'brand.colorPrimary': brand.colorPrimary || '#2563eb',
          'brand.colorAccent': brand.colorAccent || '#111827',
          today: todayStr,
        };
        const replaceVars = (str) =>
          String(str || '').replace(/\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g, (_, key) =>
            Object.prototype.hasOwnProperty.call(vars, key) ? vars[key] : ''
          );
        let mjmlText = replaceVars(String(scenFull.email.mjml));
        // Garde-fous simples
        const tooLarge = mjmlText.length > 200_000;
        const looksMjml = /^<mjml[\s>]/i.test(mjmlText) && /<mj-body[\s>]/i.test(mjmlText);
        const hasScript = /<script[\s>]/i.test(mjmlText) || /javascript\s*:/i.test(mjmlText);
        if (tooLarge || hasScript || !looksMjml) {
          return res.status(422).json({ error: 'Template MJML non conforme dans le scénario.' });
        }
        return res.json({ mjml: mjmlText });
      }

      if (dryRun) {
        return res.json({
          mjml:
            '<mjml><mj-head><mj-preview>Exemple</mj-preview><mj-attributes><mj-all font-family="Inter, Arial, sans-serif"/></mj-attributes></mj-head><mj-body><mj-section><mj-column><mj-text>Exemple MJML (dryRun)</mj-text><mj-button href="' +
            actionUrl +
            '" background-color="' +
            brand.colorPrimary +
            '">' +
            ctaLabel +
            "</mj-button></mj-column></mj-section></mj-body></mjml>",
        });
      }

      const OPENAI_API = process.env.OPENAI_API || process.env.OPENAI_API_KEY;
      if (!OPENAI_API)
        return res.status(500).json({ error: "OPENAI_API manquant" });

      const effectiveUrl = trackingUrl || actionUrl;
      const dv = String(designVariant || scen.styleHint || "").toLowerCase() || "sobre";
      const seedHex = typeof seed === 'number' ? seed.toString(16) : String(seed || '0');
      const seedInt = parseInt(seedHex, 16) || 0;

      // Category- and payload-based CTA labels (varied by seed)
      const CTA_MAP = {
        finance: [
          'Vérifier la facture',
          'Valider le bon de commande',
          'Confirmer les coordonnées',
          'Consulter le dossier',
        ],
        achats: ['Valider le bon de commande', 'Vérifier le devis', 'Consulter la commande'],
        'it-saas': ['Se connecter', 'Réactiver l’accès', 'Vérifier mon compte', 'Ouvrir le portail'],
        rh: ['Compléter le formulaire', 'Mettre à jour mes informations', 'Transmettre la validation'],
        legal: ['Accéder au document', 'Signer le document', 'Vérifier la clause'],
        default: ['Accéder au document', 'Consulter le dossier', 'Ouvrir le lien sécurisé'],
      };
      const PAYLOAD_CTA = {
        pdf: ['Télécharger le PDF', 'Ouvrir le document (PDF)', 'Consulter le fichier .pdf'],
        docx: ['Télécharger le document (DOCX)', 'Ouvrir le document Word', 'Consulter le fichier .docx'],
        doc: ['Télécharger le document Word', 'Ouvrir le fichier .doc'],
        excel: ['Télécharger le fichier (XLSX)', 'Ouvrir la feuille Excel', 'Consulter le fichier .xlsx'],
        attachment: ['Télécharger la pièce jointe', 'Ouvrir la pièce jointe'],
        gdrive: ['Ouvrir dans Google Drive', 'Accéder au document partagé'],
        onedrive: ['Ouvrir dans OneDrive', 'Accéder au document partagé'],
        login: ['Se connecter', 'Réactiver l’accès', 'Vérifier mon compte'],
        form: ['Compléter le formulaire', 'Remplir le formulaire sécurisé'],
        cta: ['Accéder au document', 'Consulter le dossier'],
      };
      const catKey = (scen.category || '').toLowerCase();
      const ptKey = (scen.payloadType || '').toLowerCase();
      const payloadBucket = PAYLOAD_CTA[ptKey] || null;
      const baseBucket = payloadBucket || CTA_MAP[catKey] || CTA_MAP['default'];
      const chosenCta = (ctaLabel && ctaLabel.trim()) || baseBucket[seedInt % baseBucket.length];
      const variationGuide = [
        "Variabilité et design:",
        '- Choisir un layout en fonction de designVariant="' +
          dv +
          '" et de seed.',
        "- institutionnel: bandeau en-tête fin (logo à gauche), rappel référence/dossier en haut à droite, CTA centré.",
        "- sobre: logo discret en bas (signature), texte en 3–5 paragraphes, CTA simple aligné à gauche.",
        "- saas (startup): header compact, petits labels/badges, CTA aligné gauche, sections courtes.",
        "- marketing (B2B): logo centré + sous-titre, sections séparées, CTA visible mais sobre (pas agressif).",
        "- Position du logo: varier selon seed (haut-gauche, haut-centre, bas-signature).",
        "- Palette CTA: alterner selon seed entre (a) plein brand.colorPrimary, (b) outline brand.colorPrimary sur fond blanc, (c) plein brand.colorAccent atténué.",
        "- Alignement CTA: varier (gauche/centre) selon seed pour casser la monotonie.",
        "- Si le scénario mentionne Teams/Zoom, utiliser un en-tête discret aux couleurs de l’outil (ex. Teams #464EB8) sans images lourdes.",
      ].join("\n");

      const contentGuide = [
        "Contenu riche et crédible:",
        "- Rédiger un courriel humain et professionnel (120–220 mots) en français, ton " +
          tone +
          ".",
        "- Inclure: salutation (facultative), contexte (date/échanges précédents/personnes), demande claire, échéance, point de contact.",
        "- Ajouter une ligne miroir: Si le bouton ne fonctionne pas… avec lien en clair (" +
          effectiveUrl +
          ").",
        "- Variantes CTA selon seed (garder href=trackingUrl, varier la FORME):",
        "  • Bouton principal plein",
        "  • Bouton outline (bordure)",
        "  • Lien texte explicite (souligné)",
        "  • Lien de fichier crédible: texte affiché qui SE TERMINE par .pdf/.docx/.xls (ex: Devis_#4827_{{today}}.pdf) mais href=trackingUrl",
        "  • Lien intégré dans une phrase (ex: 'télécharger le document')",
        "- Pour payloadType=pdf|docx|excel: afficher un nom de fichier crédible (ex: Devis_#4827_{{today}}.pdf / Contrat_2025-{{today}}.docx / Suivi_heures_{{today}}.xlsx).",
        "- Pour payloadType=login: bouton Se connecter et lien texte alternatif (href=trackingUrl).",
        "- Pour payloadType=gdrive|onedrive: texte 'Ouvrir dans …' (href=trackingUrl) + note 'ne partagez pas ce lien'.",
        "- Pour payloadType=form|cta: bouton clair + rappel de délai.",
        "- Ajouter un bloc optionnel (0–2 selon seed): aide/contact, note informative (référence/échéance), rappel confidentialité.",
        "- Interdit: ne pas utiliser ces formulations génériques exactes (‘Confirmer la mise à jour’, ‘Cliquez ici’, ‘Merci de confirmer’). Paraphraser toujours.",
      ].join("\n");

      const systemPrompt = [
        "Tu es un assistant d’emailing.",
        "Tu renvoies UNIQUEMENT du MJML valide, sans commentaires, sans backticks, sans <script>.",
        "Le MJML doit être responsive, compatible Outlook, ratio texte/images correct, preheader, CTA bulletproof.",
        "Aucune URL tierce non-HTTPS, pas de tracking visible, le href du CTA utilise trackingUrl.",
        "Utilise <mj-attributes> avec Inter, Arial, sans-serif.",
        "Inclure <mj-preview>.",
        "Palette: bouton = colorPrimary, accents = colorAccent.",
        "Ajouter une section ‘note’ ou ‘muted’ si pertinent, lien texte légitime (href=trackingUrl), footer discret + disclaimer.",
        "N’utilise que les URLs fournies (brand.logoUrl, assets.*, trackingUrl). Pas de data: URI, pas d’iframes, pas de <mj-style>.",
        variationGuide,
        contentGuide,
      ].join(" ");

      const senderLine =
        identity && typeof identity === "object"
          ? `Expéditeur: ${[identity.firstName, identity.lastName]
              .filter(Boolean)
              .join(" ")}${identity.role ? `, rôle: ${identity.role}` : ""}.`
          : "";

      // Few-shot micro examples (guidance only)
      const fewShots = [
        "[Exemple Finance · institutionnel] Contexte: ref PO-2487, échéance vendredi. Afficher le rappel procédure et contact comptable.",
        "[Exemple IT · saas] Contexte: réauth SSO suite mise à jour. Préciser impact et lien miroir, éviter ton alarmiste.",
        "[Exemple RH · sobre] Contexte: mise à jour annuelle intranet RH. Demander validation d’ici une date, proposer contact RH.",
      ].join("\\n");

      const synonyms = (function(){
        const base = [];
        if (catKey.includes('finance') || catKey.includes('achats')) base.push('référence','bon de commande','échéance','validation','comptable');
        if (catKey.includes('it') || catKey.includes('saas')) base.push('portail','session','authentification','accès','réactivation');
        if (catKey.includes('rh')) base.push('intranet','formulaire','coordonnées','transmission');
        return Array.from(new Set(base)).join(', ');
      })();

      const userPrompt = [
        `Locale: ${locale}. Ton: ${tone}.`,
        `Scénario: ${scen.name} (id ${scen.id}, catégorie ${
          scen.category
        }, styleHint ${scen.styleHint || "sobre"}, payloadType ${
          scen.payloadType || "cta"
        }). Sujet: ${scen.emailSubject}. Preheader: ${scen.preheader || ""}.`,
        `Brand: ${brand.displayName} (logo: ${brand.logoUrl}, couleurs: ${brand.colorPrimary} / ${brand.colorAccent}).`,
        senderLine,
        `CTA: ${chosenCta} → ${effectiveUrl}.`,
        `Assets: pdf=${assets.pdfIconUrl || ""} doc=${
          assets.docIconUrl || ""
        } xls=${assets.excelIconUrl || ""}.`,
        `Seed: ${typeof seed === "number" ? seed : seedHex}.`,
        `DesignVariant: ${dv}.`,
        `Synonymes préférés (en utiliser 2–3 sans forcer): ${synonyms}.`,
        `Exemples (ne pas copier; seulement s'inspirer du ton/structure):\n${fewShots}`,
        `Règles de placement: varier logo/CTA selon seed (ex: seed%3==0 logo bas, seed%3==1 haut-gauche, seed%3==2 centré).`,
        `Contraintes: <mj-attributes> Inter/Arial, <mj-preview>, bouton aux couleurs, section note/muted, lien texte vers trackingUrl, footer discret, pas de <script> ni ressources lourdes.`,
        `Variabilité: adapter structure selon styleHint et seed (placement logo, header, signature, 0-2 blocs optionnels).`,
        `Réponds uniquement par du MJML complet (<mjml><mj-head>…</mj-head><mj-body>…</mj-body></mjml>).`,
      ].join("\n");

      const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
      const OPENAI_TIMEOUT_MS = Number(process.env.OPENAI_TIMEOUT_MS || 15000);
      const ctrl = new AbortController();
      const __to = setTimeout(() => ctrl.abort(), OPENAI_TIMEOUT_MS).unref?.();
      const r = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENAI_API}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          temperature: 0.6,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          max_tokens: 3500,
        }),
        signal: ctrl.signal,
      });
      clearTimeout(__to);
      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        const msg = data?.error?.message || `OpenAI HTTP ${r.status}`;
        return res.status(502).json({ error: msg });
      }
      let text = data?.choices?.[0]?.message?.content || "";
      text = String(text || "").trim();

      // Garde-fous de sortie
      const tooLarge = text.length > 30_000; // ~30KB
      const hasScript =
        /<script[\s>]/i.test(text) ||
        /javascript\s*:/i.test(text) ||
        /onerror\s*=|onload\s*=/i.test(text) ||
        /<iframe[\s>]/i.test(text) ||
        /<mj-style[\s>]/i.test(text);
      const looksMjml =
        /^<mjml[\s>]/i.test(text) &&
        /<mj-head[\s>]/i.test(text) &&
        /<mj-body[\s>]/i.test(text);
      const hasDataUri = /\ssrc\s*=\s*["']data:/i.test(text);
      const nonHttpsSrc = /\ssrc\s*=\s*["'](http:)[^"']*["']/i.test(text);
      if (tooLarge || hasScript || !looksMjml) {
        return res
          .status(422)
          .json({
            error:
              "Contenu non conforme (pas de MJML valide ou contenu interdit).",
          });
      }
      if (hasDataUri || nonHttpsSrc) {
        return res
          .status(422)
          .json({
            error: "Ressources non conformes (data: ou http: détecté).",
          });
      }
      // --- Enforce variation client-side (CTA/style) de manière déterministe ---
      try {
        const ctaLabels = [
          "Valider et continuer",
          "Vérifier et confirmer",
          "Accéder au document",
          "Se connecter",
          "Ouvrir le dossier",
          "Compléter le formulaire",
        ];
        const exts =
          scen.payloadType === "pdf"
            ? ".pdf"
            : scen.payloadType === "docx" || scen.payloadType === "doc"
            ? ".docx"
            : scen.payloadType === "excel"
            ? ".xlsx"
            : ".pdf";
        const seedNum = Number.isFinite(seed) ? Number(seed) : 0;
        const variant = seedNum % 4; // 0..3

        let mj = text;
        const url = effectiveUrl;
        const ensureMirror = () => {
          if (
            !/Si le bouton ne fonctionne pas|copiez-collez ce lien/i.test(mj)
          ) {
            mj = mj.replace(
              /<mj-divider[\s\S]*?<\/mj-divider>/i,
              (m) =>
                `${m}\n<mj-text font-size="12px" color="#666">Si le bouton ne fonctionne pas, copiez-collez ce lien : <a href="${url}">${url}</a></mj-text>`
            );
          }
        };

        // Variant-specific adjustments
        if (variant === 0) {
          // Solid brand.primary button
          mj = mj.replace(
            /<mj-button([^>]*)background-color=\"[^\"]*\"/i,
            `<mj-button$1 background-color="${brand.colorPrimary || "#2563eb"}"`
          );
        } else if (variant === 1) {
          // Outline button: white background, colored border + text
          mj = mj.replace(
            /<mj-button([^>]*)>/i,
            (m, attrs) =>
              `<mj-button${attrs} background-color="#ffffff" color="${
                brand.colorPrimary || "#2563eb"
              }" border="1px solid ${brand.colorPrimary || "#2563eb"}">`
          );
        } else if (variant === 2) {
          // Replace primary button with a file-looking text link
          if (/<mj-button[\s\S]*?<\/mj-button>/i.test(mj)) {
            mj = mj.replace(
              /<mj-button[\s\S]*?<\/mj-button>/i,
              `<mj-text font-size="14px"> <a href="${url}">Devis_#4827_{{today}}${exts}</a> </mj-text>`
            );
          } else {
            mj = mj.replace(
              /<mj-text[^>]*>Bonjour,?<\/mj-text>/i,
              (m) =>
                `${m}\n<mj-text font-size="14px"> <a href="${url}">Devis_#4827_{{today}}${exts}</a> </mj-text>`
            );
          }
        } else if (variant === 3) {
          // Keep text link CTA only (remove button if present)
          mj = mj.replace(/<mj-button[\s\S]*?<\/mj-button>/gi, "");
          mj = mj.replace(
            /<mj-text[^>]*>Bonjour,?<\/mj-text>/i,
            (m) =>
              `${m}\n<mj-text><a href="${url}">${
                ctaLabels[seedNum % ctaLabels.length]
              }</a></mj-text>`
          );
        }

        // Vary CTA label if there's a button
        mj = mj.replace(
          /(<mj-button[^>]*>)([^<]+)(<\/mj-button>)/i,
          (m, a, label, c) => `${a}${ctaLabels[seedNum % ctaLabels.length]}${c}`
        );
        ensureMirror();
        text = mj;
      } catch (_) {}

      return res.json({ mjml: text });
    } catch (e) {
      return res
        .status(500)
        .json({ error: e.message || "Erreur génération IA" });
    }
  }
);
