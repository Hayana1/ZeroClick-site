const mongoose = require("mongoose");

const tenantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      lowercase: true,
    },
  },
  { timestamps: true }
);

tenantSchema.index({ slug: 1 }, { unique: true });

module.exports = mongoose.model("Tenant", tenantSchema);
