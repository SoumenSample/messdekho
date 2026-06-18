// ============================================
// PG CONTROLLER
// ============================================

const { PG, User, Booking } = require('../models');
const { AppError } = require('../middleware/errorHandler');

const safeId = (value) => {
  if (value == null) return '';
  if (typeof value === 'object') {
    if (value._id != null) return safeId(value._id);
    return String(value);
  }
  return String(value);
};

const sameId = (left, right) => safeId(left) === safeId(right);

// ============================================
// CREATE PG (Owner only)
// ============================================

exports.createPG = async (req, res, next) => {
  try {
    const { title, description, price, location, city, address, roomsAvailable, type, occupancy, facilities, latitude, longitude } = req.body;

    console.log('Create PG req.body:', req.body);
    console.log('Create PG req.user:', req.user);

    // Check if owner has permission
    if (req.user.role !== 'owner' && req.user.role !== 'admin') {
      return next(new AppError('Only owners can create PGs', 403));
    }

    // Get images from upload middleware
    const images = req.uploadedImageUrls || req.body.images || (req.body.image ? [req.body.image] : []);

    // Create PG
    const pg = await PG.create({
      title,
      description,
      price,
      location,
      city,
      address,
      roomsAvailable,
      type,
      occupancy,
      facilities,
      latitude,
      longitude,
      images,
      owner: req.user._id
    });

    // Populate owner details
    await pg.populate('owner', 'name email phone');

    console.log('Saved PG:', pg);

    res.status(201).json({
      status: 'success',
      message: 'PG created successfully. Pending admin approval.',
      data: {
        pg
      }
    });

  } catch (error) {
    next(error);
  }
};

// ============================================
// GET ALL APPROVED PGs
// ============================================

exports.getAllPGs = async (req, res, next) => {
  try {
    const { city, search, page = 1, limit = 10, sort = '-createdAt' } = req.query;

    // Build filter
    const filter = { isApproved: true, isActive: true };

    if (city) {
      filter.city = { $regex: city, $options: 'i' };
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get total count
    const total = await PG.countDocuments(filter);

    // Get PGs
    const pgs = await PG.find(filter)
      .populate('owner', 'name email phone profilePhoto')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      status: 'success',
      data: {
        pgs,
        pagination: {
          total,
          pages: Math.ceil(total / parseInt(limit)),
          currentPage: parseInt(page),
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    next(error);
  }
};

// ============================================
// GET SINGLE PG
// ============================================

exports.getPG = async (req, res, next) => {
  try {
    const { id } = req.params;

    const pg = await PG.findById(id)
      .populate('owner', 'name email phone profilePhoto address city')
      .populate('approvedBy', 'name email');

    if (!pg) {
      return next(new AppError('PG not found', 404));
    }

    // Get average rating from bookings
    const avgRating = await Booking.aggregate([
      { $match: { pg: pg._id, rating: { $ne: null } } },
      { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);

    const ratingData = avgRating.length > 0 ? avgRating[0] : { avgRating: null, count: 0 };

    res.status(200).json({
      status: 'success',
      data: {
        pg: {
          ...pg.toObject(),
          averageRating: ratingData.avgRating,
          reviewsCount: ratingData.count
        }
      }
    });

  } catch (error) {
    next(error);
  }
};

// ============================================
// UPDATE PG (Owner only)
// ============================================

exports.updatePG = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, price, roomsAvailable, type, occupancy, facilities, isActive } = req.body;

    const pg = await PG.findById(id);

    if (!pg) {
      return next(new AppError('PG not found', 404));
    }

    // Check authorization
    if (!sameId(pg?.owner, req.user?._id) && req.user?.role !== 'admin') {
      return next(new AppError('Not authorized to update this PG', 403));
    }

    // Update fields
    if (title) pg.title = title;
    if (description) pg.description = description;
    if (price) pg.price = price;
    if (roomsAvailable) pg.roomsAvailable = roomsAvailable;
    if (type) pg.type = type;
    if (occupancy) pg.occupancy = occupancy;
    if (facilities) pg.facilities = facilities;
    if (isActive !== undefined) pg.isActive = isActive;

    // Add new images if uploaded
    if (req.uploadedImageUrls) {
      pg.images = [...pg.images, ...req.uploadedImageUrls];
    }

    if (Array.isArray(req.body.images) && req.body.images.length > 0) {
      pg.images = [...pg.images, ...req.body.images.filter(Boolean)];
    }

    if (req.body.image) {
      pg.images = [...pg.images, req.body.image].filter(Boolean);
    }

    await pg.save();
    await pg.populate('owner', 'name email phone');

    res.status(200).json({
      status: 'success',
      message: 'PG updated successfully',
      data: { pg }
    });

  } catch (error) {
    next(error);
  }
};

// ============================================
// DELETE PG (Owner only)
// ============================================

exports.deletePG = async (req, res, next) => {
  try {
    const { id } = req.params;

    const pg = await PG.findById(id);

    if (!pg) {
      return next(new AppError('PG not found', 404));
    }

    // Check authorization
    if (!sameId(pg?.owner, req.user?._id) && req.user?.role !== 'admin') {
      return next(new AppError('Not authorized to delete this PG', 403));
    }

    await PG.findByIdAndDelete(id);

    res.status(200).json({
      status: 'success',
      message: 'PG deleted successfully'
    });

  } catch (error) {
    next(error);
  }
};

// ============================================
// GET OWNER'S PGs
// ============================================

exports.getOwnerPGs = async (req, res, next) => {
  try {
    const pgs = await PG.find({ owner: req.user._id })
      .populate('owner', 'name email phone')
      .sort('-createdAt');

    res.status(200).json({
      status: 'success',
      data: { pgs }
    });

  } catch (error) {
    next(error);
  }
};
