/**
 * User model - base for Manager and Staff.
 * type: User | Manager | Staff.
 * assignedProjects / assignedDomains used only for Staff (visibility restriction).
 */

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    username: { type: String, unique: true },
    email: { type: String, unique: true },
    fullname: { type: String },
    password: { type: String },
    role: { type: String },
    type: {
      type: String,
      enum: ['User', 'Manager', 'Staff'],
    },
    assignedProjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }],
    assignedDomains: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Domain' }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
