import { useEffect, useMemo, useState, useCallback } from "react";
import { toast } from "sonner";
import { pgService } from "@/services/pgService";
import { bookingService } from "@/services/bookingService";
import { DashboardLayout } from "@/components/DashboardLayout";
import axios from "@/api/axios";
import { getPGImageUrl } from "@/utils/pgImage";
import { LayoutDashboard, Plus, CalendarCheck, Building2, Clock3, BadgeCheck, Check, X, AlertCircle } from "lucide-react";

const MENU = [
  { to: "/owner", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/owner/add", label: "Add PG", icon: Plus },
  { to: "/owner/bookings", label: "Bookings", icon: CalendarCheck },
];

export default function OwnerDashboard() {
  const [pgs, setPGs] = useState([]);
  const [loadingPGs, setLoadingPGs] = useState(true);
  const [loadingError, setLoadingError] = useState("");

  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);

  const fetchPGs = async () => {
    try {
      setLoadingPGs(true);
      setLoadingError("");
      console.log('📡 [OWNER-DASH] Fetching owner PGs...');
      const res = await pgService.getMyPGs();
      console.log('📡 [OWNER-DASH] PG fetch response:', res.data);
      setPGs(res.data?.data?.pgs || []);
    } catch (error) {
      const message = error?.response?.data?.message || error?.message || "Failed to load owner PGs";
      console.error('❌ [OWNER-DASH] PG fetch failed:', {
        statusCode: error?.response?.status,
        message,
        fullError: error
      });
      setLoadingError(message);
      setPGs([]);
    } finally {
      setLoadingPGs(false);
    }
  };

  const fetchBookings = useCallback(async () => {
    try {
      setLoadingBookings(true);
      console.log('📡 [OWNER-DASH] Fetching owner bookings...');
      const res = await bookingService.getMyBookingsAsOwner({ status: 'pending' });
      console.log('📡 [OWNER-DASH] Bookings fetch response:', res.data);
      setBookings(res.data?.data?.bookings || []);
    } catch (error) {
      console.error('❌ [OWNER-DASH] Booking fetch failed:', error);
      setBookings([]);
    } finally {
      setLoadingBookings(false);
    }
  }, []);

  const handleApprove = async (bookingId) => {
    console.log("APPROVE START");

    try {
      console.log("Sending approve request");
      const response = await axios.put(`/bookings/${bookingId}/approve`);
      console.log("Approve response:", response.data);
      toast.success("Booking approved");
      console.log("Updating state");
      setBookings((prev) => prev.filter((b) => b._id !== bookingId));
      await fetchBookings();
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
      setBookings((prev) => prev.filter((b) => b._id !== bookingId));
      await fetchBookings();
      console.log("REJECT END");
    } catch (error) {
      console.error("REJECT ERROR:", error);
      toast.error(error?.response?.data?.message || "Something went wrong");
    }
  };

  useEffect(() => {
    fetchPGs();
    fetchBookings();
  }, [fetchBookings]);

  const stats = useMemo(() => {
    const total = Array.isArray(pgs) ? pgs.length : 0;
    const approved = pgs.filter((pg) => pg.status === "approved").length;
    const pending = pgs.filter((pg) => pg.status === "pending").length;
    const pendingBookings = Array.isArray(bookings) ? bookings.length : 0;

    return [
      { label: "Total PGs", value: total, icon: Building2 },
      { label: "Approved", value: approved, icon: BadgeCheck },
      { label: "Pending", value: pending, icon: Clock3 },
      { label: "Booking Requests", value: pendingBookings, icon: CalendarCheck },
    ];
  }, [pgs, bookings]);

  return (
    <DashboardLayout
      title="PG Overview"
      subtitle="Manage your PG listings and bookings"
      menu={MENU}
      testId="owner-dashboard-page"
    >
      {loadingError && (
        <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {loadingError}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-soft">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                  <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900">{stat.value}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {(Array.isArray(bookings) ? bookings : []).length > 0 && (
        <div className="mt-8">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="font-heading text-xl font-semibold text-gray-900 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-600" />
                Pending Booking Requests
              </h2>
              <p className="mt-1 text-sm text-gray-500">You have {(Array.isArray(bookings) ? bookings : []).length} new booking request{(Array.isArray(bookings) ? bookings : []).length !== 1 ? 's' : ''}. Approve or reject to respond.</p>
            </div>
            <a
              href="/owner/bookings"
              className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-4 py-2.5 text-sm font-semibold text-orange-700 transition hover:bg-orange-100"
            >
              View All
            </a>
          </div>

          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-soft">
            <div className="grid gap-3 p-4 md:grid-cols-2">
              {bookings.slice(0, 4).map((booking) => (
                <div key={booking?._id || `${booking?.user?.email || "booking"}-${booking?.checkInDate || "na"}`} className="rounded-lg border border-gray-200 p-4 transition hover:shadow-md">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{booking?.user?.name || "Unknown User"}</h3>
                      <p className="text-xs text-gray-500 truncate">{booking?.user?.email || "Unknown Email"}</p>
                      <p className="mt-2 text-sm text-gray-700">{booking?.pg?.title || "Unknown PG"}</p>
                      <p className="mt-1 text-xs text-gray-500">
                        {booking?.checkInDate ? new Date(booking.checkInDate).toLocaleDateString("en-IN") : "Not set"} • {booking?.numberOfDays ?? 0} nights • ₹{booking?.totalPrice?.toLocaleString("en-IN") || "0"}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => handleApprove(booking?._id)}
                      className="flex-1 flex items-center justify-center gap-1 rounded-lg bg-emerald-700 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-800 transition"
                      data-testid={`approve-${booking?._id || "unknown"}`}
                    >
                      <Check className="h-3 w-3" /> Approve
                    </button>
                    <button
                      onClick={() => handleReject(booking?._id)}
                      className="flex-1 flex items-center justify-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100 transition"
                      data-testid={`reject-${booking?._id || "unknown"}`}
                    >
                      <X className="h-3 w-3" /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 flex items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-xl font-semibold text-gray-900">Your PG listings</h2>
          <p className="mt-1 text-sm text-gray-500">Review listings, track approval status, and manage updates.</p>
        </div>
        {/* <a
          href="/owner/add"
          className="inline-flex items-center gap-2 rounded-full bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800"
        >
          <Plus className="h-4 w-4" /> Add PG
        </a> */}
      </div>
      
      {loadingPGs ? (
        <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-6 text-sm text-gray-500 shadow-soft">
          Loading your PG listings...
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-soft">
          {Array.isArray(pgs) && pgs.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-2 lg:grid-cols-3">
              {pgs.map((pg) => (
                <div 
                  key={pg._id} 
                  className="rounded-xl border border-gray-200 p-4 transition hover:shadow-md"
                >
                  <img src={getPGImageUrl(pg)} alt={pg.title} className="mb-3 h-36 w-full rounded-lg object-cover" />
                  <h3 className="text-lg font-semibold text-gray-900">{pg.title}</h3>
                  <p className="mt-1 text-xs text-gray-500">ID: {pg._id}</p>
                  <div className="mt-3 flex items-center justify-between gap-3 text-sm text-gray-600">
                    <span>{pg.city}</span>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${pg.status === "approved" ? "bg-emerald-50 text-emerald-700" : pg.status === "pending" ? "bg-orange-50 text-orange-700" : "bg-gray-100 text-gray-600"}`}>
                      {pg.status || "draft"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-10 text-center">
              <p className="mb-4 text-gray-500">No PG listings yet</p>
              <a href="/owner/add" className="inline-block rounded-lg bg-emerald-700 px-6 py-2 text-white transition hover:bg-emerald-800">
                Create Your First PG
              </a>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
