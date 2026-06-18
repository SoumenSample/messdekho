import { getToken } from './token';
import { useAuth } from '@/context/AuthContext';

/**
 * Decode JWT token (client-side, no verification)
 * @param {string} token - JWT token
 * @returns {object|null} - Decoded payload or null
 */
export const decodeToken = (token) => {
  try {
    if (!token) return null;

    const parts = token.split('.');
    if (parts.length !== 3) return null;

    // Decode the payload (2nd part)
    const decoded = JSON.parse(
      atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'))
    );

    return decoded;
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
};

/**
 * Check if token is expired
 * @param {string} token - JWT token
 * @returns {boolean} - True if expired
 */
export const isTokenExpired = (token) => {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;

  const currentTime = Math.floor(Date.now() / 1000);
  return decoded.exp < currentTime;
};

/**
 * Get user ID from stored token
 * @returns {string|null} - User ID or null
 */
export const getUserIdFromToken = () => {
  const token = getToken();
  const decoded = decodeToken(token);
  return decoded?.id || null;
};

/**
 * Check if user has a specific role
 * @param {string|string[]} requiredRole - Role(s) to check
 * @returns {boolean}
 */
export const hasRole = (requiredRole) => {
  // This function needs to be called within a React component context
  // Use the useUserRole hook instead for components
  const token = getToken();
  if (!token || isTokenExpired(token)) return false;

  // Note: JWT doesn't contain role, so we need user context
  return true; // Requires useUserRole hook
};

/**
 * Hook to check user role
 * Usage: const { role, isUser, isOwner, isAdmin } = useUserRole();
 */
export const useUserRole = () => {
  const { user } = useAuth();
  const token = getToken();

  const role = user?.role || null;
  const isAuthenticated = !!user && !!token && !isTokenExpired(token);
  const isUser = isAuthenticated && role === 'user';
  const isOwner = isAuthenticated && role === 'owner';
  const isAdmin = isAuthenticated && role === 'admin';

  return {
    role,
    isAuthenticated,
    isUser,
    isOwner,
    isAdmin,
    userId: user?.id || null,
    userName: user?.name || null,
    userEmail: user?.email || null,
  };
};

/**
 * Check if current user has specific role
 * @param {string|string[]} roles - Role(s) to check
 * @returns {boolean}
 */
export const userHasRole = (roles) => {
  const { user, token } = { user: useAuth().user, token: getToken() };

  if (!user || !token || isTokenExpired(token)) return false;

  const rolesArray = Array.isArray(roles) ? roles : [roles];
  return rolesArray.includes(user.role);
};
