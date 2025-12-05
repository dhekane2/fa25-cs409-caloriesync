import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const ACCESS_TOKEN_EXPIRES = '5m';
const REFRESH_TOKEN_EXPIRES = '7d';
const SALT_ROUNDS = 10;

const COOKIE_NAME = 'refreshToken';
const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days in ms

const ACCESS_COOKIE_NAME = 'accessToken';
const ACCESS_TOKEN_MAX_AGE = 2 * 60 * 1000; // 2 minutes in ms
// Cookie options for refresh token. Adjust these when deploying to support
// cross-site cookies (frontend and backend served from different origins):
// - For local development with same-origin or simple cross-origin flows,
//   `sameSite: 'lax'` is often acceptable.
// - For cross-site cookies in production (frontend and backend on different domains),
//   set `sameSite: 'none'` AND `secure: true` so the browser will accept the cookie.
// - Also ensure CORS `credentials: true` is enabled and the frontend uses
//   `fetch(..., { credentials: 'include' })` so cookies are sent with requests.
// Example for production cross-site:
//   const cookieOptions = { httpOnly: true, secure: true, sameSite: 'none', maxAge: ..., path: '/' }
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: REFRESH_TOKEN_MAX_AGE,
  path: '/'
};

const accessCookieOptions = {
  ...cookieOptions,
  maxAge: ACCESS_TOKEN_MAX_AGE
};

function generateAccessToken(user) {
  return jwt.sign({ id: user._id, email: user.email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRES });
}

function generateRefreshToken(user) {
  return jwt.sign({ id: user._id, email: user.email }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRES });
}

export async function register(req, res) {
  
  console.log("Register request received");

  try {
    const {
      first_name,
      last_name,
      email,
      password,
      phone_number,
      age,
      gender,
      height,
      weight,
      goal_weight,
      goal_timeframe_value,
      goal_timeframe_unit
    } = req.body;

    // phone_number is optional; treat empty string as "not provided"
    const normalizedPhone =
      typeof phone_number === 'string' && phone_number.trim() === ''
        ? undefined
        : phone_number;

    // goal_timeframe_value and goal_timeframe_unit are required from frontend
    if (
      !first_name ||
      !last_name ||
      !email ||
      !password ||
      !age ||
      !gender ||
      height == null ||
      weight == null ||
      goal_weight == null ||
      goal_timeframe_value == null ||
      !goal_timeframe_unit
    ) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(409).json({ message: 'User with that email already exists' });

    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

    const user = new User({
      first_name,
      last_name,
      email: email.toLowerCase(),
      password_hash,
      phone_number: normalizedPhone,
      age,
      gender,
      height,
      weight,
      goal_weight,
      goal_timeframe_value: Number(goal_timeframe_value),
      goal_timeframe_unit
    });

    await user.save();

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // save refresh token (single-token approach: overwrite any existing token)
    user.refresh_token = refreshToken;
    await user.save();

    // set HttpOnly cookies for access and refresh tokens
    res.cookie(ACCESS_COOKIE_NAME, accessToken, accessCookieOptions);
    res.cookie(COOKIE_NAME, refreshToken, cookieOptions);

    const safeUser = user.toObject();
    delete safeUser.password_hash;
    delete safeUser.refresh_token;

    return res.status(201).json({ user: safeUser, message:"user registered successfully" });
  } catch (err) {
    console.error('Register error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function login(req, res) {

  console.log("Login request received");
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Missing email or password' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // overwrite stored refresh token
    user.refresh_token = refreshToken;
    await user.save();

    // set HttpOnly cookies for access and refresh tokens
    res.cookie(ACCESS_COOKIE_NAME, accessToken, accessCookieOptions);
    res.cookie(COOKIE_NAME, refreshToken, cookieOptions);

    const safeUser = user.toObject();
    delete safeUser.password_hash;
    delete safeUser.refresh_token;

    return res.json({ user: safeUser, message:"user logged in successfully" });
  } catch (err) {
    console.error('Login error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function refresh(req, res) {
  try {
    const refreshToken = req.cookies && req.cookies[COOKIE_NAME];
    if (!refreshToken) return res.status(400).json({ message: 'Missing refresh token cookie' });

    let payload;
    try {
      payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    } catch (e) {
      return res.status(403).json({ message: 'Invalid refresh token' });
    }

    const user = await User.findById(payload.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // ensure token matches the single stored token
    if (!user.refresh_token || user.refresh_token !== refreshToken) {
      return res.status(403).json({ message: 'Refresh token revoked' });
    }

    const accessToken = generateAccessToken(user);

    // refresh access token cookie
    res.cookie(ACCESS_COOKIE_NAME, accessToken, accessCookieOptions);

    return res.json({ message: 'access token refreshed' });
  } catch (err) {
    console.error('Refresh error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function logout(req, res) {

  console.log("Logout request received");
  try {
    const refreshToken = req.cookies && req.cookies[COOKIE_NAME];
    if (!refreshToken) {
      // clear cookie anyway
      res.clearCookie(COOKIE_NAME, cookieOptions);
      res.clearCookie(ACCESS_COOKIE_NAME, accessCookieOptions);
      return res.json({ message: 'Logged out' });
    }

    let payload;
    try { payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET); } catch (e) { payload = null; }

    if (payload) {
      const user = await User.findById(payload.id);
      if (user) {
        // clear stored refresh token on logout
        user.refresh_token = null;
        await user.save();
      }
    }

    // clear the cookies on logout
    res.clearCookie(COOKIE_NAME, cookieOptions);
    res.clearCookie(ACCESS_COOKIE_NAME, accessCookieOptions);
    return res.json({ message: 'Logged out' });
  } catch (err) {
    console.error('Logout error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
