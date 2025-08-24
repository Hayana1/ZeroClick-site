const express = require("express");
const router = express.Router();
const Batch = require("../models/Batch");
const Employee = require("../models/Employee");

// Récupérer tous les batches
router.get("/", async (req, res) => {
  try {
    const batches = await Batch.find()
      .populate("employees", "name email department")
      .sort({ dateCreated: -1 });
    res.json(batches);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Créer un nouveau batch
router.post("/", async (req, res) => {
  const { name, description, scheduledDate, employeeIds } = req.body;

  try {
    const employees = await Employee.find({ _id: { $in: employeeIds } });

    const batch = new Batch({
      name,
      description,
      scheduledDate,
      employees: employeeIds,
      totalEmployees: employees.length,
    });

    const newBatch = await batch.save();
    res.status(201).json(newBatch);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Récupérer un batch spécifique
router.get("/:id", async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id).populate(
      "employees",
      "name email department"
    );

    if (!batch) {
      return res.status(404).json({ message: "Batch not found" });
    }

    res.json(batch);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Mettre à jour un batch
router.patch("/:id", async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id);

    if (!batch) {
      return res.status(404).json({ message: "Batch not found" });
    }

    if (req.body.name != null) {
      batch.name = req.body.name;
    }

    if (req.body.description != null) {
      batch.description = req.body.description;
    }

    if (req.body.status != null) {
      batch.status = req.body.status;
    }

    if (req.body.employeeIds != null) {
      const employees = await Employee.find({
        _id: { $in: req.body.employeeIds },
      });
      batch.employees = req.body.employeeIds;
      batch.totalEmployees = employees.length;
    }

    const updatedBatch = await batch.save();
    res.json(updatedBatch);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Supprimer un batch
router.delete("/:id", async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id);

    if (!batch) {
      return res.status(404).json({ message: "Batch not found" });
    }

    await Batch.deleteOne({ _id: req.params.id });
    res.json({ message: "Batch deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
