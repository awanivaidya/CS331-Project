# MERN Backend – AI-Based Customer Communication Analysis and Risk Alert System (Module 1)

Node.js + Express + MongoDB (Mongoose). CRUD for customers, SLAs, projects, domains, and communications (email + transcript upload).

## Prerequisites

- Node.js 18+
- MongoDB running locally (`mongodb://localhost:27017`)

## Setup

```bash
cd backend
npm install
```

Optional: create `.env` in `backend/`:

```
MONGODB_URI=mongodb://localhost:27017/customer_communication_db
PORT=5000
```

## Run

```bash
npm start
```

Server runs at **http://localhost:5001** (or the value of `PORT` in `.env`).

- **Health**: `GET http://localhost:5001/health`
- **Endpoints**: `GET http://localhost:5001/`

Use **POSTMAN_SAMPLE_PAYLOADS.md** for request bodies.

## Structure

- `server.js` – Express app, route mounting
- `config/db.js` – Mongoose connection
- `models/` – User, Customer, SLA, Project, Domain, Communication
- `controllers/` – Request handlers
- `routes/` – Express routers
