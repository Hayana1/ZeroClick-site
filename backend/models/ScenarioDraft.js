const mongoose = require('mongoose');

const LinkSchema = new mongoose.Schema({
  label: String,
  type: String, // youtube | calendar | internal | other
  displayUrl: String, // text shown to user (e.g., youtube.com/...)
});

const AttachmentSchema = new mongoose.Schema({
  filename: String,
  mime: String,
  contentText: String,
  contentHtml: String,
});

const ScenarioDraftSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', index: true, required: true },
    departments: { type: [String], default: [] },
    riskLevel: { type: String, default: 'medium' },
    persona: { type: String, default: 'external' }, // external|internal
    lureCategory: { type: String, default: '' },
    title: { type: String, default: '' },
    summary: { type: String, default: '' },
    email: {
      subject: String,
      preheader: String,
      html: String,
      fromName: String,
      fromEmail: String,
    },
    links: { type: [LinkSchema], default: [] },
    attachments: { type: [AttachmentSchema], default: [] },
    checks: {
      policyOk: { type: Boolean, default: false },
      comments: { type: [String], default: [] },
    },
    status: { type: String, default: 'draft' }, // draft|approved|rejected
    reviewNotes: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ScenarioDraft', ScenarioDraftSchema);
