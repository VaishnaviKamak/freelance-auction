import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyBids } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const bidStatusColors = { pending: 'badge-pending', accepted: 'badge-accepted', rejected: 'badge-rejected' };

export default function FreelancerDashboard() {
  const { user } = useAuth();
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyBids().then((r) => setBids(r.data.bids)).finally(() => setLoading(false));
  }, []);

  const stats = {
    total: bids.length,
    pending: bids.filter((b) => b.status === 'pending').length,
    accepted: bids.filter((b) => b.status === 'accepted').length,
    rejected: bids.filter((b) => b.status === 'rejected').length,
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Welcome back, {user?.username} 👋</h1>
          <p style={{ color: 'var(--text3)', marginTop: 4 }}>
            Skills: {user?.profile?.skills || 'Not set'} · Experience: {user?.profile?.experience || 0} yrs · Rating: {user?.profile?.rating?.toFixed(1) || '0.0'} ★
          </p>
        </div>
        <Link to="/freelancer/projects" className="btn btn-primary">Browse Projects</Link>
      </div>

      <div className="stats-grid">
        <div className="stat-card"><div className="stat-value">{stats.total}</div><div className="stat-label">Total Bids</div></div>
        <div className="stat-card"><div className="stat-value" style={{ color: 'var(--amber)' }}>{stats.pending}</div><div className="stat-label">Pending</div></div>
        <div className="stat-card"><div className="stat-value" style={{ color: 'var(--green)' }}>{stats.accepted}</div><div className="stat-label">Won</div></div>
        <div className="stat-card"><div className="stat-value" style={{ color: 'var(--text3)' }}>{stats.rejected}</div><div className="stat-label">Rejected</div></div>
      </div>

      <div className="card">
        <h2 style={{ marginBottom: 20, fontSize: 18 }}>Recent Bids</h2>
        {loading ? <div className="loader"><div className="spinner" /></div> : bids.length === 0 ? (
          <div className="empty">
            <h3>No bids yet</h3>
            <p>Browse available projects and submit your first bid.</p>
            <Link to="/freelancer/projects" className="btn btn-primary" style={{ marginTop: 16 }}>Browse Projects</Link>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Project</th><th>Bid Amount</th><th>Delivery</th><th>Score</th><th>Status</th></tr></thead>
              <tbody>
                {bids.slice(0, 8).map((b) => (
                  <tr key={b.bid_id}>
                    <td style={{ fontWeight: 500 }}>{b.auction?.project?.title || '—'}</td>
                    <td style={{ color: 'var(--green)', fontWeight: 600 }}>${b.bid_amount?.toLocaleString()}</td>
                    <td style={{ color: 'var(--text2)' }}>{new Date(b.delivery_time).toLocaleDateString()}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ height: 4, width: 60, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${b.score}%`, background: 'var(--accent)', borderRadius: 2 }} />
                        </div>
                        <span style={{ fontSize: 12, color: 'var(--text3)' }}>{b.score}</span>
                      </div>
                    </td>
                    <td><span className={`badge ${bidStatusColors[b.status]}`}>{b.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
