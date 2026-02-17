/**
 * SLA model - linked to a Customer.
 */

const mongoose = require('mongoose');

const slaSchema = new mongoose.Schema(
  {
    responseTime: { type: Number, required: true },
    deadline: { type: String, required: true },
    riskThreshold: { type: Number, required: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SLA', slaSchema);
