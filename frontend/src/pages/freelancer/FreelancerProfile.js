import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { updateFreelancerProfile, getProfile } from '../../services/api';

export default function FreelancerProfile() {
  const { user } = useAuth();

  const [form, setForm] = useState({
    username: user?.username || '',
    skills: user?.profile?.skills || '',
    experience: user?.profile?.experience || 0,
  });
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg(''); setErr(''); setLoading(true);
    try {
      await updateFreelancerProfile(form);

      // Refresh user in context
      const res = await getProfile();
      localStorage.setItem('user', JSON.stringify(res.data.user));

      setMsg('Profile updated successfully!');
    } catch (e) {
      setErr(e.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page" style={{ maxWidth: 600 }}>
      <div className="page-header">
        <h1>My Profile</h1>
      </div>

      {/* Current profile info */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 24 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'var(--accent)', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              fontSize: 26, fontWeight: 700, color: '#fff',
              fontFamily: 'var(--font-head)'
            }}>
              {user?.username?.[0]?.toUpperCase()}
            </div>
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 18 }}>{user?.username}</div>
            <div style={{ color: 'var(--text3)', fontSize: 13, marginTop: 2 }}>{user?.email}</div>
            <div style={{ marginTop: 6, display: 'flex', gap: 16, fontSize: 13, color: 'var(--text2)' }}>
              <span>⭐ Rating: <strong>{user?.profile?.rating?.toFixed(1) || '0.0'}</strong></span>
              <span>🎓 Experience: <strong>{user?.profile?.experience || 0} yrs</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Edit form */}
      <div className="card">
        <h3 style={{ marginBottom: 20 }}>Edit Profile</h3>

        {msg && <div className="alert alert-success" style={{ marginBottom: 16 }}>{msg}</div>}
        {err && <div className="alert alert-error" style={{ marginBottom: 16 }}>{err}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label>Username</label>
            <input
              value={form.username}
              onChange={set('username')}
              placeholder="Your username"
              required
            />
          </div>

          <div className="form-group">
            <label>Skills</label>
            <input
              value={form.skills}
              onChange={set('skills')}
              placeholder="e.g. React, Node.js, Python, UI/UX..."
            />
            <span style={{ fontSize: 12, color: 'var(--text3)' }}>
              Separate skills with commas
            </span>
          </div>

          <div className="form-group">
            <label>Years of Experience</label>
            <input
              type="number"
              value={form.experience}
              onChange={set('experience')}
              min={0}
              max={50}
              placeholder="e.g. 3"
            />
          </div>

          <div style={{ padding: '12px 16px', background: 'var(--bg3)', borderRadius: 8, fontSize: 13, color: 'var(--text3)' }}>
            ⭐ Your rating (<strong style={{ color: 'var(--amber)' }}>{user?.profile?.rating?.toFixed(1) || '0.0'}</strong>) is set automatically based on client feedback and cannot be edited.
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
