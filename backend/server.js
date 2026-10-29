const express = require('express');
const cors = require('cors');
require('dotenv').config();

const usersRoutes = require('./routes/users');
const documentsRoutes = require('./routes/documents');
const auditLogsRoutes = require('./routes/auditLogs');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS & Body Parsing
const allowedOrigins = process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : '*';
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// API Routes
app.use('/api/users', usersRoutes);
app.use('/api/documents', documentsRoutes);
app.use('/api/audit-logs', auditLogsRoutes);

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Audit Logging Backend API', timestamp: new Date() });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err.stack);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

app.listen(PORT, () => {
  console.log(`🚀 Audit Logging Server running at http://localhost:${PORT}`);
});
