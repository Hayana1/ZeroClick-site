// backend/routes/results.js
const express = require("express");
const mongoose = require("mongoose");
const router = express.Router({ mergeParams: true });

const Batch = require("../models/Batch");
const Target = require("../models/Target");
const Employee = require("../models/Employee");
const ClickEvent = require("../models/ClickEvent");
// Employee/Tenant non indispensables ici mais dispo si tu veux enrichir
// const Employee = require("../models/Employee");
// const Tenant = require("../models/Tenant");

const { Types } = mongoose;
const isValidId = (id) => Types.ObjectId.isValid(id);

/* ============================================================================
 * GET /api/tenants/:tenantId/results/overview
 * -> Liste des campagnes du tenant, avec sentCount / clickCount / progress
 * ========================================================================== */
router.get("/tenants/:tenantId/results/overview", async (req, res) => {
  const { tenantId } = req.params;
  if (!isValidId(tenantId)) {
    return res.status(400).json({ error: "tenantId invalide" });
  }

  try {
    // 1) Récupère toutes les campagnes du tenant
    const batches = await Batch.find({ tenantId })
      .sort({ dateCreated: -1 })
      .lean();

    // 2) Pré-calcule les clicks par batch (en 1 requête)
    const clicksAgg = await Target.aggregate([
      { $match: { tenantId: new Types.ObjectId(tenantId) } },
      {
        $group: {
          _id: "$batchId",
          clickCount: {
            $sum: {
              $cond: [{ $gt: ["$clickCount", 0] }, 1, 0],
            },
          },
        },
      },
    ]);

    const clicksMap = new Map(
      clicksAgg.map((r) => [String(r._id), r.clickCount])
    );

    // 3) Formate la réponse
    const overview = batches.map((b) => {
      // selections est Map côté mongoose → devient objet en .lean()
      const selections = b.selections || {};
      const sentCount = Object.values(selections).filter(Boolean).length;

      // totalEmployees peut être calculé via b.totalEmployees ou longueur du tableau (selon ton schéma)
      const totalEmployees =
        b.totalEmployees ??
        (Array.isArray(b.employees) ? b.employees.length : 0) ??
        0;

      const clickCount = clicksMap.get(String(b._id)) || 0;
      const progress =
        totalEmployees > 0 ? Math.round((sentCount / totalEmployees) * 100) : 0;

      return {
        _id: b._id,
        name: b.name,
        dateCreated: b.dateCreated,
        dateUpdated: b.dateUpdated,
        totalEmployees,
        sentCount,
        clickCount,
        progress,
      };
    });

    res.json(overview);
  } catch (e) {
    res.status(500).json({ error: e.message || "Erreur overview" });
  }
});

/* ============================================================================
 * GET /api/tenants/:tenantId/batches/:batchId/results
 * -> Détail d’une campagne : groupé par département + employés qui ont cliqué
 * ========================================================================== */
router.get("/tenants/:tenantId/batches/:batchId/results", async (req, res) => {
  const { tenantId, batchId } = req.params;
  if (!isValidId(tenantId) || !isValidId(batchId)) {
    return res.status(400).json({ error: "IDs invalides" });
  }

  // Vérifie l'appartenance du batch au tenant
  const batch = await Batch.findOne({ _id: batchId, tenantId }).lean();
  if (!batch) return res.status(404).json({ error: "Batch introuvable" });

  // Récupère toutes les cibles (Targets) de la campagne avec l’employé
  const targets = await Target.find(
    { batchId },
    {
      employeeId: 1,
      clickCount: 1,
      lastClickedAt: 1,
      lastIp: 1,
      lastUserAgent: 1,
      lastSuspiciousAt: 1,
      trainingCompletedAt: 1,
      quizScore: 1,
    }
  )
    .populate("employeeId") // -> { name, email, department, ... }
    .lean();

  // Filtre: on ne garde que ceux qui ont cliqué au moins 1 fois
  const clicked = targets.filter((t) => (t.clickCount || 0) > 0);

  // Groupement par département
  const byDept = new Map(); // dept -> array of employees
  for (const t of clicked) {
    const e = t.employeeId;
    if (!e) continue;
    const dept = e.department || "—";
    if (!byDept.has(dept)) byDept.set(dept, []);
    byDept.get(dept).push({
      _id: e._id,
      name: e.name,
      email: e.email,
      department: e.department || "—",
      firstClickAt: t.lastClickedAt || null,
      ip: t.lastIp || null,
      userAgent: t.lastUserAgent || null,
      isLikelyBot: !!t.lastSuspiciousAt, // compat colonne UI
      trainingCompleted: !!t.trainingCompletedAt,
      trainingCompletedAt: t.trainingCompletedAt || null,
      quizScore: typeof t.quizScore === 'number' ? t.quizScore : null,
    });
  }

  // Ordonne les départements + tri des employés par nom
  const rows = Array.from(byDept.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([department, employees]) => {
      // Récupère theme/scenario configurés pour ce groupe (département)
      const themesByGroup = batch.themesByGroup || {};
      const groupConfigs = batch.groupConfigs || {};
      const theme =
        themesByGroup instanceof Map
          ? themesByGroup.get(department) || ""
          : themesByGroup[department] || "";
      const cfg =
        groupConfigs instanceof Map
          ? groupConfigs.get(department) || {}
          : groupConfigs[department] || {};
      const scenarioId = cfg.scenarioId || null;
      const category = cfg.category || null;

      return {
        department,
        clickCount: employees.length,
        config: { theme, scenarioId, category },
        employees: employees.sort((a, b) =>
          (a.name || "").localeCompare(b.name || "")
        ),
      };
    });

  const totalEmployees =
    batch.totalEmployees ??
    (Array.isArray(batch.employees) ? batch.employees.length : 0) ??
    0;

  res.json({
    batch: {
      _id: batch._id,
      name: batch.name,
      dateCreated: batch.dateCreated,
      totalEmployees,
      clickCount: clicked.length,
    },
    rows,
  });
});

/* ============================================================================
 * (Optionnel) GET /api/tenants/:tenantId/results
 * -> Résumé global du tenant (tous les batches)
 * ========================================================================== */
router.get("/tenants/:tenantId/results", async (req, res) => {
  const { tenantId } = req.params;
  if (!isValidId(tenantId)) {
    return res.status(400).json({ error: "tenantId invalide" });
  }

  try {
    const [batches, clicksAgg] = await Promise.all([
      Batch.find({ tenantId }).lean(),
      Target.aggregate([
        { $match: { tenantId: new Types.ObjectId(tenantId) } },
        {
          $group: {
            _id: null,
            totalClickedTargets: {
              $sum: { $cond: [{ $gt: ["$clickCount", 0] }, 1, 0] },
            },
            lastClickAt: { $max: "$lastClickedAt" },
          },
        },
      ]),
    ]);

    const totalBatches = batches.length;
    const totalEmployees =
      batches.reduce((acc, b) => {
        const n =
          b.totalEmployees ??
          (Array.isArray(b.employees) ? b.employees.length : 0) ??
          0;
        return acc + n;
      }, 0) || 0;

    const totalSent = batches.reduce((acc, b) => {
      const selections = b.selections || {};
      const sentCount = Object.values(selections).filter(Boolean).length;
      return acc + sentCount;
    }, 0);

    const clickInfo = clicksAgg[0] || {
      totalClickedTargets: 0,
      lastClickAt: null,
    };

    res.json({
      totalBatches,
      totalEmployees,
      totalSent,
      totalClickedTargets: clickInfo.totalClickedTargets || 0,
      lastClickAt: clickInfo.lastClickAt || null,
    });
  } catch (e) {
    res.status(500).json({ error: e.message || "Erreur résumé global" });
  }
});

module.exports = router;
/* ============================================================================
 * GET /api/tenants/:tenantId/results/weekly
 * -> Agrégat par employé sur une période (par défaut 7 jours) avec nb de clics
 * Query: start=YYYY-MM-DD, end=YYYY-MM-DD
 * ========================================================================== */
router.get("/tenants/:tenantId/results/weekly", async (req, res) => {
  const { tenantId } = req.params;
  if (!isValidId(tenantId)) return res.status(400).json({ error: "tenantId invalide" });

  try {
    const startStr = String(req.query.start || "");
    const endStr = String(req.query.end || "");
    let end = endStr ? new Date(endStr) : new Date();
    let start = startStr ? new Date(startStr) : new Date(end.getTime() - 7 * 24 * 3600 * 1000);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ error: "dates invalides" });
    }

    const match = {
      tenantId: new Types.ObjectId(tenantId),
      createdAt: { $gte: start, $lte: end },
      isLikelyBot: { $ne: true },
    };

    const agg = await ClickEvent.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$employeeId",
          clicks: { $sum: 1 },
          lastAt: { $max: "$createdAt" },
        },
      },
      { $sort: { clicks: -1 } },
    ]);

    const empIds = agg.map((r) => r._id);
    const emps = await Employee.find({ _id: { $in: empIds } }, { name: 1, email: 1, department: 1 }).lean();
    const empMap = new Map(emps.map((e) => [String(e._id), e]));
    // training status (any target with trainingCompletedAt)
    const train = await Target.aggregate([
      { $match: { tenantId: new Types.ObjectId(tenantId), trainingCompletedAt: { $ne: null } } },
      { $group: { _id: "$employeeId", lastTrainingAt: { $max: "$trainingCompletedAt" } } },
    ]);
    const trainMap = new Map(train.map((t) => [String(t._id), t.lastTrainingAt]));

    const rows = agg.map((r) => {
      const e = empMap.get(String(r._id)) || {};
      const trainingAt = trainMap.get(String(r._id)) || null;
      return {
        employeeId: String(r._id),
        name: e.name || "—",
        email: e.email || "—",
        department: e.department || "—",
        clicks: r.clicks,
        lastClickAt: r.lastAt || null,
        trainingCompleted: !!trainingAt,
        trainingCompletedAt: trainingAt,
      };
    });

    res.json({ start, end, rows });
  } catch (e) {
    res.status(500).json({ error: e.message || "Erreur weekly results" });
  }
});

/* ============================================================================
 * GET /api/tenants/:tenantId/results/weekly.csv
 * -> Export CSV pour Excel de l'agrégat hebdo
 * ========================================================================== */
router.get("/tenants/:tenantId/results/weekly.csv", async (req, res) => {
  req.url = req.url.replace(/\.csv(\?|$)/, '$1');
  try {
    const jsonUrl = req.originalUrl.replace(/\.csv(\?|$)/, '$1');
    // Reuse handler by calling logic above via function? Simpler: duplicate parse
    const { tenantId } = req.params;
    if (!isValidId(tenantId)) return res.status(400).send("tenantId invalide");

    const startStr = String(req.query.start || "");
    const endStr = String(req.query.end || "");
    let end = endStr ? new Date(endStr) : new Date();
    let start = startStr ? new Date(startStr) : new Date(end.getTime() - 7 * 24 * 3600 * 1000);
    const match = {
      tenantId: new Types.ObjectId(tenantId),
      createdAt: { $gte: start, $lte: end },
      isLikelyBot: { $ne: true },
    };
    const agg = await ClickEvent.aggregate([
      { $match: match },
      { $group: { _id: "$employeeId", clicks: { $sum: 1 }, lastAt: { $max: "$createdAt" } } },
      { $sort: { clicks: -1 } },
    ]);
    const empIds = agg.map((r) => r._id);
    const emps = await Employee.find({ _id: { $in: empIds } }, { name: 1, email: 1, department: 1 }).lean();
    const empMap = new Map(emps.map((e) => [String(e._id), e]));
    const train = await Target.aggregate([
      { $match: { tenantId: new Types.ObjectId(tenantId), trainingCompletedAt: { $ne: null } } },
      { $group: { _id: "$employeeId", lastTrainingAt: { $max: "$trainingCompletedAt" } } },
    ]);
    const trainMap = new Map(train.map((t) => [String(t._id), t.lastTrainingAt]));

    const rows = agg.map((r) => {
      const e = empMap.get(String(r._id)) || {};
      const trainingAt = trainMap.get(String(r._id)) || null;
      return {
        employeeId: String(r._id),
        name: e.name || "",
        email: e.email || "",
        department: e.department || "",
        clicks: r.clicks,
        lastClickAt: r.lastAt || null,
        trainingCompleted: trainingAt ? 'Oui' : 'Non',
        trainingCompletedAt: trainingAt ? new Date(trainingAt).toISOString() : '',
      };
    });

    const headers = [
      'employeeId','name','email','department','clicks','lastClickAt','trainingCompleted','trainingCompletedAt'
    ];
    const lines = [headers.join(',')].concat(
      rows.map(r => headers.map(h => {
        const v = r[h] == null ? '' : r[h];
        const s = String(v).replace(/"/g,'""');
        return s.includes(',') || s.includes('"') ? `"${s}"` : s;
      }).join(','))
    );
    res.setHeader('Content-Type','text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=weekly-results-${tenantId}.csv`);
    res.send(lines.join('\n'));
  } catch (e) {
    res.status(500).send(e.message || 'Erreur export CSV');
  }
});
