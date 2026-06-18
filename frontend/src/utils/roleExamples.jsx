import { useUserRole } from '@/utils/role';

/**
 * Example 1: Conditional rendering based on role
 */
export function NavbarExample() {
  const { role, isUser, isOwner, isAdmin } = useUserRole();

  return (
    <nav className="flex gap-4">
      {/* Show for all authenticated users */}
      <a href="/listings">Browse PGs</a>

      {/* Only for residents (users) */}
      {isUser && <a href="/my-bookings">My Bookings</a>}

      {/* Only for PG owners */}
      {isOwner && <a href="/owner-dashboard">My PGs</a>}
      {isOwner && <a href="/owner-bookings">Booking Requests</a>}

      {/* Only for admins */}
      {isAdmin && <a href="/admin">Admin Panel</a>}
      {isAdmin && <a href="/admin/users">Manage Users</a>}
    </nav>
  );
}

/**
 * Example 2: Role-based UI components
 */
export function DashboardExample() {
  const { role, isUser, isOwner, isAdmin, isAuthenticated } = useUserRole();

  if (!isAuthenticated) {
    return <div>Please log in to continue</div>;
  }

  return (
    <div>
      {isUser && (
        <div className="user-dashboard">
          <h1>User Dashboard</h1>
          <div>Your bookings</div>
          <button>Browse PGs</button>
        </div>
      )}

      {isOwner && (
        <div className="owner-dashboard">
          <h1>Owner Dashboard</h1>
          <div>Your PG listings</div>
          <button>Add New PG</button>
          <button>View Booking Requests</button>
        </div>
      )}

      {isAdmin && (
        <div className="admin-dashboard">
          <h1>Admin Dashboard</h1>
          <div>System Statistics</div>
          <button>Manage Users</button>
          <button>Manage PGs</button>
          <button>View Reports</button>
        </div>
      )}
    </div>
  );
}

/**
 * Example 3: Feature visibility
 */
export function PGCardExample({ pg }) {
  const { isOwner, userId } = useUserRole();

  const isOwnPG = isOwner && pg.ownerId === userId;

  return (
    <div className="pg-card">
      <h3>{pg.title}</h3>
      <p>₹{pg.price}/month</p>

      {/* Show edit button only if owner of this PG */}
      {isOwnPG && (
        <div className="owner-actions">
          <button>Edit PG</button>
          <button>Delete PG</button>
        </div>
      )}

      {/* Show booking button for regular users */}
      {!isOwnPG && !isOwner && (
        <button>Book Now</button>
      )}
    </div>
  );
}

/**
 * Example 4: Role-based feature flags
 */
export function FeatureExample() {
  const { role } = useUserRole();

  // Feature flags by role
  const features = {
    user: ['browse-pg', 'make-booking', 'view-bookings', 'leave-review'],
    owner: ['list-pg', 'manage-pg', 'view-bookings', 'approve-bookings'],
    admin: ['manage-all', 'view-analytics', 'user-management', 'pg-moderation'],
  };

  const userFeatures = features[role] || [];

  return (
    <div>
      {userFeatures.includes('make-booking') && (
        <button>Make Booking</button>
      )}

      {userFeatures.includes('list-pg') && (
        <button>List Your PG</button>
      )}

      {userFeatures.includes('view-analytics') && (
        <button>View Analytics</button>
      )}
    </div>
  );
}

/**
 * Example 5: Sidebar navigation with roles
 */
export function SidebarExample() {
  const { isUser, isOwner, isAdmin } = useUserRole();

  const menuItems = [
    { label: 'Home', href: '/', show: true },
    { label: 'Browse PGs', href: '/listings', show: true },
    { label: 'My Bookings', href: '/my-bookings', show: isUser },
    { label: 'Owner Dashboard', href: '/owner', show: isOwner },
    { label: 'Add PG', href: '/owner/add-pg', show: isOwner },
    { label: 'Admin Panel', href: '/admin', show: isAdmin },
  ];

  return (
    <aside className="sidebar">
      <nav>
        {menuItems
          .filter(item => item.show)
          .map(item => (
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
      </nav>
    </aside>
  );
}

/**
 * Example 6: Token information display
 */
export function TokenDebugExample() {
  const { decodeToken, isTokenExpired, getToken } = require('@/utils/role');

  const token = getToken();
  const decoded = decodeToken(token);
  const expired = isTokenExpired(token);

  return (
    <div className="debug-info">
      <h4>Token Info (Debug)</h4>
      <p>Token: {token ? token.substring(0, 20) + '...' : 'None'}</p>
      <p>Expired: {expired ? 'Yes' : 'No'}</p>
      {decoded && (
        <pre>{JSON.stringify(decoded, null, 2)}</pre>
      )}
    </div>
  );
}
