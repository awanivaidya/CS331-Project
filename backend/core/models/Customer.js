/**
 * Customer model - created and managed by Manager.
 */

const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    priority: { type: String, default: "normal" },
    sentimentScore: { type: Number, default: 0 },
    riskStatus: {
      type: String,
      enum: ["stable", "warning", "critical", null],
      default: null,
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
