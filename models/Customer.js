/**
 * Customer model - created and managed by Manager.
 */

const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    priority: { type: String, default: 'normal' },
    sentimentScore: { type: Number, default: null },
    riskStatus: { type: String, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Customer', customerSchema);
