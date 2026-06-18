import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Search } from "lucide-react";
import { LocationInput } from "@/components/search/LocationInput";
import { DatePicker } from "@/components/search/DatePicker";
import { GuestSelector } from "@/components/search/GuestSelector";

/**
 * SearchBar
 * -----------------------------------------------------------
 * Composed, OYO-style horizontal search bar. Sections:
 *   Location  |  Stay dates  |  Rooms & Guests  |  [Search]
 * Highlights the active section (the one most recently focused).
 * Stacks vertically on small screens for mobile usability.
 *
 * On submit:
 *   1. Builds a query string with all collected values.
 *   2. Navigates to `/search?...` (which renders the PG Listing page).
 *   3. Also console.logs the full payload for debugging.
 */
export const SearchBar = () => {
  const nav = useNavigate();
  const [location, setLocation] = useState("");
  const [{ checkIn, checkOut }, setDates] = useState({ checkIn: null, checkOut: null });
  const [{ rooms, guests }, setRG] = useState({ rooms: 1, guests: 1 });
  const [active, setActive] = useState(null); // 'loc' | 'date' | 'guest'

  const focusCls = (key) => (active === key ? "ring-1 ring-white/15" : "hover:bg-white/5");

  const submit = (e) => {
    e.preventDefault();
    const payload = {
      location: location.trim(),
      checkIn: checkIn ? format(checkIn, "yyyy-MM-dd") : null,
      checkOut: checkOut ? format(checkOut, "yyyy-MM-dd") : null,
      rooms,
      guests,
    };
    // eslint-disable-next-line no-console
    console.log("[MessDekho] Search payload →", payload);

    const q = new URLSearchParams();
    if (payload.location) q.set("q", payload.location);
    if (payload.checkIn) q.set("checkIn", payload.checkIn);
    if (payload.checkOut) q.set("checkOut", payload.checkOut);
    q.set("rooms", String(rooms));
    q.set("guests", String(guests));
    nav(`/search?${q.toString()}`);
  };

  return (
    <form
      onSubmit={submit}
      className="w-full overflow-visible rounded-[24px] border border-white/30 bg-gradient-to-r from-[#0b252c]/97 via-[#103139]/99 to-[#0b252c]/97 p-1.5 shadow-[0_14px_42px_rgba(1,11,14,0.58),inset_0_1px_0_rgba(255,255,255,0.18)] transition-all duration-300 hover:border-white/42 hover:shadow-[0_20px_58px_rgba(1,11,14,0.64),inset_0_1px_0_rgba(255,255,255,0.24)]"
      data-testid="search-bar"
    >
      <div className="flex flex-col items-stretch divide-y divide-white/12 lg:flex-row lg:divide-x lg:divide-y-0">
        {/* 1. Location + Near me - WIDER */}
        <div
          className={`flex min-w-0 rounded-xl transition lg:basis-[40%] lg:flex-[1.8_1_0%] ${focusCls("loc")}`}
          onFocus={() => setActive("loc")}
          onClick={() => setActive("loc")}
        >
          <LocationInput
            value={location}
            onChange={setLocation}
            onFocusSection={() => setActive("loc")}
          />
        </div>

        {/* 2. Dates */}
        <div
          className={`min-w-0 rounded-xl transition lg:basis-[25%] lg:flex-[1.1_1_0%] ${focusCls("date")}`}
          onClick={() => setActive("date")}
        >
          <DatePicker
            checkIn={checkIn}
            checkOut={checkOut}
            onChange={setDates}
            onFocusSection={() => setActive("date")}
          />
        </div>

        {/* 3. Guests */}
        <div
          className={`min-w-0 rounded-xl transition lg:basis-[20%] lg:flex-[0.9_1_0%] ${focusCls("guest")}`}
          onClick={() => setActive("guest")}
        >
          <GuestSelector
            rooms={rooms}
            guests={guests}
            onChange={setRG}
            onFocusSection={() => setActive("guest")}
          />
        </div>

        {/* 4. Search */}
        <div className="flex min-w-0 items-stretch p-0.5 lg:basis-[15%] lg:flex-[0.7_1_0%] lg:p-0">
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-[20px] bg-gradient-to-b from-emerald-400 via-emerald-500 to-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_6px_18px_rgba(16,185,129,0.42),inset_0_1px_0_rgba(255,255,255,0.28)] transition duration-300 hover:from-emerald-500 hover:via-emerald-600 hover:to-emerald-700 hover:shadow-[0_10px_24px_rgba(16,185,129,0.52)] active:scale-[0.98] lg:rounded-l-none lg:rounded-r-[20px]"
            data-testid="search-bar-submit"
          >
            <Search className="h-4 w-4" /> Search
          </button>
        </div>
      </div>
    </form>
  );
};
