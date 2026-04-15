const { generateAlertIfNeeded } = require("../../core/services/riskService");

module.exports = {
  id: "TC-RISK-07",
  scenario: "Critical customer should generate a CRITICAL risk alert",
  inputData: {
    customer: {
      _id: "cust-1",
      name: "ACME Corp",
      sentimentScore: -0.82,
      riskStatus: "critical",
    },
    project: {
      _id: "proj-1",
      name: "Customer Platform",
    },
  },
  expectedOutput: {
    severity: "CRITICAL",
    type: "RISK_ALERT",
  },
  run() {
    return generateAlertIfNeeded(this.inputData.customer, this.inputData.project);
  },
  validate(actualOutput) {
    return (
      actualOutput &&
      actualOutput.severity === this.expectedOutput.severity &&
      actualOutput.type === this.expectedOutput.type
    );
  },
};
