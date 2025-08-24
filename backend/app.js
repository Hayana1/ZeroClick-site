const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/employees", require("./routes/employees"));
app.use("/api/batches", require("./routes/batches"));
app.use("/api/clicks", require("./routes/clicks"));
app.use("/api/leaderboard", require("./routes/leaderboard")); // app.js

// Connexion à MongoDB
mongoose
  .connect(
    process.env.MONGODB_URI || "mongodb://localhost:27017/email-campaigns",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Could not connect to MongoDB", err));

// Route de test
app.get("/api/health", (req, res) => {
  res.json({ message: "Server is running!" });
});

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

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
