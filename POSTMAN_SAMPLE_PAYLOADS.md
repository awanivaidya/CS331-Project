# Sample JSON Payloads for Postman (Backend Module 1)

Base URL: `http://localhost:5000`

---

## 1. Customers

### Create customer — POST `/api/customers`
```json
{
  "name": "Acme Corp",
  "priority": "high",
  "sentimentScore": null,
  "riskStatus": null
}
```
Minimal:
```json
{
  "name": "Beta Inc"
}
```

### Update customer — PUT `/api/customers/<customer_id>`
```json
{
  "name": "Acme Corporation",
  "priority": "critical",
  "riskStatus": "elevated"
}
```

---

## 2. SLAs

### Create SLA — POST `/api/slas`
Use a valid `customerId` from the customers collection.
```json
{
  "responseTime": 24,
  "deadline": "2025-03-01",
  "riskThreshold": 0.7,
  "customerId": "<paste_customer_id_here>"
}
```

### Update SLA — PUT `/api/slas/<sla_id>`
```json
{
  "responseTime": 48,
  "riskThreshold": 0.8
}
```

### List SLAs by customer — GET `/api/slas?customerId=<customer_id>`

---

## 3. Projects

### Create project — POST `/api/projects`
```json
{
  "name": "Q1 Integration",
  "status": "active",
  "customerId": "<paste_customer_id_here>"
}
```

### Update project — PUT `/api/projects/<project_id>`
```json
{
  "name": "Q1 Integration Phase 2",
  "status": "completed"
}
```

### List by customer/status — GET `/api/projects?customerId=<id>&status=active`

---

## 4. Domains

### Create domain — POST `/api/domains`
```json
{
  "name": "Billing"
}
```

### Update domain — PUT `/api/domains/<domain_id>`
```json
{
  "name": "Billing & Invoicing"
}
```

---

## 5. Communications

### Upload email — POST `/api/communications/email`
Use valid `projectId`, `domainId`, `customerId` from their collections.
```json
{
  "content": "We are facing delays in the delivery. Please confirm the new timeline.",
  "subject": "Delivery delay inquiry",
  "sender": "client@acme.com",
  "projectId": "<project_id>",
  "domainId": "<domain_id>",
  "customerId": "<customer_id>",
  "timestamp": "2025-02-07T10:00:00Z"
}
```
Omit `timestamp` to use server current time.

### Upload meeting transcript — POST `/api/communications/transcript`
```json
{
  "content": "Meeting notes: Client expressed concern about support response times. Agreed to escalate to engineering.",
  "meetingDate": "2025-02-06",
  "participants": ["john@company.com", "jane@acme.com", "support@company.com"],
  "projectId": "<project_id>",
  "domainId": "<domain_id>",
  "customerId": "<customer_id>",
  "timestamp": "2025-02-07T14:30:00Z"
}
```

### Update communication (e.g. set sentiment/summary later) — PUT `/api/communications/<comm_id>`
```json
{
  "sentiment": -0.3,
  "summary": "Customer reported delivery delay; requested new timeline."
}
```

### List communications — GET
- All: `/api/communications`
- By type: `/api/communications?type=email`
- By project: `/api/communications?projectId=<project_id>`
- By customer: `/api/communications?customerId=<customer_id>`

---

## Suggested Postman flow

1. **Health**: GET `http://localhost:5000/health` — expect `{"status":"ok","mongodb":"connected"}`.
2. **Create customer**: POST `/api/customers` with body above → copy `_id`.
3. **Create SLA**: POST `/api/slas` with that `customerId`.
4. **Create project**: POST `/api/projects` with same `customerId`.
5. **Create domain**: POST `/api/domains` with `{"name":"Support"}` → copy `_id`.
6. **Upload email**: POST `/api/communications/email` with the copied `projectId`, `domainId`, `customerId`.
7. **Upload transcript**: POST `/api/communications/transcript` with same IDs and transcript body.
8. **List**: GET `/api/communications`, GET `/api/customers`, etc.
