import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/DashboardLayout";
import { createPG } from "@/api/pg";
import { dataStore, useAuth } from "@/context/AuthContext";
import { ALL_FACILITIES, CITIES, PG_TYPES, SHARING_TYPES } from "@/data/mockData";
import { CalendarCheck, ImagePlus, LayoutDashboard, Plus, Save, X } from "lucide-react";

const MENU = [
  { to: "/owner", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/owner/add", label: "Add PG", icon: Plus },
  { to: "/owner/bookings", label: "Bookings", icon: CalendarCheck },
];

const DEFAULT_IMGS = [
  "https://images.pexels.com/photos/5137982/pexels-photo-5137982.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  "https://images.pexels.com/photos/8089071/pexels-photo-8089071.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  "https://images.pexels.com/photos/35165103/pexels-photo-35165103.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
];

export default function OwnerAddEditPG() {
  const { id } = useParams();
  const { user } = useAuth();
  const nav = useNavigate();
  const editing = useMemo(() => (id ? dataStore.getPGs().find((p) => p.id === id) : null), [id]);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState(
    editing || {
      title: "",
      city: "Bengaluru",
      location: "",
      price: 8000,
      type: "Boys PG",
      sharing: "Double Sharing",
      description: "",
      facilities: ["Wi-Fi", "Meals"],
      images: DEFAULT_IMGS.slice(0, 2),
    }
  );
  const [imgUrl, setImgUrl] = useState("");

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const toggleFacility = (f) =>
    set("facilities", form.facilities.includes(f) ? form.facilities.filter((x) => x !== f) : [...form.facilities, f]);

  const normalizeType = (type) => {
    if (type === "Boys PG" || type === "Girls PG") return "PG";
    if (type === "Co-living") return "Shared";
    return "PG";
  };

  const normalizeOccupancy = (sharing) => {
    if (sharing === "Single Room") return "Single";
    if (sharing === "Double Sharing") return "Double";
    if (sharing === "Triple Sharing") return "Triple";
    return "Single";
  };

  const normalizeFacilities = (facilities) => {
    const map = {
      "Wi-Fi": "Wifi",
      Meals: "Food",
      CCTV: "Security",
      "Study Room": "Desk",
      Laundry: "Laundry",
      Housekeeping: "Housekeeping",
      AC: "AC",
    };

    return facilities.map((facility) => map[facility]).filter(Boolean);
  };

  const addImage = () => {
    const defaultImgs = Array.isArray(DEFAULT_IMGS) ? DEFAULT_IMGS : ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80'];
    console.log('LENGTH DEBUG - defaultImgs:', defaultImgs?.length);
    if (!imgUrl.trim()) {
      set("images", [...(Array.isArray(form.images) ? form.images : []), defaultImgs[Math.floor(Math.random() * defaultImgs.length)]]);
    } else {
      set("images", [...(Array.isArray(form.images) ? form.images : []), imgUrl.trim()]);
      setImgUrl("");
    }
  };
  const removeImage = (i) => set("images", (Array.isArray(form.images) ? form.images : []).filter((_, idx) => idx !== i));

  const save = (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.location.trim() || (Array.isArray(form.images) ? form.images : []).length === 0) {
      console.log('LENGTH DEBUG - form.images:', form.images?.length, 'type:', typeof form.images, 'isArray:', Array.isArray(form.images));
      toast.error("Title, location and at least one image are required.");
      return;
    }

    if (editing) {
      dataStore.updatePG(editing.id, form);
      toast.success("PG updated");
      nav("/owner");
      return;
    }

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      location: form.location.trim(),
      city: form.city,
      address: form.location.trim(),
      roomsAvailable: 1,
      type: normalizeType(form.type),
      occupancy: normalizeOccupancy(form.sharing),
      facilities: normalizeFacilities(form.facilities),
      images: form.images,
    };

    console.log("IMAGE URL:", imgUrl);
    console.log("PG PAYLOAD:", payload);
    console.log("Creating PG...");
    console.log("PG payload:", payload);

    setSaving(true);
    createPG(payload)
      .then((response) => {
        console.log("PG API response:", response);

        const savedPg = response.data?.data?.pg;
        if (savedPg) {
          dataStore.addPG({
            ...form,
            id: savedPg._id || savedPg.id || `pg-${Date.now()}`,
            ownerId: user.id,
            ownerName: user.name,
            rating: savedPg.rating || 4.5,
            reviews: savedPg.reviewsCount || 0,
            isApproved: savedPg.isApproved,
            status: savedPg.isApproved ? "approved" : "pending",
            featured: false,
            images: (savedPg?.images && Array.isArray(savedPg.images) && savedPg.images.length > 0) ? savedPg.images : (Array.isArray(form.images) ? form.images : []),
            type: form.type,
            sharing: form.sharing,
          });
        }

        toast.success("PG submitted — pending admin approval");
        nav("/owner");
      })
      .catch((error) => {
        console.error("PG API error:", error);
        const message =
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "Failed to create PG";
        toast.error(message);
      })
      .finally(() => {
        setSaving(false);
      });
  };

  return (
    <DashboardLayout
      title={editing ? "Edit PG" : "Add a new PG"}
      subtitle="Tell us about your property. Quality photos & honest details get 3× more bookings."
      menu={MENU}
      testId="owner-add-edit-page"
    >
      <form onSubmit={save} className="space-y-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-soft lg:p-8" data-testid="pg-form">
        <Section title="Basic details">
          <div className="grid gap-5 md:grid-cols-2">
            <Input label="PG Title" value={form.title} onChange={(v) => set("title", v)} placeholder="e.g. Green Meadow Residency" testId="input-title" />
            <Input label="Locality" value={form.location} onChange={(v) => set("location", v)} placeholder="e.g. HSR Layout, Bengaluru" testId="input-location" />
            <Select label="City" value={form.city} onChange={(v) => set("city", v)} options={CITIES} testId="input-city" />
            <Select label="Type" value={form.type} onChange={(v) => set("type", v)} options={PG_TYPES} testId="input-type" />
          </div>
        </Section>

        <Section title="Pricing & sharing">
          <div className="grid gap-5 md:grid-cols-2">
            <Input
              label="Monthly rent (₹)"
              type="number"
              value={form.price}
              onChange={(v) => set("price", Number(v))}
              testId="input-price"
            />
            <Select label="Room sharing" value={form.sharing} onChange={(v) => set("sharing", v)} options={SHARING_TYPES} testId="input-sharing" />
          </div>
        </Section>

        <Section title="About the PG">
          <div>
            <label className="text-sm font-semibold text-gray-800">Description</label>
            <textarea
              rows={4}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Brief about amenities, food quality, nearby attractions…"
              className="mt-2 w-full rounded-xl border border-gray-200 bg-white p-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500/30"
              data-testid="input-description"
            />
          </div>
        </Section>

        <Section title="Facilities">
          <div className="flex flex-wrap gap-2">
            {ALL_FACILITIES.map((f) => (
              <button
                type="button"
                key={f}
                onClick={() => toggleFacility(f)}
                className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
                  form.facilities.includes(f)
                    ? "border-emerald-700 bg-emerald-700 text-white"
                    : "border-gray-200 text-gray-700 hover:border-emerald-300"
                }`}
                data-testid={`facility-chip-${f.replace(/\s+/g, "-").toLowerCase()}`}
              >
                {f}
              </button>
            ))}
          </div>
        </Section>

        <Section title="Images" hint="Paste an image URL or click Add to use a sample image.">
          <div className="flex gap-2">
            <input
              value={imgUrl}
              onChange={(e) => setImgUrl(e.target.value)}
              placeholder="https://..."
              className="flex-1 rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/30"
              data-testid="input-image-url"
            />
            <button type="button" onClick={addImage} className="inline-flex items-center gap-1.5 rounded-full bg-gray-900 px-4 py-2 text-sm font-semibold text-white" data-testid="btn-add-image">
              <ImagePlus className="h-4 w-4" /> Add
            </button>
          </div>
          {form.images.length > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4" data-testid="image-grid">
              {form.images.map((src, i) => (
                <div key={i} className="relative overflow-hidden rounded-xl border border-gray-100">
                  <img src={src} alt="" className="aspect-[4/3] w-full object-cover" />
                  <button type="button" onClick={() => removeImage(i)} className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/95 text-gray-700 hover:text-red-600">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Section>

        <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-6">
          <button type="button" onClick={() => nav("/owner")} className="rounded-full border border-gray-200 px-5 py-2 text-sm font-semibold text-gray-700">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-full bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60" data-testid="pg-form-submit">
            <Save className="h-4 w-4" /> {saving ? "Saving..." : editing ? "Save changes" : "Publish PG"}
          </button>
        </div>
      </form>
    </DashboardLayout>
  );
}

const Section = ({ title, hint, children }) => (
  <div>
    <div className="font-heading text-lg font-semibold text-gray-900">{title}</div>
    {hint && <p className="mt-0.5 text-xs text-gray-500">{hint}</p>}
    <div className="mt-4">{children}</div>
  </div>
);

const Input = ({ label, value, onChange, type = "text", placeholder, testId }) => (
  <label className="block">
    <div className="text-sm font-semibold text-gray-800">{label}</div>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/30"
      data-testid={testId}
    />
  </label>
);

const Select = ({ label, value, onChange, options, testId }) => (
  <label className="block">
    <div className="text-sm font-semibold text-gray-800">{label}</div>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/30"
      data-testid={testId}
    >
      {options.map((o) => <option key={o}>{o}</option>)}
    </select>
  </label>
);
