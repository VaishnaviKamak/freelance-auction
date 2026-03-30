import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProjects } from '../../services/api';

export default function BrowseProjects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    getProjects({ status: 'listed' })
      .then((r) => setProjects(r.data.projects))
      .finally(() => setLoading(false));
  }, []);

  const filtered = projects.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page">
      <div className="page-header">
        <h1>Browse Projects</h1>
        <span style={{ color: 'var(--text3)', fontSize: 14 }}>{filtered.length} open for bidding</span>
      </div>

      <div style={{ marginBottom: 20 }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search projects by title or description..."
          style={{ maxWidth: 420 }}
        />
      </div>

      {loading ? (
        <div className="loader"><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="empty"><h3>No projects available</h3><p>Check back later for new opportunities.</p></div>
      ) : (
        <div style={{ display: 'grid', gap: 16 }}>
          {filtered.map((p) => (
            <div key={p.project_id} className="card" style={{ cursor: 'pointer', transition: 'border-color 0.2s' }}
              onClick={() => navigate(`/freelancer/projects/${p.project_id}`)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <h3 style={{ fontSize: 17 }}>{p.title}</h3>
                    <span className="badge badge-listed">Open for Bids</span>
                  </div>
                  <p style={{ color: 'var(--text2)', fontSize: 14, lineHeight: 1.6, marginBottom: 12 }}>
                    {p.description.length > 200 ? p.description.slice(0, 200) + '…' : p.description}
                  </p>
                  <div style={{ display: 'flex', gap: 20, fontSize: 13, color: 'var(--text3)' }}>
                    <span>Posted by: <strong style={{ color: 'var(--text2)' }}>{p.client?.user?.username || '—'}</strong></span>
                    <span>Deadline: <strong style={{ color: 'var(--text2)' }}>{new Date(p.deadline).toLocaleDateString()}</strong></span>
                  </div>
                </div>
                <div style={{ textAlign: 'right', minWidth: 120, marginLeft: 20 }}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--green)', fontFamily: 'var(--font-head)' }}>
                    ${p.budget.toLocaleString()}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>Max budget</div>
                  <button className="btn btn-primary btn-sm" style={{ marginTop: 12 }}
                    onClick={(e) => { e.stopPropagation(); navigate(`/freelancer/projects/${p.project_id}`); }}>
                    View & Bid
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
