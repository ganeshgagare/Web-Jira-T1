import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import toast from 'react-hot-toast';

export default function ProjectDetailPage() {
  const { id } = useParams();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [projRes, tasksRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/tasks?projectId=${id}`)
      ]);
      setProject(projRes.data);
      setTasks(tasksRes.data);
    } catch { toast.error('Failed to load project'); navigate('/projects'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [id]);

  const handleStatusChange = async (task, status) => {
    await api.put(`/tasks/${task.id}`, { status });
    load();
  };

  if (loading) return (
    <div className="app-layout"><Sidebar />
      <div className="main-content"><div className="loading-page"><span className="spinner" /> Loading…</div></div>
    </div>
  );

  const statusCounts = {
    TODO: tasks.filter(t => t.status === 'TODO').length,
    IN_PROGRESS: tasks.filter(t => t.status === 'IN_PROGRESS').length,
    DONE: tasks.filter(t => t.status === 'DONE').length,
    OVERDUE: tasks.filter(t => t.overdue).length,
  };

  const progress = tasks.length === 0 ? 0 : Math.round((statusCounts.DONE / tasks.length) * 100);

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
            <div className="breadcrumb">
              <a onClick={() => navigate('/projects')} style={{ cursor:'pointer' }}>Projects</a>
              <span>›</span>
              <span>{project?.name}</span>
            </div>
            <h1 className="page-title">{project?.name}</h1>
            <p className="page-subtitle">{project?.description || 'No description'}</p>
          </div>
        </div>

        <div className="page-body">
          {/* Stats */}
          <div className="stats-grid" style={{ gridTemplateColumns:'repeat(auto-fit, minmax(140px, 1fr))' }}>
            <div className="stat-card accent">
              <div className="stat-value">{tasks.length}</div>
              <div className="stat-label">Total Tasks</div>
            </div>
            <div className="stat-card info">
              <div className="stat-value">{statusCounts.IN_PROGRESS}</div>
              <div className="stat-label">In Progress</div>
            </div>
            <div className="stat-card success">
              <div className="stat-value">{statusCounts.DONE}</div>
              <div className="stat-label">Completed</div>
            </div>
            <div className="stat-card danger">
              <div className="stat-value">{statusCounts.OVERDUE}</div>
              <div className="stat-label">Overdue</div>
            </div>
          </div>

          {/* Progress */}
          <div className="stat-card" style={{ marginBottom:20, padding:'16px 20px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:10 }}>
              <span style={{ fontWeight:600 }}>Overall Progress</span>
              <span style={{ color:'#6366f1', fontWeight:700 }}>{progress}%</span>
            </div>
            <div className="progress-bar" style={{ height:10 }}>
              <div className="progress-fill" style={{ width:`${progress}%` }} />
            </div>
          </div>

          <div className="two-col" style={{ gap:20, alignItems:'start' }}>
            {/* Tasks */}
            <div className="table-container">
              <div className="table-header">
                <span className="table-title">Tasks</span>
              </div>
              {tasks.length === 0 ? (
                <div className="empty-state" style={{ padding:'40px 24px' }}>
                  <div className="empty-state-icon">📋</div>
                  <div className="empty-state-text">No tasks</div>
                </div>
              ) : (
                <table>
                  <thead>
                    <tr><th>Title</th><th>Assignee</th><th>Priority</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {tasks.map(t => (
                      <tr key={t.id}>
                        <td style={{ fontWeight:500, maxWidth:180, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                          {t.title}
                        </td>
                        <td style={{ fontSize:12 }}>{t.assigneeName || <span style={{ color:'#64748b' }}>–</span>}</td>
                        <td>{priorityBadge(t.priority)}</td>
                        <td>
                          <select className="form-select" style={{ padding:'3px 7px', fontSize:11 }}
                            value={t.status} onChange={e => handleStatusChange(t, e.target.value)}>
                            <option value="TODO">Todo</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="DONE">Done</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Members */}
            <div className="stat-card">
              <div style={{ fontWeight:600, fontSize:14, marginBottom:14 }}>👥 Team Members</div>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12, paddingBottom:12, borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
                <div className="avatar" style={{ width:34, height:34 }}>{project?.ownerName?.[0]?.toUpperCase()}</div>
                <div>
                  <div style={{ fontSize:13, fontWeight:600 }}>{project?.ownerName}</div>
                  <div style={{ fontSize:11, color:'#6366f1' }}>Owner</div>
                </div>
              </div>
              {project?.members?.map(m => (
                <div key={m.userId} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
                  <div className="avatar">{m.name?.[0]?.toUpperCase()}</div>
                  <div>
                    <div style={{ fontSize:13, fontWeight:500 }}>{m.name}</div>
                    <div style={{ fontSize:11, color:'#64748b' }}>{m.email}</div>
                  </div>
                </div>
              ))}
              {(!project?.members || project?.members?.length === 0) && (
                <div style={{ fontSize:12, color:'#64748b' }}>No additional members</div>
              )}

              {project?.deadline && (
                <div style={{ marginTop:16, padding:'10px 14px', background:'rgba(0,0,0,0.2)', borderRadius:8, fontSize:12 }}>
                  📅 Deadline: <strong>{project.deadline}</strong>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
