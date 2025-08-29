const express = require("express");
const router = express.Router({ mergeParams: true });
const ClickEvent = require("../models/ClickEvent");
const Employee = require("../models/Employee");

// GET /api/tenants/:tenantId/batches/:batchId/clicks
router.get("/:tenantId/batches/:batchId/clicks", async (req, res) => {
  const { tenantId, batchId } = req.params;

  const rows = await ClickEvent.find({ tenantId, batchId })
    .sort({ clickedAt: -1 })
    .lean();

  // enrichir avec nom/email pour le front
  const ids = [
    ...new Set(rows.map((r) => r.employeeId?.toString()).filter(Boolean)),
  ];
  const emp = await Employee.find(
    { _id: { $in: ids } },
    { name: 1, email: 1, department: 1 }
  ).lean();
  const byId = Object.fromEntries(emp.map((e) => [e._id.toString(), e]));

  const out = rows.map((r) => ({
    ...r,
    employee: byId[r.employeeId?.toString()] || null,
  }));

  res.json(out);
});

module.exports = router;
