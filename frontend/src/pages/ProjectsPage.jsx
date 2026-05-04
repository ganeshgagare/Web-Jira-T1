import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import toast from 'react-hot-toast';

function ProjectModal({ onClose, onSave, initial }) {
  const [form, setForm] = useState(initial || { name:'', description:'', deadline:'' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form };
      if (!payload.deadline) delete payload.deadline;
      if (initial?.id) {
        await api.put(`/projects/${initial.id}`, payload);
        toast.success('Project updated!');
      } else {
        await api.post('/projects', payload);
        toast.success('Project created!');
      }
      onSave();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">{initial?.id ? 'Edit Project' : 'New Project'}</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Project Name *</label>
            <input className="form-input" value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="e.g. Website Redesign" />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-textarea" value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })} placeholder="What is this project about?" />
          </div>
          <div className="form-group">
            <label className="form-label">Deadline</label>
            <input type="date" className="form-input" value={form.deadline}
              onChange={e => setForm({ ...form, deadline: e.target.value })} />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="spinner" /> : (initial?.id ? 'Save Changes' : 'Create Project')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function MemberModal({ project, users, onClose, onSave }) {
  const [adding, setAdding] = useState(false);
  const [userId, setUserId] = useState('');

  const memberIds = new Set(project.members?.map(m => m.userId));
  const availableUsers = users.filter(u => !memberIds.has(u.id));

  const handleAdd = async () => {
    if (!userId) return;
    setAdding(true);
    try {
      await api.post(`/projects/${project.id}/members`, { userId: Number(userId) });
      toast.success('Member added!');
      onSave();
    } catch { toast.error('Failed to add member'); }
    finally { setAdding(false); }
  };

  const handleRemove = async (uid) => {
    try {
      await api.delete(`/projects/${project.id}/members/${uid}`);
      toast.success('Member removed');
      onSave();
    } catch { toast.error('Failed'); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">Manage Team — {project.name}</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div style={{ marginBottom: 20 }}>
          <div className="form-label" style={{ marginBottom: 8 }}>Current Members</div>
          {(!project.members || project.members.length === 0) && (
            <p style={{ fontSize:13, color:'#64748b' }}>No members yet.</p>
          )}
          {project.members?.map(m => (
            <div key={m.userId} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <div className="avatar">{m.name?.[0]?.toUpperCase()}</div>
                <div>
                  <div style={{ fontSize:13, fontWeight:500 }}>{m.name}</div>
                  <div style={{ fontSize:11, color:'#64748b' }}>{m.email}</div>
                </div>
              </div>
              <button className="btn btn-danger" style={{ padding:'4px 10px', fontSize:11 }}
                onClick={() => handleRemove(m.userId)}>Remove</button>
            </div>
          ))}
        </div>

        {availableUsers.length > 0 && (
          <div>
            <div className="form-label" style={{ marginBottom: 8 }}>Add Member</div>
            <div style={{ display:'flex', gap:8 }}>
              <select className="form-select" style={{ flex:1 }} value={userId} onChange={e => setUserId(e.target.value)}>
                <option value="">Select user…</option>
                {availableUsers.map(u => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
              </select>
              <button className="btn btn-primary" onClick={handleAdd} disabled={adding || !userId}>
                {adding ? <span className="spinner" /> : 'Add'}
              </button>
            </div>
          </div>
        )}
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

export default function ProjectsPage() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [memberProject, setMemberProject] = useState(null);
  const [search, setSearch] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [projRes, usersRes] = await Promise.all([
        api.get('/projects'),
        isAdmin ? api.get('/users') : Promise.resolve({ data: [] })
      ]);
      setProjects(projRes.data);
      setUsers(usersRes.data);
    } catch { toast.error('Failed to load projects'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this project?')) return;
    await api.delete(`/projects/${id}`);
    toast.success('Project deleted');
    load();
  };

  const filtered = projects.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.description || '').toLowerCase().includes(search.toLowerCase())
  );

  const progress = (p) => p.totalTasks === 0 ? 0 : Math.round((p.completedTasks / p.totalTasks) * 100);

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="page-header">
          <div>
            <h1 className="page-title">Projects</h1>
            <p className="page-subtitle">{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
          </div>
          {isAdmin && (
            <button className="btn btn-primary" onClick={() => { setEditProject(null); setShowModal(true); }}>
              + New Project
            </button>
          )}
        </div>

        <div className="page-body">
          <div className="filters-row">
            <input className="search-input form-input" placeholder="🔍 Search projects…"
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          {loading ? (
            <div className="loading-page"><span className="spinner" /> Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📁</div>
              <div className="empty-state-text">No projects found</div>
              <div className="empty-state-sub">
                {isAdmin ? 'Create your first project to get started' : 'You haven\'t been added to any projects yet'}
              </div>
            </div>
          ) : (
            <div className="cards-grid">
              {filtered.map(p => (
                <div key={p.id} className="card" onClick={() => navigate(`/projects/${p.id}`)}>
                  <div className="card-header">
                    <div>
                      <div className="card-title">{p.name}</div>
                      <div style={{ fontSize:11, color:'#64748b', marginTop:2 }}>by {p.ownerName}</div>
                    </div>
                    {isAdmin && (
                      <div style={{ display:'flex', gap:6 }} onClick={e => e.stopPropagation()}>
                        <button className="btn btn-secondary" style={{ padding:'4px 10px', fontSize:12 }}
                          onClick={() => { setEditProject(p); setShowModal(true); }}>✏️</button>
                        <button className="btn btn-secondary" style={{ padding:'4px 10px', fontSize:12 }}
                          onClick={() => setMemberProject(p)}>👥</button>
                        <button className="btn btn-danger" style={{ padding:'4px 10px', fontSize:12 }}
                          onClick={() => handleDelete(p.id)}>🗑️</button>
                      </div>
                    )}
                  </div>
                  {p.description && <p className="card-desc">{p.description}</p>}

                  <div style={{ marginBottom:12 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'#94a3b8', marginBottom:6 }}>
                      <span>Progress</span>
                      <span>{p.completedTasks}/{p.totalTasks} tasks · {progress(p)}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width:`${progress(p)}%` }} />
                    </div>
                  </div>

                  <div className="card-meta">
                    {p.deadline && (
                      <span className="chip">📅 {p.deadline}</span>
                    )}
                    <span className="chip">👥 {(p.members?.length || 0) + 1} members</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <ProjectModal
          initial={editProject}
          onClose={() => { setShowModal(false); setEditProject(null); }}
          onSave={() => { setShowModal(false); setEditProject(null); load(); }}
        />
      )}
      {memberProject && (
        <MemberModal
          project={memberProject}
          users={users}
          onClose={() => setMemberProject(null)}
          onSave={() => { load(); setMemberProject(null); }}
        />
      )}
    </div>
  );
}
