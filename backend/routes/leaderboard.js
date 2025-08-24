// routes/leaderboard.js
const router = require("express").Router();
const mongoose = require("mongoose");
const Target = require("../models/Target");

/**
 * GET /api/leaderboard/month
 * Query:
 *   - year: ex 2025 (défaut = année courante)
 *   - month: 1..12 (défaut = mois courant)
 *   - limit: 10..200 (défaut 50)
 *   - department: optionnel (filtre)
 *
 * Renvoie par employé :
 *   - clicksInMonth: nb de premiers clics dont clickedAt ∈ [startOfMonth, endOfMonth)
 *   - participationsInMonth: nb de targets créés dans ce mois (createdAt)
 *   - rateInMonth = clicksInMonth / max(participationsInMonth,1)
 *   - lastClickAtInMonth: dernier clickedAt dans ce mois (si existant)
 */

router.get("/all-time", async (req, res) => {
  try {
    const limit = Math.min(Math.max(Number(req.query.limit) || 100, 1), 500);

    const rows = await Target.aggregate([
      {
        $group: {
          _id: "$employeeId",
          participationsAllTime: { $sum: 1 },
          clicksAllTime: {
            $sum: { $cond: [{ $ifNull: ["$clickedAt", false] }, 1, 0] },
          },
          lastClickAtAllTime: { $max: "$clickedAt" },
        },
      },
      {
        $lookup: {
          from: "employees",
          localField: "_id",
          foreignField: "_id",
          as: "employee",
        },
      },
      { $unwind: "$employee" },
      {
        $addFields: {
          rateAllTime: {
            $cond: [
              { $gt: ["$participationsAllTime", 0] },
              { $divide: ["$clicksAllTime", "$participationsAllTime"] },
              0,
            ],
          },
        },
      },
      { $sort: { clicksAllTime: -1, rateAllTime: -1, lastClickAtAllTime: -1 } },
      { $limit: limit },
      {
        $project: {
          _id: 0,
          employeeId: "$_id",
          name: "$employee.name",
          email: "$employee.email",
          department: "$employee.department",
          clicksAllTime: 1,
          participationsAllTime: 1,
          rateAllTime: 1,
          lastClickAtAllTime: 1,
        },
      },
    ]);

    res.json(rows);
  } catch (err) {
    console.error("leaderboard/all-time error:", err);
    res.status(500).json({ message: err.message });
  }
});

router.get("/month", async (req, res) => {
  try {
    const now = new Date();
    const year = Number(req.query.year) || now.getFullYear();
    const month = Number(req.query.month) || now.getMonth() + 1; // 1..12
    const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 200);
    const department = req.query.department; // optionnel

    // bornes du mois
    const monthStart = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
    const monthEnd = new Date(Date.UTC(year, month, 1, 0, 0, 0)); // exclu

    // Pipeline en 2 sous-aggrégations fusionnées:
    // A) clics du mois (clickedAt dans le mois) => clicksInMonth + lastClickAtInMonth
    // B) participations du mois (createdAt dans le mois) => participationsInMonth
    const clicksPipeline = [
      { $match: { clickedAt: { $gte: monthStart, $lt: monthEnd } } },
      {
        $group: {
          _id: "$employeeId",
          clicksInMonth: { $sum: 1 },
          lastClickAtInMonth: { $max: "$clickedAt" },
        },
      },
    ];

    const participationsPipeline = [
      { $match: { createdAt: { $gte: monthStart, $lt: monthEnd } } },
      {
        $group: {
          _id: "$employeeId",
          participationsInMonth: { $sum: 1 },
        },
      },
    ];

    // Exécuter les deux en parallèle
    const [clicksRows, partsRows] = await Promise.all([
      Target.aggregate(clicksPipeline),
      Target.aggregate(participationsPipeline),
    ]);

    // Transformer en maps
    const clicksMap = new Map(clicksRows.map((r) => [String(r._id), r]));
    const partsMap = new Map(partsRows.map((r) => [String(r._id), r]));

    // Fusionner l’ensemble des employeeIds
    const allIds = new Set([
      ...Array.from(clicksMap.keys()),
      ...Array.from(partsMap.keys()),
    ]);

    // Construire documents fusionnés puis faire un $lookup pour enrichir avec employee
    const temp = Array.from(allIds).map((idStr) => {
      const c = clicksMap.get(idStr);
      const p = partsMap.get(idStr);
      return {
        _id: new mongoose.Types.ObjectId(idStr),
        clicksInMonth: c?.clicksInMonth || 0,
        lastClickAtInMonth: c?.lastClickAtInMonth || null,
        participationsInMonth: p?.participationsInMonth || 0,
      };
    });

    if (temp.length === 0) return res.json([]);

    // Injecter dans un pipeline via $facet (utiliser $lookup pour employee)
    const rows = await Target.aggregate([
      {
        $match: { employeeId: { $in: temp.map((t) => t._id) } },
      },
      // Réduire à 1 doc par employeeId
      {
        $group: { _id: "$employeeId" },
      },
      // Merge avec les valeurs calculées temp (via $set avec $literal + $map client-side)
      {
        $addFields: {
          data: {
            $let: {
              vars: { arr: temp },
              in: {
                $first: {
                  $filter: {
                    input: "$$arr",
                    as: "t",
                    cond: { $eq: ["$$t._id", "$_id"] },
                  },
                },
              },
            },
          },
        },
      },
      // Raccourci: projeter les champs calculés
      {
        $project: {
          clicksInMonth: "$data.clicksInMonth",
          lastClickAtInMonth: "$data.lastClickAtInMonth",
          participationsInMonth: "$data.participationsInMonth",
        },
      },
      // join employee
      {
        $lookup: {
          from: "employees",
          localField: "_id",
          foreignField: "_id",
          as: "employee",
        },
      },
      { $unwind: "$employee" },

      // filtre département si demandé
      ...(department
        ? [{ $match: { "employee.department": department } }]
        : []),

      // calcul du taux
      {
        $addFields: {
          rateInMonth: {
            $cond: [
              { $gt: ["$participationsInMonth", 0] },
              { $divide: ["$clicksInMonth", "$participationsInMonth"] },
              0,
            ],
          },
        },
      },

      // tri: clicks desc, puis taux, puis récence
      { $sort: { clicksInMonth: -1, rateInMonth: -1, lastClickAtInMonth: -1 } },

      // limites & projection finale
      { $limit: limit },
      {
        $project: {
          _id: 0,
          employeeId: "$_id",
          name: "$employee.name",
          email: "$employee.email",
          department: "$employee.department",
          clicksInMonth: 1,
          participationsInMonth: 1,
          rateInMonth: 1,
          lastClickAtInMonth: 1,
        },
      },
    ]);

    res.json({
      year,
      month,
      start: monthStart,
      end: monthEnd,
      totalEmployees: rows.length,
      rows,
    });
  } catch (err) {
    console.error("leaderboard/month error:", err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
