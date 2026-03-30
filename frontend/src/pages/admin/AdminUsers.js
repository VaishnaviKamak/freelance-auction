import React, { useEffect, useState } from 'react';
import { adminGetUsers, adminToggleBlock } from '../../services/api';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [msg, setMsg] = useState('');

  const load = () => {
    adminGetUsers().then((r) => setUsers(r.data.users)).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const handleToggleBlock = async (userId, username, isActive) => {
    const action = isActive ? 'block' : 'unblock';
    if (!window.confirm(`Are you sure you want to ${action} "${username}"?`)) return;
    try {
      const res = await adminToggleBlock(userId);
      setMsg(res.data.message);
      load();
    } catch (e) {
      setMsg(e.response?.data?.message || 'Action failed');
    }
  };

  const filtered = users.filter((u) =>
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const roleColors = {
    client: 'badge-listed',
    freelancer: 'badge-accepted',
    admin: 'badge-assigned',
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>User Management</h1>
        <span style={{ color: 'var(--text3)', fontSize: 14 }}>{users.length} users</span>
      </div>

      {msg && (
        <div className="alert alert-success" style={{ marginBottom: 16 }}>{msg}</div>
      )}

      <div style={{ marginBottom: 20 }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by username or email..."
          style={{ maxWidth: 360 }}
        />
      </div>

      <div className="card">
        {loading ? (
          <div className="loader"><div className="spinner" /></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Profile Info</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.user_id} style={{ opacity: u.is_active === false ? 0.5 : 1 }}>
                    <td style={{ fontWeight: 600 }}>{u.username}</td>
                    <td style={{ color: 'var(--text2)', fontSize: 13 }}>{u.email}</td>
                    <td>
                      <span className={`badge ${roleColors[u.role] || ''}`}>{u.role}</span>
                    </td>
                    <td style={{ fontSize: 13, color: 'var(--text3)' }}>
                      {u.role === 'client' && u.clientProfile?.company_name}
                      {u.role === 'freelancer' && u.freelancerProfile && (
                        <>Skills: {u.freelancerProfile.skills?.slice(0, 30) || '—'} · ⭐{u.freelancerProfile.rating?.toFixed(1)}</>
                      )}
                    </td>
                    <td>
                      {u.role === 'admin' ? (
                        <span className="badge badge-assigned">Admin</span>
                      ) : u.is_active === false ? (
                        <span className="badge badge-rejected">Blocked</span>
                      ) : (
                        <span className="badge badge-accepted">Active</span>
                      )}
                    </td>
                    <td style={{ color: 'var(--text3)', fontSize: 13 }}>
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td>
                      {u.role === 'admin' ? (
                        <button className="btn btn-secondary btn-sm" disabled>Protected</button>
                      ) : u.is_active === false ? (
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => handleToggleBlock(u.user_id, u.username, u.is_active)}
                        >
                          Unblock
                        </button>
                      ) : (
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleToggleBlock(u.user_id, u.username, u.is_active)}
                        >
                          Block
                        </button>
                      )}
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