# Hosting and Deployment Plan

## 1. Host Site

| Component      | Target Host          | Technology             |
| -------------- | -------------------- | ---------------------- |
| Frontend       | Vercel               | React + TailwindCSS    |
| Backend API    | Render (Web Service) | Node.js + Express      |
| NLP Processing | Bundled with Backend | Python (child process) |
| Database       | MongoDB Atlas        | MongoDB (Cloud)        |

## 2. Deployment Strategy

### Step 1: Database Setup (MongoDB Atlas)

1. Create MongoDB Atlas account and cluster
2. Configure database user with read/write permissions
3. Whitelist Render IP addresses (or use `0.0.0.0/0` for all)
4. Obtain connection string:
   ```
   mongodb+srv://<username>:<password>@cluster.xxxxx.mongodb.net/<dbname>
   ```

### Step 2: Backend Deployment (Render)

1. **Create Web Service:**
   - Connect GitHub repository
   - Set root directory: `backend/`

2. **Configure Environment Variables:**
   - `MONGO_URI` - MongoDB connection string from Step 1
   - `JWT_SECRET` - Secret key for authentication
   - `PORT` - 5001 (or Render default)

3. **Build Configuration:**
   - Build command: `npm install; pip install -r ../nlpservice/requirements.txt`
   - Start command: `node core/server.js`
   - Runtime: Node.js + Python 3.10+

4. **NLP Integration:**
   - NLP analyzer (`nlpservice/analyzer.py`) is bundled with backend
   - Backend spawns Python process when needed:
     ```javascript
     spawn("python", ["analyzer.py", "--text", text, "--json", "--offline"]);
     ```

### Step 3: Frontend Deployment (Vercel)

1. **Create Project:**
   - Connect GitHub repository
   - Framework: React

2. **Configure Environment:**
   - `REACT_APP_API_URL` - Render backend URL (e.g., `https://backend.onrender.com`)

3. **Deploy:**
   - Vercel auto-builds and deploys on Git push

### Step 4: API Communication Configuration

**Frontend → Backend:**

- Frontend makes HTTPS requests to backend API endpoints
- JWT token stored in HTTP-only cookies for authentication

**Backend → Database:**

- Mongoose ODM connects to MongoDB Atlas via `MONGO_URI`

**Backend → NLP:**

- Direct child process communication (no network calls)
- Data passed via stdin/stdout in JSON format

**API Endpoints:**

- `/api/auth/*` - Authentication
- `/api/customers/*` - Customer management
- `/api/projects/*` - Project management
- `/api/slas/*` - SLA management
- `/api/communications/*` - Upload and analyze communications
- `/api/alerts/*` - View alerts and dashboard
- `/api/domains/*` - Domain management
