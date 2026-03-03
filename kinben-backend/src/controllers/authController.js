import bcrypt from 'bcryptjs';
import { pool } from '../config/database.js';
import { generateTokens } from '../utils/tokenManager.js';
import { AppError } from '../middleware/errorHandler.js';
import { validateEmail, validatePassword } from '../utils/validators.js';
import { v4 as uuidv4 } from 'uuid';

export const signup = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, phone } = req.body;

    // Validation
    if (!email || !validateEmail(email)) {
      throw new AppError('Invalid email format', 400, 'INVALID_EMAIL');
    }

    if (!password || !validatePassword(password)) {
      throw new AppError(
        'Password must be at least 8 characters with uppercase, number, and special character',
        400,
        'WEAK_PASSWORD'
      );
    }

    // Check if user exists
    const existingUserResult = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (existingUserResult.rows.length > 0) {
      throw new AppError('Email already registered', 409, 'EMAIL_EXISTS');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user
    const userId = uuidv4();
    const now = new Date();

    await pool.query(
      `INSERT INTO users
       (id, email, password_hash, first_name, last_name, phone_number, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [userId, email.toLowerCase(), passwordHash, firstName, lastName, phone, now, now]
    );

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(userId, email.toLowerCase());

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: userId,
          email: email.toLowerCase(),
          firstName,
          lastName
        },
        accessToken,
        refreshToken
      },
      message: 'Account created successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError('Email and password required', 400, 'MISSING_CREDENTIALS');
    }

    // Get user with password hash
    const userResult = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (userResult.rows.length === 0) {
      throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    const user = userResult.rows[0];

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    // Update last login
    await pool.query(
      'UPDATE users SET last_login = $1 WHERE id = $2',
      [new Date(), user.id]
    );

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id, user.email);

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name
        },
        accessToken,
        refreshToken
      },
      message: 'Login successful'
    });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      throw new AppError('Refresh token required', 400, 'NO_REFRESH_TOKEN');
    }

    // This will verify the token
    const { generateTokens: regenerateTokens, verifyToken } = await import('../utils/tokenManager.js');
    const decoded = verifyToken(token);

    const { accessToken, refreshToken } = generateTokens(decoded.userId, decoded.email);

    res.json({
      success: true,
      data: { accessToken, refreshToken },
      message: 'Token refreshed'
    });
  } catch (error) {
    next(error);
  }
};

export const getCurrentUser = async (req, res, next) => {
  try {
    const { userId } = req.user;

    const userResult = await pool.query(
      'SELECT id, email, first_name, last_name, phone_number, profile_image_url, created_at FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    const user = userResult.rows[0];

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

export const logout = (req, res) => {
  // In a real system, you might invalidate the token in a blacklist
  // For now, JWT tokens are stateless, so logout is handled client-side
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
};

export default {
  signup,
  login,
  refreshToken,
  getCurrentUser,
  logout
};
