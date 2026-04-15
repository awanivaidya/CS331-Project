const { calculateRiskStatus } = require("../../core/services/riskService");

module.exports = {
  id: "TC-RISK-02",
  scenario: "Risk status should be critical when sentiment score is exactly -0.6",
  inputData: { sentimentScore: -0.6 },
  expectedOutput: "critical",
  run() {
    return calculateRiskStatus(this.inputData.sentimentScore);
  },
  validate(actualOutput) {
    return actualOutput === this.expectedOutput;
  },
};
