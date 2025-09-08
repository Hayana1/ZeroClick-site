const mongoose = require('mongoose');

const TenantKnowledgeSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', unique: true, required: true },
    summary: { type: String, default: '' },
    keyFacts: { type: [String], default: [] },
    itemsUsed: { type: [mongoose.Schema.Types.ObjectId], default: [] },
    model: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('TenantKnowledge', TenantKnowledgeSchema);

