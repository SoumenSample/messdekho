# Mess Dekho Backend API Documentation

## Overview
This is the backend API for Mess Dekho, a PG (Paying Guest) booking application. The API provides endpoints for user authentication, PG management, booking, and admin operations.

## Base URL
```
http://localhost:9000/api
```

## Authentication
Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## Authentication Endpoints

### POST /auth/signup
Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "user" // optional: "user", "owner", or "admin"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully."
}
```

**Error Responses:**
- `400`: Validation error (missing fields, password too short)
- `409`: Email already registered

---

### POST /auth/login
Login and get JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

**Error Responses:**
- `400`: Missing email or password
- `401`: Invalid credentials
- `500`: Server error

---

## PG Endpoints

### GET /pg
Get all approved PG listings with pagination and filtering.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `location` (string): Filter by city or area (case-insensitive)
- `minPrice` (number): Minimum price filter
- `maxPrice` (number): Maximum price filter

**Example Request:**
```
GET /api/pg?page=1&limit=10&location=Bangalore&minPrice=10000&maxPrice=25000
```

**Success Response (200):**
```json
{
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Cozy PG",
      "description": "Nice place",
      "location": {
        "city": "Bangalore",
        "area": "Koramangala"
      },
      "price": 15000,
      "images": ["url1", "url2"],
      "facilities": ["WiFi", "AC"],
      "ownerId": "507f1f77bcf86cd799439012",
      "status": "approved",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 100,
  "page": 1,
  "pages": 10
}
```

---

### GET /pg/:id
Get a single PG listing by ID.

**Success Response (200):** Returns single PG object

**Error Responses:**
- `404`: PG not found
- `500`: Invalid ID format

---

### POST /pg
Create a new PG listing (Owner only).

**Authentication:** Required (role: owner)

**Request Body:**
```json
{
  "title": "Luxury PG",
  "description": "Fully furnished",
  "location": {
    "city": "Bangalore",
    "area": "Whitefield"
  },
  "price": 25000,
  "facilities": ["WiFi", "AC", "Hot Water"],
  "images": [] // Optional file upload
}
```

**Success Response (201):** Returns created PG object with status "pending"

**Error Responses:**
- `400`: Validation error
- `401`: Not authenticated
- `403`: Only owners can create PG

---

### PUT /pg/:id
Update PG listing (Owner or Admin).

**Authentication:** Required (role: owner or admin)

**Request Body:** Same as POST /pg (all fields optional)

**Success Response (200):** Returns updated PG object

**Error Responses:**
- `403`: Not authorized to update
- `404`: PG not found

---

### DELETE /pg/:id
Delete PG listing (Owner or Admin).

**Authentication:** Required (role: owner or admin)

**Success Response (200):**
```json
{
  "message": "PG deleted"
}
```

**Error Responses:**
- `403`: Not authorized
- `404`: PG not found

---

## Booking Endpoints

### POST /bookings
Create a new booking.

**Authentication:** Required

**Request Body:**
```json
{
  "pgId": "507f1f77bcf86cd799439011",
  "checkInDate": "2024-02-01T00:00:00Z",
  "checkOutDate": "2024-02-15T00:00:00Z",
  "guests": 2
}
```

**Success Response (201):**
```json
{
  "_id": "507f1f77bcf86cd799439020",
  "userId": "507f1f77bcf86cd799439001",
  "pgId": "507f1f77bcf86cd799439011",
  "checkInDate": "2024-02-01T00:00:00Z",
  "checkOutDate": "2024-02-15T00:00:00Z",
  "guests": 2,
  "status": "booked",
  "createdAt": "2024-01-20T10:00:00Z"
}
```

**Error Responses:**
- `400`: Validation error
- `401`: Not authenticated
- `404`: PG not found or not approved
- `409`: Dates overlap with existing booking

---

### GET /bookings/user
Get all bookings for logged-in user.

**Authentication:** Required

**Success Response (200):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439020",
    "userId": "507f1f77bcf86cd799439001",
    "pgId": {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Cozy PG"
      // ... full PG details
    },
    "status": "booked",
    "checkInDate": "2024-02-01T00:00:00Z",
    "checkOutDate": "2024-02-15T00:00:00Z"
  }
]
```

---

### GET /bookings/owner
Get all bookings for owner's PGs.

**Authentication:** Required (role: owner or admin)

**Success Response (200):** Array of bookings with user details

**Error Responses:**
- `403`: Access denied (not owner)

---

### PUT /bookings/:id/cancel
Cancel a booking.

**Authentication:** Required

**Success Response (200):**
```json
{
  "message": "Booking cancelled",
  "booking": {
    // ... booking object with status: "cancelled"
  }
}
```

**Error Responses:**
- `400`: Booking already cancelled
- `403`: Not authorized to cancel this booking
- `404`: Booking not found

---

## Admin Endpoints

All admin endpoints require authentication with `role: admin`.

### GET /admin/pg
Get all PG listings (including pending and rejected).

**Success Response (200):** Array of all PG objects

---

### PUT /admin/pg/:id/approve
Approve a pending PG listing.

**Request Body:** None

**Success Response (200):**
```json
{
  "message": "PG approved",
  "pg": {
    // ... PG object with status: "approved"
  }
}
```

---

### PUT /admin/pg/:id/reject
Reject a pending PG listing.

**Request Body:** None

**Success Response (200):**
```json
{
  "message": "PG rejected",
  "pg": {
    // ... PG object with status: "rejected"
  }
}
```

---

### GET /admin/users
Get all users (passwords excluded).

**Success Response (200):** Array of user objects

---

### DELETE /admin/user/:id
Delete a user account.

**Success Response (200):**
```json
{
  "message": "User deleted"
}
```

**Error Responses:**
- `404`: User not found

---

## Error Response Format

All errors follow a consistent format:

```json
{
  "success": false,
  "error": "Error description",
  "details": "Additional error details or array of validation errors"
}
```

---

## Testing

Run the test suite:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

---

## Environment Variables

Required environment variables (see `.env.example`):

- `MONGO_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `PORT`: Server port (default: 9000)
- `CLOUDINARY_CLOUD_NAME`: Cloudinary cloud name
- `CLOUDINARY_API_KEY`: Cloudinary API key
- `CLOUDINARY_API_SECRET`: Cloudinary API secret
- `NODE_ENV`: Environment (development, test, production)

---

## Common Status Codes

- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `400 Bad Request`: Validation error or invalid input
- `401 Unauthorized`: Missing or invalid authentication token
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `409 Conflict`: Duplicate entry or date conflict
- `500 Internal Server Error`: Server error

---

## Rate Limiting

Currently, no rate limiting is implemented. Consider adding rate limiting in production.

---

## Security Considerations

1. **Passwords**: All passwords are hashed using bcrypt before storage
2. **JWT**: Tokens expire after 7 days
3. **Input Validation**: All inputs are validated against expected formats
4. **Role-based Access**: All sensitive operations are protected by role checks
5. **Error Messages**: Detailed error messages in development, generic in production

---

## Version History

- **v1.0.0** (2024-01-20): Initial release with core features
