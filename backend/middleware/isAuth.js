// Simple middleware - checks if the user is logged in
function isAuth(req, res, next) {
  if (req.isAuthenticated()) {
    return next(); // let them through
  }
  res.status(401).json({ error: 'You must be logged in' });
}

module.exports = isAuth;