import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { getToken } from "@/utils/token";

export const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  const loc = useLocation();
  const token = getToken();

  if (loading) {
    return null;
  }

  // Not logged in: redirect only when BOTH user and token are missing
  const noUser = !user;
  const noToken = !token;

  if (noUser && noToken) {
    return <Navigate to={`/auth?redirect=${encodeURIComponent(loc.pathname + loc.search)}`} replace />;
  }

  // Check role-based access if specified
  // If role-based access is required, ensure we have a user to check against
  if (roles) {
    if (!user) {
      return <Navigate to="/" replace />;
    }
    if (!roles.includes(user.role)) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
};
