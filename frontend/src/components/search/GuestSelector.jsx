import { useEffect, useRef, useState } from "react";
import { Minus, Plus, Trash2, UserRound } from "lucide-react";

/**
 * GuestSelector
 * -----------------------------------------------------------
 * Opens a dropdown where the user can:
 *  - Increase/decrease Rooms & Guests for each room
 *  - Add another room (up to 5)
 *  - Delete any room (if more than 1)
 * Emits a normalized `{ rooms: number, guests: number }` summary upward.
 */
const clamp = (n, min, max) => Math.min(Math.max(n, min), max);

export const GuestSelector = ({ rooms, guests, onChange, onFocusSection }) => {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const textGlow = { textShadow: "0 1px 3px rgba(0,0,0,0.45)" };

  // Internal per-room guests breakdown (array of integers)
  const [roomGuests, setRoomGuests] = useState(() => {
    const arr = Array(rooms).fill(1);
    // distribute guests into rooms so total matches
    let remaining = Math.max(guests, rooms) - rooms;
    for (let i = 0; i < arr.length && remaining > 0; i++) {
      const add = Math.min(remaining, 3);
      arr[i] += add;
      remaining -= add;
    }
    return arr;
  });

  useEffect(() => {
    const h = (e) => wrapRef.current && !wrapRef.current.contains(e.target) && setOpen(false);
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  // Emit summary whenever roomGuests changes
  useEffect(() => {
    const totalRooms = roomGuests.length;
    const totalGuests = roomGuests.reduce((a, b) => a + b, 0);
    onChange({ rooms: totalRooms, guests: totalGuests });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomGuests]);

  const changeRoomGuests = (i, delta) =>
    setRoomGuests((prev) => prev.map((g, idx) => (idx === i ? clamp(g + delta, 1, 4) : g)));

  const addRoom = () =>
    setRoomGuests((prev) => (prev.length < 5 ? [...prev, 1] : prev));

  const removeRoom = (i) =>
    setRoomGuests((prev) => (prev.length > 1 ? prev.filter((_, idx) => idx !== i) : prev));

  const label = `${rooms} ${rooms === 1 ? "Room" : "Rooms"}, ${guests} ${guests === 1 ? "Guest" : "Guests"}`;

  return (
    <div className="relative z-[70]" ref={wrapRef}>
      <button
        type="button"
        onClick={() => {
          setOpen((v) => !v);
          onFocusSection?.();
        }}
        className="flex w-full items-center gap-2 px-4 py-2.5 text-left"
        data-testid="sb-guests-trigger"
      >
        <UserRound className="h-4 w-4 flex-shrink-0 text-white/90" />
        <div className="min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/80" style={textGlow}>
            Rooms & guests
          </div>
          <div className="truncate text-sm font-semibold text-white" style={textGlow}>
            {label}
          </div>
        </div>
      </button>

      {open && (
        <div
          className="absolute right-0 top-full z-[90] mt-2 w-[320px] overflow-visible rounded-2xl border border-gray-100 bg-white p-5 shadow-[0_25px_60px_rgba(4,120,87,0.18)] animate-fade-up"
          data-testid="sb-guests-popover"
        >
          <div className="space-y-4">
            {roomGuests.map((g, i) => (
              <div key={i} className="rounded-xl border border-gray-100 bg-gray-50/70 p-4" data-testid={`sb-room-${i}`}>
                <div className="flex items-center justify-between">
                  <div className="font-heading text-sm font-semibold text-gray-900">Room {i + 1}</div>
                  {roomGuests.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeRoom(i)}
                      className="flex items-center gap-1 rounded-full border border-red-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-red-600 hover:bg-red-50"
                      data-testid={`sb-remove-room-${i}`}
                    >
                      <Trash2 className="h-3 w-3" /> Remove
                    </button>
                  )}
                </div>
                <Counter
                  label="Guests"
                  value={g}
                  onDec={() => changeRoomGuests(i, -1)}
                  onInc={() => changeRoomGuests(i, 1)}
                  min={1}
                  max={4}
                  testPrefix={`sb-room-${i}`}
                />
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
            <button
              type="button"
              onClick={addRoom}
              disabled={roomGuests.length >= 5}
              className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 disabled:opacity-50"
              data-testid="sb-add-room"
            >
              <Plus className="h-3.5 w-3.5" /> Add room
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full bg-gray-900 px-4 py-1.5 text-xs font-semibold text-white hover:bg-gray-800"
              data-testid="sb-guests-done"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const Counter = ({ label, value, onInc, onDec, min, max, testPrefix }) => (
  <div className="mt-3 flex items-center justify-between">
    <div className="text-sm text-gray-700">{label}</div>
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={onDec}
        disabled={value <= min}
        className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 text-gray-700 transition hover:border-emerald-300 hover:text-emerald-700 disabled:opacity-40"
        data-testid={`${testPrefix}-dec`}
        aria-label="Decrease"
      >
        <Minus className="h-3 w-3" />
      </button>
      <div className="w-5 text-center text-sm font-semibold text-gray-900" data-testid={`${testPrefix}-value`}>
        {value}
      </div>
      <button
        type="button"
        onClick={onInc}
        disabled={value >= max}
        className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 text-gray-700 transition hover:border-emerald-300 hover:text-emerald-700 disabled:opacity-40"
        data-testid={`${testPrefix}-inc`}
        aria-label="Increase"
      >
        <Plus className="h-3 w-3" />
      </button>
    </div>
  </div>
);
