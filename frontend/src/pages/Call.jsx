import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Calendar, Clock, Phone, PhoneCall, ShieldCheck } from "lucide-react";
import { Navbar } from "@/components/Navbar";

const AGENT_AVATAR =
  "https://images.pexels.com/photos/31868218/pexels-photo-31868218.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=100&w=100";

const SLOTS = ["10:30 AM", "12:00 PM", "3:00 PM", "5:30 PM", "7:00 PM"];

export default function Call() {
  const [phone, setPhone] = useState("");
  const [when, setWhen] = useState(() => new Date(Date.now() + 86400000).toISOString().slice(0, 10));
  const [slot, setSlot] = useState(SLOTS[1]);
  const [submitted, setSubmitted] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    if (!/^[+\d][\d\s-]{7,}$/.test(phone)) {
      toast.error("Please enter a valid phone number");
      return;
    }
    setSubmitted(true);
    toast.success("Call scheduled — we'll ring you shortly");
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB]" data-testid="call-page">
      <Navbar />
      <section className="mx-auto max-w-5xl px-5 py-10 lg:px-8 lg:py-14">
        <Link to="/" className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>

        <div className="grid gap-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-soft lg:grid-cols-[1fr_1.1fr] lg:p-10">
          {/* Left: agent info */}
          <div className="flex flex-col justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-700">Talk to a specialist</div>
              <h1 className="mt-3 font-heading text-3xl font-bold text-gray-900 lg:text-4xl">
                Book a free 10-minute call
              </h1>
              <p className="mt-3 text-gray-600">
                Our in-house experts will shortlist 3 hand-picked PGs based on your budget, location and preferences — completely free.
              </p>
            </div>

            <div className="mt-6 flex items-center gap-4 rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4">
              <img src={AGENT_AVATAR} alt="" className="h-12 w-12 rounded-full object-cover ring-2 ring-white" />
              <div>
                <div className="font-heading font-semibold text-gray-900">Priya Sharma</div>
                <div className="text-xs text-gray-500">Senior Housing Consultant · 6+ yrs</div>
              </div>
              <div className="ml-auto flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" /> Online
              </div>
            </div>

            <ul className="mt-6 space-y-2.5 text-sm text-gray-700">
              <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-700" /> No brokerage, ever</li>
              <li className="flex items-center gap-2"><Clock className="h-4 w-4 text-emerald-700" /> Average response under 2 minutes</li>
              <li className="flex items-center gap-2"><PhoneCall className="h-4 w-4 text-emerald-700" /> Multilingual support (EN, HI, KN, MR)</li>
            </ul>
          </div>

          {/* Right: form */}
          {!submitted ? (
            <form onSubmit={submit} className="rounded-2xl border border-gray-100 bg-[#F9FAFB] p-6" data-testid="call-form">
              <div className="font-heading text-lg font-semibold text-gray-900">Schedule your call</div>
              <div className="mt-4 space-y-4">
                <label className="block">
                  <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-gray-500">
                    <Phone className="h-3.5 w-3.5" /> Phone number
                  </div>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/30"
                    data-testid="call-phone"
                  />
                </label>
                <label className="block">
                  <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-gray-500">
                    <Calendar className="h-3.5 w-3.5" /> Date
                  </div>
                  <input
                    type="date"
                    value={when}
                    onChange={(e) => setWhen(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/30"
                    data-testid="call-date"
                  />
                </label>
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-gray-500">
                    <Clock className="h-3.5 w-3.5" /> Time slot
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {SLOTS.map((s) => (
                      <button
                        type="button"
                        key={s}
                        onClick={() => setSlot(s)}
                        className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
                          slot === s
                            ? "border-emerald-700 bg-emerald-700 text-white"
                            : "border-gray-200 text-gray-700 hover:border-emerald-300"
                        }`}
                        data-testid={`call-slot-${s.replace(/\s+|:/g, "-")}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <button
                type="submit"
                className="mt-6 w-full rounded-full bg-emerald-700 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
                data-testid="call-submit"
              >
                Schedule call
              </button>
              <p className="mt-3 text-center text-[11px] text-gray-400">We'll never share your number with property owners.</p>
            </form>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-emerald-100 bg-emerald-50/40 p-10 text-center" data-testid="call-confirmation">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-700 text-white">
                <PhoneCall className="h-6 w-6" />
              </div>
              <div className="mt-5 font-heading text-2xl font-bold text-gray-900">You're on the list!</div>
              <p className="mt-2 max-w-sm text-sm text-gray-600">
                We'll call <span className="font-semibold text-gray-900">{phone}</span> on{" "}
                <span className="font-semibold text-gray-900">{when}</span> at{" "}
                <span className="font-semibold text-gray-900">{slot}</span>.
              </p>
              <Link
                to="/"
                className="mt-6 rounded-full bg-gray-900 px-5 py-2 text-sm font-semibold text-white hover:bg-gray-800"
              >
                Back to home
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
