// ============================================
// USER MODEL SCHEMA
// ============================================

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
      maxlength: [100, 'Name cannot be more than 100 characters']
    },

    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please provide a valid email'
      ]
    },

    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false // Don't return password by default
    },

    phone: {
      type: String,
      required: [true, 'Please provide a phone number'],
      unique: true,
      match: [/^[0-9]{10}$/, 'Please provide a valid 10-digit phone number']
    },

    role: {
      type: String,
      enum: ['user', 'owner', 'admin'],
      default: 'user'
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true // Adds createdAt and updatedAt automatically
  }
);

// ============================================
// INDEXES
// ============================================

userSchema.index({ email: 1 });
userSchema.index({ role: 1 });

// ============================================
// METHODS
// ============================================

// Compare password method
userSchema.methods.comparePassword = async function(enteredPassword) {
  const bcryptjs = require('bcryptjs');
  return await bcryptjs.compare(enteredPassword, this.password);
};

// Get user without sensitive data
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

// ============================================
// EXPORT MODEL
// ============================================

module.exports = mongoose.model('User', userSchema);
