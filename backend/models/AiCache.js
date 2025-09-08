const mongoose = require('mongoose');

const AiCacheSchema = new mongoose.Schema(
  {
    key: { type: String, unique: true, index: true },
    value: { type: Object, default: {} },
    ttlSeconds: { type: Number, default: 1800 }, // 30 min
  },
  { timestamps: true }
);

AiCacheSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 2 }); // 2 days auto-prune

module.exports = mongoose.model('AiCache', AiCacheSchema);

