const mongoose = require("mongoose");

const TargetSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      index: true,
      required: true,
    },
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
    token: { type: String, unique: true, index: true, required: true },

    // suivi envoi manuel
    markedSent: { type: Boolean, default: false },
    sentAt: { type: Date },

    // tracking clics
    clickCount: { type: Number, default: 0 },
    lastClickedAt: { type: Date },
    lastSuspiciousAt: { type: Date },
    lastUserAgent: { type: String },
    lastIp: { type: String },
    copiedAt: Date,

    linkCopiedAt: { type: Date, default: null },
    linkCopiedCount: { type: Number, default: 0 },

    // Formation associée (MVP Training)
    scenarioId: { type: String, default: null },
    trainingCompletedAt: { type: Date, default: null },
    quizScore: { type: Number, default: null },
    xpEarned: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// 📌 Index stratégiques
TargetSchema.index(
  { tenantId: 1, batchId: 1, employeeId: 1 },
  { unique: true }
);
TargetSchema.index({ tenantId: 1, batchId: 1 });
TargetSchema.index({ token: 1 }, { unique: true });
// Empêche de ré-attribuer le même scénario au même employé (tous batches)
TargetSchema.index(
  { tenantId: 1, employeeId: 1, scenarioId: 1 },
  { unique: true, partialFilterExpression: { scenarioId: { $type: "string" } } }
);
// Accélère la recherche du dernier envoi pour cooldowns
TargetSchema.index({ tenantId: 1, employeeId: 1, sentAt: -1 });

module.exports = mongoose.model("Target", TargetSchema);
