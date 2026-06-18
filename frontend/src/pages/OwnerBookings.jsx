import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/DashboardLayout";
import { bookingService } from "@/services/bookingService";
import axios from "@/api/axios";
import { CalendarCheck, Check, LayoutDashboard, Plus, X } from "lucide-react";

const MENU = [
  { to: "/owner", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/owner/add", label: "Add PG", icon: Plus },
  { to: "/owner/bookings", label: "Bookings", icon: CalendarCheck },
];

export default function OwnerBookings() {
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [loadingError, setLoadingError] = useState("");

  const bookingRows = useMemo(() => (Array.isArray(bookings) ? bookings : []), [bookings]);

  const fetchBookings = async () => {
    try {
      setLoadingBookings(true);
      setLoadingError("");
      console.log('📡 [OWNER-BOOKINGS] Fetching owner bookings...');
      const res = await bookingService.getMyBookingsAsOwner();
      console.log('📡 [OWNER-BOOKINGS] Bookings fetch response:', res.data);
      setBookings(res.data?.data?.bookings || []);
    } catch (error) {
      const message = error?.response?.data?.message || error?.message || "Failed to load bookings";
      console.error('❌ [OWNER-BOOKINGS] Booking fetch failed:', {
        statusCode: error?.response?.status,
        message,
        fullError: error
      });
      setLoadingError(message);
      setBookings([]);
    } finally {
      setLoadingBookings(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleApprove = async (bookingId) => {
    console.log("APPROVE START");

    try {
      console.log("Sending approve request");
      const response = await axios.put(`/bookings/${bookingId}/approve`);
      console.log("Approve response:", response.data);
      toast.success("Booking approved");
      console.log("Updating state");
      setBookings((prev) =>
        prev.map((b) =>
          b._id === bookingId
            ? { ...b, status: "approved" }
            : b
        )
      );
      console.log("APPROVE END");
    } catch (error) {
      console.error("APPROVE ERROR:", error);
      toast.error(error?.response?.data?.message || "Something went wrong");
    }
  };

  const handleReject = async (bookingId) => {
    console.log("REJECT START");

    try {
      console.log("Sending reject request");
      const response = await axios.put(`/bookings/${bookingId}/reject`, {
        reason: "Rejected by owner"
      });
      console.log("Reject response:", response.data);
      toast.success("Booking rejected");
      console.log("Updating state");
      setBookings((prev) =>
        prev.map((b) =>
          b._id === bookingId
            ? { ...b, status: "rejected" }
            : b
        )
      );
      console.log("REJECT END");
    } catch (error) {
      console.error("REJECT ERROR:", error);
      toast.error(error?.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <DashboardLayout
      title="Incoming bookings"
      subtitle="Review and respond to booking requests from residents."
      menu={MENU}
      testId="owner-bookings-page"
    >
      {loadingError && (
        <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {loadingError}
        </div>
      )}
      {loadingBookings ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-6 text-sm text-gray-500 shadow-soft">
          Loading your booking requests...
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-soft">
          <table className="w-full text-sm" data-testid="owner-bookings-table">
            <thead className="bg-gray-50 text-xs uppercase tracking-widest text-gray-500">
              <tr>
                <th className="px-4 py-3 text-left">Resident</th>
                <th className="px-4 py-3 text-left">PG</th>
                <th className="px-4 py-3 text-left">Move-in</th>
                <th className="px-4 py-3 text-left">Nights</th>
                <th className="px-4 py-3 text-left">Total Price</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(Array.isArray(bookingRows) ? bookingRows : []).length === 0 ? (
                <tr><td colSpan={7} className="p-10 text-center text-gray-500">No booking requests yet.</td></tr>
              ) : (
                bookingRows.map((booking) => (
                  <tr key={booking?._id || `${booking?.user?.email || "booking"}-${booking?.checkInDate || "na"}`} className="hover:bg-gray-50" data-testid={`owner-booking-${booking?._id || "unknown"}`}>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-gray-900">{booking?.user?.name || "Unknown User"}</div>
                      <div className="text-xs text-gray-500">{booking?.user?.email || "Unknown Email"}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{booking?.pg?.title || "Unknown PG"}</td>
                    <td className="px-4 py-3 text-gray-600">{booking?.checkInDate ? new Date(booking.checkInDate).toLocaleDateString("en-IN") : "Not set"}</td>
                    <td className="px-4 py-3 text-gray-600">{booking?.numberOfDays ?? 0}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900">₹{booking?.totalPrice?.toLocaleString("en-IN") || "0"}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                        booking?.status === "approved" || booking?.status === "confirmed" ? "bg-emerald-50 text-emerald-700" :
                        booking?.status === "pending" ? "bg-orange-50 text-orange-700" :
                        "bg-gray-100 text-gray-600"
                      }`}>
                        {booking?.status || "unknown"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {booking?.status === "pending" ? (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleApprove(booking?._id)}
                            className="flex items-center gap-1 rounded-full bg-emerald-700 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-800"
                            data-testid={`approve-${booking?._id || "unknown"}`}
                          >
                            <Check className="h-3 w-3" /> Approve
                          </button>
                          <button
                            onClick={() => handleReject(booking?._id)}
                            className="flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-100"
                            data-testid={`reject-${booking?._id || "unknown"}`}
                          >
                            <X className="h-3 w-3" /> Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
}
