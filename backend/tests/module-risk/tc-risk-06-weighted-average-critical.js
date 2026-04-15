const { updateCustomerSentiment } = require("../../core/services/riskService");

module.exports = {
  id: "TC-RISK-06",
  scenario:
    "Weighted average sentiment should update score and move status to critical",
  inputData: {
    customer: {
      sentimentHistory: [
        { score: 0, timestamp: new Date("2026-01-01T00:00:00.000Z") },
        { score: -0.9, timestamp: new Date("2026-01-02T00:00:00.000Z") },
      ],
      sentimentScore: 0,
      riskStatus: "stable",
    },
    newScore: -0.9,
  },
  expectedOutput: {
    sentimentScore: -0.75,
    riskStatus: "critical",
  },
  run() {
    updateCustomerSentiment(this.inputData.customer, this.inputData.newScore);
    return {
      sentimentScore: this.inputData.customer.sentimentScore,
      riskStatus: this.inputData.customer.riskStatus,
    };
  },
  validate(actualOutput) {
    const delta = Math.abs(actualOutput.sentimentScore - this.expectedOutput.sentimentScore);
    return delta < 0.0001 && actualOutput.riskStatus === this.expectedOutput.riskStatus;
  },
};
