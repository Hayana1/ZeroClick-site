// backend/routes/tenants.employees.js (CommonJS)
const express = require("express");
const mongoose = require("mongoose");
const router = express.Router({ mergeParams: true });
const Employee = require("../models/Employee");

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// GET /api/tenants/:tenantId/employees
router.get("/:tenantId/employees", async (req, res) => {
  const { tenantId } = req.params;
  if (!isValidId(tenantId))
    return res.status(400).json({ error: "tenantId invalide" });
  const rows = await Employee.find({ tenantId }).sort({
    department: 1,
    name: 1,
  });
  res.json(rows);
});

// POST /api/tenants/:tenantId/employees
router.post("/:tenantId/employees", async (req, res) => {
  const { tenantId } = req.params;
  const { name, email, department } = req.body || {};
  if (!isValidId(tenantId))
    return res.status(400).json({ error: "tenantId invalide" });
  if (!name || !email)
    return res.status(400).json({ error: "name et email requis" });

  const exists = await Employee.findOne({ tenantId, email });
  if (exists)
    return res
      .status(409)
      .json({ error: "email déjà existant pour ce tenant" });

  const created = await Employee.create({ tenantId, name, email, department });
  res.status(201).json(created);
});

// DELETE /api/tenants/:tenantId/employees/:id
router.delete("/:tenantId/employees/:id", async (req, res) => {
  const { tenantId, id } = req.params;
  if (!isValidId(tenantId) || !isValidId(id)) {
    return res.status(400).json({ error: "id invalide" });
  }
  await Employee.deleteOne({ _id: id, tenantId });
  res.status(204).end();
});

module.exports = router;
