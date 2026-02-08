/**
 * User model - base for Manager and Staff.
 * type: User | Manager | Staff.
 * assignedProjects / assignedDomains used only for Staff (visibility restriction).
 */

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    type: {
      type: String,
      enum: ['User', 'Manager', 'Staff'],
      required: true,
    },
    assignedProjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }],
    assignedDomains: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Domain' }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
