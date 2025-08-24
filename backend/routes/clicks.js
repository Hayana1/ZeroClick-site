const express = require("express");
const router = express.Router();
const Click = require("../models/Click");
const Batch = require("../models/Batch");
const Employee = require("../models/Employee");

// Tracker un clic
router.get("/track", async (req, res) => {
  const { batchId, employeeId, link } = req.query;

  if (!batchId || !employeeId || !link) {
    return res.status(400).json({ message: "Missing parameters" });
  }

  try {
    // Vérifier que le batch et l'employé existent
    const batch = await Batch.findById(batchId);
    const employee = await Employee.findById(employeeId);

    if (!batch || !employee) {
      return res.status(404).json({ message: "Batch or employee not found" });
    }

    // Vérifier si l'employé fait partie du batch
    const isInBatch = batch.employees.includes(employeeId);
    if (!isInBatch) {
      return res.status(400).json({ message: "Employee not in this batch" });
    }

    // Enregistrer le clic
    const click = new Click({
      batchId,
      employeeId,
      linkUrl: link,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    await click.save();

    // Mettre à jour le compteur de clics du batch
    await Batch.findByIdAndUpdate(batchId, { $inc: { clickCount: 1 } });

    // Rediriger vers l'URL réelle (ou retourner une image de tracking)
    // Pour le tracking d'email, on retourne généralement une image transparente 1x1 pixel
    res.set("Content-Type", "image/png");
    res.send(
      Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
        "base64"
      )
    );
  } catch (err) {
    console.error("Error tracking click:", err);
    res.set("Content-Type", "image/png");
    res.send(
      Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
        "base64"
      )
    );
  }
});

// Récupérer les statistiques de clics pour un batch
router.get("/batch/:batchId", async (req, res) => {
  try {
    const clicks = await Click.find({ batchId: req.params.batchId })
      .populate("employeeId", "name email department")
      .sort({ clickTime: -1 });

    res.json(clicks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Récupérer les statistiques de clics pour un employé
router.get("/employee/:employeeId", async (req, res) => {
  try {
    const clicks = await Click.find({ employeeId: req.params.employeeId })
      .populate("batchId", "name dateCreated")
      .sort({ clickTime: -1 });

    res.json(clicks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
