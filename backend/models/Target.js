const mongoose = require("mongoose");

const targetSchema = new mongoose.Schema(
  {
    batchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
      index: true,
      required: true,
    },
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      index: true,
      required: true,
    },

    token: { type: String, required: true, unique: true }, // lien public

    // “une seule fois”
    clickedAt: { type: Date, default: null },
    clickCount: { type: Number, default: 0 },

    // audit léger
    firstClickIp: String,
    firstClickUA: String,

    // (optionnel) expiration
    expiresAt: Date,
  },
  { timestamps: true }
);

// Un seul target par employé dans un batch
targetSchema.index({ batchId: 1, employeeId: 1 }, { unique: true });

module.exports = mongoose.model("Target", targetSchema);
