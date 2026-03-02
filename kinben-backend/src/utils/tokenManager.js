import jwt from 'jsonwebtoken';
import 'dotenv/config.js';
import { AppError } from '../middleware/errorHandler.js';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRY = process.env.JWT_EXPIRY || '15m';
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || '7d';

if (!JWT_SECRET || JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be at least 32 characters long');
}

export const generateTokens = (userId, email, role = 'user') => {
  try {
    const accessToken = jwt.sign(
      { userId, email, role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY }
    );

    const refreshToken = jwt.sign(
      { userId, email },
      JWT_SECRET,
      { expiresIn: REFRESH_TOKEN_EXPIRY }
    );

    return { accessToken, refreshToken };
  } catch (error) {
    throw new AppError('Failed to generate tokens', 500, 'TOKEN_GENERATION_ERROR');
  }
};

export const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new AppError('Token has expired', 401, 'TOKEN_EXPIRED');
    } else if (error.name === 'JsonWebTokenError') {
      throw new AppError('Invalid token', 401, 'INVALID_TOKEN');
    }
    throw new AppError('Token verification failed', 401, 'TOKEN_VERIFICATION_ERROR');
  }
};

export const refreshAccessToken = (refreshToken) => {
  try {
    const decoded = verifyToken(refreshToken);
    const { userId, email } = decoded;

    const newAccessToken = jwt.sign(
      { userId, email, role: 'user' },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY }
    );

    return newAccessToken;
  } catch (error) {
    throw new AppError('Failed to refresh token', 401, 'REFRESH_TOKEN_ERROR');
  }
};

export const extractTokenFromHeader = (authHeader) => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7); // Remove "Bearer " prefix
};

export default {
  generateTokens,
  verifyToken,
  refreshAccessToken,
  extractTokenFromHeader
};
