import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProject, getRankedBids, selectFreelancer, submitFeedback, makePayment, getProjectFeedback, getProjectPayment, closeAuction } from '../../services/api';

function Stars({ value }) {
  return (
    <div className="stars">
      {[1,2,3,4,5].map((s) => (
        <span key={s} className={`star${s <= value ? '' : ' empty'}`}>★</span>
      ))}
    </div>
  );
}

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [auction, setAuction] = useState(null);
  const [rankedBids, setRankedBids] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  // Feedback form state
  const [fbForm, setFbForm] = useState({ rating: 5, comments: '' });
  const [showFbModal, setShowFbModal] = useState(false);

  const load = async () => {
    try {
      const res = await getProject(id);
      setProject(res.data.project);
      setAuction(res.data.project.auction);
      if (res.data.project.auction) {
        const rb = await getRankedBids(res.data.project.auction.auction_id);
        setRankedBids(rb.data.ranked_bids);
      }
      const [fbRes, payRes] = await Promise.allSettled([getProjectFeedback(id), getProjectPayment(id)]);
      if (fbRes.status === 'fulfilled') setFeedback(fbRes.value.data.feedback);
      if (payRes.status === 'fulfilled') setPayment(payRes.value.data.payment);
    } catch (e) { setErr('Failed to load project'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [id]);

  const handleSelectFreelancer = async (bid) => {
    if (!window.confirm(`Select ${bid.freelancer?.user?.username} for this project?`)) return;
    try {
      await selectFreelancer(id, { freelancer_id: bid.freelancer_id, bid_id: bid.bid_id });
      setMsg('Freelancer selected! Project assigned.');
      load();
    } catch (e) { setErr(e.response?.data?.message || 'Failed'); }
  };

  const handlePayment = async () => {
    if (!project.assigned_freelancer_id) return;
    try {
      const topBid = rankedBids.find((b) => b.status === 'accepted');
      await makePayment({ project_id: project.project_id, freelancer_id: project.assigned_freelancer_id, amount: topBid?.bid_amount || project.budget });
      setMsg('Payment processed!'); load();
    } catch (e) { setErr(e.response?.data?.message || 'Payment failed'); }
  };

  const handleFeedback = async (e) => {
    e.preventDefault();
    try {
      await submitFeedback({ project_id: project.project_id, freelancer_id: project.assigned_freelancer_id, ...fbForm });
      setShowFbModal(false); setMsg('Feedback submitted!'); load();
    } catch (e) { setErr(e.response?.data?.message || 'Failed'); }
  };

  const handleCloseAuction = async () => {
    try { await closeAuction(auction.auction_id); setMsg('Auction closed.'); load(); }
    catch (e) { setErr(e.response?.data?.message || 'Failed'); }
  };

  if (loading) return <div className="loader"><div className="spinner" /></div>;
  if (!project) return <div className="page"><div className="alert alert-error">{err || 'Project not found'}</div></div>;

  const statusColors = { open: 'badge-open', listed: 'badge-listed', assigned: 'badge-assigned', completed: 'badge-completed', closed: 'badge-closed' };

  return (
    <div className="page">
      {msg && <div className="alert alert-success" style={{ marginBottom: 16 }}>{msg}</div>}
      {err && <div className="alert alert-error" style={{ marginBottom: 16 }}>{err}</div>}

      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
            <h1 style={{ fontSize: 24 }}>{project.title}</h1>
            <span className={`badge ${statusColors[project.status]}`}>{project.status}</span>
          </div>
          <p style={{ color: 'var(--text3)', fontSize: 14 }}>Budget: <span style={{ color: 'var(--green)', fontWeight: 600 }}>${project.budget.toLocaleString()}</span> · Deadline: {new Date(project.deadline).toLocaleDateString()}</p>
        </div>
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>← Back</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card">
            <h3 style={{ marginBottom: 12 }}>Project Description</h3>
            <p style={{ color: 'var(--text2)', lineHeight: 1.7 }}>{project.description}</p>
          </div>

          {/* Bids / Ranked Bids */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3>Bids ({rankedBids.length})</h3>
              {auction?.status === 'open' && (
                <button className="btn btn-secondary btn-sm" onClick={handleCloseAuction}>Close Auction</button>
              )}
            </div>
            {rankedBids.length === 0 ? (
              <div className="empty"><p>No bids yet. Auction is {auction?.status || 'not opened'}.</p></div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {rankedBids.map((bid, i) => (
                  <div key={bid.bid_id} style={{
                    background: 'var(--bg3)', borderRadius: 10, padding: '14px 16px',
                    border: bid.status === 'accepted' ? '1px solid var(--green)' : '1px solid var(--border)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: i === 0 ? 'var(--accent)' : 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>
                        {i + 1}
                      </div>
                      <div>
                        <div style={{ fontWeight: 500 }}>{bid.freelancer?.user?.username}</div>
                        <div style={{ fontSize: 12, color: 'var(--text3)' }}>
                          Deliver by: {new Date(bid.delivery_time).toLocaleDateString()} · Rating: {bid.freelancer?.rating?.toFixed(1) || 'N/A'}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ color: 'var(--green)', fontWeight: 600 }}>${bid.bid_amount.toLocaleString()}</div>
                        <div style={{ fontSize: 12, color: 'var(--accent2)' }}>Score: {bid.computed_score ?? bid.score}/100</div>
                      </div>
                      <span className={`badge badge-${bid.status}`}>{bid.status}</span>
                      {project.status === 'listed' && bid.status === 'pending' && (
                        <button className="btn btn-success btn-sm" onClick={() => handleSelectFreelancer(bid)}>Select</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {auction && (
            <div className="card">
              <h4 style={{ marginBottom: 12 }}>Auction Details</h4>
              <div style={{ fontSize: 13, display: 'flex', flexDirection: 'column', gap: 8, color: 'var(--text2)' }}>
                <div>Status: <span className={`badge badge-${auction.status}`}>{auction.status}</span></div>
                <div>Started: {new Date(auction.start_time).toLocaleString()}</div>
                <div>Ends: {new Date(auction.end_time).toLocaleString()}</div>
                <div>Total Bids: {rankedBids.length}</div>
              </div>
            </div>
          )}

          {project.assignedFreelancer && (
            <div className="card">
              <h4 style={{ marginBottom: 12 }}>Assigned Freelancer</h4>
              <div style={{ fontSize: 14, color: 'var(--text2)' }}>
                <div style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>{project.assignedFreelancer.user?.username}</div>
                <div>Skills: {project.assignedFreelancer.skills}</div>
                <Stars value={Math.round(project.assignedFreelancer.rating)} />
              </div>
            </div>
          )}

          {/* Payment */}
          {project.status === 'assigned' && !payment && (
            <div className="card">
              <h4 style={{ marginBottom: 8 }}>Make Payment</h4>
              <p style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 12 }}>Release payment to the assigned freelancer.</p>
              <button className="btn btn-success" style={{ width: '100%' }} onClick={handlePayment}>Pay Now</button>
            </div>
          )}
          {payment && (
            <div className="card">
              <h4 style={{ marginBottom: 8 }}>Payment</h4>
              <div style={{ fontSize: 13, color: 'var(--text2)' }}>
                <div>Amount: <span style={{ color: 'var(--green)', fontWeight: 600 }}>${payment.amount?.toLocaleString()}</span></div>
                <div>Status: <span className={`badge badge-${payment.status}`}>{payment.status}</span></div>
                <div style={{ wordBreak: 'break-all', marginTop: 4 }}>TxID: {payment.transaction_id}</div>
              </div>
            </div>
          )}

          {/* Feedback */}
          {project.status === 'assigned' && !feedback && (
            <button className="btn btn-primary" onClick={() => setShowFbModal(true)}>Provide Rating & Feedback</button>
          )}
          {feedback && (
            <div className="card">
              <h4 style={{ marginBottom: 8 }}>Your Feedback</h4>
              <Stars value={feedback.rating} />
              <p style={{ fontSize: 13, color: 'var(--text2)', marginTop: 8 }}>{feedback.comments}</p>
            </div>
          )}
        </div>
      </div>

      {/* Feedback Modal */}
      {showFbModal && (
        <div className="modal-overlay" onClick={() => setShowFbModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Rate this Freelancer</h2>
            <form onSubmit={handleFeedback} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label>Rating (1–5)</label>
                <input type="number" min={1} max={5} value={fbForm.rating} onChange={(e) => setFbForm({ ...fbForm, rating: parseInt(e.target.value) })} />
              </div>
              <div className="form-group">
                <label>Comments</label>
                <textarea value={fbForm.comments} onChange={(e) => setFbForm({ ...fbForm, comments: e.target.value })} rows={4} placeholder="How was the experience?" />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowFbModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Submit Feedback</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
