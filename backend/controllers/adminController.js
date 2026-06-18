// ============================================
// ADMIN CONTROLLER
// ============================================

const { PG, User, Booking } = require('../models');
const { AppError } = require('../middleware/errorHandler');

// ============================================
// GET ALL PGs (Admin - including unapproved)
// ============================================

exports.getAllPGs = async (req, res, next) => {
  try {
    const { city } = req.query;

    // Check admin authorization
    if (req.user.role !== 'admin') {
      return next(new AppError('Only admins can access this route', 403));
    }

    const pendingPGs = await PG.find({
      $or: [
        { status: 'pending' },
        {
          status: { $exists: false },
          isApproved: false
        }
      ]
    })
      .populate('owner', 'name email')
      .sort({ createdAt: -1 });

    console.log('PENDING PG COUNT:', pendingPGs.length);
    console.log('PENDING PGS:', pendingPGs);

    let filteredPendingPGs = pendingPGs;

    if (city) {
      filteredPendingPGs = pendingPGs.filter((pg) =>
        (pg.city || '').toLowerCase().includes(String(city).toLowerCase())
      );
    }

    res.status(200).json({
      success: true,
      pgs: filteredPendingPGs
    });

  } catch (error) {
    next(error);
  }
};

// ============================================
// APPROVE PG (Admin only)
// ============================================

exports.approvePG = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check admin authorization
    if (req.user.role !== 'admin') {
      return next(new AppError('Only admins can approve PGs', 403));
    }

    const pg = await PG.findById(id);

    if (!pg) {
      return next(new AppError('PG not found', 404));
    }

    if (pg.isApproved) {
      return next(new AppError('PG is already approved', 400));
    }

    // Approve PG
    await pg.approve(req.user._id);
    await pg.populate('owner', 'name email phone');
    await pg.populate('approvedBy', 'name email');

    res.status(200).json({
      status: 'success',
      message: 'PG approved successfully',
      data: { pg }
    });

  } catch (error) {
    next(error);
  }
};

// ============================================
// REJECT PG (Admin only)
// ============================================

exports.rejectPG = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    // Check admin authorization
    if (req.user.role !== 'admin') {
      return next(new AppError('Only admins can reject PGs', 403));
    }

    const pg = await PG.findById(id);

    if (!pg) {
      return next(new AppError('PG not found', 404));
    }

    // Delete PG
    await PG.findByIdAndDelete(id);

    res.status(200).json({
      status: 'success',
      message: 'PG rejected and deleted',
      data: {
        message: `PG "${pg.title}" has been rejected.`
      }
    });

  } catch (error) {
    next(error);
  }
};

// ============================================
// GET ALL USERS (Admin)
// ============================================

exports.getAllUsers = async (req, res, next) => {
  try {
    const { role, status = 'active', page = 1, limit = 10 } = req.query;

    // Check admin authorization
    if (req.user.role !== 'admin') {
      return next(new AppError('Only admins can access this route', 403));
    }

    // Build filter
    const filter = {};

    if (role) {
      filter.role = role;
    }

    if (status === 'active') {
      filter.isActive = true;
    } else if (status === 'inactive') {
      filter.isActive = false;
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await User.countDocuments(filter);

    // Get users
    const users = await User.find(filter)
      .select('-password')
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      status: 'success',
      data: {
        users,
        pagination: {
          total,
          pages: Math.ceil(total / parseInt(limit)),
          currentPage: parseInt(page),
          stats: {
            totalUsers: await User.countDocuments(),
            owners: await User.countDocuments({ role: 'owner' }),
            regularUsers: await User.countDocuments({ role: 'user' })
          }
        }
      }
    });

  } catch (error) {
    next(error);
  }
};

// ============================================
// DELETE USER (Admin)
// ============================================

exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check admin authorization
    if (req.user.role !== 'admin') {
      return next(new AppError('Only admins can delete users', 403));
    }

    const user = await User.findById(id);

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    if (user.role === 'admin') {
      return next(new AppError('Cannot delete admin users', 400));
    }

    // Delete user
    await User.findByIdAndDelete(id);

    res.status(200).json({
      status: 'success',
      message: 'User deleted successfully'
    });

  } catch (error) {
    next(error);
  }
};

// ============================================
// DEACTIVATE USER (Admin)
// ============================================

exports.deactivateUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check admin authorization
    if (req.user.role !== 'admin') {
      return next(new AppError('Only admins can deactivate users', 403));
    }

    const user = await User.findById(id);

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    user.isActive = false;
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'User deactivated successfully',
      data: { user: { id: user._id, email: user.email, isActive: user.isActive } }
    });

  } catch (error) {
    next(error);
  }
};

// ============================================
// GET DASHBOARD STATS (Admin)
// ============================================

exports.getDashboardStats = async (req, res, next) => {
  try {
    // Check admin authorization
    if (req.user.role !== 'admin') {
      return next(new AppError('Only admins can access this route', 403));
    }

    // Get stats
    const totalUsers = await User.countDocuments();
    const totalOwners = await User.countDocuments({ role: 'owner' });
    const totalPGs = await PG.countDocuments();
    const approvedPGs = await PG.countDocuments({ isApproved: true });
    const pendingPGs = await PG.countDocuments({ isApproved: false });
    const totalBookings = await Booking.countDocuments();
    const activeBookings = await Booking.countDocuments({ status: { $in: ['pending', 'confirmed', 'active'] } });
    const completedBookings = await Booking.countDocuments({ status: 'completed' });

    // Revenue calculation (from completed bookings payments)
    const revenue = await Booking.aggregate([
      { $match: { paymentStatus: 'completed', status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        stats: {
          users: {
            total: totalUsers,
            owners: totalOwners,
            regularUsers: totalUsers - totalOwners
          },
          pgs: {
            total: totalPGs,
            approved: approvedPGs,
            pending: pendingPGs
          },
          bookings: {
            total: totalBookings,
            active: activeBookings,
            completed: completedBookings
          },
          revenue: revenue.length > 0 ? revenue[0].total : 0
        }
      }
    });

  } catch (error) {
    next(error);
  }
};

// ============================================
// GET ALL BOOKINGS (Admin)
// ============================================

exports.getAllBookings = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    // Check admin authorization
    if (req.user.role !== 'admin') {
      return next(new AppError('Only admins can access this route', 403));
    }

    // Build filter
    const filter = {};
    if (status) {
      filter.status = status;
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Booking.countDocuments(filter);

    // Get bookings
    const bookings = await Booking.find(filter)
      .populate('user', 'name email phone')
      .populate('pg', 'title location price')
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
