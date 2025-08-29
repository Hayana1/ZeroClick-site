const mongoose = require("mongoose");

const ClickEventSchema = new mongoose.Schema(
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

    // request context
    userAgent: { type: String },
    ip: { type: String },

    // flags
    isLikelyBot: { type: Boolean, default: false }, // NOT required; defaults to false

    // optional signal you might set in your route
    reason: { type: String }, // e.g., 'no-ua', 'preload', 'link-scanner', etc.
  },
  { timestamps: true }
);

ClickEventSchema.index({
  tenantId: 1,
  batchId: 1,
  employeeId: 1,
  createdAt: -1,
});

module.exports = mongoose.model("ClickEvent", ClickEventSchema);
