const fs = require("fs");
const path = require("path");

const testCases = [
  require("./tc-risk-01-null-score-stable"),
  require("./tc-risk-02-critical-threshold"),
  require("./tc-risk-03-warning-threshold"),
  require("./tc-risk-04-positive-score-stable"),
  require("./tc-risk-05-history-cap"),
  require("./tc-risk-06-weighted-average-critical"),
  require("./tc-risk-07-generate-critical-alert"),
  require("./tc-risk-08-stable-no-alert"),
];

function pretty(value) {
  if (value === undefined) return "undefined";
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value);
  } catch (error) {
    return String(value);
  }
}

function runAll() {
  const results = [];

  for (const testCase of testCases) {
    try {
      const actualOutput = testCase.run();
      const isPass = testCase.validate(actualOutput);

      results.push({
        id: testCase.id,
        scenario: testCase.scenario,
        inputData: pretty(testCase.inputData),
        expectedOutput: pretty(testCase.expectedOutput),
        actualOutput: pretty(actualOutput),
        status: isPass ? "PASS" : "FAIL",
      });
    } catch (error) {
      results.push({
        id: testCase.id,
        scenario: testCase.scenario,
        inputData: pretty(testCase.inputData),
        expectedOutput: pretty(testCase.expectedOutput),
        actualOutput: `ERROR: ${error.message}`,
        status: "FAIL",
      });
    }
  }

  console.table(
    results.map((result) => ({
      "Test Case ID": result.id,
      Scenario: result.scenario,
      Status: result.status,
    })),
  );

  const outputPath = path.join(__dirname, "module-risk-test-results.json");
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2), "utf8");

  console.log(`\nDetailed results saved at: ${outputPath}`);

  const failed = results.filter((result) => result.status === "FAIL");
  if (failed.length > 0) {
    console.error(`\nModule risk tests failed: ${failed.length} test(s).`);
    process.exit(1);
  }

  console.log(`\nModule risk tests passed: ${results.length} test(s).`);
}

runAll();
