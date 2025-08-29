const express = require("express");
const crypto = require("crypto");
const router = express.Router();

const Batch = require("../models/Batch");
const Employee = require("../models/Employee");
const Target = require("../models/Target");

const newToken = () => crypto.randomBytes(16).toString("base64url");
const publicBaseUrl = (req) => {
  if (process.env.PUBLIC_API_URL) return process.env.PUBLIC_API_URL;
  const proto = req.get("x-forwarded-proto") || req.protocol || "http";
  return `${proto}://${req.get("host")}`;
};

// GET /api/batches?tid=TENANT_ID
router.get("/", async (req, res) => {
  try {
    const { tid } = req.query;
    if (!tid)
      return res.status(400).json({ message: "Missing tid (tenant id)" });

    const batches = await Batch.find({ tenantId: tid }).sort({
      dateCreated: -1,
    });

    const withStats = await Promise.all(
      batches.map(async (b) => {
        const totalTargets = await Target.countDocuments({
          tenantId: tid,
          batchId: b._id,
        });
        const clicked = await Target.countDocuments({
          tenantId: tid,
          batchId: b._id,
          clickedAt: { $ne: null },
        });
        return {
          ...b.toObject(),
          totalEmployees: totalTargets,
          sentCount: totalTargets,
          clickCount: clicked,
        };
      })
    );

    res.json(withStats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/batches  { tenantId, name, employeeIds[], windowStart?, windowEnd?, trainingUrl? }
router.post("/", async (req, res) => {
  try {
    const {
      tenantId,
      name,
      employeeIds = [],
      windowStart,
      windowEnd,
      trainingUrl,
      description,
    } = req.body || {};
    if (!tenantId || !name || !employeeIds.length) {
      return res
        .status(400)
        .json({ message: "tenantId, name et employeeIds requis" });
    }

    const employees = await Employee.find({
      tenantId,
      _id: { $in: employeeIds },
    });
    const batch = await Batch.create({
      tenantId,
      name,
      description,
      windowStart,
      windowEnd,
      trainingUrl,
      employees: employees.map((e) => e._id),
    });

    // Génère un target par employé
    await Promise.all(
      employees.map((e) =>
        Target.create({
          tenantId,
          batchId: batch._id,
          employeeId: e._id,
          token: newToken(),
        })
      )
    );

    // Stats + liens
    const base = publicBaseUrl(req);
    const targets = await Target.find({
      tenantId,
      batchId: batch._id,
    }).populate("employeeId", "name email department");
    const links = targets.map((t) => ({
      employee: t.employeeId,
      token: t.token,
      trackingUrl: `${base}/t/${t.token}`,
      clickedAt: t.clickedAt,
      clickCount: t.clickCount,
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

// GET /api/batches/:id  (détail + liens)
router.get("/:id", async (req, res) => {
  try {
    const b = await Batch.findById(req.params.id).populate(
      "employees",
      "name email department"
    );
    if (!b) return res.status(404).json({ message: "Batch not found" });

    const targets = await Target.find({ batchId: b._id }).populate(
      "employeeId",
      "name email department"
    );
    const base = publicBaseUrl(req);

    const links = targets.map((t) => ({
      employee: t.employeeId,
      token: t.token,
      trackingUrl: `${base}/t/${t.token}`,
      clickedAt: t.clickedAt,
      clickCount: t.clickCount,
    }));

    const clickCount = targets.filter((t) => !!t.clickedAt).length;

    res.json({
      ...b.toObject(),
      totalEmployees: targets.length,
      sentCount: targets.length,
      clickCount,
      links,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/batches/:id
router.delete("/:id", async (req, res) => {
  try {
    const b = await Batch.findById(req.params.id);
    if (!b) return res.status(404).json({ message: "Batch not found" });
    await Target.deleteMany({ batchId: b._id });
    await Batch.deleteOne({ _id: b._id });
    res.json({ message: "Batch deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
