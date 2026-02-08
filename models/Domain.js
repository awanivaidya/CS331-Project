/**
 * Domain model - standalone. Staff visibility is via assignedDomains.
 */

const mongoose = require('mongoose');

const domainSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Domain', domainSchema);
