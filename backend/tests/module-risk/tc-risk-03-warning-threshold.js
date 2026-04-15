const { calculateRiskStatus } = require("../../core/services/riskService");

module.exports = {
  id: "TC-RISK-03",
  scenario: "Risk status should be warning when sentiment score is exactly -0.3",
  inputData: { sentimentScore: -0.3 },
  expectedOutput: "warning",
  run() {
    return calculateRiskStatus(this.inputData.sentimentScore);
  },
  validate(actualOutput) {
    return actualOutput === this.expectedOutput;
  },
};
