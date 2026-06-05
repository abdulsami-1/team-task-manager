// passport.js - sets up the "local" login strategy (username + password)
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const pool = require('./db');

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      // 1. Find the user by username
      const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
      const user = result.rows[0];
      if (!user) {
        return done(null, false, { message: 'Wrong username or password' });
      }

      // 2. Compare the typed password with the stored hash
      const passwordMatches = await bcrypt.compare(password, user.password_hash);
      if (!passwordMatches) {
        return done(null, false, { message: 'Wrong username or password' });
      }

      // 3. Success - pass the user along
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
);

// Save only the user id inside the session cookie
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// On each request, load the full user from the id in the session
passport.deserializeUser(async (id, done) => {
  try {
    const result = await pool.query('SELECT id, username, email FROM users WHERE id = $1', [id]);
    done(null, result.rows[0]);
  } catch (err) {
    done(err);
  }
});

module.exports = passport;