// models/Batch.js
const mongoose = require("mongoose");

const BatchSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      index: true,
      required: true,
    },
    name: { type: String, required: true },
    description: String,
    scheduledDate: Date,

    // liste des employés ciblés (facultatif si tu relies via Target)
    employees: [{ type: mongoose.Schema.Types.ObjectId, ref: "Employee" }],

    // Compteurs “agrégés” (optionnels si tu calcules via Target)
    totalEmployees: { type: Number, default: 0 },
    clickCount: { type: Number, default: 0 },

    // ✅ NOUVEAU : persistance Mongo (remplace le localStorage)
    selections: {
      // employeeId -> boolean (envoyé ?)
      type: Map,
      of: Boolean,
      default: {},
    },
    themesByGroup: {
      // "RH" | "Finance" | "IT" | "Direction" | "Autre" -> texte
      type: Map,
      of: String,
      default: {},
    },
  },
  { timestamps: { createdAt: "dateCreated", updatedAt: "dateUpdated" } }
);

module.exports = mongoose.model("Batch", BatchSchema);
