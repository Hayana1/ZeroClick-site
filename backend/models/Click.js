const mongoose = require("mongoose");

const clickSchema = new mongoose.Schema({
  batchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Batch",
    required: true,
  },
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true,
  },
  clickTime: {
    type: Date,
    default: Date.now,
  },
  ipAddress: {
    type: String,
  },
  userAgent: {
    type: String,
  },
  linkUrl: {
    type: String,
    required: true,
  },
  uniqueClick: {
    type: Boolean,
    default: true,
  },
});

// Index pour éviter les doublons (un employé ne peut cliquer qu'une fois sur le même lien)
clickSchema.index({ batchId: 1, employeeId: 1, linkUrl: 1 }, { unique: true });

module.exports = mongoose.model("Click", clickSchema);
