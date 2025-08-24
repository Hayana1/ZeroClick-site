const express = require("express");
const router = express.Router();
const Employee = require("../models/Employee");

// Récupérer tous les employés
router.get("/", async (req, res) => {
  try {
    const employees = await Employee.find().sort({ name: 1 });
    res.json(employees);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Créer un nouvel employé
router.post("/", async (req, res) => {
  const { name, email, department } = req.body;

  try {
    // Vérifier si l'employé existe déjà
    const existingEmployee = await Employee.findOne({ email });
    if (existingEmployee) {
      return res.status(400).json({ message: "Employee already exists" });
    }

    const employee = new Employee({
      name,
      email,
      department,
    });

    const newEmployee = await employee.save();
    res.status(201).json(newEmployee);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Mettre à jour un employé
router.patch("/:id", async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    if (req.body.name != null) {
      employee.name = req.body.name;
    }

    if (req.body.department != null) {
      employee.department = req.body.department;
    }

    if (req.body.isActive != null) {
      employee.isActive = req.body.isActive;
    }

    const updatedEmployee = await employee.save();
    res.json(updatedEmployee);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Supprimer un employé
router.delete("/:id", async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    await Employee.deleteOne({ _id: req.params.id });
    res.json({ message: "Employee deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
