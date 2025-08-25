// app.js
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
// Autorise ton front (local ou déployé)
app.use(
  cors({
    origin: [FRONTEND_URL],
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  })
);
app.use(express.json());

/* --------- DB CONNECT AVANT LES ROUTES --------- */
async function start() {
  try {
    await mongoose.connect(MONGODB_URI, {
      dbName: MONGODB_DB, // ✅ force la db si non précisée dans l'URI
      // (Mongoose 6+ n'a plus besoin de useNewUrlParser/useUnifiedTopology)
    });
    console.log(
      `✅ MongoDB Connected: ${mongoose.connection.host}/${mongoose.connection.name}`
    );

    /* --------- ROUTES --------- */
    app.use("/api/employees", require("./routes/employees"));
    app.use("/api/batches", require("./routes/batches"));
    app.use("/api/clicks", require("./routes/clicks"));
    app.use("/api/leaderboard", require("./routes/leaderboard"));

    // Health check
    app.get("/api/health", (req, res) => {
      res.json({ message: "Server is running!" });
    });

    // Ping Discord pour debug
    app.get("/api/debug/discord", async (req, res) => {
      const { notifyDiscord } = require("./utils/discord");
      await notifyDiscord({
        embeds: [
          {
            title: "🔔 Test Discord",
            description: "Si tu vois ceci dans ton salon, le webhook marche ✅",
            color: 0x5da8ff,
          },
        ],
      });
      res.json({ ok: true });
    });

    // Page racine (utile pour Render)
    app.get("/", (req, res) => res.send("ZeroClick API live"));

    /* --------- START SERVER --------- */
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Could not connect to MongoDB", err.message);
    process.exit(1);
  }
}

start();
