import "@/App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Home from "@/pages/Home";
import PGListing from "@/pages/PGListing";
import PGDetails from "@/pages/PGDetails";
import Auth from "@/pages/Auth";
import MyBookings from "@/pages/MyBookings";
import OwnerDashboard from "@/pages/OwnerDashboard";
import OwnerAddEditPG from "@/pages/OwnerAddEditPG";
import OwnerBookings from "@/pages/OwnerBookings";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminHomepageCities from "@/pages/admin/AdminHomepageCities";
import Chat from "@/pages/Chat";
import Call from "@/pages/Call";
import SupportPage from "@/pages/SupportPage";

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <BrowserRouter>
          <Toaster position="top-right" richColors closeButton />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/listings" element={<PGListing />} />
            <Route path="/stays" element={<PGListing />} />
            <Route path="/search" element={<PGListing />} />
            <Route path="/pg/:id" element={<PGDetails />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/call" element={<Call />} />
            <Route path="/support" element={<SupportPage />} />
            <Route
              path="/my-bookings"
              element={
                <ProtectedRoute roles={["user"]}>
                  <MyBookings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/owner"
              element={
                <ProtectedRoute roles={["owner"]}>
                  <OwnerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/owner/add"
              element={
                <ProtectedRoute roles={["owner"]}>
                  <OwnerAddEditPG />
                </ProtectedRoute>
              }
            />
            <Route
              path="/owner/edit/:id"
              element={
                <ProtectedRoute roles={["owner"]}>
                  <OwnerAddEditPG />
                </ProtectedRoute>
              }
            />
            <Route
              path="/owner/bookings"
              element={
                <ProtectedRoute roles={["owner"]}>
                  <OwnerBookings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute roles={["admin"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute roles={["admin"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/homepage-cities"
              element={
                <ProtectedRoute roles={["admin"]}>
                  <AdminHomepageCities />
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </div>
  );
}

export default App;
