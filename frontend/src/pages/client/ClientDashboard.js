import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getClientProjects } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const statusColors = { open: 'badge-open', listed: 'badge-listed', assigned: 'badge-assigned', completed: 'badge-completed', closed: 'badge-closed' };

export default function ClientDashboard() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getClientProjects().then((r) => setProjects(r.data.projects)).finally(() => setLoading(false));
  }, []);

  const stats = {
    total: projects.length,
    open: projects.filter((p) => p.status === 'open').length,
    active: projects.filter((p) => ['listed', 'assigned'].includes(p.status)).length,
    completed: projects.filter((p) => p.status === 'completed').length,
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Welcome back, {user?.username} 👋</h1>
          <p style={{ color: 'var(--text3)', marginTop: 4 }}>{user?.profile?.company_name || 'Client Dashboard'}</p>
        </div>
        <Link to="/client/projects/new" className="btn btn-primary">+ Post Project</Link>
      </div>

      <div className="stats-grid">
        <div className="stat-card"><div className="stat-value">{stats.total}</div><div className="stat-label">Total Projects</div></div>
        <div className="stat-card"><div className="stat-value" style={{ color: 'var(--green)' }}>{stats.open}</div><div className="stat-label">Open</div></div>
        <div className="stat-card"><div className="stat-value" style={{ color: 'var(--amber)' }}>{stats.active}</div><div className="stat-label">Active Auctions</div></div>
        <div className="stat-card"><div className="stat-value" style={{ color: 'var(--accent2)' }}>{stats.completed}</div><div className="stat-label">Completed</div></div>
      </div>

      <div className="card">
        <h2 style={{ marginBottom: 20, fontSize: 18 }}>Recent Projects</h2>
        {loading ? <div className="loader"><div className="spinner" /></div> : projects.length === 0 ? (
          <div className="empty"><h3>No projects yet</h3><p>Post your first project to start receiving bids.</p>
            <Link to="/client/projects/new" className="btn btn-primary" style={{ marginTop: 16 }}>Post a Project</Link></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Title</th><th>Budget</th><th>Deadline</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
                {projects.map((p) => (
                  <tr key={p.project_id}>
                    <td style={{ fontWeight: 500 }}>{p.title}</td>
                    <td style={{ color: 'var(--green)' }}>${p.budget.toLocaleString()}</td>
                    <td style={{ color: 'var(--text2)' }}>{new Date(p.deadline).toLocaleDateString()}</td>
                    <td><span className={`badge ${statusColors[p.status] || ''}`}>{p.status}</span></td>
                    <td>
                      <Link to={`/client/projects/${p.project_id}`} className="btn btn-secondary btn-sm">View</Link>
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
