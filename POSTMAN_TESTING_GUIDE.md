# Mess Dekho Backend - Postman Testing Guide

## Prerequisites

1. Backend Running on `http://localhost:9000`
2. MongoDB Connected
3. Postman installed

## Setup Postman

### 1. Create Collection
- Click "Collections" → "New Collection"
- Name: "Mess Dekho Backend"

### 2. Add Environment Variables
- Create new Environment: "Dev"
- Add variables:
```json
{
  "base_url": "http://localhost:9000/api",
  "token": "",
  "userId": "",
  "pgId": "",
  "bookingId": ""
}
```

Use `{{base_url}}` in requests
Use `{{token}}` in Authorization header

---

## API ENDPOINTS TESTING

### 1️⃣ HEALTH CHECK
```
GET http://localhost:9000/api/health
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Backend is running perfectly!",
  "timestamp": "2024-05-02T12:00:00.000Z"
}
```

---

## 2️⃣ AUTHENTICATION ROUTES

### A) REGISTER USER
```
POST {{base_url}}/auth/register
Content-Type: application/json
```

**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "confirmPassword": "password123",
  "phone": "9876543210",
  "role": "user"
}
```

**Response (201 Created):**
```json
{
  "status": "success",
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "9876543210",
      "role": "user"
    },
    "token": "jwt_token_here"
  }
}
```

**Save token:**
- In Postman, go to Tests tab:
```javascript
if (pm.response.code === 201) {
  pm.environment.set("token", pm.response.json().data.token);
  pm.environment.set("userId", pm.response.json().data.user.id);
}
```

---

### B) LOGIN USER
```
POST {{base_url}}/auth/login
Content-Type: application/json
```

**Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200 OK):** Same as registration

---

### C) GET CURRENT USER
```
GET {{base_url}}/auth/me
Authorization: Bearer {{token}}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "9876543210",
      "role": "user",
      "profilePhoto": null,
      "address": null,
      "city": null,
      "createdAt": "2024-05-02T..."
    }
  }
}
```

---

### D) UPDATE PROFILE
```
PUT {{base_url}}/auth/profile
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Body:**
```json
{
  "name": "John Doe Updated",
  "address": "123 Main Street",
  "city": "Delhi"
}
```

---

### E) LOGOUT
```
POST {{base_url}}/auth/logout
Authorization: Bearer {{token}}
```

---

## 3️⃣ PG (LISTING) ROUTES

### A) CREATE PG (Owner)

**First, register as owner:**
```json
{
  "name": "Owner Name",
  "email": "owner@example.com",
  "password": "password123",
  "confirmPassword": "password123",
  "phone": "9876543211",
  "role": "owner"
}
```

**Create PG:**
```
POST {{base_url}}/pg
Authorization: Bearer {{owner_token}}
Content-Type: application/json
```

**Body:**
```json
{
  "title": "Cozy PG in Nehrulu Place",
  "description": "Best PG for students and professionals. Spacious rooms with WiFi and AC",
  "price": 8000,
  "location": "Nehrulu Place",
  "city": "Delhi",
  "address": "123 Main Street, Delhi",
  "roomsAvailable": 5,
  "type": "PG",
  "occupancy": "Single",
  "facilities": ["Wifi", "AC", "Bed", "Cupboard", "Common Kitchen"]
}
```

**Response (201 Created):**
```json
{
  "status": "success",
  "message": "PG created successfully. Pending admin approval.",
  "data": {
    "pg": {
      "_id": "pg_id",
      "title": "Cozy PG in Nehrulu Place",
      "price": 8000,
      "isApproved": false,
      "owner": { "id": "owner_id", "name": "Owner Name" },
      "createdAt": "2024-05-02T..."
    }
  }
}
```

**Save pgId:**
```javascript
if (pm.response.code === 201) {
  pm.environment.set("pgId", pm.response.json().data.pg._id);
}
```

---

### B) GET ALL APPROVED PGs
```
GET {{base_url}}/pg?city=Delhi&page=1&limit=10
Content-Type: application/json
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "pgs": [
      {
        "_id": "pg_id",
        "title": "Cozy PG",
        "price": 8000,
        "location": "Nehrulu Place",
        "city": "Delhi",
        "images": [],
        "facilities": ["Wifi", "AC"],
        "isApproved": true,
        "owner": { "name": "Owner Name", "phone": "9876543211" }
      }
    ],
    "pagination": {
      "total": 1,
      "pages": 1,
      "currentPage": 1,
      "limit": 10
    }
  }
}
```

---

### C) GET SINGLE PG
```
GET {{base_url}}/pg/{{pgId}}
```

---

### D) UPDATE PG (Owner)
```
PUT {{base_url}}/pg/{{pgId}}
Authorization: Bearer {{owner_token}}
Content-Type: application/json
```

**Body:** (Only fields to update)
```json
{
  "price": 9000,
  "roomsAvailable": 4,
  "facilities": ["Wifi", "AC", "Bed", "Cupboard"]
}
```

---

### E) DELETE PG (Owner)
```
DELETE {{base_url}}/pg/{{pgId}}
Authorization: Bearer {{owner_token}}
```

---

## 4️⃣ BOOKING ROUTES

### A) CREATE BOOKING (User)
```
POST {{base_url}}/bookings
Authorization: Bearer {{user_token}}
Content-Type: application/json
```

**Body:**
```json
{
  "pgId": "{{pgId}}",
  "checkInDate": "2024-05-20",
  "checkOutDate": "2024-05-25",
  "roomsBooked": 1,
  "guestName": "John Doe",
  "guestEmail": "john@example.com",
  "guestPhone": "9876543210",
  "specialRequirements": "Non-vegetarian"
}
```

**Response (201 Created):**
```json
{
  "status": "success",
  "message": "Booking created successfully. Pending owner approval.",
  "data": {
    "booking": {
      "_id": "booking_id",
      "user": "user_id",
      "pg": "pg_id",
      "checkInDate": "2024-05-20",
      "checkOutDate": "2024-05-25",
      "numberOfDays": 5,
      "totalPrice": 40000,
      "status": "pending",
      "ownerApproved": false
    }
  }
}
```

**Save bookingId:**
```javascript
if (pm.response.code === 201) {
  pm.environment.set("bookingId", pm.response.json().data.booking._id);
}
```

---

### B) GET USER'S BOOKINGS
```
GET {{base_url}}/bookings?status=pending&page=1
Authorization: Bearer {{user_token}}
```

---

### C) CONFIRM BOOKING (Owner)
```
PUT {{base_url}}/bookings/{{bookingId}}/confirm
Authorization: Bearer {{owner_token}}
```

---

### D) ADD REVIEW (User - after booking complete)
```
POST {{base_url}}/bookings/{{bookingId}}/review
Authorization: Bearer {{user_token}}
Content-Type: application/json
```

**Body:**
```json
{
  "rating": 5,
  "review": "Great stay! Rooms were clean and staff was very helpful."
}
```

---

### E) CANCEL BOOKING
```
PUT {{base_url}}/bookings/{{bookingId}}/cancel
Authorization: Bearer {{user_token}}
Content-Type: application/json
```

**Body:**
```json
{
  "reason": "Plans changed"
}
```

---

## 5️⃣ ADMIN ROUTES

### A) REGISTER ADMIN (Create one manually in MongoDB)

Or use elevated permissions:

### B) GET ALL PGs (Admin - Including Unapproved)
```
GET {{base_url}}/admin/pgs?status=all&page=1
Authorization: Bearer {{admin_token}}
```

---

### C) APPROVE PG
```
PUT {{base_url}}/admin/pg/{{pgId}}/approve
Authorization: Bearer {{admin_token}}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "PG approved successfully",
  "data": {
    "pg": {
      "isApproved": true,
      "approvedAt": "2024-05-02T..."
    }
  }
}
```

---

### D) GET DASHBOARD STATS
```
GET {{base_url}}/admin/stats
Authorization: Bearer {{admin_token}}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "stats": {
      "users": {
        "total": 10,
        "owners": 3,
        "regularUsers": 7
      },
      "pgs": {
        "total": 5,
        "approved": 4,
        "pending": 1
      },
      "bookings": {
        "total": 20,
        "active": 5,
        "completed": 15
      },
      "revenue": 500000
    }
  }
}
```

---

### E) GET ALL USERS
```
GET {{base_url}}/admin/users?role=owner&status=active
Authorization: Bearer {{admin_token}}
```

---

## Common Errors & Fixes

### 401 Unauthorized
**Issue:** Token missing or invalid
**Fix:** 
- Make sure token is in Authorization header
- Token format: `Bearer <token>`
- Token might be expired

### 400 Validation Error
**Issue:** Invalid request body
**Fix:** Check field types and required fields

### 403 Forbidden
**Issue:** User doesn't have permission
**Fix:** 
- User must be owner to create PG
- User must be user role to create booking
- Admin only routes need admin token

### 404 Not Found
**Issue:** Resource doesn't exist
**Fix:** Check if ID is correct

---

## Testing Workflow

1. **Register User** → Get token
2. **Register Owner** → Get owner token
3. **Owner Creates PG** → Get pgId
4. **Admin Approves PG** (or skip if not required)
5. **User Creates Booking** → Get bookingId
6. **Owner Confirms Booking**
7. **User Adds Review**

---

## Pro Tips

1. **Save tokens in Postman:**
   - Use Tests tab to save tokens
   - Use Pre-request Script for setup

2. **Use Environment Variables:**
   - Avoid hardcoding URLs
   - Easy to switch between dev/prod

3. **Create Requests Groups:**
   - Auth folder
   - PG folder
   - Booking folder
   - Admin folder

4. **Test Error Cases:**
   - Try invalid credentials
   - Try accessing without token
   - Try accessing with wrong role

---

**Happy Testing!** 🎉
