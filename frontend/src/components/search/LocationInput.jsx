import { useEffect, useRef, useState } from "react";
import { Loader2, LocateFixed, MapPin } from "lucide-react";
import { CITIES } from "@/data/mockData";

/**
 * LocationInput
 * -----------------------------------------------------------
 * Text input with a "Near me" geolocation button.
 * - Shows inline suggestions from CITIES + dummy areas as the user types.
 * - "Near me" uses navigator.geolocation and resolves to a nearby city
 *   (mock resolver for frontend-only demo).
 */
const POPULAR_AREAS = [
  "Koramangala, Bengaluru",
  "HSR Layout, Bengaluru",
  "Powai, Mumbai",
  "Kothrud, Pune",
  "Adyar, Chennai",
  "Hauz Khas, Delhi",
  "Viman Nagar, Pune",
  "Gachibowli, Hyderabad",
];

export const LocationInput = ({ value, onChange, onFocusSection }) => {
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [locating, setLocating] = useState(false);
  const wrapRef = useRef(null);
  const textGlow = { textShadow: "0 1px 3px rgba(0,0,0,0.45)" };

  // close suggestions on outside click
  useEffect(() => {
    const h = (e) => wrapRef.current && !wrapRef.current.contains(e.target) && setSuggestOpen(false);
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const matches =
    ((value || "").trim().length > 0)
      ? [...CITIES, ...POPULAR_AREAS].filter((x) => x.toLowerCase().includes((value || "").toLowerCase())).slice(0, 6)
      : POPULAR_AREAS.slice(0, 6);

  const nearMe = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        // Mock reverse-geocode: pick nearest seeded city by longitude band.
        const lng = pos.coords.longitude;
        const city =
          lng < 74 ? "Mumbai" : lng < 77 ? "Pune" : lng < 78 ? "Bengaluru" : lng < 80 ? "Hyderabad" : "Chennai";
        onChange(city);
        setLocating(false);
      },
      () => {
        onChange("Bengaluru"); // graceful fallback
        setLocating(false);
      },
      { timeout: 6000 }
    );
  };

  return (
    <div ref={wrapRef} className="relative min-w-0 flex-[1.8_1_0%]" onFocus={onFocusSection}>
      <div className="flex min-w-0 items-center gap-2.5 rounded-xl bg-[rgba(0,0,0,0.35)] px-4 py-2.5">
        <MapPin className="h-4 w-4 flex-shrink-0 text-white/96" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setSuggestOpen(true)}
          placeholder="Search by city, PG, or area"
          className="w-full min-w-0 flex-1 bg-transparent pr-2 text-sm font-semibold text-[rgba(255,255,255,0.96)] placeholder:font-medium placeholder:text-white/100 outline-none"
          style={{ ...textGlow, opacity: 1 }}
          data-testid="sb-location-input"
        />
        <button
          type="button"
          onClick={nearMe}
          disabled={locating}
          className="flex shrink-0 items-center gap-1.5 rounded-full border border-white/30 bg-white/12 px-2.5 py-1.5 text-[11px] font-semibold text-white/95 transition hover:border-white/45 hover:bg-white/20 disabled:opacity-60 backdrop-blur"
          style={textGlow}
          data-testid="sb-near-me"
        >
          {locating ? <Loader2 className="h-3 w-3 animate-spin text-white" /> : <LocateFixed className="h-3 w-3 text-white/95" />}
          Near me
        </button>
      </div>

      {suggestOpen && (
        <div
          className="absolute left-0 right-0 top-full z-40 mt-2 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_20px_50px_rgba(4,120,87,0.12)] animate-fade-up"
          data-testid="sb-location-suggestions"
        >
          <div className="px-4 pb-1.5 pt-3 text-[10px] font-bold uppercase tracking-[0.22em] text-gray-400">
            {value ? "Matches" : "Popular"}
          </div>
          <ul className="max-h-64 overflow-y-auto">
            {matches.length === 0 ? (
              <li className="px-4 py-3 text-sm text-gray-500">No matches — try another area</li>
            ) : (
              matches.map((m) => (
                <li key={m}>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      onChange(m);
                      setSuggestOpen(false);
                    }}
                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-emerald-50"
                    data-testid={`sb-suggestion-${m.replace(/[\s,]+/g, "-")}`}
                  >
                    <MapPin className="h-3.5 w-3.5 text-gray-400" />
                    {m}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
};
