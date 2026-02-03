## UML Class Structure

This section describes the class structure of the **AI-Based Customer Communication Analysis and Risk Alert System**.  
Each class is documented along with its attributes and methods, including **visibility modifiers**.

### Visibility Legend
- `+` **Public** – Accessible from any class  
- `-` **Private** – Accessible only within the class  
- `#` **Protected** – Accessible within the class and its subclasses  

---

## Class Descriptions

### User
**Base class for all system users.**

**Attributes:**
- `- userId : String` – Unique identifier for the user
- `- name : String` – User's full name
- `- email : String` – User's email address
- `- password : String` – Encrypted password for authentication

**Methods:**
- `+ login() : boolean` – Authenticates user credentials and returns success status
- `+ logout() : void` – Ends the current user session

---

### Manager
**Extends User. Responsible for system administration and oversight.**

**Methods:**
- `+ createCustomer() : void` – Creates a new customer profile in the system
- `+ defineSLA() : void` – Sets service level agreement parameters
- `+ uploadCommunication() : void` – Uploads customer communication data (emails, transcripts)
- `+ assignProjectDomain() : void` – Assigns projects to specific business domains
- `+ viewAlerts() : List<Alert>` – Retrieves all system alerts
- `+ viewDashboard() : void` – Displays system overview and analytics
- `+ viewProjects() : List<Project>` – Retrieves all projects in the system

---
### Staff
**Extends User. Assigned to specific projects with limited permissions.**

**Attributes:**
- `# assignedRole : String` – Role designation (e.g., finance, tech)
- `# assignedProjects : List<Project>` – Projects assigned to this staff member

**Methods:**
- `+ viewProjects() : List<Project>` – Retrieves projects assigned to this staff member
- `+ viewAlerts() : List<Alert>` – Retrieves alerts related to assigned projects

---

### Customer
**Represents a client whose communications are monitored.**

**Attributes:**
- `- customerId : String` – Unique customer identifier
- `- customerName : String` – Customer's organization or individual name
- `- priority : String` – Customer priority level (e.g., high, medium, low)
- `- sentimentScore : float` – Current sentiment score based on communication analysis
- `- riskStatus : String` – Current risk level (e.g., critical, warning, stable)

**Methods:**
- `# updateSentiment() : void` – Updates sentiment score based on recent communications
- `# updateRiskStatus() : void` – Updates risk status based on sentiment and SLA metrics

---

### SLA
**Service Level Agreement defining response expectations and risk thresholds.**

**Attributes:**
- `- slaId : String` – Unique SLA identifier
- `- responseTime : int` – Maximum response time in hours
- `- deadline : Date` – SLA expiration or review date
- `- riskThreshold : float` – Sentiment threshold that triggers risk alerts

---

### Project
**Represents a customer project.**

**Attributes:**
- `- projectId : String` – Unique project identifier
- `- projectName : String` – Descriptive project name
- `- projectCategory : String` – Business domain or category
- `- status : String` – Current project status (e.g., active, completed, on-hold)

---

### Communication
**Base class for all customer communications.**

**Attributes:**
- `- communicationId : String` – Unique communication identifier
- `- content : String` – Raw communication content
- `- timestamp : Date` – When the communication occurred
- `- sentiment : String` – Analyzed sentiment (positive, neutral, negative)
- `- summary : String` – AI-generated summary of the communication

---
### Email
**Extends Communication. Represents email communications.**

**Attributes:**
- `- subject : String` – Email subject line
- `- sender : String` – Email sender address

---

### Transcript
**Extends Communication. Represents meeting or call transcripts.**

**Attributes:**
- `- meetingDate : Date` – Date and time of the meeting
- `- participants : List<String>` – List of meeting participants

---
