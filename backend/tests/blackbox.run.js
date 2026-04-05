const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:5001";

const results = [];
let authToken = null;

function pushResult(id, title, status, details = "") {
  results.push({ id, title, status, details });
}

async function runCase(id, title, fn) {
  try {
    await fn();
    pushResult(id, title, "PASS");
  } catch (error) {
    pushResult(id, title, "FAIL", error.message);
  }
}

async function request(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, options);
  let body = null;

  try {
    body = await response.json();
  } catch {
    body = null;
  }

  return { response, body };
}

function expectStatus(actual, expected, context) {
  if (actual !== expected) {
    throw new Error(`${context}: expected status ${expected}, got ${actual}`);
  }
}

(async () => {
  const unique = Date.now();
  const username = `mgr${unique}`;
  const email = `${username}@example.com`;

  await runCase("BB-01", "GET /health should return 200", async () => {
    const { response, body } = await request("/health");
    expectStatus(response.status, 200, "health");
    if (!body || body.status !== "ok") {
      throw new Error("health response body is invalid");
    }
  });

  await runCase(
    "BB-02",
    "GET /api/customers without token should return 401",
    async () => {
      const { response, body } = await request("/api/customers");
      expectStatus(response.status, 401, "unauthorized customers");
      if (!body || !body.error) {
        throw new Error("expected error payload for unauthorized request");
      }
    },
  );

  await runCase(
    "BB-03",
    "POST /api/auth/register manager should return 201",
    async () => {
      const { response, body } = await request("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          email,
          fullname: "Manager Test",
          password: "Pass@123",
          type: "Manager",
        }),
      });

      expectStatus(response.status, 201, "register manager");
      if (!body || !body.token) {
        throw new Error("register did not return token");
      }

      authToken = body.token;
    },
  );

  await runCase("BB-04", "GET /api/auth/me with token should return 200", async () => {
    if (!authToken) throw new Error("auth token not set from registration");

    const { response, body } = await request("/api/auth/me", {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    expectStatus(response.status, 200, "auth me");
    if (!body || !body.user || body.user.username !== username) {
      throw new Error("unexpected /api/auth/me response payload");
    }
  });

  await runCase(
    "BB-05",
    "POST /api/domains with manager token should return 201",
    async () => {
      if (!authToken) throw new Error("auth token not set from registration");

      const { response, body } = await request("/api/domains", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ name: `AutoDomain-${unique}` }),
      });

      expectStatus(response.status, 201, "create domain");
      if (!body || !body._id) {
        throw new Error("create domain payload missing _id");
      }
    },
  );

  await runCase(
    "BB-06",
    "POST /api/customers missing domainId should return 400",
    async () => {
      if (!authToken) throw new Error("auth token not set from registration");

      const { response, body } = await request("/api/customers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ name: "ACME", priority: "high" }),
      });

      expectStatus(response.status, 400, "create customer validation");
      if (!body || !String(body.error || "").includes("domainId")) {
        throw new Error("expected domainId validation error");
      }
    },
  );

  console.table(results);

  const failed = results.filter((r) => r.status === "FAIL");
  if (failed.length > 0) {
    console.error(`\nBlack-box run failed: ${failed.length} case(s) failed.`);
    console.error(
      `Tip: ensure backend is running and reachable at ${BASE_URL} before running this script.`,
    );
    process.exit(1);
  }

  console.log(`\nBlack-box run passed: ${results.length} case(s).`);
})();
