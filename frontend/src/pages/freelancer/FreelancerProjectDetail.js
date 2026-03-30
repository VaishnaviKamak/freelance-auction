import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProject, submitBid, getBidsByAuction, getFreelancerFeedbacks } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

function Stars({ value }) {
  return (
    <span style={{ color: 'var(--amber)' }}>{'★'.repeat(Math.round(value || 0))}{'☆'.repeat(5 - Math.round(value || 0))}</span>
  );
}

export default function FreelancerProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [bids, setBids] = useState([]);
  const [myBid, setMyBid] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bidForm, setBidForm] = useState({ bid_amount: '', delivery_time: '' });
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    try {
      const res = await getProject(id);
      setProject(res.data.project);
      if (res.data.project.auction) {
        const bRes = await getBidsByAuction(res.data.project.auction.auction_id);
        const allBids = bRes.data.bids;
        setBids(allBids);
        const mine = allBids.find((b) => b.freelancer?.user_id === user?.user_id);
        setMyBid(mine || null);
      }
      if (res.data.project.assigned_freelancer_id) {
        const fRes = await getFreelancerFeedbacks(res.data.project.assigned_freelancer_id);
        setFeedbacks(fRes.data.feedbacks.slice(0, 3));
      }
    } catch (e) {
      setErr('Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const handleSubmitBid = async (e) => {
    e.preventDefault();
    setErr(''); setMsg(''); setSubmitting(true);
    try {
      await submitBid({
        auction_id: project.auction.auction_id,
        bid_amount: parseFloat(bidForm.bid_amount),
        delivery_time: new Date(bidForm.delivery_time).toISOString(),
      });
      setMsg('Bid submitted successfully!');
      setBidForm({ bid_amount: '', delivery_time: '' });
      load();
    } catch (e) {
      setErr(e.response?.data?.message || 'Failed to submit bid');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loader"><div className="spinner" /></div>;
  if (!project) return <div className="page"><div className="alert alert-error">{err || 'Not found'}</div></div>;

  const canBid = project.auction?.status === 'open' && !myBid && project.status === 'listed';
  const minDate = new Date().toISOString().slice(0, 16);

  return (
    <div className="page">
      {msg && <div className="alert alert-success" style={{ marginBottom: 16 }}>{msg}</div>}
      {err && <div className="alert alert-error" style={{ marginBottom: 16 }}>{err}</div>}

      <div className="page-header">
        <div>
          <h1 style={{ fontSize: 24 }}>{project.title}</h1>
          <p style={{ color: 'var(--text3)', marginTop: 4, fontSize: 14 }}>
            Posted by {project.client?.user?.username} · Deadline {new Date(project.deadline).toLocaleDateString()}
          </p>
        </div>
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>← Back</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Project details */}
          <div className="card">
            <div style={{ display: 'flex', gap: 24, marginBottom: 20 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--green)', fontFamily: 'var(--font-head)' }}>${project.budget.toLocaleString()}</div>
                <div style={{ fontSize: 12, color: 'var(--text3)' }}>Max Budget</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 600, color: 'var(--accent2)', fontFamily: 'var(--font-head)' }}>{bids.length}</div>
                <div style={{ fontSize: 12, color: 'var(--text3)' }}>Bids So Far</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--amber)' }}>
                  {project.auction ? new Date(project.auction.end_time).toLocaleDateString() : '—'}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text3)' }}>Auction Ends</div>
              </div>
            </div>
            <h3 style={{ marginBottom: 10 }}>Description</h3>
            <p style={{ color: 'var(--text2)', lineHeight: 1.7 }}>{project.description}</p>
          </div>

          {/* Submit bid */}
          {canBid && (
            <div className="card" style={{ border: '1px solid var(--accent)', boxShadow: '0 0 0 1px var(--accent-glow)' }}>
              <h3 style={{ marginBottom: 16, color: 'var(--accent2)' }}>Submit Your Bid</h3>
              <form onSubmit={handleSubmitBid} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Your Bid Amount ($)</label>
                    <input type="number" value={bidForm.bid_amount} onChange={(e) => setBidForm({ ...bidForm, bid_amount: e.target.value })}
                      placeholder={`Max $${project.budget}`} max={project.budget} min={1} step="0.01" required />
                    <span style={{ fontSize: 12, color: 'var(--text3)' }}>Lower bids score higher</span>
                  </div>
                  <div className="form-group">
                    <label>Delivery Date</label>
                    <input type="datetime-local" value={bidForm.delivery_time} onChange={(e) => setBidForm({ ...bidForm, delivery_time: e.target.value })}
                      min={minDate} required />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit Bid'}
                </button>
              </form>
            </div>
          )}

          {myBid && (
            <div className="card" style={{ border: '1px solid var(--green)' }}>
              <h3 style={{ marginBottom: 12, color: 'var(--green)' }}>✓ Your Bid</h3>
              <div style={{ display: 'flex', gap: 24, fontSize: 14 }}>
                <div><span style={{ color: 'var(--text3)' }}>Amount:</span> <strong style={{ color: 'var(--green)' }}>${myBid.bid_amount?.toLocaleString()}</strong></div>
                <div><span style={{ color: 'var(--text3)' }}>Delivery:</span> <strong>{new Date(myBid.delivery_time).toLocaleDateString()}</strong></div>
                <div><span style={{ color: 'var(--text3)' }}>Score:</span> <strong style={{ color: 'var(--accent2)' }}>{myBid.score}/100</strong></div>
                <div><span className={`badge badge-${myBid.status}`}>{myBid.status}</span></div>
              </div>
            </div>
          )}

          {/* Feedback from past clients (provideRating use case) */}
          {feedbacks.length > 0 && (
            <div className="card">
              <h3 style={{ marginBottom: 14 }}>Freelancer Reviews</h3>
              {feedbacks.map((f) => (
                <div key={f.feedback_id} style={{ borderBottom: '1px solid var(--border)', paddingBottom: 12, marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <strong style={{ fontSize: 14 }}>{f.client?.user?.username}</strong>
                    <Stars value={f.rating} />
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--text2)' }}>{f.comments}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {project.auction && (
            <div className="card">
              <h4 style={{ marginBottom: 12 }}>Auction Info</h4>
              <div style={{ fontSize: 13, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text3)' }}>Status</span>
                  <span className={`badge badge-${project.auction.status}`}>{project.auction.status}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text3)' }}>Ends</span>
                  <span style={{ color: 'var(--text2)' }}>{new Date(project.auction.end_time).toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text3)' }}>Total Bids</span>
                  <span style={{ color: 'var(--text)' }}>{bids.length}</span>
                </div>
              </div>
            </div>
          )}

          <div className="card">
            <h4 style={{ marginBottom: 12 }}>Scoring Formula</h4>
            <div style={{ fontSize: 12, color: 'var(--text3)', lineHeight: 2 }}>
              <div>Freelancer rating — <strong style={{ color: 'var(--text2)' }}>40%</strong></div>
              <div>Bid amount — <strong style={{ color: 'var(--text2)' }}>30%</strong></div>
              <div>Delivery speed — <strong style={{ color: 'var(--text2)' }}>20%</strong></div>
              <div>Experience — <strong style={{ color: 'var(--text2)' }}>10%</strong></div>
              <div style={{ marginTop: 8, padding: '8px', background: 'var(--bg3)', borderRadius: 8 }}>
                Best value wins — not just lowest price
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
