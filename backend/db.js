// db.js - creates one shared PostgreSQL connection pool
const { Pool } = require('pg');
require('dotenv').config();

// Neon (and most cloud PG providers) require SSL.
// We enable it when DATABASE_URL contains 'sslmode' or when NODE_ENV is production.
const isRemote =
  process.env.DATABASE_URL &&
  (process.env.DATABASE_URL.includes('sslmode') ||
    process.env.NODE_ENV === 'production');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isRemote ? { rejectUnauthorized: false } : false,
});

module.exports = pool;
