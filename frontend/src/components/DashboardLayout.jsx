import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { LogOut, Home as HomeIcon } from "lucide-react";

export const DashboardLayout = ({ title, subtitle, menu, children, testId }) => {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  return (
    <div className="min-h-screen bg-[#F9FAFB]" data-testid={testId}>
      <div className="mx-auto flex max-w-[1440px] gap-0 px-0 lg:px-6">
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-gray-200 bg-white p-6 md:block" data-testid="dash-sidebar">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-700 text-white">
              <HomeIcon className="h-5 w-5" />
            </div>
            <span className="font-heading text-lg font-bold text-gray-900">MessDekho</span>
          </div>
          <div className="mt-8">
            <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-400">
              {user?.role === "admin" ? "Admin Panel" : "Owner Panel"}
            </div>
            <nav className="mt-3 flex flex-col gap-1">
              {menu.map((m) => (
                <NavLink
                  key={m.to}
                  to={m.to}
                  end={m.end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                      isActive
                        ? "bg-emerald-50 text-emerald-800"
                        : "text-gray-600 hover:bg-gray-50"
                    }`
                  }
                  data-testid={`sidebar-link-${m.to.replace(/\//g, "-")}`}
                >
                  {m.icon && <m.icon className="h-4 w-4" />} {m.label}
                </NavLink>
              ))}
            </nav>
          </div>
          <div className="absolute bottom-6 left-6 right-6">
            <div className="flex items-center gap-3 rounded-xl border border-gray-200 p-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-800">
                {user?.name?.[0]?.toUpperCase() || "U"}
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="truncate text-sm font-semibold text-gray-900">{user?.name}</div>
                <div className="truncate text-xs text-gray-500">{user?.email}</div>
              </div>
              <button
                onClick={() => {
                  logout();
                  // DEBUG: navigation disabled to prevent redirect loop
                  // nav("/");
                  console.log("DEBUG: logout navigation suppressed");
                }}
                className="text-gray-400 hover:text-gray-800"
                title="Logout"
                data-testid="sidebar-logout-btn"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </aside>
        <main className="flex-1 px-5 py-8 lg:px-10">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="font-heading text-3xl font-bold text-gray-900 lg:text-4xl" data-testid="dash-title">{title}</h1>
              {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
            </div>
          </div>
          <div className="mt-8">{children}</div>
        </main>
      </div>
      {/* Mobile bottom nav */}
      <div className="fixed bottom-4 left-1/2 z-40 flex -translate-x-1/2 items-center gap-1 rounded-full border border-gray-200 bg-white/95 p-1.5 shadow-soft backdrop-blur md:hidden" data-testid="mobile-bottom-nav">
        {menu.map((m) => (
          <NavLink
            key={m.to}
            to={m.to}
            end={m.end}
            className={({ isActive }) =>
              `flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                isActive ? "bg-emerald-700 text-white" : "text-gray-600"
              }`
            }
          >
            {m.icon && <m.icon className="h-3.5 w-3.5" />} {m.label}
          </NavLink>
        ))}
      </div>
    </div>
  );
};
