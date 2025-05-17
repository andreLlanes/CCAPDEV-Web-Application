const jwt = require('jsonwebtoken');
const User = require('../models/Users');

const ensureAuth = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.redirect('/login');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ⬇️ fetch full user data from database using decoded ID
    const user = await User.findById(decoded.id || decoded._id);
    if (!user) {
      return res.redirect('/login');
    }

    req.user = user; // now req.user contains full user info
    next();
  } catch (err) {
    console.error('❌ Invalid Token:', err.message);
    res.clearCookie('token');
    return res.redirect('/login');
  }
};

const ensureGuest = (req, res, next) => {
  const token = req.cookies.token;
  if (token) {
    try {
      jwt.verify(token, process.env.JWT_SECRET);
      return res.redirect('/home');
    } catch (err) {
      return next();
    }
  }
  return next();
};

module.exports = { ensureAuth, ensureGuest };