// ============================================
// BOOKING MODEL SCHEMA
// ============================================

const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    // User who booked
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide a user']
    },

    // PG that was booked
    pg: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PG',
      required: [true, 'Please provide a PG']
    },

    // Owner of the PG (automatically set from PG owner)
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide a PG owner']
    },

    // Check-in date
    checkInDate: {
      type: Date,
      required: [true, 'Please provide check-in date']
    },

    // Check-out date (optional for ongoing bookings)
    checkOutDate: {
      type: Date,
      default: null
    },

    // Number of rooms booked
    roomsBooked: {
      type: Number,
      required: [true, 'Please provide number of rooms'],
      min: [1, 'At least 1 room must be booked']
    },

    // Booking status
    status: {
      type: String,
      enum: ['pending', 'approved', 'confirmed', 'active', 'completed', 'cancelled'],
      default: 'pending'
    },

    // Total price for booking
    totalPrice: {
      type: Number,
      required: [true, 'Please provide total price'],
      min: [0, 'Price cannot be negative']
    },

    // Price per room per day
    pricePerDay: {
      type: Number,
      required: [true, 'Please provide price per day']
    },

    // Number of days booked
    numberOfDays: {
      type: Number,
      required: true,
      min: [1, 'Booking must be for at least 1 day']
    },

    // Daily rent calculation
    dailyRent: {
      type: Number,
      required: [true, 'Please provide daily rent'],
      min: [0, 'Daily rent cannot be negative']
    },

    // Total days of stay
    totalDays: {
      type: Number,
      required: true,
      min: [1, 'Total days must be at least 1']
    },

    // Stay price (before deposit)
    stayPrice: {
      type: Number,
      required: [true, 'Please provide stay price'],
      min: [0, 'Stay price cannot be negative']
    },

    // Refundable deposit (fixed at ₹1000)
    refundableDeposit: {
      type: Number,
      default: 1000,
      min: [0, 'Deposit cannot be negative']
    },

    // Guest information
    guestName: {
      type: String,
      required: [true, 'Please provide guest name'],
      trim: true
    },

    guestEmail: {
      type: String,
      required: [true, 'Please provide guest email']
    },

    guestPhone: {
      type: String,
      required: [true, 'Please provide guest phone']
    },

    // Additional requirements/notes
    specialRequirements: {
      type: String,
      default: null,
      maxlength: [500, 'Special requirements cannot exceed 500 characters']
    },

    // Payment information
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending'
    },

    paymentId: {
      type: String,
      default: null
    },

    // Cancellation details
    cancellationReason: {
      type: String,
      default: null
    },

    cancelledAt: {
      type: Date,
      default: null
    },

    cancelledBy: {
      type: String,
      enum: ['user', 'owner', 'admin'],
      default: undefined
    },

    // Rating (after booking completion)
    rating: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
      default: null
    },

    review: {
      type: String,
      default: null,
      maxlength: [1000, 'Review cannot exceed 1000 characters']
    },

    // Owner approval for booking
    ownerApproved: {
      type: Boolean,
      default: false
    },

    ownerApprovedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// ============================================
// INDEXES
// ============================================

bookingSchema.index({ user: 1, status: 1 });
bookingSchema.index({ owner: 1, status: 1 });
bookingSchema.index({ pg: 1, status: 1 });
bookingSchema.index({ checkInDate: 1, checkOutDate: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ createdAt: -1 });

// ============================================
// VIRTUAL - Duration
// ============================================

bookingSchema.virtual('duration').get(function() {
  if (!this.checkOutDate) return null;
  const duration = Math.ceil(
    (this.checkOutDate - this.checkInDate) / (1000 * 60 * 60 * 24)
  );
  return duration;
});

// ============================================
// MIDDLEWARE - CALCULATE TOTAL PRICE
// ============================================

bookingSchema.pre('save', async function(next) {
  if (this.isModified('pricePerDay') || this.isModified('numberOfDays')) {
    this.totalPrice = this.pricePerDay * this.numberOfDays;
  }
  next();
});

// ============================================
// METHODS
// ============================================

// Cancel booking
bookingSchema.methods.cancelBooking = async function(reason, cancelledBy) {
  if (this.status === 'cancelled') {
    throw new Error('Booking is already cancelled');
  }
  this.status = 'cancelled';
  this.cancellationReason = reason;
  this.cancelledAt = new Date();
  this.cancelledBy = cancelledBy;
  return this.save();
};

// Add review
bookingSchema.methods.addReview = async function(rating, reviewText) {
  if (this.status !== 'completed') {
    throw new Error('Can only review completed bookings');
  }
  this.rating = rating;
  this.review = reviewText;
  return this.save();
};

// Confirm booking
bookingSchema.methods.confirmBooking = async function() {
  this.status = 'confirmed';
  this.ownerApproved = true;
  this.ownerApprovedAt = new Date();
  return this.save();
};

// ============================================
// STATICS
// ============================================

// Get user bookings
bookingSchema.statics.getUserBookings = function(userId) {
  return this.find({ user: userId })
    .populate('pg', 'title location price images')
    .sort({ checkInDate: -1 });
};

// Get owner bookings for their PGs
bookingSchema.statics.getOwnerBookings = function(ownerId) {
  return this.find()
    .populate({
      path: 'pg',
      match: { owner: ownerId },
      select: 'title location price'
    })
    .populate('user', 'name email phone')
    .sort({ checkInDate: -1 });
};

// Check if PG is available for dates
bookingSchema.statics.checkAvailability = async function(pgId, newCheckInDate, newCheckOutDate) {
  console.log("CHECKING ONLY APPROVED BOOKINGS");
  
  const overlappingBooking = await this.findOne({
    pg: pgId,
    status: "approved",
    checkInDate: { $lte: newCheckOutDate },
    checkOutDate: { $gte: newCheckInDate }
  });

  console.log("OVERLAPPING BOOKING:", overlappingBooking);

  // Return true if NO overlapping approved booking exists (PG IS available)
  return !overlappingBooking;
};

// ============================================
// EXPORT MODEL
// ============================================

module.exports = mongoose.model('Booking', bookingSchema);
