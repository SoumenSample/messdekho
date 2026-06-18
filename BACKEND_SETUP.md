# Mess Dekho Backend - Setup Guide

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Installation

1. **Navigate to backend directory:**
```bash
cd backend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Configure environment variables:**
```bash
# Copy the example file
cp .env.example .env

# Edit .env with your actual values
```

Required environment variables:
- `MONGO_URI`: MongoDB connection string
- `JWT_SECRET`: Your secret key for JWT (use something strong in production)
- `CLOUDINARY_CLOUD_NAME`: Your Cloudinary cloud name
- `CLOUDINARY_API_KEY`: Your Cloudinary API key
- `CLOUDINARY_API_SECRET`: Your Cloudinary API secret

### Running the Application

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

Server will start on `http://localhost:9000` (or the PORT specified in .env)

---

## 🧪 Testing

### Run all tests:
```bash
npm test
```

### Run tests in watch mode (for development):
```bash
npm run test:watch
```

### Test Coverage:
The test suite includes:
- ✅ Authentication (signup, login, validation)
- ✅ PG Listings (CRUD operations, filtering)
- ✅ Bookings (create, cancel, availability)
- ✅ Admin Operations (approve PGs, manage users)
- ✅ Authorization & Role-based access
- ✅ Error handling & validation

### Running Specific Tests:
```bash
# Auth tests only
npm test -- auth.test.js

# Booking tests only
npm test -- booking.test.js

# Admin tests only
npm test -- admin.test.js
```

---

## 📁 Project Structure

```
backend/
├── config/              # Configuration files
│   ├── db.js           # MongoDB connection
│   └── cloudinary.js   # Cloudinary setup
├── middleware/          # Express middleware
│   ├── auth.js         # Authentication & authorization
│   ├── errorHandler.js # Centralized error handling
│   └── upload.js       # File upload configuration
├── models/             # Database models
│   ├── User.js         # User schema
│   ├── PG.js           # PG listing schema
│   └── Booking.js      # Booking schema
├── controllers/        # Business logic
│   ├── authController.js
│   ├── pgController.js
│   ├── bookingController.js
│   └── adminController.js
├── routes/             # API routes
│   ├── auth.js
│   ├── pg.js
│   ├── booking.js
│   ├── admin.js
│   └── test.js
├── tests/              # Test files
│   ├── setup.js        # Test configuration
│   ├── utils.js        # Test utilities
│   ├── auth.test.js
│   ├── pg.test.js
│   ├── booking.test.js
│   └── admin.test.js
├── utils/              # Utility functions
│   └── validation.js   # Input validation rules
├── server.js           # Express app setup
├── package.json        # Dependencies
├── .env.example        # Environment template
└── .env               # Environment variables (create from .env.example)
```

---

## 📚 API Documentation

See [API_DOCUMENTATION.md](../API_DOCUMENTATION.md) for complete API reference.

### Quick API Overview:

**Authentication:**
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login and get JWT token

**PG Listings:**
- `GET /api/pg` - List all approved PGs
- `GET /api/pg/:id` - Get single PG
- `POST /api/pg` - Create PG (owner only)
- `PUT /api/pg/:id` - Update PG (owner/admin)
- `DELETE /api/pg/:id` - Delete PG (owner/admin)

**Bookings:**
- `POST /api/bookings` - Create booking
- `GET /api/bookings/user` - Get user bookings
- `GET /api/bookings/owner` - Get owner's bookings
- `PUT /api/bookings/:id/cancel` - Cancel booking

**Admin:**
- `GET /api/admin/pg` - List all PGs (including pending)
- `PUT /api/admin/pg/:id/approve` - Approve PG
- `PUT /api/admin/pg/:id/reject` - Reject PG
- `GET /api/admin/users` - List all users
- `DELETE /api/admin/user/:id` - Delete user

---

## 🔐 User Roles

The system supports three roles:

1. **User** - Can search PGs and make bookings
2. **Owner** - Can create and manage PG listings
3. **Admin** - Can approve/reject PGs and manage users

---

## ✨ Features Implemented

### Authentication
- ✅ User registration with email validation
- ✅ Secure password hashing (bcrypt)
- ✅ JWT-based authentication
- ✅ 7-day token expiration
- ✅ Role-based access control

### PG Management
- ✅ Create/Read/Update/Delete PG listings
- ✅ Image upload to Cloudinary
- ✅ Search and filter by location and price
- ✅ Pagination support
- ✅ PG status management (pending/approved/rejected)

### Bookings
- ✅ Create bookings with date validation
- ✅ Automatic availability checking
- ✅ Overlap detection for date conflicts
- ✅ User can cancel bookings
- ✅ Owner can view all bookings for their PGs

### Admin Features
- ✅ Approve/reject PG listings
- ✅ View all users and PGs
- ✅ Delete user accounts
- ✅ Full audit trail via timestamps

### Error Handling
- ✅ Comprehensive validation errors
- ✅ Duplicate entry prevention
- ✅ Date conflict detection
- ✅ Authorization checks
- ✅ Graceful error messages

---

## 🐛 Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running
- Check MONGO_URI is correct
- For MongoDB Atlas, whitelist your IP

### Tests Failing
- Ensure MongoDB is accessible
- Run `npm install` to install all dependencies
- Clear test cache: `npm test -- --clearCache`

### Environment Variables Not Loaded
- Verify .env file exists in backend directory
- Restart the server after changing .env
- Check for typos in variable names

### Port Already in Use
- Change PORT in .env file
- Or kill process using port 9000: `lsof -ti:9000 | xargs kill`

---

## 📝 Development Tips

### Adding New Features
1. Create models in `/models`
2. Add controllers in `/controllers`
3. Create routes in `/routes`
4. Add test file in `/tests`
5. Update API_DOCUMENTATION.md

### Debugging
- Enable detailed logging: Set `NODE_ENV=development`
- Check server logs for detailed error messages
- Use MongoDB Compass to inspect database

### Code Quality
- All code follows consistent error handling patterns
- Validation middleware validates all inputs
- Role-based middleware protects sensitive routes

---

## 🚢 Deployment Considerations

### Before Deploying:
1. Set `NODE_ENV=production` in production
2. Use strong JWT_SECRET
3. Enable MongoDB authentication
4. Use HTTPS in production
5. Set up environment variables on hosting platform
6. Run tests before deployment: `npm test`
7. Set up CI/CD pipeline for automated testing

### Performance:
- Pagination is implemented for list endpoints
- Database indexes on frequently queried fields
- Lean queries where only data is needed
- Async operations for long-running tasks

---

## 📞 Support

For issues or questions:
1. Check API_DOCUMENTATION.md for endpoint details
2. Review test files for usage examples
3. Check error messages for specific validation issues
4. Review server logs for detailed error traces

---

**Happy Coding! 🎉**
