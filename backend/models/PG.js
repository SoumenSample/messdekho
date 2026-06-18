// ============================================
// PG/MESS MODEL SCHEMA
// ============================================

const mongoose = require('mongoose');

const pgSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a title'],
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters']
    },

    description: {
      type: String,
      required: [true, 'Please provide a description'],
      maxlength: [1000, 'Description cannot be more than 1000 characters']
    },

    price: {
      type: Number,
      required: [true, 'Please provide a price'],
      min: [0, 'Price cannot be negative']
    },

    location: {
      type: String,
      required: [true, 'Please provide a location'],
      trim: true
    },

    city: {
      type: String,
      required: [true, 'Please provide a city'],
      trim: true
    },

    address: {
      type: String,
      required: [true, 'Please provide an address'],
      trim: true
    },

    // GPS Coordinates for map integration
    latitude: {
      type: Number,
      default: null
    },

    longitude: {
      type: Number,
      default: null
    },

    // Images stored as Cloudinary URLs
    images: {
      type: [String],
      default: []
    },

    // Facilities/Amenities
    facilities: {
      type: [String],
      enum: [
        'Wifi',
        'AC',
        'Bed',
        'Cupboard',
        'Desk',
        'Attached Bathroom',
        'Common Kitchen',
        'Laundry',
        'Parking',
        'Security',
        'Food',
        'Housekeeping'
      ],
      default: []
    },

    // Owner reference
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    // Number of rooms/spaces available
    roomsAvailable: {
      type: Number,
      required: [true, 'Please provide number of rooms available'],
      min: [1, 'At least 1 room must be available']
    },

    // Type of accommodation
    type: {
      type: String,
      enum: ['PG', 'Mess', 'Hostel', 'Shared'],
      default: 'PG'
    },

    // Occupancy
    occupancy: {
      type: String,
      enum: ['Single', 'Double', 'Triple', 'Multiple'],
      default: 'Single'
    },

    // Approval status
    isApproved: {
      type: Boolean,
      default: false
    },

    // Approval timestamps
    approvedAt: {
      type: Date,
      default: null
    },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },

    // Rating
    rating: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
      default: null
    },

    // Number of bookings
    bookingsCount: {
      type: Number,
      default: 0
    },

    // Is active
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// ============================================
// INDEXES
// ============================================

pgSchema.index({ city: 1, isApproved: 1 });
pgSchema.index({ owner: 1 });
pgSchema.index({ location: 'text', title: 'text' });
pgSchema.index({ createdAt: -1 });

// ============================================
// VIRTUAL - Total images
// ============================================

pgSchema.virtual('totalImages').get(function() {
  console.log('PG VIRTUAL DEBUG - totalImages:', {
    images: this.images,
    type: typeof this.images,
    isArray: Array.isArray(this.images)
  });
  return Array.isArray(this.images) ? this.images.length : 0;
});

pgSchema.virtual('image').get(function() {
  const images = Array.isArray(this.images) ? this.images : [];
  return images?.[0] || null;
});

pgSchema.set('toJSON', { virtuals: true });
pgSchema.set('toObject', { virtuals: true });

// ============================================
// METHODS
// ============================================

// Get available rooms count
pgSchema.methods.getAvailableRooms = function() {
  console.log('PG METHOD DEBUG - getAvailableRooms:', {
    roomsAvailable: this.roomsAvailable,
    type: typeof this.roomsAvailable
  });
  return this.roomsAvailable || 0;
};

// Mark as approved
pgSchema.methods.approve = async function(adminId) {
  this.isApproved = true;
  this.approvedAt = new Date();
  this.approvedBy = adminId;
  return this.save();
};

// ============================================
// STATICS
// ============================================

// Get approved PGs by city
pgSchema.statics.getByCity = function(city) {
  return this.find({
    city,
    isApproved: true,
    isActive: true
  }).populate('owner', 'name email phone profilePhoto');
};

// ============================================
// EXPORT MODEL
// ============================================

module.exports = mongoose.model('PG', pgSchema);
