// ============================================
// AUTH CONTROLLER
// ============================================

const { User } = require('../models');
const bcryptjs = require('bcryptjs');
const { generateToken } = require('../middleware/auth');
const { AppError } = require('../middleware/errorHandler');

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// ============================================
// REGISTER CONTROLLER
// ============================================

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role, phone } = req.body;

    // Step 1: Required fields
    if (!name || !email || !password || !role || !phone) {
      return res.status(400).json({
        status: 'error',
        message: 'All fields are required'
      });
    }

    // Step 2: Simple validations with clear messages
    if (!isValidEmail(email)) {
      return res.status(400).json({ status: 'error', message: 'Invalid email' });
    }

    if (typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ status: 'error', message: 'Password must be at least 6 characters' });
    }

    if (!['user', 'owner', 'admin'].includes(role)) {
      return res.status(400).json({ status: 'error', message: 'Role not valid' });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ status: 'error', message: 'Email already exists' });
    }

    // Hash password and create user
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    await User.create({ name, email, password: hashedPassword, role, phone });

    return res.status(201).json({ success: true, message: 'User registered successfully' });

  } catch (error) {
    next(error);
  }
};

// ============================================
// LOGIN CONTROLLER
// ============================================

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return next(new AppError('Please provide email and password', 400));
    }

    // Find user and include password field
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return next(new AppError('Invalid email or password', 401));
    }

    // Check password
    const isPasswordCorrect = await user.comparePassword(password);

    if (!isPasswordCorrect) {
      return next(new AppError('Invalid email or password', 401));
    }

    // Generate JWT token
    const token = generateToken(user._id);

    // Return response
    res.status(200).json({
      status: 'success',
      message: 'Logged in successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        token
      }
    });

  } catch (error) {
    next(error);
  }
};

// ============================================
// GET CURRENT USER
// ============================================

exports.getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt
        }
      }
    });

  } catch (error) {
    next(error);
  }
};

// ============================================
// UPDATE PROFILE
// ============================================

exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone, address, city } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        name: name || req.user.name,
        phone: phone || req.user.phone,
        address: address || req.user.address,
        city: city || req.user.city
      },
      { new: true, runValidators: true }
    );

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    res.status(200).json({
      status: 'success',
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      }
    });

  } catch (error) {
    next(error);
  }
};

// ============================================
// LOGOUT (Frontend will handle token removal)
// ============================================

exports.logout = async (req, res, next) => {
  try {
    res.status(200).json({
      status: 'success',
      message: 'Logged out successfully. Please remove token from client storage.'
    });
  } catch (error) {
    next(error);
  }
};
