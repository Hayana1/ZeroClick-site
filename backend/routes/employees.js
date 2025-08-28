const express = require("express");
const router = express.Router();
const Employee = require("../models/Employee");

// GET /api/employees?tid=TENANT_ID  (filtre OBLIGATOIRE)
router.get("/", async (req, res) => {
  try {
    const { tid } = req.query;
    if (!tid)
      return res.status(400).json({ message: "Missing tid (tenant id)" });

    const employees = await Employee.find({ tenantId: tid }).sort({
      department: 1,
      name: 1,
    }); // ✅ tri stable

    res.json(employees);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/employees  { tenantId, name, email, department? }
router.post("/", async (req, res) => {
  try {
    const { tenantId, name, email, department } = req.body || {};
    if (!tenantId || !name || !email) {
      return res
        .status(400)
        .json({ message: "tenantId, name et email sont requis" });
    }
    const existing = await Employee.findOne({ tenantId, email });
    if (existing)
      return res.status(400).json({ message: "Employee already exists" });

    const created = await Employee.create({
      tenantId,
      name,
      email,
      department,
    });
    res.status(201).json(created);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/employees/:id
router.delete("/:id", async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee)
      return res.status(404).json({ message: "Employee not found" });
    await Employee.deleteOne({ _id: req.params.id });
    res.json({ message: "Employee deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
