const { updateCustomerSentiment } = require("../../core/services/riskService");

module.exports = {
  id: "TC-RISK-05",
  scenario: "Sentiment history should keep only the latest 10 entries",
  inputData: {
    customer: {
      sentimentHistory: Array.from({ length: 10 }, (_, i) => ({
        score: i * -0.05,
        timestamp: new Date("2026-01-01T00:00:00.000Z"),
      })),
      sentimentScore: 0,
      riskStatus: "stable",
    },
    newScore: -0.5,
  },
  expectedOutput: {
    historyLength: 10,
    newestScore: -0.5,
  },
  run() {
    updateCustomerSentiment(this.inputData.customer, this.inputData.newScore);
    const history = this.inputData.customer.sentimentHistory;
    return {
      historyLength: history.length,
      newestScore: history[history.length - 1].score,
    };
  },
  validate(actualOutput) {
    return (
      actualOutput.historyLength === this.expectedOutput.historyLength &&
      actualOutput.newestScore === this.expectedOutput.newestScore
    );
  },
};
