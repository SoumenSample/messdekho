# Mess Dekho — PRD

## Original Problem Statement
Build a modern responsive React frontend for a PG/Mess booking website called "Mess Dekho". OYO-inspired clean, minimal, card-based layout. Three user roles: User (customer), PG/Mess Owner, Admin. Delivered pages: Home with search + featured cards, PG Listing with filters, PG Details with gallery + book button, Login/Signup, My Bookings, Owner Dashboard + Add/Edit PG + Owner Bookings, Admin Dashboard with approvals + user management. Reusable components (Navbar, Footer, PG Card, Dashboard layout). Dummy data, React Router navigation.

## User Choices (from initial ask_human)
- Frontend only (no backend)
- Mock authentication via localStorage
- Design: modern fresh (teal/emerald theme)
- Images: Unsplash stock
- Single login with role-based access

## User Personas
1. **Resident (User)** — searches, compares, books PGs; views own bookings.
2. **PG Owner** — publishes PGs, manages listings, approves/rejects booking requests.
3. **Admin** — approves pending listings, manages all users.

## Architecture
- React 19 + React Router 7 + Tailwind CSS + Shadcn UI primitives + lucide-react icons
- `sonner` for toasts
- Mock auth + CRUD stored in `localStorage` (keys: `md_users`, `md_pgs`, `md_bookings`, `md_session`)
- Fonts: Outfit (headings), Manrope (body)
- Theme: Deep Emerald (#047857) primary, Warm Terracotta (#C2410C) accent

## Folder Structure
```
/app/frontend/src/
├── App.js                 # Routes + AuthProvider + Toaster
├── index.css              # Tailwind + fonts + utilities
├── context/
│   └── AuthContext.jsx    # login/signup/logout + dataStore helpers
├── data/
│   └── mockData.js        # seed PGs, users, bookings, facilities, cities
├── components/
│   ├── Navbar.jsx         # sticky glassmorphism nav
│   ├── Footer.jsx
│   ├── PGCard.jsx         # listing card
│   ├── DashboardLayout.jsx # sidebar + mobile bottom-nav
│   ├── ProtectedRoute.jsx  # role-gated route wrapper
│   └── ui/                # shadcn primitives (pre-installed)
└── pages/
    ├── Home.jsx
    ├── PGListing.jsx
    ├── PGDetails.jsx
    ├── Auth.jsx
    ├── MyBookings.jsx
    ├── OwnerDashboard.jsx
    ├── OwnerAddEditPG.jsx
    ├── OwnerBookings.jsx
    └── AdminDashboard.jsx
```

## Implemented (Feb 2026)
- [x] 9 pages with responsive layouts (mobile + desktop)
- [x] Reusable Navbar, Footer, PGCard, DashboardLayout, ProtectedRoute
- [x] Hero + search form with city/budget/type filters on Home
- [x] Featured PG grid + popular cities tiles on Home
- [x] PG Listing with sidebar filters (city, budget range, type, sharing, facilities) + mobile drawer
- [x] PG Details with image gallery, tabs (Overview/Amenities/Mess Menu/Reviews), sticky booking card
- [x] Login/Signup with role selector, form validation, demo credential hint
- [x] My Bookings list with status badges + cancel
- [x] Owner dashboard (stats + listings table, add/edit/delete)
- [x] Owner Bookings (approve/reject)
- [x] Admin dashboard (pending approvals + all users with delete)
- [x] Protected routes + role-based redirects
- [x] Loading skeletons, empty states, toasts
- [x] `data-testid` on all interactive elements
- [x] Testing agent: 21/21 functional checks pass

## Prioritized Backlog
### P1 (User-visible polish)
- Replace native `window.confirm` with shadcn AlertDialog for cancel/delete flows
- Unique imagery per city tile on Home
- Add search suggestions/autocomplete on Home hero
- Favorites / saved searches for residents
### P2 (Revenue & growth)
- Stripe-based deposit pre-auth for booking requests
- SEO pages per city/locality for organic traffic
- Owner onboarding wizard with photo upload (backend + object storage)
- Review submission form with photo upload (residents who stayed 30+ days)
### P3 (Backend migration)
- Migrate localStorage CRUD to FastAPI + MongoDB
- Real JWT auth + email/phone verification
- Admin seeding guarded by env variable

## Next Tasks
- Collect user feedback on the current look/flow
- Decide between P1 polish pass vs. full backend migration (P3)
