const mongoose = require("mongoose");

async function connectDB() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB || "email-campaigns";

  if (!uri) {
    console.error("❌ MONGODB_URI manquante. Ajoute-la dans .env");
    process.exit(1);
  }

  try {
    // Depuis Mongoose 6+, pas besoin de useNewUrlParser / useUnifiedTopology, mais OK si tu les gardes
    const conn = await mongoose.connect(uri, {
      dbName, // ✅ force le nom de la base si l'URI ne l'a pas
    });

    console.log(
      `✅ MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`
    );
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    process.exit(1);
  }
}

module.exports = connectDB;
