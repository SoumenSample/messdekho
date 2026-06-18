// ============================================
// INPUT VALIDATION SCHEMAS
// ============================================

const Joi = require('joi');

// ============================================
// USER VALIDATION SCHEMAS
// ============================================

const registerSchema = Joi.object({
  name: Joi.string().required().trim().max(100),
  email: Joi.string().email().required().lowercase(),
  password: Joi.string().required().min(6),
  role: Joi.string().valid('user', 'owner', 'admin').required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required().lowercase(),
  password: Joi.string().required()
});

const updateProfileSchema = Joi.object({
  name: Joi.string().trim().max(100),
  phone: Joi.string().regex(/^[0-9]{10}$/),
  address: Joi.string().max(200),
  city: Joi.string().max(100)
});

// ============================================
// PG VALIDATION SCHEMAS
// ============================================

const createPGSchema = Joi.object({
  title: Joi.string().required().trim().max(100),
  description: Joi.string().required().max(1000),
  price: Joi.number().required().min(0),
  location: Joi.string().trim(),
  city: Joi.string().required().trim(),
  address: Joi.string().required().trim(),
  latitude: Joi.number(),
  longitude: Joi.number(),
  roomsAvailable: Joi.number().required().min(1),
  type: Joi.string().valid('PG', 'Mess', 'Hostel', 'Shared').default('PG'),
  occupancy: Joi.string().valid('Single', 'Double', 'Triple', 'Multiple').default('Single'),
  image: Joi.string().uri().allow(''),
  images: Joi.array().items(Joi.string()).default([]),
  facilities: Joi.array().items(
    Joi.string().valid(
      'Wifi', 'AC', 'Bed', 'Cupboard', 'Desk', 'Attached Bathroom',
      'Common Kitchen', 'Laundry', 'Parking', 'Security', 'Food', 'Housekeeping'
    )
  ).default([])
});

const updatePGSchema = Joi.object({
  title: Joi.string().trim().max(100),
  description: Joi.string().max(1000),
  price: Joi.number().min(0),
  location: Joi.string().trim(),
  city: Joi.string().trim(),
  address: Joi.string().trim(),
  roomsAvailable: Joi.number().min(1),
  type: Joi.string().valid('PG', 'Mess', 'Hostel', 'Shared'),
  occupancy: Joi.string().valid('Single', 'Double', 'Triple', 'Multiple'),
  image: Joi.string().uri().allow(''),
  facilities: Joi.array().items(
    Joi.string().valid(
      'Wifi', 'AC', 'Bed', 'Cupboard', 'Desk', 'Attached Bathroom',
      'Common Kitchen', 'Laundry', 'Parking', 'Security', 'Food', 'Housekeeping'
    )
  ),
  isActive: Joi.boolean()
});

// ============================================
// BOOKING VALIDATION SCHEMAS
// ============================================

const createBookingSchema = Joi.object({
  pgId: Joi.string().required(),
  checkInDate: Joi.date().required().min('now'),
  checkOutDate: Joi.date().min(Joi.ref('checkInDate')),
  roomsBooked: Joi.number().required().min(1),
  guestName: Joi.string().required().trim(),
  guestEmail: Joi.string().email().required(),
  guestPhone: Joi.string().required().regex(/^[0-9]{10}$/),
  specialRequirements: Joi.string().max(500)
});

const updateBookingStatusSchema = Joi.object({
  status: Joi.string().valid('pending', 'confirmed', 'active', 'completed', 'cancelled').required()
});

const addReviewSchema = Joi.object({
  rating: Joi.number().required().min(1).max(5),
  review: Joi.string().required().max(1000)
});

const cancelBookingSchema = Joi.object({
  reason: Joi.string().required().max(500)
});

// ============================================
// VALIDATION MIDDLEWARE
// ============================================

const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const messages = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        status: 'error',
        message: 'Validation error',
        errors: messages
      });
    }

    // Replace request body with validated data
    req[property] = value;           
    next();
  };
};

module.exports = {
  // Schemas
  registerSchema,
  loginSchema,
  updateProfileSchema,
  createPGSchema,
  updatePGSchema,
  createBookingSchema,
  updateBookingStatusSchema,
  addReviewSchema,
  cancelBookingSchema,

  // Middleware
  validate
};
