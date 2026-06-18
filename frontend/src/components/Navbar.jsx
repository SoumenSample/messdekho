import { Link, NavLink, useNavigate } from "react-router-dom";
import { Home, LogOut, Menu, Search, UserCircle2, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

export const Navbar = () => {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const nav = useNavigate();
  const logoSrc = "/messdekho-logo.png";

  const dashHref =
    user?.role === "admin"
      ? "/admin"
      : user?.role === "owner"
        ? "/owner"
        : "/my-bookings";

  const handleLogout = () => {
    logout();
    setOpen(false);
    // DEBUG: suppress navigation on logout while debugging auth flow
    // nav("/");
    console.log("DEBUG: Navbar logout navigation suppressed");
  };

  return (
    <header
      className="glass-nav sticky top-0 z-50 border-b border-gray-200/70"
      data-testid="app-navbar"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
        <Link to="/" className="flex shrink-0 cursor-pointer items-center gap-2" data-testid="nav-logo-link">
          <img
            src={logoSrc}
            alt="MessDekho"
            className="h-10 w-auto max-w-none object-contain md:h-[30px]"
            loading="eager"
          />
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          <NavLink
            to="/listings"
            className={({ isActive }) =>
              `text-sm font-medium transition-colors ${isActive ? "text-emerald-700" : "text-gray-600 hover:text-emerald-700"}`
            }
            data-testid="nav-listings-link"
          >
            Browse PGs
          </NavLink>
          <NavLink
            to="/listings?city=Bengaluru"
            className="text-sm font-medium text-gray-600 hover:text-emerald-700"
            data-testid="nav-bengaluru-link"
          >
            Bengaluru
          </NavLink>
          <NavLink
            to="/listings?city=Mumbai"
            className="text-sm font-medium text-gray-600 hover:text-emerald-700"
            data-testid="nav-mumbai-link"
          >
            Mumbai
          </NavLink>
          <NavLink
            to="/listings?city=Pune"
            className="text-sm font-medium text-gray-600 hover:text-emerald-700"
            data-testid="nav-pune-link"
          >
            Pune
          </NavLink>
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              <Link
                to={dashHref}
                className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-100"
                data-testid="nav-dashboard-link"
              >
                <UserCircle2 className="h-4 w-4" />
                {user.name.split(" ")[0]}
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 rounded-full bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-800"
                data-testid="nav-logout-btn"
              >
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/auth"
                className="text-sm font-semibold text-gray-700 transition hover:text-emerald-700"
                data-testid="nav-login-link"
              >
                Login
              </Link>
              <Link
                to="/auth?mode=signup"
                className="rounded-full bg-emerald-700 px-5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800"
                data-testid="nav-signup-btn"
              >
                Sign up
              </Link>
            </>
          )}
        </div>

        <button
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 md:hidden"
          onClick={() => setOpen((v) => !v)}
          data-testid="nav-mobile-toggle"
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-gray-200 bg-white px-5 py-4 md:hidden" data-testid="mobile-menu">
          <div className="flex flex-col gap-3">
            <Link to="/listings" onClick={() => setOpen(false)} className="flex items-center gap-2 text-gray-700">
              <Search className="h-4 w-4" /> Browse PGs
            </Link>
            {user ? (
              <>
                <Link to={dashHref} onClick={() => setOpen(false)} className="text-gray-700">
                  Dashboard ({user.role})
                </Link>
                <button onClick={handleLogout} className="text-left text-gray-700">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/auth" onClick={() => setOpen(false)} className="text-gray-700">
                  Login
                </Link>
                <Link to="/auth?mode=signup" onClick={() => setOpen(false)} className="text-emerald-700 font-semibold">
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
