# Customer Communication Analysis - Frontend

React frontend for the AI-Based Customer Communication Analysis and Risk Alert System.

## Tech Stack

- React 18
- Vite
- TailwindCSS
- React Router
- Axios

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## Backend Connection

The frontend connects to the backend API at `http://localhost:5001` via Vite proxy.

All API calls are made to `/api` which is proxied to the backend.

## Features

- **Authentication**: Mock login system
- **Dashboard**: Overview with stats and recent communications
- **Customers**: Manage customers with CRUD operations
- **Communications**: Upload emails/transcripts with NLP analysis
- **Projects**: Manage projects linked to customers
- **SLAs**: Create and manage SLA policies

## Login

Use any email and password to login (mock authentication).

## API Endpoints

- `GET /api/customers` - List all customers
- `POST /api/customers` - Create customer
- `POST /api/communications/email` - Upload email
- `POST /api/communications/transcript` - Upload transcript
- `GET /api/projects` - List projects
- `GET /api/slas` - List SLA policies
