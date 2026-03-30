import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getClientProjects } from '../../services/api';

const statusColors = { open: 'badge-open', listed: 'badge-listed', assigned: 'badge-assigned', completed: 'badge-completed', closed: 'badge-closed' };

export default function ClientProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getClientProjects().then((r) => setProjects(r.data.projects)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="page">
      <div className="page-header">
        <h1>My Projects</h1>
        <Link to="/client/projects/new" className="btn btn-primary">+ Post Project</Link>
      </div>
      <div className="card">
        {loading ? <div className="loader"><div className="spinner" /></div> : projects.length === 0 ? (
          <div className="empty">
            <h3>No projects yet</h3>
            <p>Post a project to get started.</p>
            <Link to="/client/projects/new" className="btn btn-primary" style={{ marginTop: 16 }}>Post a Project</Link>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Title</th><th>Budget</th><th>Deadline</th><th>Status</th><th>Bids</th><th>Action</th></tr></thead>
              <tbody>
                {projects.map((p) => (
                  <tr key={p.project_id}>
                    <td style={{ fontWeight: 500, maxWidth: 220 }}>{p.title}</td>
                    <td style={{ color: 'var(--green)' }}>${p.budget.toLocaleString()}</td>
                    <td style={{ color: 'var(--text2)' }}>{new Date(p.deadline).toLocaleDateString()}</td>
                    <td><span className={`badge ${statusColors[p.status]}`}>{p.status}</span></td>
                    <td style={{ color: 'var(--text2)' }}>{p.auction ? 'Auction open' : '—'}</td>
                    <td><Link to={`/client/projects/${p.project_id}`} className="btn btn-secondary btn-sm">Manage</Link></td>
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
