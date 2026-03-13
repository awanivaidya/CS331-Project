/**
 * Project model - belongs to a Customer.
 */

const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    status: { type: String, default: "active" },
    domainId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Domain",
      required: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    tasks: [{ type: String }], // List of actionable tasks from latest NLP analysis
  },
  { timestamps: true },
);

module.exports = mongoose.model("Project", projectSchema);
