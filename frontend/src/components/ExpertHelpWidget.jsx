import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MessageCircle, Phone } from "lucide-react";

/**
 * ExpertHelpWidget
 * ------------------------------------------------------------
 * Floating "Get expert help" pill, fixed bottom-right.
 * - Desktop: opens dropdown on hover (pointer enter/leave) + click.
 * - Mobile : opens on tap, closes on outside tap.
 * - Blinking green online indicator (CSS keyframe animate-pulse).
 * - Dropdown options: Chat → /support, Call → /call.
 * - Accessible (aria-expanded, aria-haspopup, keyboard Esc to close).
 */
const AGENT_AVATAR =
  "https://images.pexels.com/photos/31868218/pexels-photo-31868218.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=100&w=100";

export const ExpertHelpWidget = () => {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);
  const closeTimerRef = useRef(null);
  const nav = useNavigate();

  const clearCloseTimer = () => {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const openPopup = () => {
    clearCloseTimer();
    setOpen(true);
  };

  const scheduleClosePopup = () => {
    clearCloseTimer();
    closeTimerRef.current = window.setTimeout(() => {
      setOpen(false);
      closeTimerRef.current = null;
    }, 120);
  };

  // Close on outside click / tap (mobile + desktop)
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [open]);

  useEffect(() => {
    return () => clearCloseTimer();
  }, []);

  // Close on Escape
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Handle chat or call action
  const handleChatClick = () => {
    setOpen(false);
    nav("/support");
  };

  const handleCallClick = () => {
    setOpen(false);
    nav("/call");
  };

  return (
    <div
      ref={wrapperRef}
      className="fixed bottom-20 right-5 z-[60] sm:bottom-24 sm:right-6"
      data-testid="expert-help-widget"
      onMouseEnter={openPopup}
      onMouseLeave={scheduleClosePopup}
    >
      {/* Dropdown (appears above the button) */}
      <motion.div
        className={`mb-3 w-56 origin-bottom-right overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_20px_60px_rgba(4,120,87,0.18)] ${
          open
            ? "pointer-events-auto"
            : "pointer-events-none"
        }`}
        role="menu"
        aria-hidden={!open}
        data-testid="expert-help-dropdown"
        initial={{ opacity: 0, scale: 0.95, y: 8 }}
        animate={open ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.95, y: 8 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        onMouseEnter={openPopup}
        onMouseLeave={scheduleClosePopup}
      >
        <div className="flex items-center gap-3 border-b border-gray-100 bg-emerald-50/60 px-4 py-3">
          <div className="relative">
            <img
              src={AGENT_AVATAR}
              alt="Support agent"
              className="h-9 w-9 rounded-full object-cover ring-2 ring-white"
            />
            <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
            </span>
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-900">AI · Support</div>
            <div className="text-[11px] font-medium text-emerald-700">Online · replies in ~30s</div>
          </div>
        </div>
        <button
          type="button"
          onClick={handleChatClick}
          role="menuitem"
          className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-gray-800 transition hover:bg-emerald-50 hover:text-emerald-800"
          data-testid="expert-help-chat"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <MessageCircle className="h-4 w-4" />
          </span>
          Start a chat
        </button>
        <button
          type="button"
          onClick={handleCallClick}
          role="menuitem"
          className="flex w-full items-center gap-3 border-t border-gray-100 px-4 py-3 text-left text-sm font-medium text-gray-800 transition hover:bg-orange-50 hover:text-orange-800"
          data-testid="expert-help-call"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-orange-700">
            <Phone className="h-4 w-4" />
          </span>
          Book a call
        </button>
      </motion.div>

      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        onMouseEnter={openPopup}
        onMouseLeave={scheduleClosePopup}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Get expert help"
        className="group flex items-center gap-3 rounded-full border border-gray-100 bg-white py-1.5 pl-1.5 pr-5 shadow-[0_12px_40px_rgba(4,120,87,0.18)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_50px_rgba(4,120,87,0.28)] active:translate-y-0"
        data-testid="expert-help-trigger"
      >
        <span className="relative">
          <img
            src={AGENT_AVATAR}
            alt=""
            className="h-10 w-10 rounded-full object-cover ring-2 ring-emerald-50"
          />
          {/* Blinking green online dot */}
          <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5" data-testid="online-dot">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500" />
          </span>
        </span>
        <span className="flex flex-col text-left">
          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700">
            24×7 support
          </span>
          <span className="text-sm font-semibold text-gray-900 group-hover:text-emerald-800">
            Get expert help
          </span>
        </span>
      </button>
    </div>
  );
};
