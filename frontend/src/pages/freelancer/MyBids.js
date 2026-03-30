import React, { useEffect, useState } from 'react';
import { getMyBids, deleteBid } from '../../services/api';

const statusColors = { pending: 'badge-pending', accepted: 'badge-accepted', rejected: 'badge-rejected' };

export default function MyBids() {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  const load = () => {
    getMyBids().then((r) => setBids(r.data.bids)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleWithdraw = async (bidId) => {
    if (!window.confirm('Withdraw this bid?')) return;
    try {
      await deleteBid(bidId);
      setMsg('Bid withdrawn.');
      load();
    } catch (e) { setMsg(e.response?.data?.message || 'Failed'); }
  };

  const totalEarning = bids.filter((b) => b.status === 'accepted').reduce((s, b) => s + b.bid_amount, 0);

  return (
    <div className="page">
      <div className="page-header"><h1>My Bids</h1></div>
      {msg && <div className="alert alert-success" style={{ marginBottom: 16 }}>{msg}</div>}

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
        <div className="stat-card"><div className="stat-value">{bids.length}</div><div className="stat-label">Total Bids</div></div>
        <div className="stat-card"><div className="stat-value" style={{ color: 'var(--amber)' }}>{bids.filter((b) => b.status === 'pending').length}</div><div className="stat-label">Pending</div></div>
        <div className="stat-card"><div className="stat-value" style={{ color: 'var(--green)' }}>{bids.filter((b) => b.status === 'accepted').length}</div><div className="stat-label">Won</div></div>
        <div className="stat-card"><div className="stat-value" style={{ color: 'var(--green)' }}>${totalEarning.toLocaleString()}</div><div className="stat-label">Total Earned</div></div>
      </div>

      <div className="card">
        {loading ? <div className="loader"><div className="spinner" /></div> : bids.length === 0 ? (
          <div className="empty"><h3>No bids yet</h3><p>Browse projects and start bidding.</p></div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {bids.map((b) => (
              <div key={b.bid_id} style={{ background: 'var(--bg3)', borderRadius: 10, padding: '16px 20px', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>{b.auction?.project?.title || 'Unknown Project'}</div>
                  <div style={{ fontSize: 13, color: 'var(--text3)' }}>
                    Deliver by: {new Date(b.delivery_time).toLocaleDateString()} · Submitted: {new Date(b.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: 'var(--green)', fontWeight: 700, fontSize: 18 }}>${b.bid_amount?.toLocaleString()}</div>
                    <div style={{ fontSize: 12, color: 'var(--accent2)' }}>Score: {b.score}/100</div>
                  </div>
                  <span className={`badge ${statusColors[b.status]}`}>{b.status}</span>
                  {b.status === 'pending' && (
                    <button className="btn btn-danger btn-sm" onClick={() => handleWithdraw(b.bid_id)}>Withdraw</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
