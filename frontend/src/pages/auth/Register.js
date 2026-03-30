import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '', role: 'client', company_name: '', skills: '', experience: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const user = await register(form);
      navigate(user.role === 'client' ? '/client/dashboard' : '/freelancer/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 480 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ fontSize: 32, fontFamily: 'var(--font-head)', color: 'var(--accent2)' }}>BidForge</h1>
          <p style={{ color: 'var(--text3)', marginTop: 6 }}>Create your account</p>
        </div>
        <div className="card">
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {error && <div className="alert alert-error">{error}</div>}
            <div className="form-group">
              <label>Username</label>
              <input value={form.username} onChange={set('username')} placeholder="johndoe" required />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={form.email} onChange={set('email')} placeholder="john@example.com" required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" value={form.password} onChange={set('password')} placeholder="Min 6 characters" required minLength={6} />
            </div>
            <div className="form-group">
              <label>I am a</label>
              <select value={form.role} onChange={set('role')}>
                <option value="client">Client — I want to post projects</option>
                <option value="freelancer">Freelancer — I want to bid on projects</option>
              </select>
            </div>
            {form.role === 'client' && (
              <div className="form-group">
                <label>Company Name (optional)</label>
                <input value={form.company_name} onChange={set('company_name')} placeholder="Acme Corp" />
              </div>
            )}
            {form.role === 'freelancer' && (
              <>
                <div className="form-group">
                  <label>Skills</label>
                  <input value={form.skills} onChange={set('skills')} placeholder="React, Node.js, Python..." />
                </div>
                <div className="form-group">
                  <label>Years of Experience</label>
                  <input type="number" value={form.experience} onChange={set('experience')} placeholder="3" min={0} />
                </div>
              </>
            )}
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: 4 }}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'var(--text3)' }}>
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
