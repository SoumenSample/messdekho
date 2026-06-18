# Mess Dekho Backend

Backend for Mess/PG Booking Platform built with Node.js, Express, and MongoDB.

## Project Structure

```
backend/
├── config/              # Configuration files
├── models/              # Mongoose schemas
├── routes/              # API routes
├── controllers/         # Route handlers
├── middleware/          # Custom middleware
├── utils/               # Utility functions
├── server.js            # Main server file
├── package.json         # Dependencies
└── .env                 # Environment variables
```

## Installation

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment Variables
Create `.env` file in backend folder with:
```
MONGO_URI=mongodb://localhost:27017/mess-dekho
PORT=9000
NODE_ENV=development
JWT_SECRET=your_secret_key
FRONTEND_URL=http://localhost:5173
```

### 3. Start MongoDB
Make sure MongoDB is running on your system:
```bash
# Windows (if using MongoDB Community)
mongod

# Or use MongoDB Atlas - update MONGO_URI in .env
```

### 4. Start Backend Server
```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

Server will run on `http://localhost:9000`

## Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests

## API Endpoints

### Health Check
- `GET /api/health` - Check if server is running

### Authentication (Step 5)
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### PG Listings (Step 6)
- `POST /api/pg` - Create new PG (Owner)
- `GET /api/pg` - Get all approved PGs
- `GET /api/pg/:id` - Get specific PG
- `PUT /api/pg/:id` - Update PG (Owner)
- `DELETE /api/pg/:id` - Delete PG (Owner)

### Bookings (Step 6)
- `POST /api/bookings` - Create booking (User)
- `GET /api/bookings/my` - Get user's bookings

### Admin (Step 6)
- `GET /api/admin/pgs` - Get all PGs (Admin)
- `PUT /api/admin/pg/:id/approve` - Approve PG (Admin)
- `DELETE /api/admin/user/:id` - Delete user (Admin)

## Development Steps

- [x] Step 1: Project Setup
- [ ] Step 2: Database Connection
- [ ] Step 3: Mongoose Models
- [ ] Step 4: Middleware Setup
- [ ] Step 5: Auth Routes
- [ ] Step 6: Main Feature Routes
- [ ] Step 7: Frontend Connection
- [ ] Step 8: Testing Guide

## Technologies Used

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB + Mongoose
- **Authentication**: JWT + Bcryptjs
- **Validation**: Joi
- **File Upload**: Multer + Cloudinary
- **CORS**: Express CORS

## Common Issues

### MongoDB Connection Error
- Check if MongoDB is running
- Verify MONGO_URI in .env
- For MongoDB Atlas, ensure IP whitelist includes your IP

### Port Already in Use
- Change PORT in .env
- Or kill process using port 9000

### CORS Errors
- Check FRONTEND_URL matches your React app URL
- Ensure CORS middleware is enabled

---

**Happy Coding!** 🚀
