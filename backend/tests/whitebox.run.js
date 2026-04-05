const assert = require("assert");
const {
  calculateRiskStatus,
  updateCustomerSentiment,
  generateAlertIfNeeded,
} = require("../core/services/riskService");
const { managerOnly } = require("../core/middlewares/authorization");

const results = [];

function runCase(id, title, fn) {
  try {
    fn();
    results.push({ id, title, status: "PASS" });
  } catch (error) {
    results.push({ id, title, status: "FAIL", error: error.message });
  }
}

runCase("WB-01", "calculateRiskStatus(null) => stable", () => {
  assert.strictEqual(calculateRiskStatus(null), "stable");
});

runCase("WB-02", "calculateRiskStatus(-0.8) => critical", () => {
  assert.strictEqual(calculateRiskStatus(-0.8), "critical");
});

runCase("WB-03", "calculateRiskStatus(-0.4) => warning", () => {
  assert.strictEqual(calculateRiskStatus(-0.4), "warning");
});

runCase("WB-04", "calculateRiskStatus(0.2) => stable", () => {
  assert.strictEqual(calculateRiskStatus(0.2), "stable");
});

runCase("WB-05", "updateCustomerSentiment keeps only 10 history entries", () => {
  const customer = {
    sentimentHistory: Array.from({ length: 10 }, (_, i) => ({
      score: -0.1 * i,
      timestamp: new Date(),
    })),
    sentimentScore: 0,
    riskStatus: "stable",
  };

  updateCustomerSentiment(customer, -0.5);
  assert.strictEqual(customer.sentimentHistory.length, 10);
});

runCase("WB-06", "generateAlertIfNeeded => CRITICAL alert", () => {
  const customer = {
    _id: "c1",
    name: "Critical Customer",
    sentimentScore: -0.8,
    riskStatus: "critical",
  };
  const project = { _id: "p1", name: "Project A" };

  const alert = generateAlertIfNeeded(customer, project);
  assert.ok(alert);
  assert.strictEqual(alert.severity, "CRITICAL");
});

runCase("WB-07", "generateAlertIfNeeded => WARNING alert", () => {
  const customer = {
    _id: "c2",
    name: "Warning Customer",
    sentimentScore: -0.4,
    riskStatus: "warning",
  };
  const project = { _id: "p2", name: "Project B" };

  const alert = generateAlertIfNeeded(customer, project);
  assert.ok(alert);
  assert.strictEqual(alert.severity, "WARNING");
});

runCase("WB-08", "generateAlertIfNeeded => null for stable", () => {
  const customer = {
    _id: "c3",
    name: "Stable Customer",
    sentimentScore: 0.1,
    riskStatus: "stable",
  };
  const project = { _id: "p3", name: "Project C" };

  const alert = generateAlertIfNeeded(customer, project);
  assert.strictEqual(alert, null);
});

runCase("WB-09", "managerOnly allows manager", () => {
  let nextCalled = false;
  const req = { user: { type: "Manager" } };
  const res = { status: () => ({ json: () => null }) };

  managerOnly(req, res, () => {
    nextCalled = true;
  });

  assert.strictEqual(nextCalled, true);
});

runCase("WB-10", "managerOnly blocks staff", () => {
  let statusCode = null;
  let body = null;
  const req = { user: { type: "Staff" } };
  const res = {
    status(code) {
      statusCode = code;
      return this;
    },
    json(payload) {
      body = payload;
      return this;
    },
  };

  managerOnly(req, res, () => null);
  assert.strictEqual(statusCode, 403);
  assert.strictEqual(body.error, "Manager access required");
});

console.table(results);

const failed = results.filter((r) => r.status === "FAIL");
if (failed.length > 0) {
  console.error(`\nWhite-box run failed: ${failed.length} case(s) failed.`);
  process.exit(1);
}

console.log(`\nWhite-box run passed: ${results.length} case(s).`);
