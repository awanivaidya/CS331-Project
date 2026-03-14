# UI Choice and Justification

## Chosen UI Type

The project uses a **menu-based interface combined with direct manipulation**.

- A sidebar menu allows users to navigate between the main modules such as Dashboard, Customers, Projects, and Alerts.
- Users interact with the system by clicking buttons, selecting options from dropdown menus, and opening forms to create or edit data.

## Why This UI is Appropriate

### 1. Easy navigation between system modules

The system is divided into multiple modules (Customers, Projects, Alerts, Dashboard), and users frequently switch between them while investigating risks or managing records. A menu-based sidebar provides a clear and consistent navigation structure, reducing the time needed to locate features. This also improves discoverability for new users because the available modules are always visible.

### 2. Simple and intuitive interaction

Most actions in the application are task-oriented and visual (e.g., selecting a customer, opening a project, viewing details). Direct manipulation through clicks, buttons, and dropdowns matches common expectations for modern web dashboards, which lowers the learning curve. It also supports “drill-down” behavior, where users can open a customer/project from a list to view detailed information.

### 3. Efficient management of data

The application primarily manages structured data (customers, projects/engagements, and SLA-related information). Lists and tables allow users to scan many items quickly, while forms support creating and updating records in a controlled way. Using a top-right “New/Create” action with a popup form keeps users on the same page, enabling fast creation without disrupting the browsing workflow.

### 4. Reduces user errors

The system requires correct relationships between entities (for example, a project must be linked to a customer and domain, and may reference SLA settings). Structured inputs (dropdowns, numeric fields, and date pickers) minimize invalid data entry and ensure consistent formatting. This reduces common user errors such as selecting the wrong customer/domain combination or entering incorrectly formatted dates.

### 5. Suitable for dashboard-style systems

This project is monitoring-heavy: users need to view risk status, sentiment indicators, and operational items (deadlines, at-risk engagements) at a glance. A dashboard-style UI supports quick situational awareness using summary sections and visual indicators, while still allowing deeper investigation through list and detail pages. This combination supports both proactive monitoring and efficient follow-up actions.
