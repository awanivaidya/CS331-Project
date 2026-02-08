# Sample JSON Payloads for Postman (MERN Backend – Module 1)

Base URL: `http://localhost:5001`

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

### Update customer — PUT `/api/customers/:id`
```json
{
  "name": "Acme Corporation",
  "priority": "critical",
  "riskStatus": "elevated"
}
```

### List — GET `/api/customers`  
### Get one — GET `/api/customers/:id`  
### Delete — DELETE `/api/customers/:id`

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

### Update — PUT `/api/slas/:id`  
### List all — GET `/api/slas`  
### List by customer — GET `/api/slas?customerId=<customer_id>`  
### Delete — DELETE `/api/slas/:id`

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

### Update — PUT `/api/projects/:id`  
### List — GET `/api/projects` or `?customerId=...&status=active`  
### Delete — DELETE `/api/projects/:id`

---

## 4. Domains

### Create domain — POST `/api/domains`
```json
{
  "name": "Billing"
}
```

### Update — PUT `/api/domains/:id`  
### List — GET `/api/domains`  
### Delete — DELETE `/api/domains/:id`

---

## 5. Communications

### Upload email — POST `/api/communications/email`
Use valid `projectId`, `domainId`, `customerId`.
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

### Upload transcript — POST `/api/communications/transcript`
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

### Update communication — PUT `/api/communications/:id`
```json
{
  "sentiment": -0.3,
  "summary": "Customer reported delivery delay; requested new timeline."
}
```

### List communications
- All: GET `/api/communications`
- By type: GET `/api/communications?type=email`
- By project: GET `/api/communications?projectId=<project_id>`
- By domain: GET `/api/communications?domainId=<domain_id>`
- By customer: GET `/api/communications?customerId=<customer_id>`

### Get one — GET `/api/communications/:id`  
### Delete — DELETE `/api/communications/:id`

---

## Suggested Postman flow

1. **Health**: GET `http://localhost:5001/health` → expect `{"status":"ok","mongodb":"connected"}`.
2. **Create customer**: POST `/api/customers` → copy `_id`.
3. **Create SLA**: POST `/api/slas` with that `customerId`.
4. **Create project**: POST `/api/projects` with same `customerId` → copy `_id`.
5. **Create domain**: POST `/api/domains` with `{"name":"Support"}` → copy `_id`.
6. **Upload email**: POST `/api/communications/email` with the copied `projectId`, `domainId`, `customerId`.
7. **Upload transcript**: POST `/api/communications/transcript` with same IDs.
8. **List by project**: GET `/api/communications?projectId=<project_id>`.
9. **List by domain**: GET `/api/communications?domainId=<domain_id>`.
