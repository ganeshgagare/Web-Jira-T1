import { useEffect, useState } from 'react';
import api from '../api/axios';
import Sidebar from '../components/Sidebar';
import toast from 'react-hot-toast';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/users')
      .then(res => setUsers(res.data))
      .catch(() => toast.error('Failed to load users'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const roleBadge = (role) => (
    <span className={`badge ${role === 'ADMIN' ? 'badge-admin' : 'badge-member'}`}>
      {role}
    </span>
  );

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="page-header">
          <div>
            <h1 className="page-title">Users</h1>
            <p className="page-subtitle">{users.length} team member{users.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        <div className="page-body">
          <div className="filters-row">
            <input className="search-input form-input" placeholder="🔍 Search users…"
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          <div className="table-container">
            {loading ? (
              <div className="loading-page"><span className="spinner" /> Loading…</div>
            ) : filtered.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">👥</div>
                <div className="empty-state-text">No users found</div>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u, i) => (
                    <tr key={u.id}>
                      <td style={{ color:'#64748b', fontSize:12 }}>{i + 1}</td>
                      <td>
                        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                          <div className="avatar" style={{ width:32, height:32, fontSize:13 }}>
                            {u.name?.[0]?.toUpperCase()}
                          </div>
                          <span style={{ fontWeight:500 }}>{u.name}</span>
                        </div>
                      </td>
                      <td style={{ color:'#94a3b8', fontSize:13 }}>{u.email}</td>
                      <td>{roleBadge(u.role)}</td>
                      <td style={{ color:'#64748b', fontSize:12 }}>
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
