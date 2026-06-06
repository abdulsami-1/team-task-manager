require('dotenv').config();
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const PgSession = require('connect-pg-simple')(session);

const pool = require('./db');
const passport = require('./passport');

const authRoutes = require('./routes/auth');
const teamRoutes = require('./routes/teams');
const taskRoutes = require('./routes/tasks');

const app = express();

// Trust the proxy in front of us (Hugging Face Spaces / cloud platforms)
// This is required for secure cookies and correct IP detection behind a reverse proxy
app.set('trust proxy', 1);

// Read JSON request bodies
app.use(express.json());

// Allow the frontend to call us AND send the session cookie
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim());

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (curl, Postman, server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      // Reject but don't throw — return null so Express handles it gracefully
      return callback(null, false);
    },
    credentials: true,
  })
);

// Session store initialization with fallback
// Tries PostgreSQL first, falls back to MemoryStore if PG is unavailable
let sessionStore;

try {
  sessionStore = new PgSession({
    pool: pool,
    tableName: 'session',
    createTableIfMissing: true,
  });
  console.log('✓ PostgreSQL session store initialized');
} catch (err) {
  console.error('✗ PG session store initialization failed, falling back to MemoryStore:', err.message);
  sessionStore = new session.MemoryStore();
}

app.use(
  session({
    store: sessionStore,
    secret: process.env.SESSION_SECRET || 'dev-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true, // JavaScript on the page cannot read this cookie
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // 'none' required for cross-domain cookies
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  })
);

// Start passport and connect it to the session
app.use(passport.initialize());
app.use(passport.session());

// Mount the routes
app.use('/auth', authRoutes);
app.use('/teams', teamRoutes);
app.use('/tasks', taskRoutes);

// Simple health check
app.get('/', (req, res) => {
  res.json({ message: 'Task Manager API is running' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});