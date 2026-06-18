import { useEffect, useMemo, useRef, useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isAfter,
  isBefore,
  isSameDay,
  isSameMonth,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarDays, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";

/**
 * DatePicker (range)
 * -----------------------------------------------------------
 * Premium booking-style floating range calendar.
 * - Two months side by side on desktop, stacked on smaller screens.
 * - First click selects check-in, second click selects check-out.
 * - Past dates are disabled.
 * - Hover previews the current range while choosing check-out.
 */
export const DatePicker = ({ checkIn, checkOut, onChange, onFocusSection }) => {
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState(() => startOfMonth(checkIn || new Date()));
  const [phase, setPhase] = useState("in"); // in | out
  const [hoveredDay, setHoveredDay] = useState(null);
  const triggerRef = useRef(null);
  const popRef = useRef(null);
  const textGlow = { textShadow: "0 1px 3px rgba(0,0,0,0.45)" };

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;

    const onPointerDown = (event) => {
      const triggerNode = triggerRef.current;
      const popoverNode = popRef.current;
      const target = event.target;

      if (triggerNode?.contains(target) || popoverNode?.contains(target)) return;
      setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setCursor(startOfMonth(checkIn || new Date()));
    setHoveredDay(null);
    setPhase(checkIn && !checkOut ? "out" : "in");
  }, [checkIn, checkOut, open]);

  const today = startOfDay(new Date());

  const monthLabel = useMemo(() => {
    if (checkIn && checkOut) {
      return `${format(checkIn, "d MMM")} - ${format(checkOut, "d MMM")}`;
    }

    if (checkIn) {
      return `${format(checkIn, "d MMM")} · choose checkout`;
    }

    return "Select your stay dates";
  }, [checkIn, checkOut]);

  const popupMonths = useMemo(() => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      return [cursor];
    }

    return [cursor, addMonths(cursor, 1)];
  }, [cursor, open]);

  const previewEnd =
    !checkOut && phase === "out" && hoveredDay && checkIn && isAfter(hoveredDay, checkIn)
      ? hoveredDay
      : null;

  const pick = (day) => {
    if (isBefore(day, today)) return;
    if (phase === "in" || !checkIn || isBefore(day, checkIn)) {
      onChange({ checkIn: day, checkOut: null });
      setPhase("out");
      setHoveredDay(null);
    } else if (isSameDay(day, checkIn)) {
      onChange({ checkIn: day, checkOut: day });
      setPhase("in");
      setHoveredDay(null);
      setTimeout(() => setOpen(false), 120);
    } else {
      onChange({ checkIn, checkOut: day });
      setPhase("in");
      setHoveredDay(null);
      setTimeout(() => setOpen(false), 150);
    }
  };

  const monthGrid = (monthDate) => {
    const start = startOfWeek(startOfMonth(monthDate), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(monthDate), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  };

  const inRange = (d) => checkIn && checkOut && isAfter(d, checkIn) && isBefore(d, checkOut);
  const inPreview = (d) => checkIn && previewEnd && isAfter(d, checkIn) && isBefore(d, previewEnd);

  const moveMonth = (direction) => {
    setCursor((current) => {
      const nextMonth = addMonths(current, direction);
      const nextStart = startOfMonth(nextMonth);
      if (direction < 0 && isBefore(nextStart, startOfMonth(today))) {
        return startOfMonth(today);
      }
      return nextMonth;
    });
  };

  const handleTriggerClick = () => {
    setOpen((value) => !value);
    onFocusSection?.();
  };

  const popup = (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={popRef}
          role="dialog"
          aria-modal="true"
          aria-label="Stay dates calendar"
          className="absolute left-1/2 top-[calc(100%+8px)] z-[9999] w-[min(720px,90vw)] -translate-x-1/2 overflow-hidden rounded-[18px] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.985),rgba(249,250,251,0.965))] shadow-[0_18px_42px_rgba(15,23,42,0.14),0_3px_14px_rgba(16,185,129,0.08)] ring-1 ring-black/5 backdrop-blur-xl"
          initial={{ opacity: 0, y: 8, scale: 0.992 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 6, scale: 0.992 }}
          transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="relative overflow-hidden border-b border-slate-200/70 bg-white/82 px-3.5 py-3 sm:px-4 sm:py-3.5">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.18),transparent_35%),radial-gradient(circle_at_top_right,rgba(14,165,233,0.12),transparent_30%)]" />
              <div className="relative flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200/70 bg-emerald-50/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-700 sm:text-[11px]">
                    <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> Premium stay dates
                  </div>
                  <div className="mt-1.5 text-[13px] text-slate-600 sm:text-sm">Choose your check-in and check-out dates.</div>
                </div>

                <div className="rounded-[14px] border border-slate-200/70 bg-white/80 px-3 py-2.5 shadow-[0_6px_18px_rgba(15,23,42,0.05)] backdrop-blur-sm sm:px-4 sm:py-3">
                  <div className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">Selected</div>
                  <div className="mt-1 text-[13px] font-semibold text-slate-900 sm:text-sm">{monthLabel}</div>
                  {checkIn && checkOut && (
                    <div className="mt-1 text-[11px] text-emerald-700 sm:text-xs">
                      {Math.max(0, Math.round((checkOut - checkIn) / 86400000))} night(s)
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between px-3.5 pt-2.5 sm:px-4 sm:pt-3">
              <button
                type="button"
                onClick={() => moveMonth(-1)}
                disabled={isBefore(startOfMonth(addMonths(cursor, -1)), startOfMonth(today))}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200/80 bg-white text-slate-700 shadow-sm transition hover:border-emerald-300 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-30"
                data-testid="sb-cal-prev"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <div className="text-center">
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-700 sm:text-[11px]">
                  Flexible premium booking calendar
                </div>
              </div>

              <button
                type="button"
                onClick={() => moveMonth(1)}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200/80 bg-white text-slate-700 shadow-sm transition hover:border-emerald-300 hover:text-emerald-700"
                data-testid="sb-cal-next"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-[calc(100vh-190px)] overflow-auto px-3.5 pb-3.5 pt-2.5 sm:px-4 sm:pb-4 sm:pt-3">
              <div className="grid gap-3.5 lg:grid-cols-2 lg:gap-4">
                {popupMonths.map((monthDate, monthIndex) => (
                  <div
                    key={monthIndex}
                    className="rounded-[18px] border border-slate-200/80 bg-white/82 p-2.5 shadow-[0_8px_18px_rgba(15,23,42,0.045)] backdrop-blur-sm sm:p-3"
                  >
                    <div className="mb-2.5 flex items-center justify-center text-[0.95rem] font-semibold tracking-[-0.02em] text-slate-900 sm:text-[1rem]">
                      {format(monthDate, "MMMM yyyy")}
                    </div>

                    <div className="grid grid-cols-7 gap-0.5 text-center text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400 sm:gap-1 sm:text-[10px]">
                      {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((weekday) => (
                        <div key={weekday} className="pb-1 sm:pb-1.5">
                          {weekday}
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-7 gap-0.5 sm:gap-[3px]">
                      {monthGrid(monthDate).map((day) => {
                        const disabled = isBefore(day, today);
                        const isStart = checkIn && isSameDay(day, checkIn);
                        const isEnd = checkOut && isSameDay(day, checkOut);
                        const isMuted = !isSameMonth(day, monthDate);
                        const selectedRange = inRange(day);
                        const previewRange = inPreview(day);
                        const selected = isStart || isEnd;
                        const inFocusRange = selectedRange || previewRange;

                        return (
                          <button
                            key={day.toISOString()}
                            type="button"
                            onClick={() => pick(day)}
                            onMouseEnter={() => setHoveredDay(day)}
                            onMouseLeave={() => setHoveredDay(null)}
                            disabled={disabled}
                            data-testid={`sb-day-${format(day, "yyyy-MM-dd")}`}
                            className={`group relative flex aspect-square items-center justify-center rounded-lg text-[0.82rem] font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 sm:rounded-xl sm:text-[0.88rem] ${
                              disabled
                                ? "cursor-not-allowed text-slate-300"
                                : isMuted
                                  ? "text-slate-300 hover:bg-emerald-50/70 hover:text-slate-500"
                                  : "text-slate-700 hover:bg-emerald-50/80 hover:text-emerald-800"
                            } ${selected ? "z-10 text-white shadow-[0_10px_22px_rgba(16,185,129,0.38)]" : ""}`}
                          >
                            <span
                              className={`absolute inset-[3px] rounded-lg transition-all duration-200 sm:inset-1 sm:rounded-xl ${
                                selected
                                  ? "bg-[linear-gradient(135deg,#22c55e_0%,#16a34a_48%,#0f766e_100%)] shadow-[0_10px_28px_rgba(16,185,129,0.42),0_0_0_1px_rgba(255,255,255,0.2)]"
                                  : inFocusRange
                                    ? "bg-emerald-100/80"
                                    : "bg-transparent group-hover:bg-emerald-50/70"
                              } ${isStart ? "rounded-r-md" : ""} ${isEnd ? "rounded-l-md" : ""}`}
                              aria-hidden="true"
                            />
                            <span className="relative z-10">{format(day, "d")}</span>
                            {isSameDay(day, today) && !selected && (
                              <span
                                className="absolute bottom-1.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-emerald-500/70"
                                aria-hidden="true"
                              />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex flex-col gap-3 border-t border-slate-200/80 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-slate-500">
                  {checkIn && checkOut
                    ? `Stay duration: ${Math.max(0, Math.round((checkOut - checkIn) / 86400000))} night(s)`
                    : phase === "out"
                      ? "Pick a check-out date"
                      : "Select a check-in date"}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onChange({ checkIn: null, checkOut: null })}
                    className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-emerald-300 hover:text-emerald-700"
                    data-testid="sb-cal-clear"
                  >
                    Clear
                  </button>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="rounded-full bg-[linear-gradient(135deg,#22c55e_0%,#16a34a_55%,#0f766e_100%)] px-4 py-2 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(16,185,129,0.35)] transition hover:shadow-[0_16px_30px_rgba(16,185,129,0.42)]"
                    data-testid="sb-cal-done"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="relative z-[70]" ref={triggerRef}>
      <button
        type="button"
        onClick={handleTriggerClick}
        className="flex w-full items-center gap-2 px-4 py-2.5 text-left"
        data-testid="sb-dates-trigger"
      >
        <CalendarDays className="h-4 w-4 flex-shrink-0 text-white/90" />
        <div className="min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/80" style={textGlow}>
            Stay dates
          </div>
          <div
            className={`truncate text-sm font-semibold ${checkIn ? "text-white" : "text-white/82"}`}
            style={textGlow}
          >
            {monthLabel}
          </div>
        </div>
      </button>

      {popup}
    </div>
  );
};
