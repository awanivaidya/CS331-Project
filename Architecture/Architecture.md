# Software Architecture

## Chosen Architecture Style

**Layered Architecture** (with Service-Oriented Components)

---

## A. Justification of Architecture Category (Granularity of Components)

- The system is divided into well-defined layers, each with a specific responsibility.
- Each layer communicates only with adjacent layers, ensuring **separation of concerns**.

### Layers in the Project

| Layer | Components |
|-------|------------|
| **Presentation Layer** | Web UI (Dashboard, Project View, Alerts View) — Used by Manager and Staff |
| **Application / Service Layer** | Customer Management, Project & SLA Management, Risk Evaluation Logic |
| **AI / NLP Processing Layer** | Sentiment Analysis, Task Extraction, Summary Generation |
| **Data Access Layer** | Customer Data, Project Data, Communication Data, SLA Records |
| **External Services Layer** | NLP Engine, Notification Service |

### Component Granularity

- Components are **coarse-grained services**, not fine-grained microservices.
- Each module (e.g., NLP Processor, Risk Analyzer) performs a single major function.
- All components are deployed as part of **one unified system**.

---

## B. Why Layered Architecture Is the Best Choice

### 1. Scalability

- Individual layers (e.g., NLP layer) can be optimized or scaled independently.
- AI processing can be enhanced or replaced without affecting UI or data layers.
- Suitable for moderate system growth without microservice overhead.

### 2. Maintainability

- Clear separation of responsibilities:
  - UI changes do not affect AI logic.
  - Database schema changes do not impact frontend.
- Easier debugging and testing due to layer isolation.
- New features (e.g., new analysis type) can be added in the service layer.

### 3. Performance

- Direct method calls between layers reduce communication overhead.
- Faster than microservices for this project scale.
- NLP processing is isolated, preventing performance bottlenecks in core services.

### 4. Simplicity and Academic Suitability

- Easier to design, implement, and document.
- Clear mapping to UML, DFDs, and use-case diagrams.
- Well-suited for a university software engineering project.

### 5. Future Extensibility

- Can evolve into Service-Oriented or Microservices Architecture later.
- NLP Engine and Notification Service can be separated if required.
