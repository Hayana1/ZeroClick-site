const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    department: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// 🔒 Unicité email PAR tenant
employeeSchema.index({ tenantId: 1, email: 1 }, { unique: true });
// 🚀 Tri rapide par département puis nom
employeeSchema.index({ tenantId: 1, department: 1, name: 1 });

module.exports = mongoose.model("Employee", employeeSchema);
