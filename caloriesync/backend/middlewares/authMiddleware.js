import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const ACCESS_COOKIE_NAME = 'accessToken';

export async function authenticateJWT(req, res, next) {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];

  let token;

  if (authHeader) {
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({ message: 'Invalid Authorization format' });
    }
    token = parts[1];
  } else if (req.cookies && req.cookies[ACCESS_COOKIE_NAME]) {
    token = req.cookies[ACCESS_COOKIE_NAME];
  }

  if (!token) {
    return res.status(401).json({ message: 'Missing access token' });
  }

  try {
    const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    // attach minimal user info
    req.user = { id: payload.id, email: payload.email };
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}
