import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ExpertHelpWidget } from "@/components/ExpertHelpWidget";
import { useAuth } from "@/context/AuthContext";
import { bookPG } from "@/api/booking";
import { getToken } from "@/utils/token";
import authService from "@/services/authService";
import pgService from "@/services/pgService";
import { getPGImageUrl, getPGImages } from "@/utils/pgImage";
import { Calendar, Check, MapPin, Soup, Star, Wifi, Wind } from "lucide-react";

const FACILITY_ICONS = {
  "Wi-Fi": Wifi,
  AC: Wind,
  Meals: Soup,
};

export default function PGDetails() {
  const { id } = useParams();
  const nav = useNavigate();
  const { user, setSessionUser } = useAuth();
  const storedUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  })();
  const role = storedUser?.role || user?.role;
  const canBook = role !== "admin";
  const [pg, setPg] = useState(null);
  const [pgLoading, setPgLoading] = useState(true);
  const [pgError, setPgError] = useState(null);
  const [active, setActive] = useState(0);
  const [tab, setTab] = useState("overview");
  const [checkIn, setCheckIn] = useState(() => new Date(Date.now() + 86400000 * 7).toISOString().slice(0, 10));
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSent, setBookingSent] = useState(false);
  const [specialReq, setSpecialReq] = useState('');
  const safeImages = Array.isArray(pg?.images) ? pg.images.filter(Boolean) : (pg?.image ? [pg.image] : []);
  const pgImages = safeImages.length > 0 ? safeImages : ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80'];
  const mainImage = pgImages[active] || pgImages[0];
  console.log('LENGTH DEBUG - pgImages:', pgImages?.length, 'active index:', active);

  // Calculate pricing breakdown
  const calculatePricing = () => {
    if (!pg || !checkIn) return null;
    
    const monthlyRent = pg.price || 0;
    const dailyRent = Math.round(monthlyRent / 30);
    
    const moveInDate = new Date(checkIn);
    const today = new Date();
    const diffTime = Math.abs(moveInDate - today);
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const stayPrice = dailyRent * totalDays;
    const refundableDeposit = 1000;
    const totalPrice = stayPrice + refundableDeposit;
    
    return {
      monthlyRent,
      dailyRent,
      totalDays,
      stayPrice,
      refundableDeposit,
      totalPrice
    };
  };

  const pricing = calculatePricing();

  // Fetch PG details from backend API
  useEffect(() => {
    if (!id) {
      setPgError('PG ID not provided');
      setPgLoading(false);
      return;
    }

    const fetchPG = async () => {
      try {
        setPgLoading(true);
        setPgError(null);
        const response = await pgService.getPGById(id);
        const fetchedPG = response?.data?.data?.pg || response?.data?.data || null;
        
        console.log('PGDetails - fetched PG:', fetchedPG);
        
        if (fetchedPG) {
          setPg(fetchedPG);
        } else {
          setPgError('PG not found');
        }
      } catch (error) {
        console.error('PGDetails - fetch error:', error.response?.data || error.message);
        const errorMsg =
          error.response?.data?.message ||
          error.response?.data?.error ||
          'Failed to load PG details';
        setPgError(errorMsg);
      } finally {
        setPgLoading(false);
      }
    };

    fetchPG();
  }, [id]);

  if (pgLoading) {
    return (
      <div>
        <Navbar />
        <div className="mx-auto max-w-7xl px-5 py-24 text-center">
          <h2 className="font-heading text-2xl font-bold">Loading PG details...</h2>
        </div>
        <Footer />
      </div>
    );
  }

  if (pgError || !pg) {
    return (
      <div>
        <Navbar />
        <div className="mx-auto max-w-7xl px-5 py-24 text-center">
          <h2 className="font-heading text-2xl font-bold">{pgError || 'PG not found'}</h2>
          <button onClick={() => { /* DEBUG: nav disabled */ }} className="mt-6 rounded-full bg-emerald-700 px-5 py-2 text-sm font-semibold text-white">
            Back to listings
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const handleBook = async () => {
    if (!user) {
      nav(`/auth?redirect=/pg/${id}`);
      return;
    }

    // Debug: log current client auth state to help diagnose role mismatches
    try {
      console.log('DEBUG: Booking - current user from context:', user);
      console.log('DEBUG: Booking - localStorage user:', localStorage.getItem('user'));
      const storedUser = (() => {
        try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
      })();
      console.log('DEBUG: Booking - localStorage role (from user):', storedUser?.role ?? null);
      console.log('DEBUG: Booking - token present:', !!getToken());
    } catch (e) {
      // ignore
    }

    const token = getToken();
    if (!token) {
      nav(`/auth?redirect=/pg/${id}`);
      return;
    }

    // Get authoritative user from backend (in case client state is stale)
    let serverUser = null;
    try {
      const meResp = await authService.getCurrentUser();
      serverUser = meResp?.data?.data?.user || null;
      console.log('DEBUG: Booking - /auth/me returned:', serverUser);
      if (serverUser && setSessionUser) {
        // sync local session with server authoritative user
        setSessionUser(serverUser);
      }
    } catch (err) {
      console.warn('DEBUG: Booking - failed to fetch /auth/me', err?.response?.data || err.message || err);
    }

    // Normalize role comparison to be resilient to case/whitespace or alternate labels
    const storedUser = (() => {
      try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
    })();
    const rawRole = (serverUser?.role || user?.role || storedUser?.role || '').toString();
    const role = rawRole.trim().toLowerCase();
    // Accept 'user' and legacy 'resident'
    if (role !== 'user' && role !== 'resident') {
      toast.error('Only user accounts can book a PG.');
      return;
    }

    // Build payload matching backend expectations
    const roomsBooked = 1;
    const guestName = user.name || user?.fullName || 'Guest';
    const guestEmail = user.email || '';
    const guestPhone = user.phone || '0000000000';

    const checkin = new Date(checkIn);
    
    // Calculate checkOutDate with realistic stay duration (30 days default)
    const defaultStayDays = 30;
    const checkOutDate = new Date(checkin);
    checkOutDate.setDate(checkOutDate.getDate() + defaultStayDays);

    const payload = {
      pgId: pg._id || pg.id,
      checkInDate: checkin.toISOString(),
      checkOutDate: checkOutDate.toISOString(),
      roomsBooked,
      guestName,
      guestEmail,
      guestPhone,
      specialRequirements: (specialReq && specialReq.trim()) ? specialReq.trim() : 'No special requirements'
    };

    console.log('BOOKING PAYLOAD:', payload);
    console.log('DEBUG - checkInDate:', checkin.toISOString(), 'checkOutDate:', checkOutDate.toISOString());

    setBookingLoading(true);
    try {
      const response = await bookPG(payload);
      // Prefer backend message if available
      const successText = response?.data?.message || 'Booking request sent successfully! Owner will contact you shortly.';
      toast.success(successText);
      setBookingSent(true);

      // Optional: update local demo store for immediate UI reflection
      try {
        const created = response?.data?.data?.booking;
        if (created) {
          console.log('Booking created:', created);
        }
      } catch (e) {
        // ignore local store errors
      }

    } catch (error) {
      // Log full backend response for debugging
      const resData = error.response?.data;
      console.error('Booking error response:', resData || error.message || error);

      // Try to extract messages from multiple possible shapes safely
      let message = resData?.message || resData?.error || error.message || 'Failed to send booking request. Please try again.';

      const errorsField = resData?.errors;
      console.log('LENGTH DEBUG - errorsField:', errorsField, 'type:', typeof errorsField, 'isArray:', Array.isArray(errorsField));
      if (Array.isArray(errorsField) && (errorsField?.length || 0) > 0) {
        console.log('LENGTH DEBUG - processing errors array with length:', errorsField.length);
        const parts = errorsField.map((e) => {
          if (!e) return null;
          // e may be { field, message } or { message } or a string
          if (typeof e === 'string') return e;
          const m = e.message || e.msg || e.error || Object.values(e).join(': ');
          return m;
        }).filter(Boolean);
        if ((parts?.length || 0) > 0) {
          console.log('LENGTH DEBUG - extracted parts:', parts);
          message = parts.join('; ');
        }
      } else if (errorsField && typeof errorsField === 'object') {
        // object with fields
        console.log('LENGTH DEBUG - processing errors object');
        const parts = Object.values(errorsField).map((v) => {
          if (Array.isArray(v)) return v.map((x) => x.message || x).join('; ');
          return v.message || v;
        }).filter(Boolean);
        if ((parts?.length || 0) > 0) {
          console.log('LENGTH DEBUG - extracted parts from object:', parts);
          message = parts.join('; ');
        }
      }

      toast.error(message);
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="bg-[#F9FAFB]">
      <Navbar />
      <section className="mx-auto max-w-7xl px-5 py-10 lg:px-8" data-testid={`pg-details-${pg?.id || 'loading'}`}>
        <button onClick={() => nav(-1)} className="text-sm font-semibold text-gray-500 hover:text-emerald-700" data-testid="back-btn">
          ← Back
        </button>

        {/* Gallery */}
        <div className="mt-4 grid gap-3 md:grid-cols-4 md:grid-rows-2">
          <div className="relative overflow-hidden rounded-2xl md:col-span-2 md:row-span-2">
            <img src={mainImage} alt={pg?.title || 'PG'} className="h-64 w-full object-cover md:h-full" data-testid="gallery-main" />
          </div>
          {(Array.isArray(pgImages) ? pgImages : []).slice(0, 4).map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`relative overflow-hidden rounded-2xl ${active === i ? "ring-2 ring-emerald-700 ring-offset-2" : ""}`}
              data-testid={`gallery-thumb-${i}`}
            >
              <img src={img} alt="" className="h-32 w-full object-cover md:h-full" />
            </button>
          ))}
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px]">
          <div>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800">{pg?.type || 'PG'}</span>
                  <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-semibold text-gray-700">{pg?.sharing || 'Not specified'}</span>
                </div>
                <h1 className="mt-3 font-heading text-3xl font-bold text-gray-900 lg:text-4xl" data-testid="pg-title">{pg?.title || 'Loading...'}</h1>
                <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4 text-emerald-700" /> {pg?.location || 'Location not available'}
                </div>
              </div>
              <div className="flex items-center gap-1 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm font-semibold text-gray-800">
                <Star className="h-4 w-4 fill-orange-400 text-orange-400" /> {pg?.rating || 'N/A'} <span className="text-gray-400">({pg?.reviews || '0'})</span>
              </div>
            </div>

            {/* Tabs */}
            <div className="mt-8 flex gap-6 border-b border-gray-200" data-testid="details-tabs">
              {[
                ["overview", "Overview"],
                ["amenities", "Amenities"],
                ["mess", "Mess Menu"],
                ["reviews", "Reviews"],
              ].map(([k, l]) => (
                <button
                  key={k}
                  onClick={() => setTab(k)}
                  className={`-mb-px border-b-2 px-1 pb-3 text-sm font-semibold transition ${
                    tab === k ? "border-emerald-700 text-emerald-700" : "border-transparent text-gray-500 hover:text-gray-800"
                  }`}
                  data-testid={`tab-${k}`}
                >
                  {l}
                </button>
              ))}
            </div>

            <div className="mt-6">
              {tab === "overview" && (
                <div className="space-y-5">
                  <p className="text-gray-700 leading-relaxed">{pg?.description || 'No description available'}</p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl border border-gray-100 bg-white p-5">
                      <div className="text-xs uppercase tracking-widest text-gray-400">Hosted by</div>
                      <div className="mt-1 font-heading text-lg font-semibold">{pg?.ownerName || 'Owner Name'}</div>
                      <div className="mt-1 text-sm text-gray-500">Verified owner · 4+ years on Mess Dekho</div>
                    </div>
                    <div className="rounded-2xl border border-gray-100 bg-white p-5">
                      <div className="text-xs uppercase tracking-widest text-gray-400">House rules</div>
                      <ul className="mt-2 space-y-1.5 text-sm text-gray-700">
                        <li>• No smoking indoors</li>
                        <li>• Guests allowed in common area till 9pm</li>
                        <li>• Quiet hours after 11pm</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
              {tab === "amenities" && (
                <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                  {(Array.isArray(pg?.facilities) ? pg.facilities : []).map((f) => {
                    console.log('LENGTH DEBUG - rendering facility:', f);
                    const Icon = FACILITY_ICONS[f] || Check;
                    return (
                      <div key={f} className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                          <Icon className="h-4 w-4" />
                        </div>
                        <span className="text-sm font-medium text-gray-800">{f}</span>
                      </div>
                    );
                  })}
                </div>
              )}
              {tab === "mess" && (
                <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
                  <table className="w-full text-sm">
                    <thead className="bg-emerald-50 text-emerald-800">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold">Meal</th>
                        <th className="px-4 py-3 text-left font-semibold">Monday</th>
                        <th className="px-4 py-3 text-left font-semibold">Wednesday</th>
                        <th className="px-4 py-3 text-left font-semibold">Sunday</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {[
                        ["Breakfast", "Poha & Chai", "Idli, Sambhar", "Chole Bhature"],
                        ["Lunch", "Dal, Roti, Sabzi", "Rajma Chawal", "Biryani, Raita"],
                        ["Dinner", "Paneer Curry, Roti", "Khichdi", "Pav Bhaji"],
                      ].map((row) => (
                        <tr key={row[0]}>
                          {row.map((c, i) => (
                            <td key={i} className={`px-4 py-3 ${i === 0 ? "font-semibold text-gray-800" : "text-gray-600"}`}>{c}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {tab === "reviews" && (
                <div className="space-y-4">
                  {[
                    { name: "Ramesh T.", rating: 5, text: "Food is incredible. Feels like home." },
                    { name: "Sneha K.", rating: 4, text: "Wi-Fi is very fast. Room is clean." },
                    { name: "Aditya M.", rating: 5, text: "Owner is super friendly and flexible." },
                  ].map((r, i) => (
                    <div key={i} className="rounded-2xl border border-gray-100 bg-white p-5">
                      <div className="flex items-center justify-between">
                        <div className="font-heading font-semibold">{r.name}</div>
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: r.rating }).map((_, j) => (
                            <Star key={j} className="h-4 w-4 fill-orange-400 text-orange-400" />
                          ))}
                        </div>
                      </div>
                      <p className="mt-2 text-sm text-gray-600">{r.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Booking card */}
          <aside className="h-fit rounded-2xl border border-gray-100 bg-white p-6 shadow-soft lg:sticky lg:top-24" data-testid="booking-card">
            <div className="flex items-end gap-2">
              <span className="font-heading text-3xl font-bold text-gray-900">₹{(pg?.price || 0).toLocaleString("en-IN")}</span>
              <span className="pb-1 text-sm text-gray-500">/ month</span>
            </div>
            {canBook ? (
              <>
                <div className="mt-4 space-y-3">
                  <label className="block">
                    <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-gray-500">
                      <Calendar className="h-3.5 w-3.5" /> Move-in
                    </div>
                    <input
                      type="date"
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/40"
                      data-testid="booking-checkin"
                    />
                  </label>
                </div>
                <label className="mt-4 block">
                  <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-gray-500">Special requirements</div>
                  <textarea
                    value={specialReq}
                    onChange={(e) => setSpecialReq(e.target.value)}
                    placeholder="Food preference, early move-in, AC room, etc."
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/40 min-h-[80px]"
                    data-testid="booking-special-req"
                  />
                </label>
                <div className="mt-5 space-y-2 border-t border-dashed border-gray-200 pt-4 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Monthly rent</span>
                    <span>₹{pricing?.monthlyRent?.toLocaleString("en-IN") || "0"}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Daily rent</span>
                    <span>₹{pricing?.dailyRent?.toLocaleString("en-IN") || "0"}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Stay duration</span>
                    <span>{pricing?.totalDays || "0"} days</span>
                  </div>
                  <div className="flex justify-between font-semibold text-gray-900">
                    <span>Stay price</span>
                    <span>₹{pricing?.stayPrice?.toLocaleString("en-IN") || "0"}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Refundable deposit</span>
                    <span>₹{pricing?.refundableDeposit?.toLocaleString("en-IN") || "1000"}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Brokerage</span>
                    <span className="text-emerald-700 font-semibold">₹0</span>
                  </div>
                  <div className="flex justify-between border-t border-dashed border-gray-200 pt-3 font-heading text-lg font-bold text-gray-900">
                    <span>Total payable</span>
                    <span>₹{pricing?.totalPrice?.toLocaleString("en-IN") || "0"}</span>
                  </div>
                </div>
                <button
                  onClick={handleBook}
                  disabled={bookingLoading || bookingSent}
                  className="mt-6 w-full rounded-full bg-emerald-700 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:opacity-60"
                  data-testid="book-now-btn"
                >
                  {bookingLoading ? 'Processing...' : bookingSent ? 'Booking Pending' : user ? 'Request to book' : 'Login to book'}
                </button>
                <p className="mt-3 text-center text-[11px] text-gray-400">You won't be charged yet</p>
              </>
            ) : (
              <div className="mt-4 rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
                Booking controls are hidden for admin users.
              </div>
            )}
          </aside>
        </div>
      </section>
      <Footer />
      <ExpertHelpWidget />
    </div>
  );
}
