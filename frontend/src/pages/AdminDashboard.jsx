import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/DashboardLayout";
import { dataStore } from "@/context/AuthContext";
import { adminService } from "@/services/adminService";
import { getPGImageUrl } from "@/utils/pgImage";
import { BedDouble, Check, LayoutDashboard, MapPinned, Shield, Trash2, Users, X } from "lucide-react";

const MENU = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/homepage-cities", label: "Homepage Cities", icon: MapPinned },
];

export default function AdminDashboard() {
  const [pendingPGs, setPendingPGs] = useState([]);
  const [loadingPGs, setLoadingPGs] = useState(true);
  const [loadingError, setLoadingError] = useState("");
  const [tick, setTick] = useState(0);
  const navigate = useNavigate();

  const pgs = dataStore.getPGs();
  const users = dataStore.getUsers();
  const bookings = dataStore.getBookings();

  const loadPendingPGs = async () => {
    try {
      setLoadingPGs(true);
      setLoadingError("");
      console.log("Loading pending PGs...");
      const response = await adminService.getAllPGs({ status: "unapproved" });
      console.log("ADMIN API RESPONSE:", response.data);

      const pending = response?.data?.pgs || [];
      setPendingPGs(pending);
    } catch (error) {
      console.error("Frontend admin API error:", error);
      const message = error?.message || error?.response?.data?.message || "Failed to load pending PGs";
      setLoadingError(message);
      setPendingPGs([]);
    } finally {
      setLoadingPGs(false);
    }
  };

  useEffect(() => {
    loadPendingPGs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick]);

  const approve = async (pg) => {
    try {
      console.log(pg);
      await adminService.approvePG(pg._id);
      toast.success("PG approved and live");
      setPendingPGs((prev) => prev.filter((item) => item._id !== pg._id));
      setTick((t) => t + 1);
    } catch (error) {
      const message = error?.message || error?.response?.data?.message || "Failed to approve PG";
      toast.error(message);
    }
  };
  const reject = async (pg) => {
    try {
      console.log(pg);
      await adminService.rejectPG(pg._id);
      toast.success("PG rejected");
      setPendingPGs((prev) => prev.filter((item) => item._id !== pg._id));
      setTick((t) => t + 1);
    } catch (error) {
      const message = error?.message || error?.response?.data?.message || "Failed to reject PG";
      toast.error(message);
    }
  };
  const removeUser = (id) => {
    dataStore.deleteUser(id);
    setTick((t) => t + 1);
    toast.success("User removed");
  };

  return (
    <DashboardLayout
      title="Admin Command Center"
      subtitle="Keep the marketplace healthy — approve listings, manage users, and watch bookings flow."
      menu={MENU}
      testId="admin-dashboard"
    >
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4" data-testid="admin-stats">
        <Stat label="Total PGs" value={(Array.isArray(pgs) ? pgs : []).length} icon={BedDouble} tone="emerald" />
        <Stat label="Pending approvals" value={(Array.isArray(pendingPGs) ? pendingPGs : []).length} icon={Shield} tone="orange" />
        <Stat label="Total users" value={(Array.isArray(users) ? users : []).length} icon={Users} tone="emerald" />
        <Stat label="Total bookings" value={(Array.isArray(bookings) ? bookings : []).length} icon={LayoutDashboard} tone="orange" />
      </div>

      <h3 className="mt-10 font-heading text-xl font-semibold">Pending approvals</h3>
      {loadingError && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" data-testid="admin-pending-error">
          {loadingError}
        </div>
      )}
      <div className="mt-4 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-soft">
        <table className="w-full text-sm" data-testid="admin-pending-table">
          <thead className="bg-gray-50 text-xs uppercase tracking-widest text-gray-500">
            <tr>
              <th className="px-4 py-3 text-left">PG</th>
              <th className="px-4 py-3 text-left">Owner</th>
              <th className="px-4 py-3 text-left">City</th>
              <th className="px-4 py-3 text-left">Rent</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loadingPGs ? (
              <tr><td colSpan={5} className="p-10 text-center text-gray-500">Loading pending approvals...</td></tr>
            ) : (Array.isArray(pendingPGs) ? pendingPGs : []).length === 0 ? (
              <tr><td colSpan={5} className="p-10 text-center text-gray-500">All caught up! No pending approvals.</td></tr>
            ) : pendingPGs.map((p) => (
              <tr key={p._id} className="hover:bg-gray-50" data-testid={`pending-row-${p._id}`}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <img src={getPGImageUrl(p)} alt="" className="h-10 w-14 rounded-lg object-cover" />
                    <div className="font-semibold text-gray-900">{p.title}</div>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600">{p.ownerName}</td>
                <td className="px-4 py-3 text-gray-600">{p.city}</td>
                <td className="px-4 py-3 font-semibold text-gray-900">₹{p.price.toLocaleString("en-IN")}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => navigate(`/pg/${p._id}`)} className="flex items-center gap-1 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50" data-testid={`admin-view-${p._id}`}>
                      View Details
                    </button>
                    <button onClick={() => approve(p)} className="flex items-center gap-1 rounded-full bg-emerald-700 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-800" data-testid={`admin-approve-${p._id}`}>
                      <Check className="h-3 w-3" /> Approve
                    </button>
                    <button onClick={() => reject(p)} className="flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-100" data-testid={`admin-reject-${p._id}`}>
                      <X className="h-3 w-3" /> Reject
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className="mt-10 font-heading text-xl font-semibold">All users</h3>
      <div className="mt-4 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-soft">
        <table className="w-full text-sm" data-testid="admin-users-table">
          <thead className="bg-gray-50 text-xs uppercase tracking-widest text-gray-500">
            <tr>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Role</th>
              <th className="px-4 py-3 text-left">Joined</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50" data-testid={`user-row-${u.id}`}>
                <td className="px-4 py-3 font-semibold text-gray-900">{u.name}</td>
                <td className="px-4 py-3 text-gray-600">{u.email}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase ${
                    u.role === "admin" ? "bg-orange-50 text-orange-700" :
                    u.role === "owner" ? "bg-emerald-50 text-emerald-700" :
                    "bg-gray-100 text-gray-600"
                  }`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600">{u.createdAt}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end">
                    {u.role !== "admin" ? (
                      <button onClick={() => removeUser(u.id)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 text-red-600 hover:bg-red-50" data-testid={`admin-delete-user-${u.id}`}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}

const Stat = ({ label, value, icon: Icon, tone }) => (
  <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-soft">
    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${tone === "emerald" ? "bg-emerald-50 text-emerald-700" : "bg-orange-50 text-orange-700"}`}>
      <Icon className="h-5 w-5" />
    </div>
    <div className="mt-4 text-xs uppercase tracking-widest text-gray-400">{label}</div>
    <div className="mt-1 font-heading text-2xl font-bold text-gray-900">{value}</div>
  </div>
);
