import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';

const COLORS = ['#64748b', '#3b82f6', '#10b981', '#ef4444'];

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/tasks/dashboard'),
      api.get('/tasks')
    ]).then(([statsRes, tasksRes]) => {
      setStats(statsRes.data);
      setRecentTasks(tasksRes.data.slice(0, 5));
    }).finally(() => setLoading(false));
  }, []);

  const pieData = stats ? [
    { name: 'Todo', value: Number(stats.todo) },
    { name: 'In Progress', value: Number(stats.inProgress) },
    { name: 'Done', value: Number(stats.done) },
    { name: 'Overdue', value: Number(stats.overdue) },
  ] : [];

  const barData = stats ? [
    { name: 'Todo', count: Number(stats.todo) },
    { name: 'In Progress', count: Number(stats.inProgress) },
    { name: 'Done', count: Number(stats.done) },
    { name: 'Overdue', count: Number(stats.overdue) },
  ] : [];

  const statusBadge = (s) => {
    const cls = { TODO:'badge-todo', IN_PROGRESS:'badge-in_progress', DONE:'badge-done', OVERDUE:'badge-overdue' };
    const label = { TODO:'Todo', IN_PROGRESS:'In Progress', DONE:'Done', OVERDUE:'Overdue' };
    return <span className={`badge ${cls[s] || 'badge-todo'}`}>{label[s] || s}</span>;
  };

  const priorityBadge = (p) => {
    const cls = { LOW:'badge-low', MEDIUM:'badge-medium', HIGH:'badge-high' };
    return <span className={`badge ${cls[p] || 'badge-medium'}`}>{p}</span>;
  };

  if (loading) return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content"><div className="loading-page"><span className="spinner" /> Loading…</div></div>
    </div>
  );

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="page-header">
          <div className="page-header-left">
            <h1 className="page-title">Dashboard</h1>
            <p className="page-subtitle">Welcome back, {user?.name} 👋</p>
          </div>
        </div>

        <div className="page-body">
          {/* Stats */}
          <div className="stats-grid">
            <div className="stat-card accent">
              <div className="stat-icon accent">📋</div>
              <div className="stat-value">{stats?.total ?? 0}</div>
              <div className="stat-label">Total Tasks</div>
            </div>
            <div className="stat-card info">
              <div className="stat-icon info">🔄</div>
              <div className="stat-value">{stats?.inProgress ?? 0}</div>
              <div className="stat-label">In Progress</div>
            </div>
            <div className="stat-card success">
              <div className="stat-icon success">✅</div>
              <div className="stat-value">{stats?.done ?? 0}</div>
              <div className="stat-label">Completed</div>
            </div>
            <div className="stat-card danger">
              <div className="stat-icon danger">⚠️</div>
              <div className="stat-value">{stats?.overdue ?? 0}</div>
              <div className="stat-label">Overdue</div>
            </div>
            <div className="stat-card warning">
              <div className="stat-icon warning">📁</div>
              <div className="stat-value">{stats?.totalProjects ?? 0}</div>
              <div className="stat-label">Projects</div>
            </div>
          </div>

          {/* Charts */}
          <div className="two-col" style={{ marginBottom: 24 }}>
            <div className="stat-card" style={{ paddingTop: 20 }}>
              <div style={{ fontWeight: 600, marginBottom: 16, fontSize: 14 }}>Task Distribution</div>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                    {pieData.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background:'#1a2235', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, fontSize:12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display:'flex', gap:12, flexWrap:'wrap', justifyContent:'center', marginTop:8 }}>
                {pieData.map((d,i) => (
                  <div key={d.name} style={{ display:'flex', alignItems:'center', gap:5, fontSize:11, color:'#94a3b8' }}>
                    <div style={{ width:8, height:8, borderRadius:'50%', background:COLORS[i] }} />
                    {d.name}: {d.value}
                  </div>
                ))}
              </div>
            </div>

            <div className="stat-card" style={{ paddingTop: 20 }}>
              <div style={{ fontWeight: 600, marginBottom: 16, fontSize: 14 }}>Tasks by Status</div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={barData} margin={{ top:0, right:0, left:-20, bottom:0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" tick={{ fontSize:11, fill:'#64748b' }} />
                  <YAxis tick={{ fontSize:11, fill:'#64748b' }} />
                  <Tooltip contentStyle={{ background:'#1a2235', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, fontSize:12 }} />
                  <Bar dataKey="count" radius={[4,4,0,0]}>
                    {barData.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Tasks */}
          <div className="table-container">
            <div className="table-header">
              <span className="table-title">Recent Tasks</span>
            </div>
            {recentTasks.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📋</div>
                <div className="empty-state-text">No tasks yet</div>
                <div className="empty-state-sub">Create your first task to get started</div>
              </div>
            ) : (
              <table>
                <thead>
                  <tr><th>Title</th><th>Project</th><th>Assignee</th><th>Priority</th><th>Status</th><th>Due</th></tr>
                </thead>
                <tbody>
                  {recentTasks.map(t => (
                    <tr key={t.id}>
                      <td style={{ fontWeight:500 }}>{t.title}</td>
                      <td><span className="chip">{t.projectName}</span></td>
                      <td>{t.assigneeName || <span style={{ color:'#64748b' }}>Unassigned</span>}</td>
                      <td>{priorityBadge(t.priority)}</td>
                      <td>{statusBadge(t.status)}</td>
                      <td style={{ color: t.overdue ? '#ef4444' : '#94a3b8', fontSize:12 }}>
                        {t.dueDate || '—'}
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
