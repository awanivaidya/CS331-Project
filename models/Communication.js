/**
 * Communication model - single collection with type: 'email' | 'transcript'.
 * Conceptual abstract entity; email-specific and transcript-specific fields are optional by type.
 * sentiment and summary are null initially (for future AI/NLP).
 */

const mongoose = require('mongoose');

const communicationSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['email', 'transcript'], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    domainId: { type: mongoose.Schema.Types.ObjectId, ref: 'Domain', required: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    sentiment: { type: Number, default: null },
    summary: { type: String, default: null },
    // Email-specific
    subject: { type: String },
    sender: { type: String },
    // Transcript-specific
    meetingDate: { type: String },
    participants: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Communication', communicationSchema);
