import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PGCard } from "@/components/PGCard";
import { getPGs } from "@/api/pg";
import { ALL_FACILITIES, CITIES, PG_TYPES, SHARING_TYPES } from "@/data/mockData";
import { Filter, SlidersHorizontal, X } from "lucide-react";
import { toast } from "sonner";

export default function PGListing() {
  const [params, setParams] = useSearchParams();
  const initialCity = params.get("city") || "";
  const initialMax = Number(params.get("maxPrice")) || 20000;
  const initialType = params.get("type") || "";
  const qParam = (params.get("q") || "").trim();

  // If the free-text q matches a known city, seed the city filter.
  const seededCity = useMemo(() => {
    if (initialCity) return initialCity;
    const match = CITIES.find((c) => c.toLowerCase() === qParam.toLowerCase());
    return match || "";
  }, [initialCity, qParam]);

  const [city, setCity] = useState(seededCity);
  const [maxPrice, setMaxPrice] = useState(initialMax);
  const [type, setType] = useState(initialType);
  const [sharing, setSharing] = useState("");
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [pgs, setPGs] = useState([]);

  useEffect(() => {
    const fetchPGs = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await getPGs();
        console.log(response.data);
        console.log(response.data?.data?.pgs);
        setPGs(response.data?.data?.pgs || []);
      } catch (err) {
        const message = err.response?.data?.message || err.message || "Failed to load PGs";
        setError(message);
        toast.error(message);
        setPGs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPGs();
  }, []);

  useEffect(() => {
    const q = new URLSearchParams();
    if (city) q.set("city", city);
    if (maxPrice && maxPrice < 20000) q.set("maxPrice", String(maxPrice));
    if (type) q.set("type", type);
    if (qParam && !city) q.set("q", qParam);

    const nextQuery = q.toString();
    const currentQuery = params.toString();
    if (nextQuery !== currentQuery) {
      setParams(q, { replace: true });
    }
  }, [city, maxPrice, type, qParam, params, setParams]);

  const textMatch = (p) => {
    if (!qParam || city) return true;
    const hay = `${p.title} ${p.location} ${p.city}`.toLowerCase();
    return hay.includes(qParam.toLowerCase());
  };

  const filtered = pgs.filter((p) => {
    if (!textMatch(p)) return false;
    if (city && p.city !== city) return false;
    if (type && p.type !== type) return false;
    if (sharing && p.sharing !== sharing) return false;
    if (p.price > maxPrice) return false;
    if ((Array.isArray(facilities) ? facilities : []).length && !facilities.every((f) => (Array.isArray(p?.facilities) ? p.facilities : []).includes(f))) return false;
    return true;
  });

  const toggleFacility = (f) => {
    setFacilities((prev) => (prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]));
  };

  const clearAll = () => {
    setCity("");
    setMaxPrice(20000);
    setType("");
    setSharing("");
    setFacilities([]);
  };

  const FiltersBlock = () => (
    <div className="space-y-8">
      <div>
        <div className="flex items-center justify-between">
          <h4 className="font-heading text-sm font-bold uppercase tracking-[0.2em] text-emerald-700">Filters</h4>
          <button onClick={clearAll} className="text-xs font-semibold text-gray-500 hover:text-emerald-700" data-testid="filters-clear">
            Clear all
          </button>
        </div>
      </div>

      <div>
        <div className="mb-2 text-sm font-semibold text-gray-800">City</div>
        <select
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/40"
          data-testid="filter-city"
        >
          <option value="">All cities</option>
          {CITIES.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between text-sm font-semibold text-gray-800">
          <span>Max budget</span>
          <span className="text-emerald-700">₹{maxPrice.toLocaleString("en-IN")}</span>
        </div>
        <input
          type="range"
          min={5000}
          max={20000}
          step={500}
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full accent-emerald-700"
          data-testid="filter-budget-range"
        />
        <div className="mt-1 flex justify-between text-[11px] text-gray-500">
          <span>₹5k</span><span>₹20k</span>
        </div>
      </div>

      <div>
        <div className="mb-2 text-sm font-semibold text-gray-800">Type</div>
        <div className="flex flex-wrap gap-2">
          {PG_TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setType(type === t ? "" : t)}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                type === t
                  ? "border-emerald-700 bg-emerald-700 text-white"
                  : "border-gray-200 text-gray-700 hover:border-emerald-300"
              }`}
              data-testid={`filter-type-${t.replace(/\s+/g, "-").toLowerCase()}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-2 text-sm font-semibold text-gray-800">Sharing</div>
        <div className="flex flex-wrap gap-2">
          {SHARING_TYPES.map((s) => (
            <button
              key={s}
              onClick={() => setSharing(sharing === s ? "" : s)}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                sharing === s
                  ? "border-emerald-700 bg-emerald-700 text-white"
                  : "border-gray-200 text-gray-700 hover:border-emerald-300"
              }`}
              data-testid={`filter-sharing-${s.replace(/\s+/g, "-").toLowerCase()}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-2 text-sm font-semibold text-gray-800">Facilities</div>
        <div className="flex flex-wrap gap-2">
          {ALL_FACILITIES.map((f) => (
            <button
              key={f}
              onClick={() => toggleFacility(f)}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                facilities.includes(f)
                  ? "border-emerald-700 bg-emerald-50 text-emerald-800"
                  : "border-gray-200 text-gray-700 hover:border-emerald-300"
              }`}
              data-testid={`filter-facility-${f.replace(/\s+/g, "-").toLowerCase()}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-[#F9FAFB]">
      <Navbar />
      <section className="mx-auto max-w-7xl px-5 py-10 lg:px-8 lg:py-14">
        <div className="flex items-end justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-700">Stays</div>
            <h1 className="mt-2 font-heading text-3xl font-bold text-gray-900 lg:text-4xl" data-testid="listing-title">
              {city ? `PGs in ${city}` : "All PGs & Mess"}
            </h1>
            <p className="mt-1 text-sm text-gray-500" data-testid="listing-count">
              {(Array.isArray(filtered) ? filtered : []).length} result{(Array.isArray(filtered) ? filtered : []).length === 1 ? "" : "s"} found
            </p>
          </div>

          <button
            onClick={() => setShowMobileFilters(true)}
            className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 lg:hidden"
            data-testid="open-mobile-filters"
          >
            <SlidersHorizontal className="h-4 w-4" /> Filters
          </button>
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-[280px_1fr]">
          <aside className="hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-soft lg:block" data-testid="desktop-filters">
            <FiltersBlock />
          </aside>

          <div>
            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center" data-testid="listings-error">
                <div className="font-heading text-lg font-semibold text-red-900">Failed to load PGs</div>
                <p className="mt-2 text-sm text-red-700">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 rounded-full bg-red-700 px-5 py-2 text-sm font-semibold text-white"
                >
                  Retry
                </button>
              </div>
            )}
            {!error && loading ? (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3" data-testid="listings-loading">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="animate-pulse overflow-hidden rounded-2xl bg-white shadow-soft">
                    <div className="aspect-[4/3] bg-gray-200" />
                    <div className="space-y-3 p-5">
                      <div className="h-4 w-3/4 rounded bg-gray-200" />
                      <div className="h-3 w-1/2 rounded bg-gray-200" />
                      <div className="h-8 w-full rounded bg-gray-200" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (Array.isArray(filtered) ? filtered : []).length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white p-16 text-center" data-testid="listings-empty">
                <Filter className="h-10 w-10 text-emerald-700" />
                <div className="mt-4 font-heading text-xl font-semibold text-gray-900">No stays match your filters</div>
                <p className="mt-2 max-w-md text-sm text-gray-500">Try relaxing your budget or clearing city/facility filters to see more options.</p>
                <button onClick={clearAll} className="mt-5 rounded-full bg-emerald-700 px-5 py-2 text-sm font-semibold text-white">Clear filters</button>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3" data-testid="listings-grid">
                {filtered.map((pg, i) => (
                  <PGCard key={pg._id} pg={pg} index={i} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {showMobileFilters && (
        <div className="fixed inset-0 z-50 bg-black/40 lg:hidden" onClick={() => setShowMobileFilters(false)}>
          <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-white p-6" onClick={(e) => e.stopPropagation()} data-testid="mobile-filters">
            <div className="mb-4 flex items-center justify-between">
              <span className="font-heading text-lg font-bold">Filters</span>
              <button onClick={() => setShowMobileFilters(false)} data-testid="close-mobile-filters">
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>
            <FiltersBlock />
            <button
              onClick={() => setShowMobileFilters(false)}
              className="mt-6 w-full rounded-full bg-emerald-700 py-3 text-sm font-semibold text-white"
            >
              Show {(Array.isArray(filtered) ? filtered : []).length} results
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
