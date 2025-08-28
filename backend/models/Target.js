const mongoose = require("mongoose");

const TargetSchema = new mongoose.Schema(
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
  },
  { timestamps: true }
);

module.exports = mongoose.model("Target", TargetSchema);
