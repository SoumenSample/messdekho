// ============================================
// BOOKING CONTROLLER
// ============================================

const mongoose = require('mongoose');
const { Booking, PG, User } = require('../models');
const { AppError } = require('../middleware/errorHandler');

const safeId = (value) => {
  if (value == null) return '';
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  if (value instanceof mongoose.Types.ObjectId || value?._bsontype === 'ObjectId') {
    return value.toString();
  }

  if (typeof value === 'object') {
    if (value._id != null && value._id !== value) return safeId(value._id);
    if (typeof value.toString === 'function' && value.toString !== Object.prototype.toString) {
      return value.toString();
    }
  }

  return '';
};

const sameId = (left, right) => safeId(left) === safeId(right);

// ============================================
// CREATE BOOKING (User only)
// ============================================

exports.createBooking = async (req, res, next) => {
  try {
    const { pgId, checkInDate, checkOutDate, roomsBooked, guestName, guestEmail, guestPhone, specialRequirements, totalPrice: clientTotalPrice } = req.body;

    console.log('REQ BODY:', req.body);

    // Validate dates
    const checkin = new Date(checkInDate);
    const checkout = checkOutDate ? new Date(checkOutDate) : null;

    if (checkout && checkout <= checkin) {
      return next(new AppError('Check-out date must be after check-in date', 400));
    }

    // Get PG
    const pg = await PG.findById(pgId);
    if (!pg) {
      return next(new AppError('PG not found', 404));
    }

    if (!pg.isApproved) {
      return next(new AppError('This PG is not approved yet', 400));
    }

    console.log('AVAILABILITY CHECK - PG:', { pgId, checkinDate: checkin.toISOString(), checkoutDate: (checkout || new Date(checkin.getTime() + 24 * 60 * 60 * 1000)).toISOString() });

    // Check availability - ONLY approved bookings block dates
    const isAvailable = await Booking.checkAvailability(
      pgId,
      checkin,
      checkout || new Date(checkin.getTime() + 24 * 60 * 60 * 1000)
    );

    console.log('AVAILABILITY RESULT:', isAvailable ? 'AVAILABLE' : 'BLOCKED BY APPROVED BOOKING');

    if (!isAvailable) {
      console.log('BOOKING REJECTED: PG not available (approved booking exists for these dates)');
      return next(new AppError('PG is not available for selected dates', 400));
    }

    // Check rooms availability
    if (roomsBooked > pg.roomsAvailable) {
      return next(new AppError(`Only ${pg.roomsAvailable} rooms available`, 400));
    }

    // Calculate pricing with daily rate logic
    const monthlyRent = pg.price || 0;
    const dailyRent = Math.round(monthlyRent / 30);
    
    // Calculate total days from check-in to today (or to checkout if provided)
    const endDate = checkout || new Date();
    const diffTime = Math.abs(endDate - checkin);
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Calculate stay price and total with fixed deposit
    const stayPrice = dailyRent * totalDays;
    const refundableDeposit = 1000;
    const totalPrice = stayPrice + refundableDeposit;

    // Create booking
    const bookingData = {
      user: req.user._id,
      owner: pg.owner,
      pg: pgId,
      checkInDate: checkin,
      checkOutDate: checkout,
      roomsBooked,
      numberOfDays: totalDays,
      pricePerDay: dailyRent,
      dailyRent,
      totalDays,
      stayPrice,
      refundableDeposit,
      totalPrice,
      guestName,
      guestEmail,
      guestPhone,
      specialRequirements,
      status: 'pending'
    };

    console.log('Creating booking with data:', { owner: bookingData.owner, pgOwner: pg.owner, pgId });

    const booking = await Booking.create(bookingData);

    // Populate details
    await booking.populate('pg', 'title location price');
    await booking.populate('user', 'name email phone');

    res.status(201).json({
      status: 'success',
      message: 'Booking created successfully. Pending owner approval.',
      data: {
        booking
      }
    });

  } catch (error) {
    next(error);
  }
};

// ============================================
// GET USER BOOKINGS
// ============================================

exports.getUserBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({
      user: req.user.id
    })
      .populate('pg')
      .populate('owner', 'name email')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: bookings.length,
      bookings
    });

  } catch (error) {
    next(error);
  }
};

// ============================================
// GET BOOKING DETAILS
// ============================================

exports.getBookingDetails = async (req, res, next) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id)
      .populate('user', 'name email phone')
      .populate('pg', 'title location price facilities');

    if (!booking) {
      return next(new AppError('Booking not found', 404));
    }

    console.log('BOOKING OBJECT:', {
      id: booking?._id,
      status: booking?.status,
      userId: booking?.user?._id || booking?.user,
      pgId: booking?.pg?._id || booking?.pg,
      ownerId: booking?.owner?._id || booking?.owner
    });

    // Check authorization
    if (!sameId(booking?.user?._id, req.user?._id) && req.user?.role !== 'admin') {
      return next(new AppError('Not authorized to view this booking', 403));
    }

    res.status(200).json({
      status: 'success',
      data: { booking }
    });

  } catch (error) {
    next(error);
  }
};

// ============================================
// CANCEL BOOKING (User)
// ============================================

exports.cancelBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const booking = await Booking.findById(id);

    if (!booking) {
      return next(new AppError('Booking not found', 404));
    }

    console.log('BOOKING OBJECT:', {
      id: booking?._id,
      status: booking?.status,
      userId: booking?.user?._id || booking?.user,
      pgId: booking?.pg?._id || booking?.pg,
      ownerId: booking?.owner?._id || booking?.owner
    });

    // Check authorization
    if (!sameId(booking?.user?._id, req.user?._id)) {
      return next(new AppError('Not authorized to cancel this booking', 403));
    }

    if (booking.status === 'completed') {
      return next(new AppError('Cannot cancel a completed booking', 400));
    }

    await booking.cancelBooking(reason, 'user');

    res.status(200).json({
      status: 'success',
      message: 'Booking cancelled successfully',
      data: { booking }
    });

  } catch (error) {
    next(error);
  }
};

// ============================================
// ADD REVIEW (User - after booking completion)
// ============================================

exports.addReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating, review } = req.body;

    const booking = await Booking.findById(id);

    if (!booking) {
      return next(new AppError('Booking not found', 404));
    }

    console.log('BOOKING OBJECT:', {
      id: booking?._id,
      status: booking?.status,
      userId: booking?.user?._id || booking?.user,
      pgId: booking?.pg?._id || booking?.pg,
      ownerId: booking?.owner?._id || booking?.owner
    });

    // Check authorization
    if (!sameId(booking?.user?._id, req.user?._id)) {
      return next(new AppError('Not authorized to review this booking', 403));
    }

    await booking.addReview(rating, review);

    // Update PG average rating
    const pg = await PG.findById(booking.pg);
    if (pg) {
      const avgRating = await Booking.aggregate([
        { $match: { pg: pg._id, rating: { $ne: null } } },
        { $group: { _id: null, avgRating: { $avg: '$rating' } } }
      ]);
      if (avgRating.length > 0) {
        pg.rating = avgRating[0].avgRating;
        await pg.save();
      }
    }

    res.status(200).json({
      status: 'success',
      message: 'Review added successfully',
      data: { booking }
    });

  } catch (error) {
    next(error);
  }
};

// ============================================
// GET OWNER'S BOOKINGS
// ============================================

exports.getOwnerBookings = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    // Get owner's PGs first
    const ownerPGs = await PG.find({ owner: req.user._id }).select('_id');
    const pgIds = ownerPGs.map(pg => pg._id);

    // Build filter
    const filter = { pg: { $in: pgIds } };
    if (status) {
      filter.status = status;
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Booking.countDocuments(filter);

    // Get bookings
    const bookings = await Booking.find(filter)
      .populate('pg', 'title location price')
      .populate('user', 'name email phone')
      .sort('-checkInDate')
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      status: 'success',
      data: {
        bookings,
        pagination: {
          total,
          pages: Math.ceil(total / parseInt(limit)),
          currentPage: parseInt(page)
        }
      }
    });

  } catch (error) {
    next(error);
  }
};

// ============================================
// CONFIRM BOOKING (Owner)
// ============================================

exports.confirmBooking = async (req, res, next) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id).populate('pg', 'title owner');

    if (!booking) {
      return next(new AppError('Booking not found', 404));
    }

    console.log('BOOKING OBJECT:', {
      id: booking?._id,
      status: booking?.status,
      userId: booking?.user?._id || booking?.user,
      pgId: booking?.pg?._id || booking?.pg,
      ownerId: booking?.owner?._id || booking?.owner
    });

    // Check if user is the owner of the PG
    if (!sameId(booking?.pg?.owner, req.user?._id) && req.user?.role !== 'admin') {
      return next(new AppError('Not authorized to confirm this booking', 403));
    }

    await booking.confirmBooking();

    res.status(200).json({
      success: true,
      message: 'Booking confirmed'
    });

  } catch (error) {
    next(error);
  }
};

// ============================================
// APPROVE BOOKING (Owner)
// ============================================

exports.approveBooking = async (req, res) => {
  try {

    const bookingId = req.params.id;

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    const pg = await PG.findById(booking.pg);

    if (!pg) {
      return res.status(404).json({
        success: false,
        message: "PG not found"
      });
    }

    // REQUIRED FIELD
    const monthlyRent = pg.price || 0;

    if (!booking.totalDays) {
      const moveIn = new Date(booking.checkInDate);
      const checkOut = new Date(booking.checkOutDate);
      const diffTime = Math.abs(checkOut - moveIn);
      booking.totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    if (!booking.dailyRent) {
      booking.dailyRent = Math.round(monthlyRent / 30);
    }

    if (!booking.stayPrice) {
      booking.stayPrice = booking.dailyRent * booking.totalDays;
    }

    if (!booking.refundableDeposit) {
      booking.refundableDeposit = 1000;
    }

    if (!booking.totalPrice) {
      booking.totalPrice = booking.stayPrice + booking.refundableDeposit;
    }

    booking.owner = pg.owner;

    if (!sameId(booking.owner, req.user?._id) && req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to approve this booking'
      });
    }

    booking.status = "approved";

    console.log("BOOKING BEFORE SAVE:", booking);

    await booking.save();

    return res.status(200).json({
      success: true,
      message: "Booking approved successfully",
      booking
    });

  } catch (error) {

    console.error("APPROVE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ============================================
// REJECT BOOKING (Owner)
// ============================================

exports.rejectBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    console.log('Reject booking - Owner ID:', req.user._id, 'Booking ID:', id);

    const booking = await Booking.findById(id).populate('pg', 'title owner');

    if (!booking) {
      return next(new AppError('Booking not found', 404));
    }

    console.log('BOOKING OBJECT:', {
      id: booking?._id,
      status: booking?.status,
      userId: booking?.user?._id || booking?.user,
      pgId: booking?.pg?._id || booking?.pg,
      ownerId: booking?.owner?._id || booking?.owner
    });

    // Check if user is the owner
    if (!sameId(booking?.owner, req.user?._id) && req.user?.role !== 'admin') {
      return next(new AppError('Not authorized to reject this booking', 403));
    }

    // Update status to cancelled (rejected)
    booking.status = 'cancelled';
    booking.cancellationReason = reason || 'Rejected by owner';
    booking.cancelledAt = new Date();
    booking.cancelledBy = 'owner';
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Booking rejected'
    });

  } catch (error) {
    next(error);
  }
};
