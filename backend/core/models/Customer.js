/**
 * Customer model - created and managed by Manager.
 */

const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    priority: { type: String, default: "normal" },
    domainId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Domain",
      required: true,
    },
    sentimentScore: { type: Number, default: 0 },
    riskStatus: {
      type: String,
      enum: ["stable", "warning", "critical", null],
      default: "stable",
    },
    sentimentHistory: [
      {
        score: { type: Number },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true },
);

module.exports = mongoose.model("Customer", customerSchema);
