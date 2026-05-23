// ── DNS Fix: use Google DNS so mongodb+srv SRV lookup works ──────────────────
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

const express = require('express');
const http = require('http');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const { Server } = require('socket.io');

dotenv.config();

const app = express();
const httpServer = http.createServer(app);

// ── Socket.io ────────────────────────────────────────────────────────────────
// Allow any localhost port (handles 5173, 5174, etc.)
const allowedOrigin = (origin, callback) => {
  if (!origin || /^http:\/\/localhost:\d+$/.test(origin)) return callback(null, true);
  callback(new Error('Not allowed by CORS'));
};

const io = new Server(httpServer, {
  cors: { origin: allowedOrigin, methods: ['GET', 'POST'], credentials: true },
});

// Make io accessible in route handlers via req.io
app.use((req, _res, next) => {
  req.io = io;
  next();
});

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({ origin: allowedOrigin, credentials: true }));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth', require('./routes/auth'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/issues', require('./routes/issues'));
app.use('/api/ai', require('./routes/ai'));

// Health check
app.get('/api/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// ── Error Handler ─────────────────────────────────────────────────────────────
app.use(require('./middleware/errorHandler'));

// ── Socket Handler ────────────────────────────────────────────────────────────
require('./socket/socketHandler')(io);

// ── MongoDB + Server Start ────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Atlas connected');
    httpServer.listen(PORT, () => {
      console.log(`🚀 Orbit server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });

module.exports = { app, io };
