import { createContext, useContext, useEffect, useState } from "react";
import { SEED_BOOKINGS, SEED_PGS, SEED_USERS } from "@/data/mockData";

const AuthContext = createContext(null);

const STORAGE_KEYS = {
  users: "md_users",
  pgs: "md_pgs",
  bookings: "md_bookings",
  session: "md_session",
};

function safeParse(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEYS.users)) {
        localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(SEED_USERS));
      }
      if (!localStorage.getItem(STORAGE_KEYS.pgs)) {
        localStorage.setItem(STORAGE_KEYS.pgs, JSON.stringify(SEED_PGS));
      }
      if (!localStorage.getItem(STORAGE_KEYS.bookings)) {
        localStorage.setItem(STORAGE_KEYS.bookings, JSON.stringify(SEED_BOOKINGS));
      }
      // Prefer persisted full user object under 'user'
      const sess = safeParse(STORAGE_KEYS.session, null);
      if (sess) setUser(sess);
      else {
        // Backwards compatibility: try legacy md_session key
        const legacy = safeParse('md_session', null);
        if (legacy) setUser(legacy);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const setSessionUser = (sess) => {
    if (sess) {
      localStorage.setItem(STORAGE_KEYS.session, JSON.stringify(sess));
      setUser(sess);
    } else {
      localStorage.removeItem(STORAGE_KEYS.session);
      localStorage.removeItem('user');
      setUser(null);
    }
  };

  const login = (email, password) => {
    const users = safeParse(STORAGE_KEYS.users, []);
    const found = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (!found) return { ok: false, error: "Invalid email or password" };
    const sess = { id: found.id, name: found.name, email: found.email, role: found.role };
    localStorage.setItem(STORAGE_KEYS.session, JSON.stringify(sess));
    // Also keep `user` key for API-backed auth compatibility
    localStorage.setItem('user', JSON.stringify(sess));
    setUser(sess);
    return { ok: true, user: sess };
  };

  const signup = ({ name, email, password, role, phone }) => {
    const users = safeParse(STORAGE_KEYS.users, []);
    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      return { ok: false, error: "Email already registered" };
    }
    const newUser = {
      id: `${role}-${Date.now()}`,
      name,
      email,
      password,
      role,
      phone: phone || "",
      createdAt: new Date().toISOString().slice(0, 10),
    };
    const updated = [...users, newUser];
    localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(updated));
    const sess = { id: newUser.id, name, email, role };
    localStorage.setItem(STORAGE_KEYS.session, JSON.stringify(sess));
    localStorage.setItem('user', JSON.stringify(sess));
    setUser(sess);
    return { ok: true, user: sess };
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEYS.session);
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, setSessionUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

// Data helpers exported for pages
export const dataStore = {
  getPGs: () => safeParse(STORAGE_KEYS.pgs, []),
  setPGs: (pgs) => localStorage.setItem(STORAGE_KEYS.pgs, JSON.stringify(pgs)),
  addPG: (pg) => {
    const pgs = safeParse(STORAGE_KEYS.pgs, []);
    pgs.push(pg);
    localStorage.setItem(STORAGE_KEYS.pgs, JSON.stringify(pgs));
  },
  updatePG: (id, patch) => {
    const pgs = safeParse(STORAGE_KEYS.pgs, []);
    const idx = pgs.findIndex((p) => p.id === id);
    if (idx >= 0) {
      pgs[idx] = { ...pgs[idx], ...patch };
      localStorage.setItem(STORAGE_KEYS.pgs, JSON.stringify(pgs));
    }
  },
  deletePG: (id) => {
    const pgs = safeParse(STORAGE_KEYS.pgs, []).filter((p) => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.pgs, JSON.stringify(pgs));
  },
  getBookings: () => safeParse(STORAGE_KEYS.bookings, []),
  setBookings: (bs) => localStorage.setItem(STORAGE_KEYS.bookings, JSON.stringify(bs)),
  addBooking: (b) => {
    const bs = safeParse(STORAGE_KEYS.bookings, []);
    bs.push(b);
    localStorage.setItem(STORAGE_KEYS.bookings, JSON.stringify(bs));
  },
  updateBooking: (id, patch) => {
    const bs = safeParse(STORAGE_KEYS.bookings, []);
    const idx = bs.findIndex((b) => b.id === id);
    if (idx >= 0) {
      bs[idx] = { ...bs[idx], ...patch };
      localStorage.setItem(STORAGE_KEYS.bookings, JSON.stringify(bs));
    }
  },
  getUsers: () => safeParse(STORAGE_KEYS.users, []),
  deleteUser: (id) => {
    const us = safeParse(STORAGE_KEYS.users, []).filter((u) => u.id !== id);
    localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(us));
  },
};
