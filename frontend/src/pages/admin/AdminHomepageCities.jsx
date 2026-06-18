import { useEffect, useMemo, useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { homepageCityService } from '@/services/homepageCityService';
import { DEFAULT_HOMEPAGE_CITIES } from '@/data/homepageCities';
import { toast } from 'sonner';
import { ArrowDown, ArrowUp, Check, Edit3, EyeOff, Plus, RefreshCw, Trash2 } from 'lucide-react';

const MENU = [
  { to: '/admin', label: 'Overview' },
  { to: '/admin/users', label: 'Users' },
  { to: '/admin/homepage-cities', label: 'Homepage Cities', end: true }
];

const EMPTY_FORM = {
  cityName: '',
  slug: '',
  image: '',
  order: 0,
  isActive: true
};

const mapCity = (city, index = 0) => ({
  _id: city._id || city.id || `${city.slug || city.cityName}-${index}`,
  cityName: city.cityName || city.name || '',
  slug: city.slug || '',
  image: city.image || '',
  isActive: typeof city.isActive === 'boolean' ? city.isActive : true,
  order: Number(city.order ?? index + 1) || index + 1,
  createdAt: city.createdAt || null
});

const sortCities = (cities) =>
  [...cities].sort((a, b) => Number(a.order || 0) - Number(b.order || 0) || a.cityName.localeCompare(b.cityName));

export default function AdminHomepageCities() {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const sortedCities = useMemo(() => sortCities(cities), [cities]);

  const loadCities = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await homepageCityService.getHomepageCities({ all: true });
      const payloadCities = response?.data?.data?.cities || response?.data?.cities || [];
      const normalized = (Array.isArray(payloadCities) ? payloadCities : []).map(mapCity);
      setCities(normalized.length ? normalized : DEFAULT_HOMEPAGE_CITIES.map(mapCity));
    } catch (err) {
      const message = err?.message || err?.response?.data?.message || 'Failed to load homepage cities';
      setError(message);
      toast.error(message);
      setCities(DEFAULT_HOMEPAGE_CITIES.map(mapCity));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCities();
  }, []);

  const clearForm = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const beginEdit = (city) => {
    setEditingId(city._id);
    setForm({
      cityName: city.cityName,
      slug: city.slug,
      image: city.image,
      order: Number(city.order || 0),
      isActive: city.isActive !== false
    });
  };

  const saveCity = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      const payload = {
        cityName: form.cityName.trim(),
        slug: form.slug.trim(),
        image: form.image.trim(),
        order: Number(form.order || 0),
        isActive: !!form.isActive
      };

      if (!payload.cityName || !payload.slug || !payload.image) {
        toast.error('City name, slug, and image URL are required');
        return;
      }

      if (editingId) {
        await homepageCityService.updateHomepageCity(editingId, payload);
        toast.success('Homepage city updated');
      } else {
        await homepageCityService.createHomepageCity(payload);
        toast.success('Homepage city created');
      }

      await loadCities();
      clearForm();
    } catch (err) {
      const message = err?.message || err?.response?.data?.message || 'Failed to save city';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const deleteCity = async (city) => {
    if (!window.confirm(`Delete ${city.cityName}?`)) return;
    try {
      await homepageCityService.deleteHomepageCity(city._id);
      toast.success('Homepage city deleted');
      await loadCities();
      if (editingId === city._id) {
        clearForm();
      }
    } catch (err) {
      const message = err?.message || err?.response?.data?.message || 'Failed to delete city';
      toast.error(message);
    }
  };

  const toggleActive = async (city) => {
    try {
      await homepageCityService.updateHomepageCity(city._id, {
        isActive: !city.isActive,
        cityName: city.cityName,
        slug: city.slug,
        image: city.image,
        order: city.order
      });
      toast.success(city.isActive ? 'City disabled' : 'City enabled');
      await loadCities();
    } catch (err) {
      const message = err?.message || err?.response?.data?.message || 'Failed to update city';
      toast.error(message);
    }
  };

  const moveCity = async (city, direction) => {
    const currentIndex = sortedCities.findIndex((item) => item._id === city._id);
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const targetCity = sortedCities[targetIndex];

    if (!targetCity) return;

    try {
      await homepageCityService.updateHomepageCity(city._id, {
        cityName: city.cityName,
        slug: city.slug,
        image: city.image,
        isActive: city.isActive,
        order: targetCity.order
      });

      await homepageCityService.updateHomepageCity(targetCity._id, {
        cityName: targetCity.cityName,
        slug: targetCity.slug,
        image: targetCity.image,
        isActive: targetCity.isActive,
        order: city.order
      });

      await loadCities();
      toast.success('Order updated');
    } catch (err) {
      const message = err?.message || err?.response?.data?.message || 'Failed to reorder cities';
      toast.error(message);
    }
  };

  return (
    <DashboardLayout
      title="Homepage Cities"
      subtitle="Manage the Explore Top Cities carousel without changing the homepage UI."
      menu={MENU}
      testId="admin-homepage-cities"
    >
      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <form onSubmit={saveCity} className="rounded-3xl border border-gray-100 bg-white p-5 shadow-soft">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-700">
                {editingId ? 'Edit City' : 'Add City'}
              </div>
              <h2 className="mt-1 font-heading text-2xl font-bold text-gray-900">
                {editingId ? 'Update Homepage City' : 'Create Homepage City'}
              </h2>
            </div>
            <button
              type="button"
              onClick={loadCities}
              className="rounded-full border border-gray-200 bg-white p-2 text-gray-600 transition hover:bg-gray-50"
              title="Refresh"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-5 space-y-4">
            <Input label="City Name" value={form.cityName} onChange={(value) => setForm((prev) => ({ ...prev, cityName: value }))} placeholder="Mumbai" />
            <Input label="Slug" value={form.slug} onChange={(value) => setForm((prev) => ({ ...prev, slug: value }))} placeholder="mumbai" />
            <Input label="Image URL" value={form.image} onChange={(value) => setForm((prev) => ({ ...prev, image: value }))} placeholder="https://..." />
            <Input label="Order" type="number" value={form.order} onChange={(value) => setForm((prev) => ({ ...prev, order: value }))} placeholder="1" />

            <label className="flex items-center gap-3 rounded-2xl border border-gray-200 px-4 py-3">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))}
                className="h-4 w-4 accent-emerald-700"
              />
              <div>
                <div className="text-sm font-semibold text-gray-900">Active</div>
                <div className="text-xs text-gray-500">Inactive cities stay hidden on the homepage.</div>
              </div>
            </label>
          </div>

          <div className="mt-5 flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-emerald-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:opacity-60"
            >
              <Plus className="h-4 w-4" /> {saving ? 'Saving...' : editingId ? 'Update City' : 'Add City'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={clearForm}
                className="rounded-full border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Cancel
              </button>
            )}
          </div>

          {editingId && (
            <div className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              You are editing an existing homepage card.
            </div>
          )}
        </form>

        <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-soft">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-700">Current Cards</div>
              <h2 className="mt-1 font-heading text-2xl font-bold text-gray-900">Homepage City Cards</h2>
              <p className="mt-1 text-sm text-gray-500">These are the same cards shown on the homepage carousel.</p>
            </div>
            <div className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
              {sortedCities.length} cards
            </div>
          </div>

          {error && (
            <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="mt-5 overflow-hidden rounded-2xl border border-gray-100">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-widest text-gray-500">
                <tr>
                  <th className="px-4 py-3 text-left">City</th>
                  <th className="px-4 py-3 text-left">Slug</th>
                  <th className="px-4 py-3 text-left">Order</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-gray-500">Loading homepage cities...</td>
                  </tr>
                ) : sortedCities.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-gray-500">No homepage cities found.</td>
                  </tr>
                ) : (
                  sortedCities.map((city, index) => (
                    <tr key={city._id} className="align-top hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img src={city.image} alt={city.cityName} className="h-10 w-14 rounded-lg object-cover" />
                          <div>
                            <div className="font-semibold text-gray-900">{city.cityName}</div>
                            <div className="text-xs text-gray-500">{city.image}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{city.slug}</td>
                      <td className="px-4 py-3 font-semibold text-gray-900">{city.order}</td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => toggleActive(city)}
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase ${
                            city.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {city.isActive ? <Check className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                          {city.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => moveCity(city, 'up')}
                            className="rounded-full border border-gray-200 p-2 text-gray-600 transition hover:bg-gray-50 disabled:opacity-40"
                            disabled={index === 0}
                            title="Move up"
                          >
                            <ArrowUp className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveCity(city, 'down')}
                            className="rounded-full border border-gray-200 p-2 text-gray-600 transition hover:bg-gray-50 disabled:opacity-40"
                            disabled={index === sortedCities.length - 1}
                            title="Move down"
                          >
                            <ArrowDown className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => beginEdit(city)}
                            className="rounded-full border border-gray-200 p-2 text-gray-600 transition hover:bg-gray-50"
                            title="Edit"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteCity(city)}
                            className="rounded-full border border-red-200 p-2 text-red-600 transition hover:bg-red-50"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function Input({ label, value, onChange, placeholder, type = 'text' }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-gray-800">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(type === 'number' ? e.target.value : e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
      />
    </label>
  );
}
