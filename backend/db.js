// db.js - creates one shared PostgreSQL connection pool
const { Pool } = require('pg');
require('dotenv').config();

// A Pool keeps a few connections open and reuses them.
// This is better than opening a new connection for every query.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

module.exports = pool;