# MERN Backend – AI-Based Customer Communication Analysis and Risk Alert System (Module 1)

Node.js + Express + MongoDB (Mongoose). CRUD for customers, SLAs, projects, domains, and communications (email + transcript upload).

## Prerequisites

- Node.js 18+
- MongoDB (local or Atlas). Set `MONGODB_URI` in `.env` for Atlas.

## Setup

```bash
cd backend
npm install
```

Create `.env` in `backend/` (or copy from `.env.example`):

```
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/customer_communication_db?appName=Cluster1
PORT=5001
```

## Run

```bash
npm start
```

Server runs at **http://localhost:5001**.

- **Health**: `GET http://localhost:5001/health`
- **Endpoints**: `GET http://localhost:5001/`

Use **POSTMAN_SAMPLE_PAYLOADS.md** or import **Postman_Collection.json** for testing.

## Structure

- `server.js` – Express app, route mounting
- `config/db.js` – Mongoose connection
- `models/` – User, Customer, SLA, Project, Domain, Communication
- `controllers/` – Request handlers
- `routes/` – Express routers
