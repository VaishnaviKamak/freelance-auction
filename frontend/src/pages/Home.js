import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user } = useAuth();

  const dashboardLink = user
    ? user.role === 'client' ? '/client/dashboard'
    : user.role === 'freelancer' ? '/freelancer/dashboard'
    : '/admin/dashboard'
    : null;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, textAlign: 'center' }}>
      <div style={{ maxWidth: 640 }}>
        <h1 style={{ fontSize: 52, fontFamily: 'var(--font-head)', letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: 20 }}>
          Freelance projects,<br />
          <span style={{ color: 'var(--accent2)' }}>won by best value.</span>
        </h1>
        <p style={{ fontSize: 18, color: 'var(--text2)', marginBottom: 36, lineHeight: 1.7 }}>
          BidForge is a reverse auction platform where freelancers compete by offering the best combination of price, speed, and reputation.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          {user ? (
            <Link to={dashboardLink} className="btn btn-primary" style={{ fontSize: 16, padding: '12px 28px' }}>
              Go to Dashboard →
            </Link>
          ) : (
            <>
              <Link to="/register" className="btn btn-primary" style={{ fontSize: 16, padding: '12px 28px' }}>Get Started</Link>
              <Link to="/login" className="btn btn-secondary" style={{ fontSize: 16, padding: '12px 28px' }}>Sign In</Link>
            </>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginTop: 60 }}>
          {[
            { icon: '📋', title: 'Post a Project', desc: 'Clients post with a budget ceiling and deadline.' },
            { icon: '🔨', title: 'Freelancers Bid', desc: 'Freelancers compete with lower prices and faster delivery.' },
            { icon: '🏆', title: 'Best Wins', desc: 'Smart scoring selects the best value bid automatically.' },
          ].map((f) => (
            <div key={f.title} className="card" style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>{f.icon}</div>
              <h3 style={{ marginBottom: 6, fontSize: 16 }}>{f.title}</h3>
              <p style={{ fontSize: 13, color: 'var(--text3)', lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
