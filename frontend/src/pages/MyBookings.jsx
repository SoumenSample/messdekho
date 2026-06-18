import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { bookingService } from "@/services/bookingService";
import { getPGImageUrl } from "@/utils/pgImage";
import { Calendar, MapPin, User } from "lucide-react";

const STATUS_STYLES = {
  approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  confirmed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  pending: "bg-orange-50 text-orange-700 border-orange-200",
  rejected: "bg-rose-50 text-rose-700 border-rose-200",
  cancelled: "bg-gray-100 text-gray-600 border-gray-200",
};

const formatDate = (value) => {
  if (!value) return "Not set";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not set";
  return date.toLocaleDateString("en-IN");
};

export default function MyBookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const bookingRows = useMemo(() => (Array.isArray(bookings) ? bookings : []), [bookings]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await bookingService.getMyBookings();
      console.log("MY BOOKINGS RESPONSE:", response.data);
      setBookings(response.data?.bookings || []);
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || "Failed to load bookings";
      setError(message);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchBookings();
  }, [user]);

  const cancel = async (id) => {
    try {
      await bookingService.cancelBooking(id, "Cancelled by user");
      toast.success("Booking cancelled");
      fetchBookings();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to cancel booking");
    }
  };

  const renderStatus = (status) => {
    const normalized = (status || "unknown").toLowerCase();
    return normalized;
  };

  return (
    <div className="bg-[#F9FAFB]">
      <Navbar />
      <section className="mx-auto max-w-5xl px-5 py-12 lg:px-8 lg:py-16" data-testid="my-bookings-page">
        <div className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-700">My Stays</div>
        <h1 className="mt-2 font-heading text-3xl font-bold text-gray-900 lg:text-4xl">Your bookings</h1>
        <p className="mt-1 text-sm text-gray-500">Manage your confirmed & upcoming PG reservations.</p>

        {loading ? (
          <div className="mt-12 rounded-2xl border border-gray-200 bg-white p-10 text-center text-sm text-gray-500">
            Loading your bookings...
          </div>
        ) : error ? (
          <div className="mt-12 rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center text-sm text-rose-700">
            {error}
          </div>
        ) : (Array.isArray(bookingRows) ? bookingRows : []).length === 0 ? (
          <div className="mt-12 flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white p-14 text-center" data-testid="no-bookings">
            <div className="text-4xl">🗂️</div>
            <div className="mt-3 font-heading text-xl font-semibold">No bookings yet</div>
            <p className="mt-2 max-w-sm text-sm text-gray-500">Discover hand-picked PGs near you and book with zero brokerage.</p>
            <Link to="/listings" className="mt-5 rounded-full bg-emerald-700 px-5 py-2 text-sm font-semibold text-white">Browse PGs</Link>
          </div>
        ) : (
          <div className="mt-10 space-y-4" data-testid="bookings-list">
            {bookingRows.map((booking) => {
              const pg = booking?.pg || {};
              const owner = booking?.owner || {};
              const image = getPGImageUrl(pg, "https://images.pexels.com/photos/271816/pexels-photo-271816.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940");
              const bookingId = booking?._id || booking?.id || `${booking?.checkInDate || "booking"}`;
              const status = renderStatus(booking?.status);
              const moveInDate = formatDate(booking?.checkInDate);
              const totalPayable = booking?.totalPrice ?? 0;
              const city = pg?.city || pg?.location || "";
              return (
                <div key={bookingId} className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-soft md:flex" data-testid={`booking-row-${bookingId}`}>
                  <img src={image} alt={pg?.title || "Booked PG"} className="h-48 w-full object-cover md:h-auto md:w-64" />
                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="text-[11px] uppercase tracking-widest text-gray-400">Booking #{bookingId}</div>
                        <Link to={`/pg/${pg?._id || pg?.id || ""}`} className="font-heading text-lg font-semibold text-gray-900 hover:text-emerald-700">{pg?.title || "Booked PG"}</Link>
                        <div className="mt-1 flex items-center gap-1 text-sm text-gray-500">
                          <MapPin className="h-3.5 w-3.5" /> {city || "Unknown city"}
                        </div>
                      </div>
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider ${STATUS_STYLES[status] || STATUS_STYLES.cancelled}`}
                        data-testid={`booking-status-${bookingId}`}
                      >
                        {status}
                      </span>
                    </div>
                    <div className="mt-4 grid gap-3 text-sm text-gray-700 sm:grid-cols-4">
                      <div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-400"><Calendar className="h-3.5 w-3.5" /> Move-in</div>
                        <div className="mt-0.5 font-semibold">{moveInDate}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-400">Total days</div>
                        <div className="mt-0.5 font-semibold">{booking?.totalDays ?? booking?.numberOfDays ?? 0}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-400">Total payable</div>
                        <div className="mt-0.5 font-semibold">₹{Number(totalPayable).toLocaleString("en-IN")}</div>
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-400"><User className="h-3.5 w-3.5" /> Owner</div>
                        <div className="mt-0.5 font-semibold">{owner?.name || "Unknown owner"}</div>
                        <div className="text-xs text-gray-500">{owner?.email || ""}</div>
                      </div>
                    </div>
                    {status !== "cancelled" && (
                      <div className="mt-5 flex gap-3">
                        <Link to={`/pg/${pg?._id || pg?.id || ""}`} className="rounded-full border border-gray-200 px-4 py-1.5 text-xs font-semibold text-gray-700 hover:border-emerald-300 hover:text-emerald-700">
                          View PG
                        </Link>
                        <button
                          onClick={() => cancel(bookingId)}
                          className="rounded-full border border-red-200 bg-red-50 px-4 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100"
                          data-testid={`cancel-booking-${bookingId}`}
                        >
                          Cancel booking
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
      <Footer />
    </div>
  );
}
