import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navLinks = {
  client: [
    { to: '/client/dashboard', label: 'Dashboard' },
    { to: '/client/projects', label: 'My Projects' },
    { to: '/client/payments', label: 'Payments' },
  ],
  freelancer: [
    { to: '/freelancer/dashboard', label: 'Dashboard' },
    { to: '/freelancer/projects', label: 'Browse Projects' },
    { to: '/freelancer/bids', label: 'My Bids' },
    { to: '/freelancer/profile', label: 'My Profile' },
  ],
  admin: [
    { to: '/admin/dashboard', label: 'Dashboard' },
    { to: '/admin/users', label: 'Users' },
    { to: '/admin/projects', label: 'Projects' },
    { to: '/admin/auctions', label: 'Auctions' },
  ],
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => { logout(); navigate('/login'); };

  const links = user ? navLinks[user.role] || [] : [];

  return (
    <nav style={{
      background: 'var(--bg2)', borderBottom: '1px solid var(--border)',
      padding: '0 32px', display: 'flex', alignItems: 'center',
      height: 60, gap: 32, position: 'sticky', top: 0, zIndex: 100,
    }}>
      <Link to="/" style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 18, color: 'var(--accent2)', letterSpacing: '-0.02em' }}>
        BidForge
      </Link>

      <div style={{ display: 'flex', gap: 4, flex: 1 }}>
        {links.map((l) => (
          <Link key={l.to} to={l.to} style={{
            padding: '6px 14px', borderRadius: 8, fontSize: 14, fontWeight: 500,
            color: location.pathname.startsWith(l.to) ? 'var(--accent2)' : 'var(--text2)',
            background: location.pathname.startsWith(l.to) ? 'var(--accent-glow)' : 'transparent',
            transition: 'all 0.15s',
          }}>
            {l.label}
          </Link>
        ))}
      </div>

      {user && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ fontSize: 13, color: 'var(--text3)' }}>
            <span style={{ color: 'var(--text2)', fontWeight: 500 }}>{user.username}</span>
            {' · '}
            <span style={{ color: 'var(--accent)', textTransform: 'capitalize' }}>{user.role}</span>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={handleLogout}>Logout</button>
        </div>
      )}
    </nav>
  );
}
