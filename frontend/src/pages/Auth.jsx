import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { loginUser, registerUser } from "@/api/auth";
import { setToken } from "@/utils/token";
import { Home as HomeIcon, Mail, Lock, User as UserIcon, Phone, ArrowLeft } from "lucide-react";

const AUTH_HERO = "https://images.pexels.com/photos/6684600/pexels-photo-6684600.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940";
const SESSION_KEY = "md_session";

export default function Auth() {
  const [params] = useSearchParams();
  const nav = useNavigate();
  const { user, setSessionUser } = useAuth();
  const [mode, setMode] = useState(params.get("mode") === "signup" ? "signup" : "login");
  const [role, setRole] = useState(params.get("role") || "user");
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const redirect = params.get("redirect");

  useEffect(() => {
    if (user) {
      const target = redirect || (user.role === "admin" ? "/admin" : user.role === "owner" ? "/owner" : "/");
      // Navigate to the appropriate page after login (replace history)
      nav(target, { replace: true });
    }
  }, [user, redirect, nav]);

  const validate = () => {
    const e = {};
    if (mode === "signup" && !form.name.trim()) e.name = "Name is required";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Valid email required";
    if ((form.password || "").length < 6) e.password = "Min 6 characters";
    if (mode === "signup" && !form.phone.trim()) e.phone = "Phone is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = (evt) => {
    evt.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setSubmitError("");

    if (mode === "login") {
      loginUser({ email: form.email, password: form.password })
        .then((response) => {
          const { user: loggedInUser, token } = response.data?.data || {};

          console.log('🔐 [AUTH] Login response received:', {
            responseData: response.data?.data,
            user: loggedInUser,
            token: token ? token.substring(0, 20) + '...' : null
          });

          if (!token || !loggedInUser) {
            throw new Error("Unexpected login response");
          }

          console.log('💾 [AUTH] Saving token and session...', {
            role: loggedInUser.role,
            name: loggedInUser.name,
            email: loggedInUser.email
          });

          // Clear any legacy/stale auth keys first to avoid role/token mixups
          ['token', 'user', 'role', 'md_session'].forEach((k) => localStorage.removeItem(k));

          setToken(token);
          // Update auth context and persist session
          setSessionUser(loggedInUser);
          
          toast.success(`Welcome back, ${loggedInUser.name}!`);

          // Prefer role-based redirect when no explicit redirect provided or redirect is root
          const roleTarget = loggedInUser.role === "admin" ? "/admin" : loggedInUser.role === "owner" ? "/owner" : "/";
          const finalTarget = redirect && redirect !== "/" ? redirect : roleTarget;
          
          console.log('→ [AUTH] Redirecting to:', {
            finalTarget,
            reason: redirect && redirect !== "/" ? 'explicit redirect' : 'role-based'
          });
          
          // Use react-router navigation instead of full page reload
          nav(finalTarget, { replace: true });
        })
        .catch((error) => {
          const message =
            error.response?.data?.message ||
            error.response?.data?.error ||
            error.message ||
            "Login failed";
          setSubmitError(message);
          toast.error(message);
        })
        .finally(() => {
          setLoading(false);
        });
      return;
    }
    registerUser({
      name: form.name,
      email: form.email,
      password: form.password,
      phone: form.phone,
      role
    })
      .then((response) => {
        toast.success("Account created successfully! Redirecting to login...");
        setTimeout(() => {
          setMode("login");
          setForm({ name: "", email: "", password: "", phone: "" });
          setSubmitError("");
        }, 1500);
      })
      .catch((error) => {
        const message =
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "Signup failed. Please try again.";
        setSubmitError(message);
        toast.error(message);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB]" data-testid="auth-page">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* Left - visual */}
        <div className="relative hidden overflow-hidden lg:block">
          <img src={AUTH_HERO} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/80 via-emerald-800/60 to-emerald-900/90" />
          <div className="absolute inset-0 flex flex-col justify-between p-12">
            <Link to="/" className="flex items-center gap-2 text-white" data-testid="auth-logo-link">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
                <HomeIcon className="h-5 w-5" />
              </div>
              <span className="font-heading text-xl font-bold">MessDekho</span>
            </Link>
            <div className="max-w-md">
              <div className="text-xs font-bold uppercase tracking-[0.3em] text-orange-300">Trusted by 40k+ residents</div>
              <h2 className="mt-4 font-heading text-4xl font-bold leading-tight text-white">
                Your next PG is one login away.
              </h2>
              <p className="mt-4 text-emerald-100/90">
                Save favorites, get notified about price drops, and manage all your bookings in one place.
              </p>
            </div>
          </div>
        </div>

        {/* Right - form */}
        <div className="flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-md">
            <button onClick={() => nav("/")} className="mb-6 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800" data-testid="auth-back-btn">
              <ArrowLeft className="h-4 w-4" /> Back to home
            </button>
            <h1 className="font-heading text-3xl font-bold text-gray-900" data-testid="auth-title">
              {mode === "login" ? "Welcome back" : "Create your account"}
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              {mode === "login" ? "Log in to continue your search." : "Find homely PGs, mess services & more."}
            </p>

            {mode === "signup" && (
              <div className="mt-6 grid grid-cols-3 gap-2 rounded-full border border-gray-200 bg-white p-1" data-testid="role-selector">
                {[
                  ["user", "Resident"],
                  ["owner", "PG Owner"],
                  ["admin", "Admin"],
                ].map(([k, l]) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setRole(k)}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                      role === k ? "bg-emerald-700 text-white" : "text-gray-600"
                    }`}
                    data-testid={`role-option-${k}`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            )}

            <form onSubmit={submit} className="mt-6 space-y-4" data-testid="auth-form">
              {submitError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" data-testid="auth-error">
                  {submitError}
                </div>
              )}
              {mode === "signup" && (
                <Field
                  icon={UserIcon}
                  placeholder="Full name"
                  value={form.name}
                  onChange={(v) => setForm({ ...form, name: v })}
                  error={errors.name}
                  testId="auth-name"
                />
              )}
              <Field
                icon={Mail}
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={(v) => setForm({ ...form, email: v })}
                error={errors.email}
                testId="auth-email"
              />
              <Field
                icon={Lock}
                type="password"
                placeholder="Password"
                value={form.password}
                onChange={(v) => setForm({ ...form, password: v })}
                error={errors.password}
                testId="auth-password"
              />
              {mode === "signup" && (
                <Field
                  icon={Phone}
                  placeholder="Phone"
                  value={form.phone}
                  onChange={(v) => setForm({ ...form, phone: v })}
                  error={errors.phone}
                  testId="auth-phone"
                />
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-emerald-700 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:opacity-60"
                data-testid="auth-submit-btn"
              >
                {loading ? "Please wait…" : mode === "login" ? "Log in" : "Create account"}
              </button>
            </form>

            <div className="mt-5 text-center text-sm text-gray-500" data-testid="auth-toggle-section">
              {mode === "login" ? (
                <>Don't have an account?{" "}
                  <button onClick={() => setMode("signup")} className="font-semibold text-emerald-700 hover:underline" data-testid="to-signup">Sign up</button>
                </>
              ) : (
                <>Already have an account?{" "}
                  <button onClick={() => setMode("login")} className="font-semibold text-emerald-700 hover:underline" data-testid="to-login">Log in</button>
                </>
              )}
            </div>

            <div className="mt-8 rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/40 p-4 text-xs text-emerald-900" data-testid="demo-credentials">
              <div className="font-bold uppercase tracking-widest text-emerald-700">Demo accounts</div>
              <div className="mt-2 space-y-0.5">
                <div>Resident: <code>user@messdekho.com</code> / <code>password</code></div>
                <div>Owner: <code>owner@messdekho.com</code> / <code>password</code></div>
                <div>Admin: <code>admin@messdekho.com</code> / <code>password</code></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const Field = ({ icon: Icon, type = "text", placeholder, value, onChange, error, testId }) => (
  <div>
    <div className={`flex items-center gap-2 rounded-xl border bg-white px-3 py-2.5 ${error ? "border-red-300" : "border-gray-200 focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-500/30"}`}>
      <Icon className="h-4 w-4 text-gray-400" />
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
        data-testid={testId}
      />
    </div>
    {error && <p className="mt-1 text-xs text-red-500" data-testid={`${testId}-error`}>{error}</p>}
  </div>
);
