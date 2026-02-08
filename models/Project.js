/**
 * Project model - belongs to a Customer. Staff visibility is via assignedProjects.
 */

const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    status: { type: String, default: 'active' },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Project', projectSchema);
