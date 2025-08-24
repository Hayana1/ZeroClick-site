const express = require("express");
const router = express.Router();

const Click = require("../models/Click");
const Batch = require("../models/Batch");
const Employee = require("../models/Employee");
const Target = require("../models/Target");
const { notifyDiscord } = require("../utils/discord");

// Tracker un clic "pixel"
router.get("/track", async (req, res) => {
  const { batchId, employeeId, link } = req.query;
  if (!batchId || !employeeId || !link) {
    return res.status(400).json({ message: "Missing parameters" });
  }

  try {
    const now = new Date();
    const timeStr = now.toLocaleString("fr-CA", {
      timeZone: "America/Toronto",
      dateStyle: "short",
      timeStyle: "medium",
    });

    const batch = await Batch.findById(batchId);
    const employee = await Employee.findById(employeeId);
    if (!batch || !employee)
      return res.status(404).json({ message: "Batch or employee not found" });
    if (!batch.employees.includes(employeeId)) {
      return res.status(400).json({ message: "Employee not in this batch" });
    }

    await Click.create({
      batchId,
      employeeId,
      linkUrl: link,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
      clickTime: now,
    });

    await Batch.findByIdAndUpdate(batchId, { $inc: { clickCount: 1 } });

    // 🔔 Alerte Discord avec nom + heure
    notifyDiscord({
      content: `📩 **Clic (pixel)** — ${employee.name} à ${timeStr}`,
      embeds: [
        {
          title: "Nouveau clic (pixel)",
          color: 0x3498db,
          fields: [
            { name: "Campagne", value: batch.name, inline: true },
            {
              name: "Employé",
              value: `${employee.name} (${employee.email})`,
              inline: true,
            },
            { name: "Heure (Toronto)", value: timeStr, inline: true },
            { name: "Lien", value: link, inline: false },
          ],
          timestamp: now.toISOString(),
        },
      ],
    }).catch((e) => console.error("Discord notif error:", e));

    // pixel 1x1
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

// Stats batch
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

// Stats employé
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

// Suivi via token unique
router.get("/:token", async (req, res) => {
  try {
    const { token } = req.params;

    // On récupère aussi l'employé (name/email) pour l'alerte
    const t = await Target.findOne({ token }).populate(
      "employeeId",
      "name email"
    );
    if (!t) return res.status(404).send("Invalid link");

    // Un seul "now" pour être cohérent entre clickedAt et l'affichage
    const now = new Date();
    const timeStr = now.toLocaleString("fr-CA", {
      timeZone: "America/Toronto",
      dateStyle: "short",
      timeStyle: "medium",
    });

    // Premier clic : on fige clickedAt si encore null
    const firstUpdate = await Target.updateOne(
      { _id: t._id, clickedAt: null },
      {
        $set: {
          clickedAt: now,
          firstClickIp: req.ip,
          firstClickUA: req.get("User-Agent"),
        },
      }
    );

    // On compte tous les hits (utile pour diagnostiquer des doubles clics / bots)
    await Target.updateOne({ _id: t._id }, { $inc: { clickCount: 1 } });

    const batch = await Batch.findById(t.batchId);

    // Si c'est bien le premier clic, on incrémente la stat et on notifie
    if (firstUpdate.modifiedCount === 1) {
      await Batch.findByIdAndUpdate(t.batchId, { $inc: { clickCount: 1 } });

      // (Optionnel) enregistrer un log Click unique
      try {
        await Click.create({
          batchId: t.batchId,
          employeeId: t.employeeId,
          linkUrl: `${req.protocol}://${req.get("host")}/api/clicks/${token}`,
          ipAddress: req.ip,
          userAgent: req.get("User-Agent"),
          clickTime: now,
          uniqueClick: true,
        });
      } catch (e) {
        if (e?.code !== 11000) console.error("[click log] error:", e);
      }

      // 🔔 Alerte Discord avec nom + heure
      const emp = t.employeeId || {};
      await notifyDiscord({
        content: `✅ **Premier clic** — ${
          emp.name || emp.email || "Employé"
        } à ${timeStr}`,
        embeds: [
          {
            title: "Premier clic détecté",
            color: 0x2ecc71,
            fields: [
              { name: "Campagne", value: batch?.name || "-", inline: true },
              {
                name: "Employé",
                value: `${emp.name || "-"} (${emp.email || "-"})`,
                inline: true,
              },
              { name: "Heure (Toronto)", value: timeStr, inline: true },
              { name: "IP", value: req.ip || "—", inline: true },
              {
                name: "User-Agent",
                value: (req.get("User-Agent") || "—").slice(0, 200),
                inline: false,
              },
            ],
            timestamp: now.toISOString(),
          },
        ],
      });
    }

    // Redirection vers la page de formation
    const trainingUrl = "http://localhost:5173/oups";
    return res.redirect(302, trainingUrl);
  } catch (err) {
    console.error("Token click error:", err);
    return res.redirect(302, "/training");
  }
});

module.exports = router;
