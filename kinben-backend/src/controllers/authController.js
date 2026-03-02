import bcrypt from 'bcryptjs';
import { supabase } from '../config/supabase.js';
import { generateTokens } from '../utils/tokenManager.js';
import { AppError } from '../middleware/errorHandler.js';
import { validateEmail, validatePassword } from '../utils/validators.js';

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
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .single();

    if (existingUser) {
      throw new AppError('Email already registered', 409, 'EMAIL_EXISTS');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert([{
        email: email.toLowerCase(),
        password_hash: passwordHash,
        first_name: firstName,
        last_name: lastName,
        phone_number: phone
      }])
      .select()
      .single();

    if (createError) {
      console.error('Supabase createError:', createError);
      throw new AppError('Failed to create user', 500, 'USER_CREATE_ERROR');
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(newUser.id, newUser.email);

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: newUser.id,
          email: newUser.email,
          firstName: newUser.first_name,
          lastName: newUser.last_name
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
    const { data: user, error: queryError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    if (!user || queryError) {
      throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    // Update last login
    await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', user.id);

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

    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, phone_number, profile_image_url, created_at')
      .eq('id', userId)
      .single();

    if (error || !user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

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
