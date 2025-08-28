// app.js (CommonJS)
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

/* --------- CONFIG --------- */
const PORT = process.env.PORT || 7300;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/email-campaigns";
const MONGODB_DB = process.env.MONGODB_DB || "email-campaigns";

/* --------- MIDDLEWARE --------- */
app.use(
  cors({
    origin: [FRONTEND_URL],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"], // ← add PUT
  })
);
app.use(express.json());
app.set("trust proxy", 1);

/* --------- DB + ROUTES --------- */
async function start() {
  try {
    await mongoose.connect(MONGODB_URI, { dbName: MONGODB_DB });
    console.log(
      `✅ MongoDB Connected: ${mongoose.connection.host}/${mongoose.connection.name}`
    );

    // --- ROUTES ---
    // Tenants CRUD
    app.use("/api/tenants", require("./routes/tenants"));

    // Tenants-scopées (employés et campagnes)
    app.use("/api/tenants", require("./routes/tenants.employees"));
    app.use("/api/tenants", require("./routes/tenants.batches"));

    // Global (non-scopées)
    app.use("/api/employees", require("./routes/employees"));
    app.use("/api/batches", require("./routes/batches"));
    app.use("/api/clicks", require("./routes/clicks"));

    // ✅ Tracking misc (mark-copied, etc.)
    app.use("/api/tracking", require("./routes/tracking.misc"));

    // ❌ REMOVE this wrong mount (it caused your 404):
    // app.use("/api/tracking", require("./routes/tenants.employees"));

    // Health
    app.get("/api/health", (_req, res) => res.json({ ok: true }));
    app.get("/", (_req, res) => res.send("ZeroClick API live"));

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Could not connect to MongoDB", err.message);
    process.exit(1);
  }
}

start();
