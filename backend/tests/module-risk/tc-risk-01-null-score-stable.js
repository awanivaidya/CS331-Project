const { calculateRiskStatus } = require("../../core/services/riskService");

module.exports = {
  id: "TC-RISK-01",
  scenario: "Risk status should be stable when sentiment score is null",
  inputData: { sentimentScore: null },
  expectedOutput: "stable",
  run() {
    return calculateRiskStatus(this.inputData.sentimentScore);
  },
  validate(actualOutput) {
    return actualOutput === this.expectedOutput;
  },
};
