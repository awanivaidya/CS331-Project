const { generateAlertIfNeeded } = require("../../core/services/riskService");

module.exports = {
  id: "TC-RISK-08",
  scenario: "Stable customer should not generate any alert",
  inputData: {
    customer: {
      _id: "cust-2",
      name: "Beta Corp",
      sentimentScore: 0.2,
      riskStatus: "stable",
    },
    project: {
      _id: "proj-2",
      name: "API Integration",
    },
  },
  expectedOutput: null,
  run() {
    return generateAlertIfNeeded(this.inputData.customer, this.inputData.project);
  },
  validate(actualOutput) {
    return actualOutput === this.expectedOutput;
  },
};
