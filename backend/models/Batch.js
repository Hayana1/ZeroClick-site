const mongoose = require("mongoose");

const batchSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: "",
  },
  dateCreated: {
    type: Date,
    default: Date.now,
  },
  scheduledDate: {
    type: Date,
  },
  status: {
    type: String,
    enum: ["draft", "scheduled", "sent", "completed"],
    default: "draft",
  },
  employees: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
    },
  ],
  sentCount: {
    type: Number,
    default: 0,
  },
  totalEmployees: {
    type: Number,
    default: 0,
  },
  clickCount: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model("Batch", batchSchema);
