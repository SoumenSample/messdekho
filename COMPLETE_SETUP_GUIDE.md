# 🚀 Mess Dekho - Complete Backend Setup Guide

## 📋 Quick Start

```bash
# 1. Navigate to backend
cd backend

# 2. Install dependencies
npm install

# 3. Setup environment
# Create .env file (copy from .env template)
# Update MongoDB connection and other variables

# 4. Start MongoDB (if local)
mongod

# 5. Test database connection
npm run test-db

# 6. Start backend server
npm run dev
# Server will run on http://localhost:9000
```

---

## ✅ COMPLETE PROJECT STRUCTURE

```
MERN Stack Project: Mess Dekho
│
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection config
│   │
│   ├── models/
│   │   ├── User.js               # User schema with password hashing
│   │   ├── PG.js                 # PG/Mess schema with relationships
│   │   ├── Booking.js            # Booking schema with status tracking
│   │   └── index.js              # Models export
│   │
│   ├── controllers/
│   │   ├── authController.js     # Auth logic (register, login, profile)
│   │   ├── pgController.js       # PG CRUD operations
│   │   ├── bookingController.js # Booking logic
│   │   └── adminController.js    # Admin functions
│   │
│   ├── routes/
│   │   ├── auth.js               # Auth endpoints
│   │   ├── pg.js                 # PG endpoints
│   │   ├── booking.js            # Booking endpoints
│   │   └── admin.js              # Admin endpoints
│   │
│   ├── middleware/
│   │   ├── auth.js               # JWT verification
│   │   ├── roleAuth.js           # Role-based access control
│   │   ├── upload.js             # File upload (Multer + Cloudinary)
│   │   ├── errorHandler.js       # Error handling
│   │   └── requestLogger.js      # Request logging
│   │
│   ├── utils/
│   │   ├── validation.js         # Joi schemas + validate middleware
│   │   └── testDB.js             # Database test utility
│   │
│   ├── server.js                 # Main server file
│   ├── package.json              # Dependencies & scripts
│   ├── .env                       # Environment variables (not in git)
│   ├── .env.example              # Example env template
│   ├── .gitignore                # Git ignore rules
│   └── README.md                 # Backend documentation
│
├── frontend/
│   ├── src/
│   │   ├── services/
│   │   │   ├── api.js            # Axios configuration
│   │   │   ├── authService.js    # Auth API calls
│   │   │   ├── pgService.js      # PG API calls
│   │   │   ├── bookingService.js # Booking API calls
│   │   │   └── adminService.js   # Admin API calls
│   │   └── ... (existing components)
│   │
│   ├── .env.example              # Frontend env template
│   └── ... (existing files)
│
├── POSTMAN_TESTING_GUIDE.md     # Complete API testing guide
└── FRONTEND_INTEGRATION.md      # Frontend integration guide

```

---

## 🔧 FEATURES IMPLEMENTED

### ✨ Authentication System
- User Registration with validation
- Secure Login with JWT tokens
- Password hashing with bcryptjs
- Role-based access (user, owner, admin)
- Token refresh & expiration
- Auto logout on 401

### 🏢 PG Management
- Create/Read/Update/Delete PGs
- Image upload to Cloudinary
- Approval system (pending → approved)
- Search & filter by city/location
- Ratings from bookings
- Owner dashboard

### 📅 Booking System
- Create bookings with date validation
- Availability checking
- Booking status tracking (pending → confirmed → active → completed)
- Guest information management
- Cancellation with refunds
- Review & rating system

### 👨‍💼 Admin Dashboard
- Approve/Reject PGs
- Manage users (view, deactivate, delete)
- View all bookings & bookings
- Dashboard statistics (users, PGs, bookings, revenue)
- Full audit trail

### 📁 File Uploads
- Multer integration for file handling
- Cloudinary integration for image storage
- Image validation & compression
- Multiple file upload support

### 🔒 Security Features
- Password hashing with bcryptjs
- JWT token authentication
- Role-based middlewares
- Input validation with Joi
- CORS configuration
- Error handling with custom AppError class

---

## 📊 DATABASE SCHEMAS

### User Schema
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  phone: String (unique),
  role: 'user' | 'owner' | 'admin',
  profilePhoto: String,
  address: String,
  city: String,
  isActive: Boolean,
  timestamps
}
```

### PG Schema
```javascript
{
  title: String,
  description: String,
  price: Number,
  location: String,
  city: String,
  address: String,
  images: [String] (Cloudinary URLs),
  facilities: [String],
  owner: User Reference,
  roomsAvailable: Number,
  type: 'PG' | 'Mess' | 'Hostel',
  occupancy: 'Single' | 'Double' | 'Triple',
  isApproved: Boolean,
  approvedAt: Date,
  approvedBy: Admin Reference,
  rating: Number (1-5),
  bookingsCount: Number,
  isActive: Boolean,
  timestamps
}
```

### Booking Schema
```javascript
{
  user: User Reference,
  pg: PG Reference,
  checkInDate: Date,
  checkOutDate: Date,
  roomsBooked: Number,
  numberOfDays: Number,
  pricePerDay: Number,
  totalPrice: Number,
  status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled',
  guestName: String,
  guestEmail: String,
  guestPhone: String,
  specialRequirements: String,
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded',
  rating: Number (1-5),
  review: String,
  ownerApproved: Boolean,
  cancellationReason: String,
  cancelledAt: Date,
  timestamps
}
```

---

## 🔗 API ENDPOINTS SUMMARY

| Method | Endpoint | Auth | Role | Purpose |
|--------|----------|------|------|---------|
| POST | /api/auth/register | ✗ | - | Register user |
| POST | /api/auth/login | ✗ | - | Login user |
| GET | /api/auth/me | ✓ | - | Get current user |
| PUT | /api/auth/profile | ✓ | - | Update profile |
| POST | /api/auth/logout | ✓ | - | Logout |
| GET | /api/pg | ✗ | - | Get all PGs |
| POST | /api/pg | ✓ | owner | Create PG |
| GET | /api/pg/:id | ✗ | - | Get PG details |
| PUT | /api/pg/:id | ✓ | owner | Update PG |
| DELETE | /api/pg/:id | ✓ | owner | Delete PG |
| POST | /api/bookings | ✓ | user | Create booking |
| GET | /api/bookings | ✓ | user | Get my bookings |
| PUT | /api/bookings/:id/cancel | ✓ | user | Cancel booking |
| POST | /api/bookings/:id/review | ✓ | user | Add review |
| GET | /api/admin/pgs | ✓ | admin | Get all PGs |
| PUT | /api/admin/pg/:id/approve | ✓ | admin | Approve PG |
| GET | /api/admin/stats | ✓ | admin | Dashboard stats |

---

## 🧪 TESTING

### Using Postman
1. Import POSTMAN_TESTING_GUIDE.md
2. Setup environment variables (base_url, token)
3. Test each endpoint systematically
4. Save responses for documentation

### Using cURL
```bash
# Register
curl -X POST http://localhost:9000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com","password":"pass123","confirmPassword":"pass123","phone":"9876543210"}'

# Login
curl -X POST http://localhost:9000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"pass123"}'
```

---

## 🚨 TROUBLESHOOTING

### MongoDB Connection Failed
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:**
- Start MongoDB: `mongod`
- Or use MongoDB Atlas and update MONGO_URI in .env

### Port Already in Use
```
Error: listen EADDRINUSE :::9000
```
**Solution:**
- Change PORT in .env
- Or: `kill -9 $(lsof -t -i:9000)` (Linux/Mac)

### CORS Error
```
Access to XMLHttpRequest blocked by CORS policy
```
**Solution:**
- Check FRONTEND_URL in backend .env
- Ensure CORS middleware is enabled
- Match frontend URL exactly

### Token Expired
```
Error: Token has expired
```
**Solution:**
- Login again to get new token
- Increase JWT_EXPIRE in .env

### Image Upload Failed
```
Error: Cloudinary upload failed
```
**Solution:**
- Verify CLOUDINARY credentials in .env
- Check image file size (max 5MB)
- Ensure file is valid image format

---

## 📚 DEPENDENCIES

### Backend
- **express** ^4.18.2 - Web framework
- **mongoose** ^7.5.0 - MongoDB ODM
- **bcryptjs** ^2.4.3 - Password hashing
- **jsonwebtoken** ^9.1.0 - JWT tokens
- **dotenv** ^16.3.1 - Environment variables
- **cors** ^2.8.5 - Cross-origin requests
- **joi** ^17.11.0 - Input validation
- **multer** ^1.4.5 - File uploads
- **cloudinary** ^1.40.0 - Image storage
- **nodemon** ^3.0.1 - Dev auto-reload

### Frontend
- **axios** - HTTP client
- **react-router-dom** - Routing
- **react** - UI library

---

## 🎯 NEXT STEPS

1. ✅ Backend setup complete
2. **Setup Frontend Integration** → Use FRONTEND_INTEGRATION.md
3. **Test API Endpoints** → Use POSTMAN_TESTING_GUIDE.md
4. **Deploy to Production** → Configure environment, use MongoDB Atlas
5. **Add Payment Gateway** → Razorpay/Stripe integration
6. **Add Notifications** → Email/SMS
7. **Add Real-time Chat** → Socket.io

---

## 📞 Support

For issues or questions:
1. Check troubleshooting section above
2. Review API documentation in route files
3. Check model schemas for required fields
4. Run `npm run test-db` to verify connection

---

**You now have a production-ready MERN backend! 🎉**

Start frontend integration using FRONTEND_INTEGRATION.md guide.
