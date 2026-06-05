const express = require('express');
const bcrypt = require('bcrypt');
const passport = require('passport');
const pool = require('../db');
const { registerSchema, loginSchema } = require('../validators/schemas');

const router = express.Router();

// POST /auth/register - create a new account
router.post('/register', async (req, res) => {
  try {
    // 1. Validate the input
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { username, email, password } = value;

    // 2. Hash the password (never store the plain text)
    const passwordHash = await bcrypt.hash(password, 10);

    // 3. Save the user
    const result = await pool.query(
      `INSERT INTO users (username, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, username, email`,
      [username, email, passwordHash]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    // code 23505 = unique constraint broke (username/email already taken)
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Username or email already exists' });
    }
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// POST /auth/login - log in using the passport local strategy
router.post('/login', (req, res, next) => {
  // Validate that username and password are present before reaching Passport
  const { error } = loginSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      return res.status(401).json({ error: info ? info.message : 'Login failed' });
    }
    // req.login starts the session for this user
    req.login(user, (loginErr) => {
      if (loginErr) return next(loginErr);
      return res.json({ id: user.id, username: user.username, email: user.email });
    });
  })(req, res, next);
});

// POST /auth/logout - end the session
router.post('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.json({ message: 'Logged out' });
  });
});

// GET /auth/me - who am I? (frontend uses this to check the session)
router.get('/me', (req, res) => {
  if (req.isAuthenticated()) {
    return res.json(req.user);
  }
  res.status(401).json({ error: 'Not logged in' });
});

module.exports = router;