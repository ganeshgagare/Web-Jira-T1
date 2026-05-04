import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import toast from 'react-hot-toast';

function TaskModal({ onClose, onSave, initial, projects, users }) {
  const { isAdmin } = useAuth();
  const [form, setForm] = useState(initial || {
    title:'', description:'', projectId:'', assigneeId:'',
    status:'TODO', priority:'MEDIUM', dueDate:''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form };
      if (!payload.dueDate) delete payload.dueDate;
      if (!payload.description) delete payload.description;
      if (!payload.assigneeId) delete payload.assigneeId;
      else payload.assigneeId = Number(payload.assigneeId);
      payload.projectId = Number(payload.projectId);

      if (initial?.id) {
        await api.put(`/tasks/${initial.id}`, payload);
        toast.success('Task updated!');
      } else {
        await api.post('/tasks', payload);
        toast.success('Task created!');
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
      <div className="modal" style={{ maxWidth:560 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">{initial?.id ? 'Edit Task' : 'New Task'}</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Title *</label>
            <input className="form-input" value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })} required placeholder="Task title" />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-textarea" value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Describe the task…" />
          </div>
          <div className="two-col">
            <div className="form-group">
              <label className="form-label">Project *</label>
              <select className="form-select" value={form.projectId}
                onChange={e => setForm({ ...form, projectId: e.target.value })} required>
                <option value="">Select project…</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Assignee</label>
              <select className="form-select" value={form.assigneeId}
                onChange={e => setForm({ ...form, assigneeId: e.target.value })}>
                <option value="">Unassigned</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
          </div>
          <div className="two-col">
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-select" value={form.status}
                onChange={e => setForm({ ...form, status: e.target.value })}>
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Done</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select className="form-select" value={form.priority}
                onChange={e => setForm({ ...form, priority: e.target.value })}>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Due Date</label>
            <input type="date" className="form-input" value={form.dueDate}
              onChange={e => setForm({ ...form, dueDate: e.target.value })} />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="spinner" /> : (initial?.id ? 'Save Changes' : 'Create Task')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function TasksPage() {
  const { isAdmin } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterPriority, setFilterPriority] = useState('ALL');
  const [search, setSearch] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [tasksRes, projectsRes, usersRes] = await Promise.all([
        api.get('/tasks'),
        api.get('/projects'),
        isAdmin ? api.get('/users') : Promise.resolve({ data: [] })
      ]);
      setTasks(tasksRes.data);
      setProjects(projectsRes.data);
      setUsers(usersRes.data);
    } catch { toast.error('Failed to load tasks'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this task?')) return;
    await api.delete(`/tasks/${id}`);
    toast.success('Task deleted');
    load();
  };

  const handleStatusChange = async (task, status) => {
    try {
      await api.put(`/tasks/${task.id}`, { status });
      load();
    } catch { toast.error('Failed to update status'); }
  };

  const filtered = tasks.filter(t => {
    if (filterStatus !== 'ALL' && t.status !== filterStatus) return false;
    if (filterPriority !== 'ALL' && t.priority !== filterPriority) return false;
    if (search && !t.title.toLowerCase().includes(search.toLowerCase()) &&
        !(t.projectName || '').toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const statusBadge = (s) => {
    const cls = { TODO:'badge-todo', IN_PROGRESS:'badge-in_progress', DONE:'badge-done', OVERDUE:'badge-overdue' };
    const label = { TODO:'Todo', IN_PROGRESS:'In Progress', DONE:'Done', OVERDUE:'Overdue' };
    return <span className={`badge ${cls[s] || 'badge-todo'}`}>{label[s] || s}</span>;
  };

  const priorityBadge = (p) => {
    const cls = { LOW:'badge-low', MEDIUM:'badge-medium', HIGH:'badge-high' };
    return <span className={`badge ${cls[p] || 'badge-medium'}`}>{p}</span>;
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="page-header">
          <div>
            <h1 className="page-title">Tasks</h1>
            <p className="page-subtitle">{filtered.length} of {tasks.length} tasks</p>
          </div>
          <button className="btn btn-primary" onClick={() => { setEditTask(null); setShowModal(true); }}>
            + New Task
          </button>
        </div>

        <div className="page-body">
          <div className="filters-row">
            <input className="search-input form-input" placeholder="🔍 Search tasks…"
              value={search} onChange={e => setSearch(e.target.value)} />
            <select className="filter-select form-select" value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}>
              <option value="ALL">All Statuses</option>
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="DONE">Done</option>
              <option value="OVERDUE">Overdue</option>
            </select>
            <select className="filter-select form-select" value={filterPriority}
              onChange={e => setFilterPriority(e.target.value)}>
              <option value="ALL">All Priorities</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          <div className="table-container">
            {loading ? (
              <div className="loading-page"><span className="spinner" /> Loading…</div>
            ) : filtered.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">✅</div>
                <div className="empty-state-text">No tasks found</div>
                <div className="empty-state-sub">Try adjusting filters or create a new task</div>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Project</th>
                    <th>Assignee</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Due Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(t => (
                    <tr key={t.id}>
                      <td>
                        <div style={{ fontWeight:500 }}>{t.title}</div>
                        {t.description && <div style={{ fontSize:11, color:'#64748b', marginTop:2, maxWidth:250, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{t.description}</div>}
                      </td>
                      <td><span className="chip">{t.projectName}</span></td>
                      <td>
                        {t.assigneeName ? (
                          <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                            <div className="avatar">{t.assigneeName[0]}</div>
                            <span style={{ fontSize:13 }}>{t.assigneeName}</span>
                          </div>
                        ) : <span style={{ color:'#64748b', fontSize:12 }}>Unassigned</span>}
                      </td>
                      <td>{priorityBadge(t.priority)}</td>
                      <td>
                        <select
                          className="form-select"
                          style={{ padding:'4px 8px', fontSize:12, width:'auto' }}
                          value={t.status}
                          onChange={e => handleStatusChange(t, e.target.value)}
                        >
                          <option value="TODO">To Do</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="DONE">Done</option>
                        </select>
                      </td>
                      <td style={{ color: t.overdue ? '#ef4444' : '#94a3b8', fontSize:12 }}>
                        {t.dueDate ? (t.overdue ? '⚠️ ' : '') + t.dueDate : '—'}
                      </td>
                      <td>
                        <div style={{ display:'flex', gap:6 }}>
                          <button className="btn btn-secondary" style={{ padding:'4px 10px', fontSize:12 }}
                            onClick={() => { setEditTask({ ...t, projectId:t.projectId, assigneeId:t.assigneeId||'' }); setShowModal(true); }}>
                            ✏️
                          </button>
                          {isAdmin && (
                            <button className="btn btn-danger" style={{ padding:'4px 10px', fontSize:12 }}
                              onClick={() => handleDelete(t.id)}>🗑️</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <TaskModal
          initial={editTask}
          projects={projects}
          users={users}
          onClose={() => { setShowModal(false); setEditTask(null); }}
          onSave={() => { setShowModal(false); setEditTask(null); load(); }}
        />
      )}
    </div>
  );
}
