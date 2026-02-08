# AI-Based Customer Communication Analysis and Risk Alert System — Backend (Module 1)

Flask + PyMongo backend with CRUD APIs for customers, SLAs, projects, domains, and communications (email + transcript upload).

## Prerequisites

- Python 3.8+
- MongoDB running locally (default: `mongodb://localhost:27017/`)

## Setup

```bash
cd "cs 331 project"
python -m venv venv
source venv/bin/activate   # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## Run

```bash
python app.py
```

App runs at `http://localhost:5000`. Use `POSTMAN_SAMPLE_PAYLOADS.md` for request bodies.

- Health check: `GET http://localhost:5000/health`
- API overview: `GET http://localhost:5000/`

## Optional

Set `MONGODB_URI` if MongoDB is not on localhost:

```bash
export MONGODB_URI=mongodb://your-host:27017/
python app.py
```
