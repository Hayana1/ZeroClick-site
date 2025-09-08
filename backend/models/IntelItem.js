const mongoose = require('mongoose');

const IntelItemSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', index: true, required: true },
    title: { type: String, default: '' },
    source: { type: String, default: '' },
    url: { type: String, default: '' },
    tags: { type: [String], default: [] },
    content: { type: String, default: '' },
    addedBy: { type: String, default: '' },
    // Optional vector for RAG (OpenAI text-embedding-3-small length 1536)
    embedding: { type: [Number], default: undefined, select: false },
  },
  { timestamps: { createdAt: 'addedAt', updatedAt: 'updatedAt' } }
);

module.exports = mongoose.model('IntelItem', IntelItemSchema);
