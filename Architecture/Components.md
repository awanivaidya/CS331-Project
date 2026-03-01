# Application Components

---

## 1. User Management Component

- Handles user authentication and session management
- Manages user roles such as **Manager** and **Staff/Viewer**
- Controls access to dashboards, projects, and alerts

## 2. Customer Management Component

- Maintains customer profiles and priorities
- Links customers with projects and SLAs
- Supports retrieval and update of customer data

## 3. Project Management Component

- Manages customer projects and their metadata
- Stores communication history for each project
- Tracks project status and assigned domain/category

## 4. SLA Management Component

- Stores Service Level Agreement parameters
- Defines response time, deadlines, and risk thresholds
- Provides SLA data for risk and compliance analysis

## 5. Communication Management Component

- Handles customer communications such as emails and transcripts
- Stores raw communication content with timestamps
- Associates communications with relevant projects

## 6. NLP Processing Component

- Performs sentiment analysis on communication data
- Extracts actionable tasks for staff
- Generates concise summaries for quick understanding

## 7. Risk Analysis Component

- Evaluates project and customer risk levels
- Uses sentiment trends and SLA constraints
- Determines risk status (**stable**, **warning**, **critical**)

## 8. Alert & Notification Component

- Generates alerts for risk events or SLA breaches
- Sends notifications to relevant users
- Tracks alert severity and resolution status

## 9. Dashboard & Visualization Component

- Displays sentiment trends and risk indicators
- Provides project-wise and customer-wise insights
- Supports informed decision-making for managers and staff

## 10. Data Storage Component

- Stores user, customer, project, SLA, and communication data
- Maintains analysis results and alert history
- Supports efficient data retrieval and updates

---

## Component Overview

| #   | Component                 | Key Responsibility                              |
| --- | ------------------------- | ----------------------------------------------- |
| 1   | User Management           | Authentication, roles & access control          |
| 2   | Customer Management       | Customer profiles & linking                     |
| 3   | Project Management        | Projects, metadata & communication history      |
| 4   | SLA Management            | SLA parameters & compliance data                |
| 5   | Communication Management  | Emails, transcripts & timestamps                |
| 6   | NLP Processing            | Sentiment analysis, task extraction & summaries |
| 7   | Risk Analysis             | Risk evaluation using sentiment & SLA data      |
| 8   | Alert & Notification      | Risk alerts & SLA breach notifications          |
| 9   | Dashboard & Visualization | Trends, insights & decision support             |
| 10  | Data Storage              | Persistent storage & retrieval                  |
