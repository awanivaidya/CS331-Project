const { calculateRiskStatus } = require("../../core/services/riskService");

module.exports = {
  id: "TC-RISK-04",
  scenario: "Risk status should be stable for positive sentiment score",
  inputData: { sentimentScore: 0.25 },
  expectedOutput: "stable",
  run() {
    return calculateRiskStatus(this.inputData.sentimentScore);
  },
  validate(actualOutput) {
    return actualOutput === this.expectedOutput;
  },
};
