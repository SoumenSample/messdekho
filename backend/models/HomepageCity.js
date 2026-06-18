// ============================================
// HOMEPAGE CITY MODEL
// ============================================

const mongoose = require('mongoose');

const homepageCitySchema = new mongoose.Schema(
  {
    cityName: {
      type: String,
      required: true,
      trim: true
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true
    },
    image: {
      type: String,
      required: true,
      trim: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    order: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

homepageCitySchema.index({ order: 1, createdAt: 1 });
homepageCitySchema.index({ slug: 1 }, { unique: true });

module.exports = mongoose.model('HomepageCity', homepageCitySchema);
