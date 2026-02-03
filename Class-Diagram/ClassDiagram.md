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
