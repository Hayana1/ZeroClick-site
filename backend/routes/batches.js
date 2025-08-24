// routes/batches.js
const express = require("express");
const router = express.Router();

const crypto = require("crypto");
const Batch = require("../models/Batch");
const Employee = require("../models/Employee");
const Target = require("../models/Target");
// (optionnel si tu veux aussi purger les logs de clic détaillés à la suppression)
// const Click = require("../models/Click");

const baseUrlFromReq = (req) => `${req.protocol}://${req.get("host")}`;
const newToken = () => crypto.randomBytes(16).toString("base64url");

/**
 * GET /api/batches
 * Liste des batches avec stats live (totalEmployees, sentCount, clickCount)
 */
router.get("/", async (req, res) => {
  try {
    const batches = await Batch.find().sort({ dateCreated: -1 });
    const withStats = await Promise.all(
      batches.map(async (b) => {
        const totalTargets = await Target.countDocuments({ batchId: b._id });
        const clicked = await Target.countDocuments({
          batchId: b._id,
          clickedAt: { $ne: null },
        });
        return {
          ...b.toObject(),
          totalEmployees: totalTargets,
          sentCount: totalTargets, // “créé = prêt à envoyer”
          clickCount: clicked,
        };
      })
    );
    res.json(withStats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * POST /api/batches
 * Crée un batch + génère les tokens (1 Target par employé)
 * body: { name, description?, scheduledDate?, employeeIds: [], trainingUrl? }
 */
router.post("/", async (req, res) => {
  const {
    name,
    description,
    scheduledDate,
    employeeIds = [],
    trainingUrl,
  } = req.body;

  if (!name || !employeeIds.length) {
    return res.status(400).json({ message: "name et employeeIds sont requis" });
  }

  try {
    const employees = await Employee.find({ _id: { $in: employeeIds } });

    const batch = await Batch.create({
      name,
      description,
      scheduledDate,
      employees: employeeIds,
      totalEmployees: employees.length,
      ...(trainingUrl ? { trainingUrl } : {}), // si tu as ajouté le champ dans le modèle
    });

    // Générer un target par employé (+ token)
    const targets = await Promise.all(
      employees.map((e) =>
        Target.create({
          batchId: batch._id,
          employeeId: e._id,
          token: newToken(),
        })
      )
    );

    const links = targets.map((t) => ({
      employeeId: t.employeeId,
      token: t.token,
      trackingUrl: `${baseUrlFromReq(req)}/api/clicks/${t.token}`,
    }));

    res.status(201).json({
      ...batch.toObject(),
      totalEmployees: targets.length,
      sentCount: targets.length,
      clickCount: 0,
      links,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/**
 * GET /api/batches/:id
 * Détails d’un batch, avec liens par employé et stats exactes
 */
router.get("/:id", async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id).populate(
      "employees",
      "name email department"
    );
    if (!batch) return res.status(404).json({ message: "Batch not found" });

    const targets = await Target.find({ batchId: batch._id }).populate(
      "employeeId",
      "name email department"
    );

    const links = targets.map((t) => ({
      employee: t.employeeId,
      token: t.token,
      trackingUrl: `${baseUrlFromReq(req)}/api/clicks/${t.token}`,
      clickedAt: t.clickedAt,
      clickCount: t.clickCount,
    }));

    const clickCount = targets.filter((t) => !!t.clickedAt).length;

    res.json({
      ...batch.toObject(),
      totalEmployees: targets.length,
      sentCount: targets.length,
      clickCount,
      links,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * PATCH /api/batches/:id
 * Met à jour le batch (name/description/status/scheduledDate/trainingUrl/employeeIds)
 * Si employeeIds change: upsert les nouveaux Targets (avec token), supprime ceux retirés
 */
router.patch("/:id", async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id);
    if (!batch) return res.status(404).json({ message: "Batch not found" });

    const {
      name,
      description,
      status,
      scheduledDate,
      trainingUrl,
      employeeIds, // optionnel
    } = req.body;

    if (name != null) batch.name = name;
    if (description != null) batch.description = description;
    if (status != null) batch.status = status;
    if (scheduledDate != null) batch.scheduledDate = scheduledDate;
    if (trainingUrl != null) batch.trainingUrl = trainingUrl;

    // Gestion des employés (et des Targets) si la liste a été fournie
    if (Array.isArray(employeeIds)) {
      const currentIds = new Set(
        (batch.employees || []).map((id) => id.toString())
      );
      const nextIds = new Set(employeeIds.map((id) => id.toString()));

      // à ajouter = présents dans next mais pas dans current
      const toAdd = [...nextIds].filter((id) => !currentIds.has(id));
      // à retirer = présents dans current mais pas dans next
      const toRemove = [...currentIds].filter((id) => !nextIds.has(id));

      // Upsert targets pour les nouveaux employés
      if (toAdd.length) {
        const addEmployees = await Employee.find({ _id: { $in: toAdd } });
        await Promise.all(
          addEmployees.map((e) =>
            Target.updateOne(
              { batchId: batch._id, employeeId: e._id },
              { $setOnInsert: { token: newToken() } },
              { upsert: true }
            )
          )
        );
      }

      // Supprimer les targets des employés retirés
      if (toRemove.length) {
        await Target.deleteMany({
          batchId: batch._id,
          employeeId: { $in: toRemove },
        });
        // (optionnel) supprimer aussi les Clicks associés si tu conserves ce modèle
        // await Click.deleteMany({ batchId: batch._id, employeeId: { $in: toRemove } });
      }

      batch.employees = employeeIds;
      batch.totalEmployees = await Target.countDocuments({
        batchId: batch._id,
      });
    }

    const updated = await batch.save();

    // Recalcul rapide des stats
    const clicked = await Target.countDocuments({
      batchId: batch._id,
      clickedAt: { $ne: null },
    });

    res.json({
      ...updated.toObject(),
      sentCount: batch.totalEmployees,
      clickCount: clicked,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/**
 * DELETE /api/batches/:id
 * Supprime le batch + ses Targets (+ éventuellement ses Clicks)
 */
router.delete("/:id", async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id);
    if (!batch) return res.status(404).json({ message: "Batch not found" });

    await Target.deleteMany({ batchId: batch._id });
    // (optionnel)
    // await Click.deleteMany({ batchId: batch._id });

    await Batch.deleteOne({ _id: batch._id });
    res.json({ message: "Batch deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
