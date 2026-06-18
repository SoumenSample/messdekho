import axiosInstance from './axios';

// payload should include fields expected by backend validation:
// { pgId, checkInDate, checkOutDate, roomsBooked, guestName, guestEmail, guestPhone, specialRequirements }
export const bookPG = (payload) => {
  return axiosInstance.post('/bookings', payload);
};