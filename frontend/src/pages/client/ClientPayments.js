import React, { useEffect, useState } from 'react';
import { getMyPayments } from '../../services/api';

export default function ClientPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyPayments().then((r) => setPayments(r.data.payments)).finally(() => setLoading(false));
  }, []);

  const total = payments.filter((p) => p.status === 'completed').reduce((s, p) => s + p.amount, 0);

  return (
    <div className="page">
      <div className="page-header"><h1>Payment History</h1></div>
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
        <div className="stat-card"><div className="stat-value">{payments.length}</div><div className="stat-label">Total Payments</div></div>
        <div className="stat-card"><div className="stat-value" style={{ color: 'var(--green)' }}>${total.toLocaleString()}</div><div className="stat-label">Total Spent</div></div>
        <div className="stat-card"><div className="stat-value" style={{ color: 'var(--amber)' }}>{payments.filter((p) => p.status === 'pending').length}</div><div className="stat-label">Pending</div></div>
      </div>
      <div className="card">
        {loading ? <div className="loader"><div className="spinner" /></div> : payments.length === 0 ? (
          <div className="empty"><h3>No payments yet</h3></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Project</th><th>Amount</th><th>Status</th><th>Transaction ID</th><th>Date</th></tr></thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.payment_id}>
                    <td style={{ fontWeight: 500 }}>{p.project?.title || '—'}</td>
                    <td style={{ color: 'var(--green)', fontWeight: 600 }}>${p.amount.toLocaleString()}</td>
                    <td><span className={`badge badge-${p.status}`}>{p.status}</span></td>
                    <td style={{ fontSize: 12, color: 'var(--text3)', fontFamily: 'monospace' }}>{p.transaction_id}</td>
                    <td style={{ color: 'var(--text2)' }}>{new Date(p.created_at).toLocaleDateString()}</td>
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
