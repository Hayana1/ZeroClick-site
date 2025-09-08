const mongoose = require('mongoose');

const PulseItemSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', index: true, required: true },
    title: { type: String, default: '' },
    url: { type: String, default: '' },
    source: { type: String, default: '' },
    publishedAt: { type: Date, index: true },
    summary: { type: String, default: '' },
  },
  { timestamps: true }
);

PulseItemSchema.index({ tenantId: 1, url: 1 }, { unique: true });

module.exports = mongoose.model('PulseItem', PulseItemSchema);

