import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createProject, createAuction } from '../../services/api';

export default function PostProject() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', description: '', budget: '', deadline: '', end_time: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      // createProject (class diagram method)
      const res = await createProject({ title: form.title, description: form.description, budget: parseFloat(form.budget), deadline: form.deadline });
      const project = res.data.project;

      // Immediately open an auction for this project (openAuction flow)
      if (form.end_time) {
        await createAuction({ project_id: project.project_id, start_time: new Date().toISOString(), end_time: new Date(form.end_time).toISOString() });
      }
      navigate('/client/projects');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post project');
    } finally { setLoading(false); }
  };

  // Min date for deadline inputs
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="page" style={{ maxWidth: 700 }}>
      <div className="page-header">
        <h1>Post a New Project</h1>
      </div>
      <div className="card">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {error && <div className="alert alert-error">{error}</div>}
          <div className="form-group">
            <label>Project Title</label>
            <input value={form.title} onChange={set('title')} placeholder="e.g. Build a React e-commerce website" required />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea value={form.description} onChange={set('description')} placeholder="Describe the project in detail..." rows={5} required style={{ resize: 'vertical' }} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Budget ($)</label>
              <input type="number" value={form.budget} onChange={set('budget')} placeholder="5000" min={1} required />
            </div>
            <div className="form-group">
              <label>Project Deadline</label>
              <input type="date" value={form.deadline} onChange={set('deadline')} min={today} required />
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20 }}>
            <h3 style={{ marginBottom: 4, fontSize: 16 }}>Auction Settings</h3>
            <p style={{ color: 'var(--text3)', fontSize: 13, marginBottom: 16 }}>Set when bidding closes. Leave blank to open the auction manually later.</p>
            <div className="form-group">
              <label>Auction End Date & Time (optional)</label>
              <input type="datetime-local" value={form.end_time} onChange={set('end_time')} min={new Date().toISOString().slice(0, 16)} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Posting...' : 'Post Project & Open Auction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
