FULL PROJECT CONTEXT FOR COPILOT

This is an internal AI-based Customer Communication Analysis and Risk Alert System implemented using the MERN stack with a separate offline Python NLP service. The system is not customer-facing. It is used only by internal organizational users.

Users
There are two user types:

Manager – full privileges. Managers can register users, create projects, define SLA and requirement text, upload customer communications (emails and meeting transcripts), and view dashboards and alerts.

Staff – read-only users. Staff cannot modify data. Staff visibility is restricted by project domain.

Access Control
Projects have a projectCategory (e.g., Finance, Tech). Staff users have an assigned role/domain. A Staff user can only view projects whose category matches their assigned role. Managers can view all projects. Access control is implemented at the service/controller layer, not in the UI.

Projects and Initialization Flow
A project represents a customer engagement. When a Manager creates a project, they must enter natural-language SLA and requirement text (expectations, deadlines, response times, escalation rules). This text is stored in raw form and immediately sent to the NLP service to initialize the project state.

NLP Module (Core AI Component)
The NLP module is a standalone Python service that runs offline after the first model download. It uses pretrained transformer models (no training or fine-tuning) to perform:

Sentiment analysis on the SLA/requirement text, producing a sentiment label and confidence. Initial projects typically resolve to neutral sentiment.

Summarization of the SLA/requirements into concise bullet points that clearly describe what the organization must deliver to the customer.

The NLP service exposes a REST API. The Node/Express backend calls this API during project creation. The NLP output (sentiment + bullet summary) is stored in the database and shown to Staff users as a project overview.