# Frontend API Integration Guide

## 1. Environment Setup

Create `.env.local` in frontend folder:

```env
VITE_API_URL=http://localhost:9000/api
```

## 2. Install Axios

```bash
npm install axios
```

## 3. API Services Structure

### Files Created:
- `src/services/api.js` - Axios configuration
- `src/services/authService.js` - Auth API calls
- `src/services/pgService.js` - PG API calls
- `src/services/bookingService.js` - Booking API calls
- `src/services/adminService.js` - Admin API calls

## 4. Usage Examples

### Register User
```javascript
import { authService } from '@/services/authService';

// In component
try {
  const response = await authService.register({
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    confirmPassword: 'password123',
    phone: '9876543210',
    role: 'user'
  });
  console.log('User registered:', response);
} catch (error) {
  console.error('Registration failed:', error);
}
```

### Login User
```javascript
try {
  const response = await authService.login('john@example.com', 'password123');
  console.log('Logged in:', response);
  // Token is automatically stored
} catch (error) {
  console.error('Login failed:', error);
}
```

### Get Current User
```javascript
const user = await authService.getCurrentUser();
console.log('Current user:', user);
```

### Get All PGs (with filters)
```javascript
import { pgService } from '@/services/pgService';

// Get all PGs
const response = await pgService.getAllPGs();

// With filters
const response = await pgService.getAllPGs({
  city: 'Delhi',
  page: 1,
  limit: 10
});

// Search
const response = await pgService.searchByCity('Mumbai');
const response = await pgService.searchPGs('affordable pg');
```

### Get Single PG
```javascript
const pg = await pgService.getPGById('pgId');
console.log('PG Details:', pg);
```

### Create Booking
```javascript
import { bookingService } from '@/services/bookingService';

const response = await bookingService.createBooking({
  pgId: 'pgId',
  checkInDate: '2024-05-20',
  checkOutDate: '2024-05-25',
  roomsBooked: 1,
  guestName: 'John Doe',
  guestEmail: 'john@example.com',
  guestPhone: '9876543210',
  specialRequirements: 'Non-vegetarian'
});
```

### Get User's Bookings
```javascript
const bookings = await bookingService.getMyBookings({ status: 'confirmed' });
console.log('My Bookings:', bookings);
```

### Add Review
```javascript
await bookingService.addReview(
  'bookingId',
  5,
  'Great stay! Rooms were clean and staff was helpful'
);
```

### Create PG (Owner)
```javascript
const formData = new FormData();
formData.append('title', 'Cozy PG in Delhi');
formData.append('description', 'Best PG for students...');
formData.append('price', '8000');
formData.append('location', 'Nehrulu Place');
formData.append('city', 'Delhi');
formData.append('address', '123 Main Street');
formData.append('roomsAvailable', '5');
formData.append('type', 'PG');
formData.append('occupancy', 'Single');
formData.append('facilities', ['Wifi', 'AC', 'Bed']);

// Add images
document.getElementById('imageInput').files.forEach(file => {
  formData.append('images', file);
});

const response = await pgService.createPG(formData);
```

### Admin - Get All PGs
```javascript
import { adminService } from '@/services/adminService';

const response = await adminService.getAllPGs({ 
  status: 'unapproved',
  page: 1
});
```

### Admin - Approve PG
```javascript
await adminService.approvePG('pgId');
```

### Admin - Dashboard Stats
```javascript
const stats = await adminService.getDashboardStats();
console.log('Dashboard Stats:', stats);
```

## 5. Error Handling

```javascript
import { authService } from '@/services/authService';

try {
  await authService.login(email, password);
} catch (error) {
  if (error.status === 401) {
    console.log('Invalid credentials');
  } else if (error.status === 400) {
    console.log('Validation error:', error.errors);
  } else {
    console.log('Server error');
  }
}
```

## 6. Token Management

Token is automatically:
- Added to all requests via Authorization header
- Stored in localStorage after login
- Cleared on logout
- Handled on 401 responses (auto-redirect)

## 7. CORS Configuration

Backend already has CORS configured:
```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

Make sure `FRONTEND_URL` environment variable in backend .env matches your frontend URL.

---

**Ready to integrate frontend with backend!** 🎉
