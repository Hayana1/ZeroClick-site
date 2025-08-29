// backfill-target-tenantId.js (CommonJS)
require("dotenv").config();
const path = require("path");
const mongoose = require("mongoose");

// ✔ chemins robustes
const Target = require(path.join(__dirname, "..", "models", "Target"));
const Batch = require(path.join(__dirname, "..", "models", "Batch"));
const Employee = require(path.join(__dirname, "..", "models", "Employee"));

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/email-campaigns";
const MONGODB_DB = process.env.MONGODB_DB || "email-campaigns";

/**
 * Usage:
 *   node scripts/backfill-target-tenantId.js <tenantId>
 *   node scripts/backfill-target-tenantId.js <tenantId> --dry
 */
async function main() {
  const tenantId = process.argv[2];
  const isDry = process.argv.includes("--dry");
  if (!tenantId) {
    console.error(
      "❌ tenantId manquant. Usage: node scripts/backfill-target-tenantId.js <tenantId> [--dry]"
    );
    process.exit(1);
  }

  await mongoose.connect(MONGODB_URI, { dbName: MONGODB_DB });
  console.log(
    `✅ Connected ${mongoose.connection.host}/${mongoose.connection.name}`
  );
  console.log(
    `▶ Backfill Target.tenantId pour tenant=${tenantId} ${
      isDry ? "(DRY RUN)" : ""
    }`
  );

  // 1) Récupère tous les batches du tenant
  const batches = await Batch.find({ tenantId }, { _id: 1 }).lean();
  const batchIds = batches.map((b) => b._id);
  console.log(`• Batches trouvés: ${batchIds.length}`);

  if (!batchIds.length) {
    console.log("Rien à faire.");
    await mongoose.disconnect();
    return;
  }

  // 2) Cible uniquement les targets de ces batches où tenantId est absent
  const query = {
    batchId: { $in: batchIds },
    $or: [{ tenantId: { $exists: false } }, { tenantId: null }],
  };
  const toFixCount = await Target.countDocuments(query);
  console.log(`• Targets à corriger: ${toFixCount}`);

  if (toFixCount === 0) {
    console.log("Déjà à jour ✅");
    await mongoose.disconnect();
    return;
  }

  if (isDry) {
    // Affiche quelques exemples
    const examples = await Target.find(query).limit(5).lean();
    console.log(
      "Exemples:",
      examples.map((x) => ({
        _id: x._id,
        batchId: x.batchId,
        employeeId: x.employeeId,
      }))
    );
  } else {
    const res = await Target.updateMany(query, { $set: { tenantId } });
    console.log(
      `✅ Mis à jour: matched=${res.matchedCount ?? res.n}, modified=${
        res.modifiedCount ?? res.nModified
      }`
    );
  }

  await mongoose.disconnect();
  console.log("👋 Done");
}

main().catch((err) => {
  console.error("❌ Backfill failed:", err);
  process.exit(1);
});
