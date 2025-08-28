const express = require("express");
const router = express.Router();
const Tenant = require("../models/Tenant");

// GET /api/tenants
router.get("/", async (_req, res) => {
  const items = await Tenant.find().sort({ createdAt: -1 });
  res.json(items);
});

// POST /api/tenants { name, slug }
router.post("/", async (req, res) => {
  const { name, slug } = req.body || {};
  if (!name || !slug)
    return res.status(400).json({ error: "name et slug requis" });
  const created = await Tenant.create({ name, slug: slug.toLowerCase() });
  res.json(created);
});

// DELETE /api/tenants/:id
router.delete("/:id", async (req, res) => {
  await Tenant.findByIdAndDelete(req.params.id);
  res.status(204).end();
});

module.exports = router;
