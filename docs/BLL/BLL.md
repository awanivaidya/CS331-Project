# Business Logic Layer (BLL)

## BLL Modules (Core Functional Modules)

The Business Logic Layer (BLL) is primarily implemented in the backend through controllers, services, and middleware. The core functional modules related to the BLL are:

1. **Authentication & Authorization Module**
2. **Customer Management Module**
3. **Project & SLA Management Module**
4. **Communication Processing Module**
5. **NLP Analysis Service Module**
6. **Risk Assessment & Alerts Module**
7. **Domain Management Module**

---

## A) Business Rules Implementation

Business rules are implemented in backend controllers, services, and middleware, and are enforced before database operations.

### 1) Authentication & Authorization Module

**Business Rules**

- Only authenticated users can access protected APIs.
- Role-based restrictions are enforced (e.g., Manager-only operations on sensitive routes).
- Staff users must have at least one assigned domain during registration.

**Implementation**

- Token and user validation: `backend/core/middlewares/authenticate.js`
- Manager-only authorization checks: `backend/core/middlewares/authorization.js`
- Registration rules and account creation: `backend/core/controllers/authController.js`

### 2) Customer Management Module

**Business Rules**

- A new customer is initialized with:
  - `sentimentScore = 0`
  - `riskStatus = stable`
  - an initial sentiment history entry
- Staff users can only view/manage customers that belong to their assigned domains.

**Implementation**

- Customer creation/listing and domain-based filtering: `backend/core/controllers/customerController.js`

### 3) Project & SLA Management Module

**Business Rules**

- A project requires `name`, `customerId`, and SLA inputs during creation.
- SLA values (`responseTime`, `deadline`, `riskThreshold`) are mandatory.
- SLA information is created/updated as part of the project creation/update flow.
- The customer's domain linkage is validated/resolved from the selected customer when creating projects.

**Implementation**

- Project creation/update rules and SLA linkage: `backend/core/controllers/projectController.js`
- SLA CRUD and rule enforcement: `backend/core/controllers/slaController.js`

### 4) Communication Processing Module

**Business Rules**

- Communication uploads must be consistent with the selected project-customer-domain relationship.
- Uploaded content is stored with metadata (customer/project context) before/alongside analysis results.
- The processing pipeline ensures analysis results are written back to the correct entities (communication, project, customer).

**Implementation**

- Upload handling, relationship checks, persistence updates: `backend/core/controllers/communicationController.js`

### 5) NLP Analysis Service Module

**Business Rules**

- Every uploaded communication is analyzed to produce structured NLP outputs:
  - sentiment score/category
  - summary
  - extracted staff tasks / priority indicators (if present)
- NLP analysis is treated as a service dependency and returns normalized outputs for the rest of the system.

**Implementation**

- Python NLP integration (spawn + JSON parsing): `backend/core/services/nlpService.js`
- Python analyzer implementation: `nlpservice/analyzer.py`

### 6) Risk Assessment & Alerts Module

**Business Rules**

- Customer sentiment history is updated as new communications arrive.
- Customer risk status is calculated from sentiment and/or SLA thresholds.
- Alerts are generated when customers enter warning/critical states to support proactive intervention.

**Implementation**

- Risk score aggregation and status calculation: `backend/core/services/riskService.js`
- Alert generation and dashboard aggregation: `backend/core/controllers/alertController.js`

### 7) Domain Management Module

**Business Rules**

- Domains segment customers and staff access.
- Staff users operate only within their assigned domains.

**Implementation**

- Domain CRUD and linkage support: `backend/core/controllers/domainController.js`

---

## B) Validation Logic Implementation

Validation logic ensures that data entering the system is correct, consistent, and in the proper format before being processed further.

Validation is implemented at multiple layers (controller-level checks, middleware checks, and relationship validation) to ensure correctness, prevent invalid updates, and enforce access constraints.

### 1) Required Field Validation

- Auth: validates required fields such as `username`, `email`, `fullname`, and `password`.
- Customer: validates required inputs like customer name and domain linkage.
- Project: validates `name`, `customerId`, and SLA fields.
- SLA: validates required SLA fields such as `responseTime`, `deadline`, `riskThreshold`, and the target customer/project linkage.
- Communication: validates required upload fields (e.g., selected project/customer context and content).

Implemented in:

- `backend/core/controllers/authController.js`
- `backend/core/controllers/customerController.js`
- `backend/core/controllers/projectController.js`
- `backend/core/controllers/slaController.js`
- `backend/core/controllers/communicationController.js`

### 2) Access and Permission Validation

- JWT verification and user existence checks.
- Role-based authorization checks (Manager vs. Staff).
- Domain-based restrictions for Staff users.

Implemented in:

- `backend/core/middlewares/authenticate.js`
- `backend/core/middlewares/authorization.js`
- Domain-based filtering enforced in: `backend/core/controllers/customerController.js`

### 3) Relationship / Consistency Validation

- Ensures communication uploads match the selected project-customer-domain relationship.
- Ensures projects are linked to valid customers and domains.

Implemented in:

- `backend/core/controllers/communicationController.js`
- `backend/core/controllers/projectController.js`

---

## C) Data Transformation

Data coming from the data layer (usually databases) may need to be transformed into a format that can be used by the presentation layer (UI).

### 1) Database to API Transformation

- Mongoose documents are returned as JSON-friendly objects using `.lean()`.
- Reference IDs are transformed into readable objects using `.populate()` (e.g., showing domain/customer names instead of only IDs).

Implemented in:

- Controllers that use `.lean()` / `.populate()`, such as:
  - `backend/core/controllers/customerController.js`
  - `backend/core/controllers/projectController.js`
  - `backend/core/controllers/alertController.js`

### 2) Service Output Transformation (NLP)

- NLP output keys are mapped into application-friendly keys before the UI uses them:
  - `sentiment_score` -> `sentimentScore`
  - `staff_tasks` -> `staffTasks`

Implemented in:

- `backend/core/services/nlpService.js`

### 3) Backend Aggregation for Dashboard / Alerts

- The backend computes aggregate values needed by the dashboard (instead of forcing the UI to compute everything), such as:
  - total customers
  - stable/warning/critical counts
  - alert objects with risk context

Implemented in:

- `backend/core/controllers/alertController.js`

### 4) Frontend Transformation for Presentation

- The frontend transforms API payloads into display-ready values, such as status labels and trend visuals.

Implemented in:

- `frontend/src/pages/DashboardPage.jsx`
