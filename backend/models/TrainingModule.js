const mongoose = require('mongoose');

const SectionSchema = new mongoose.Schema({
  heading: String,
  bullets: { type: [String], default: [] },
});

const QuizSchema = new mongoose.Schema({
  question: String,
  options: { type: [String], default: [] },
  correctIndex: Number,
  explanation: String,
});

const TrainingModuleSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', index: true, required: true },
    scenarioDraftId: { type: mongoose.Schema.Types.ObjectId, ref: 'ScenarioDraft', index: true },
    title: String,
    outline: { type: [SectionSchema], default: [] },
    bestPractices: { type: [String], default: [] },
    redFlags: { type: [String], default: [] },
    quiz: { type: [QuizSchema], default: [] },
    status: { type: String, default: 'ready' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('TrainingModule', TrainingModuleSchema);

