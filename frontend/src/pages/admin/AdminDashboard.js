import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminGetStats } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminGetStats().then((r) => setStats(r.data.stats)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p style={{ color: 'var(--text3)', marginTop: 4 }}>Logged in as <strong style={{ color: 'var(--accent2)' }}>{user?.username}</strong></p>
        </div>
      </div>

      {loading ? <div className="loader"><div className="spinner" /></div> : (
        <>
          <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
            <div className="stat-card"><div className="stat-value">{stats.totalUsers}</div><div className="stat-label">Total Users</div></div>
            <div className="stat-card"><div className="stat-value" style={{ color: 'var(--accent2)' }}>{stats.totalProjects}</div><div className="stat-label">Total Projects</div></div>
            <div className="stat-card"><div className="stat-value" style={{ color: 'var(--amber)' }}>{stats.totalBids}</div><div className="stat-label">Total Bids</div></div>
            <div className="stat-card"><div className="stat-value" style={{ color: 'var(--green)' }}>{stats.totalPayments}</div><div className="stat-label">Payments</div></div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 28 }}>
            <div className="stat-card"><div className="stat-value" style={{ color: 'var(--green)' }}>{stats.openProjects}</div><div className="stat-label">Open Projects</div></div>
            <div className="stat-card"><div className="stat-value" style={{ color: 'var(--accent2)' }}>{stats.activeAuctions}</div><div className="stat-label">Active Auctions</div></div>
            <div className="stat-card"><div className="stat-value" style={{ color: 'var(--text2)' }}>{stats.completedProjects}</div><div className="stat-label">Completed</div></div>
          </div>
        </>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {[
          { to: '/admin/users', label: 'Manage Users', desc: 'View, update, or remove users', icon: '👤' },
          { to: '/admin/projects', label: 'All Projects', desc: 'Monitor all platform projects', icon: '📋' },
          { to: '/admin/auctions', label: 'Monitor Auctions', desc: 'Track all active auctions', icon: '🔨' },
        ].map((item) => (
          <Link key={item.to} to={item.to} style={{ textDecoration: 'none' }}>
            <div className="card" style={{ cursor: 'pointer', transition: 'border-color 0.2s, transform 0.2s' }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>{item.icon}</div>
              <h3 style={{ marginBottom: 6 }}>{item.label}</h3>
              <p style={{ fontSize: 13, color: 'var(--text3)' }}>{item.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
