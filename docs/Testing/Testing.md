# White Box and Black Box Testing Report

## Project
AI-Based Customer Communication Analysis and Risk Alert System

## Objective
This report demonstrates both:
1. White Box Testing (internal logic and branch verification)
2. Black Box Testing (functional behavior through API requests)

The goal is to validate correctness of authentication, authorization, customer/project/communication workflows, and risk-alert logic.

## Scope
Modules covered from backend:
1. Authentication and authorization
2. Customer, domain, project, SLA endpoints
3. Communication analysis workflow
4. Risk scoring and alert generation

## White Box Testing
White Box testing is performed with direct function and middleware checks in code-level scripts.

### White Box Test Cases
| Test ID | Target | Input / Condition | Expected Result |
|---|---|---|---|
| WB-01 | calculateRiskStatus | sentimentScore = null | stable |
| WB-02 | calculateRiskStatus | sentimentScore = -0.8 | critical |
| WB-03 | calculateRiskStatus | sentimentScore = -0.4 | warning |
| WB-04 | calculateRiskStatus | sentimentScore = 0.2 | stable |
| WB-05 | updateCustomerSentiment | history length > 10 after update | history trimmed to 10 entries |
| WB-06 | generateAlertIfNeeded | riskStatus = critical | alert with severity CRITICAL |
| WB-07 | generateAlertIfNeeded | riskStatus = warning | alert with severity WARNING |
| WB-08 | generateAlertIfNeeded | riskStatus = stable | null |
| WB-09 | managerOnly middleware | req.user.type = Manager | next() is called |
| WB-10 | managerOnly middleware | req.user.type = Staff | HTTP 403, Manager access required |

### White Box Execution Command
Run from backend folder:

```bash
npm run test:whitebox
```

### White Box Expected Outcome
All WB-01 to WB-10 should pass. If any case fails, the script exits with code 1 and prints failure details.

### White Box Case-by-Case Explanation
WB-01 (calculateRiskStatus null -> stable):
This checks the defensive branch where sentiment does not exist yet. The function is expected to avoid false alarms and return stable.

WB-02 (score -0.8 -> critical):
This validates the critical threshold branch for highly negative sentiment. If this fails, severe-risk customers may be missed.

WB-03 (score -0.4 -> warning):
This validates the mid-threshold branch where sentiment is negative but not critical.

WB-04 (score 0.2 -> stable):
This validates positive/neutral branch behavior and ensures no risk escalation for healthy sentiment.

WB-05 (history trimmed to 10):
This checks rolling-window logic in sentiment history so old entries are discarded and model remains recent-data focused.

WB-06 (critical alert object):
This verifies alert generation for critical risk, including severity field and non-null alert payload.

WB-07 (warning alert object):
This verifies warning-level alert branch. It ensures degraded sentiment still raises a visible signal.

WB-08 (stable returns null alert):
This ensures no noisy alert is generated when customer status is stable.

WB-09 (managerOnly allows manager):
This checks authorization allow-path by verifying that next() is called for manager role.

WB-10 (managerOnly blocks staff with 403):
This checks deny-path with exact expected status and message, confirming access control is enforced.

## Black Box Testing
Black Box testing is performed as API-level checks (request/response) without using internal implementation details.

### Black Box Test Cases
| Test ID | Endpoint | Input | Expected Result |
|---|---|---|---|
| BB-01 | GET /health | No payload | 200 with status=ok |
| BB-02 | GET /api/customers | No token | 401 Access denied |
| BB-03 | POST /api/auth/register | Valid manager payload | 201 and token returned |
| BB-04 | GET /api/auth/me | Valid Bearer token | 200 and current user data |
| BB-05 | POST /api/domains | Manager token + valid domain body | 201 and domain object |
| BB-06 | POST /api/customers | Manager token + missing domainId | 400 with validation error |

### Black Box Execution Command
1. Start backend server:

```bash
npm run dev
```

2. In another terminal (backend folder), run:

```bash
npm run test:blackbox
```

### Black Box Expected Outcome
All BB-01 to BB-06 should pass. If backend is unreachable, script prints a troubleshooting hint and exits with code 1.

### Black Box Case-by-Case Explanation
BB-01 (GET /health):
Confirms service liveness and MongoDB connectivity contract from public health endpoint.

BB-02 (GET /api/customers without token):
Confirms authentication barrier for protected customer data. Expected 401 proves endpoint is not publicly accessible.

BB-03 (POST /api/auth/register manager):
Validates user registration flow for a manager and verifies token issuance for session continuity.

BB-04 (GET /api/auth/me with Bearer token):
Validates token acceptance and identity resolution for authenticated requests.

BB-05 (POST /api/domains with manager token):
Validates manager-only create action on domains. Successful 201 confirms privileged role can perform mutation.

BB-06 (POST /api/customers missing domainId):
Validates request-body input checking and API error handling. Expected 400 confirms validation rules are active.

## Combined Execution
Run both automated suites:

```bash
npm run test:all
```

## Conclusion
The project supports meaningful White Box and Black Box testing:
1. White Box tests validate critical internal branches (risk thresholds, alert generation, role checks).
2. Black Box tests validate externally observable API behavior (status codes, auth protection, validation).

The provided automated scripts and commands are sufficient for demonstration in coursework and can be extended with additional cases (NLP analysis path, project-SLA integration, staff domain restrictions) for deeper coverage.
