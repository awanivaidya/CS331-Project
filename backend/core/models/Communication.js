/**
 * Communication model - single collection with type: 'email' | 'transcript'.
 * sentiment and summary null initially (for future AI/NLP).
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
    subject: { type: String },
    sender: { type: String },
    meetingDate: { type: String },
    participants: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Communication', communicationSchema);
