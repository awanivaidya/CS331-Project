/**
 * AI-Based Customer Communication Analysis and Risk Alert System
 * Backend (Module 1) - Express server entry point.
 * Run: node server.js (ensure MongoDB is running locally)
 */

require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');

const customerRoutes = require('./routes/customerRoutes');
const slaRoutes = require('./routes/slaRoutes');
const projectRoutes = require('./routes/projectRoutes');
const domainRoutes = require('./routes/domainRoutes');
const communicationRoutes = require('./routes/communicationRoutes');

const app = express();
const PORT = process.env.PORT || 5001;

// Parse JSON request bodies
app.use(express.json());

// Connect to MongoDB before starting server
connectDB();

// Mount API routes
app.use('/api/customers', customerRoutes);
app.use('/api/slas', slaRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/domains', domainRoutes);
app.use('/api/communications', communicationRoutes);

// Root - list available endpoints
app.get('/', (req, res) => {
  res.json({
    app: 'AI-Based Customer Communication Analysis and Risk Alert System',
    module: 'Backend Module 1',
    endpoints: {
      customers: '/api/customers',
      slas: '/api/slas',
      projects: '/api/projects',
      domains: '/api/domains',
      communications: '/api/communications',
      uploadEmail: 'POST /api/communications/email',
      uploadTranscript: 'POST /api/communications/transcript',
    },
  });
});

// Health check - verifies MongoDB connection
app.get('/health', async (req, res) => {
  try {
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ status: 'error', mongodb: 'not connected' });
    }
    res.json({ status: 'ok', mongodb: 'connected' });
  } catch (err) {
    res.status(503).json({ status: 'error', mongodb: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
