import React, { useEffect, useState } from 'react';
import { adminMonitorAuctions, closeAuction } from '../../services/api';

export default function AdminAuctions() {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  const load = () => {
    adminMonitorAuctions().then((r) => setAuctions(r.data.auctions)).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const handleClose = async (id) => {
    if (!window.confirm('Force close this auction?')) return;
    try { await closeAuction(id); setMsg('Auction closed.'); load(); }
    catch (e) { setMsg(e.response?.data?.message || 'Failed'); }
  };

  const statusColors = { open: 'badge-open', closed: 'badge-closed', cancelled: 'badge-rejected' };

  return (
    <div className="page">
      <div className="page-header"><h1>Monitor Auctions</h1><span style={{ color: 'var(--text3)' }}>{auctions.length} total</span></div>
      {msg && <div className="alert alert-success" style={{ marginBottom: 16 }}>{msg}</div>}

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="stat-card"><div className="stat-value" style={{ color: 'var(--green)' }}>{auctions.filter((a) => a.status === 'open').length}</div><div className="stat-label">Active</div></div>
        <div className="stat-card"><div className="stat-value" style={{ color: 'var(--text3)' }}>{auctions.filter((a) => a.status === 'closed').length}</div><div className="stat-label">Closed</div></div>
        <div className="stat-card"><div className="stat-value">{auctions.length}</div><div className="stat-label">Total</div></div>
      </div>

      <div className="card">
        {loading ? <div className="loader"><div className="spinner" /></div> : auctions.length === 0 ? (
          <div className="empty"><h3>No auctions yet</h3></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>#</th><th>Project</th><th>Start Time</th><th>End Time</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {auctions.map((a) => (
                  <tr key={a.auction_id}>
                    <td style={{ color: 'var(--text3)', fontSize: 12 }}>#{a.auction_id}</td>
                    <td style={{ fontWeight: 500 }}>{a.project?.title || '—'}</td>
                    <td style={{ color: 'var(--text2)', fontSize: 13 }}>{new Date(a.start_time).toLocaleString()}</td>
                    <td style={{ color: 'var(--text2)', fontSize: 13 }}>{new Date(a.end_time).toLocaleString()}</td>
                    <td><span className={`badge ${statusColors[a.status]}`}>{a.status}</span></td>
                    <td>
                      {a.status === 'open' && (
                        <button className="btn btn-danger btn-sm" onClick={() => handleClose(a.auction_id)}>Force Close</button>
                      )}
                    </td>
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
