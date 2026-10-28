import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { initials } from '../utils';

// Sidebar menu items per role
const menus = {
  hr: [
    { to: '/', icon: 'grid-1x2', label: 'Dashboard' },
    { to: '/employees', icon: 'people', label: 'Employees' },
    { to: '/leave-requests', icon: 'calendar2-check', label: 'Leave Requests' },
    { to: '/attendance-report', icon: 'clock-history', label: 'Attendance' },
    { to: '/announcements', icon: 'megaphone', label: 'Announcements' },
    { to: '/trainings', icon: 'mortarboard', label: 'Trainings' },
    { to: '/profile', icon: 'person-circle', label: 'My Profile' },
  ],
  manager: [
    { to: '/', icon: 'grid-1x2', label: 'Dashboard' },
    { to: '/team', icon: 'people', label: 'My Team' },
    { to: '/leave-requests', icon: 'calendar2-check', label: 'Team Leaves' },
    { to: '/attendance-report', icon: 'clock-history', label: 'Team Attendance' },
    { to: '/trainings', icon: 'mortarboard', label: 'Training Programs' },
    { to: '/attendance', icon: 'fingerprint', label: 'My Attendance' },
    { to: '/leaves', icon: 'calendar-plus', label: 'My Leaves' },
    { to: '/announcements', icon: 'megaphone', label: 'Announcements' },
    { to: '/profile', icon: 'person-circle', label: 'My Profile' },
  ],
  employee: [
    { to: '/', icon: 'grid-1x2', label: 'Dashboard' },
    { to: '/attendance', icon: 'fingerprint', label: 'Attendance' },
    { to: '/leaves', icon: 'calendar-plus', label: 'My Leaves' },
    { to: '/trainings', icon: 'mortarboard', label: 'My Trainings' },
    { to: '/announcements', icon: 'megaphone', label: 'Announcements' },
    { to: '/profile', icon: 'person-circle', label: 'My Profile' },
  ],
};

const roleLabel = { hr: 'HR Personnel', manager: 'Manager', employee: 'Employee' };

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-shell">
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="brand">
          <div className="brand-logo">S</div>
          <div>
            <div className="brand-name">StaffSync</div>
            <div className="brand-sub">HR Management</div>
          </div>
        </div>
        <nav className="nav-list">
          {menus[user.role].map((m) => (
            <NavLink key={m.to} to={m.to} end={m.to === '/'} className="nav-item-link" onClick={() => setOpen(false)}>
              <i className={`bi bi-${m.icon}`}></i>
              <span>{m.label}</span>
            </NavLink>
          ))}
        </nav>
        <button className="nav-item-link logout-btn" onClick={handleLogout}>
          <i className="bi bi-box-arrow-left"></i>
          <span>Logout</span>
        </button>
      </aside>
      {open && <div className="sidebar-overlay" onClick={() => setOpen(false)} />}

      <main className="main">
        <header className="topbar">
          <button className="btn btn-light d-lg-none" onClick={() => setOpen(true)}>
            <i className="bi bi-list fs-5"></i>
          </button>
          <div className="ms-auto d-flex align-items-center gap-3">
            <div className="text-end d-none d-sm-block">
              <div className="fw-semibold small">{user.name}</div>
              <div className="text-muted" style={{ fontSize: 12 }}>{roleLabel[user.role]}</div>
            </div>
            <div className="avatar">{initials(user.name)}</div>
          </div>
        </header>
        <div className="content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
