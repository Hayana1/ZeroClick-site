// backend/models/Click.js
const mongoose = require("mongoose");

const ClickSchema = new mongoose.Schema(
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
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Target",
      index: true,
      required: true,
    },
    token: { type: String, index: true, required: true },

    // event
    ts: { type: Date, default: Date.now, index: true },
    ipHash: { type: String, index: true },
    httpMethod: String,
    ua: String,
    referer: String,

    // anti-bot
    botScore: { type: Number, default: 0 },
    isBot: { type: Boolean, default: false },

    // headers utiles (optionnel)
    meta: mongoose.Schema.Types.Mixed,
  },
  { minimize: true }
);

ClickSchema.index({ batchId: 1, employeeId: 1, ts: -1 });
ClickSchema.index({ ipHash: 1, ts: -1 });
ClickSchema.index({ token: 1, ts: -1 });

module.exports = mongoose.model("Click", ClickSchema);
