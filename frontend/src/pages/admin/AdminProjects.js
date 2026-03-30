import React, { useEffect, useState } from 'react';
import { adminGetProjects } from '../../services/api';

const statusColors = { open: 'badge-open', listed: 'badge-listed', assigned: 'badge-assigned', completed: 'badge-completed', closed: 'badge-closed' };

export default function AdminProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    adminGetProjects().then((r) => setProjects(r.data.projects)).finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? projects : projects.filter((p) => p.status === filter);

  return (
    <div className="page">
      <div className="page-header">
        <h1>All Projects</h1>
        <span style={{ color: 'var(--text3)', fontSize: 14 }}>{projects.length} total</span>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {['all', 'open', 'listed', 'assigned', 'completed', 'closed'].map((s) => (
          <button key={s} className={`btn btn-sm ${filter === s ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter(s)} style={{ textTransform: 'capitalize' }}>
            {s}
          </button>
        ))}
      </div>

      <div className="card">
        {loading ? <div className="loader"><div className="spinner" /></div> : filtered.length === 0 ? (
          <div className="empty"><h3>No projects found</h3></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>#</th><th>Title</th><th>Client</th><th>Budget</th><th>Deadline</th><th>Status</th><th>Auction</th></tr></thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.project_id}>
                    <td style={{ color: 'var(--text3)', fontSize: 12 }}>#{p.project_id}</td>
                    <td style={{ fontWeight: 500, maxWidth: 200 }}>{p.title}</td>
                    <td style={{ color: 'var(--text2)', fontSize: 13 }}>{p.client?.user_id || '—'}</td>
                    <td style={{ color: 'var(--green)' }}>${p.budget?.toLocaleString()}</td>
                    <td style={{ color: 'var(--text2)', fontSize: 13 }}>{new Date(p.deadline).toLocaleDateString()}</td>
                    <td><span className={`badge ${statusColors[p.status]}`}>{p.status}</span></td>
                    <td style={{ fontSize: 13, color: 'var(--text3)' }}>
                      {p.auction ? <span className={`badge badge-${p.auction.status}`}>{p.auction.status}</span> : '—'}
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
