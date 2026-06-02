import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { adminAPI, assessmentAPI } from "../../utils/api";
import { getPerformanceColor, getSubjectColor, formatDate } from "../../utils/helpers";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import "./AdminDashboard.css";
import "../admin/AdminStudents.css";

const StatCard = ({ label, value, suffix = "", icon, color, sub, delay = 0 }) => (
  <div className="adm-stat-card fade-up" style={{ animationDelay: `${delay}ms` }}>
    <div className="adm-stat-top">
      <span className="adm-stat-icon" style={{ background: `${color}18`, color }}>{icon}</span>
      <span className="adm-stat-label">{label}</span>
    </div>
    <div className="adm-stat-value" style={{ color }}>
      {value}<span className="adm-stat-suffix">{suffix}</span>
    </div>
    {sub && <p className="adm-stat-sub">{sub}</p>}
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-light)", borderRadius: 8, padding: "10px 14px", fontSize: 12 }}>
      <p style={{ color: "var(--text-secondary)", marginBottom: 4, fontWeight: 700 }}>{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} style={{ color: p.color }}>{p.dataKey}: <strong>{p.value}</strong></div>
      ))}
    </div>
  );
};

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [trends, setTrends] = useState(null);
  const [recentAssessments, setRecentAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      adminAPI.getStats(),
      adminAPI.getTrends(),
      assessmentAPI.getAll(),
    ]).then(([s, t, a]) => {
      setStats(s.data);
      setTrends(t.data);
      setRecentAssessments(a.data.slice(0, 5));
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="admin-page">
      <div className="adm-skeleton-grid">{[...Array(8)].map((_, i) => <div key={i} className="skeleton" style={{ height: 110 }} />)}</div>
    </div>
  );

  const dist = stats?.distribution || {};
  const distTotal = (dist.excellent || 0) + (dist.good || 0) + (dist.average || 0) || 1;

  return (
    <div className="admin-page">
      <header className="adm-header fade-up">
        <div>
          <p className="adm-greeting">Admin Control Center</p>
          <h1 className="adm-title">Platform <span className="adm-title-accent">Overview</span></h1>
        </div>
        <div className="adm-header-actions">
          <button className="adm-action-btn primary" onClick={() => navigate("/admin/assessments")}>
            + New Assessment
          </button>
          <button className="adm-action-btn secondary" onClick={() => navigate("/admin/students")}>
            + Add Student
          </button>
        </div>
      </header>

      {/* Stat Cards */}
      <div className="adm-stats-grid">
        <StatCard label="Total Students" value={stats?.totalStudents || 0} icon="◈" color="#00d4ff" sub="Registered on platform" delay={0} />
        <StatCard label="Assessments" value={stats?.totalAssessments || 0} icon="◉" color="#7c6cfc" sub={`${stats?.availableAssessments || 0} currently active`} delay={80} />
        <StatCard label="Platform Avg" value={stats?.avgScore || 0} suffix="%" icon="◎" color="#00e5a0" sub="Across all students" delay={160} />
        <StatCard label="Total Scores" value={stats?.totalScores || 0} icon="⬡" color="#ffb800" sub="Recorded results" delay={240} />
      </div>

      {/* Charts Row */}
      <div className="adm-charts-row">
        {/* Monthly trend */}
        <div className="adm-chart-card fade-up-delay-2">
          <h3 className="adm-card-title">Monthly Average Score</h3>
          <p className="adm-card-sub">Platform-wide score trend</p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={trends?.monthlyAvg || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="adminGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c6cfc" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#7c6cfc" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fill: "#8892b0", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[50, 100]} tick={{ fill: "#8892b0", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="average" stroke="#7c6cfc" strokeWidth={2.5} fill="url(#adminGrad)"
                dot={{ r: 3, fill: "#7c6cfc", strokeWidth: 0 }} activeDot={{ r: 5, strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Subject averages */}
        <div className="adm-chart-card fade-up-delay-3">
          <h3 className="adm-card-title">Average by Subject</h3>
          <p className="adm-card-sub">Performance across subjects</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={trends?.subjectAvg || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="subject" tick={{ fill: "#8892b0", fontSize: 10 }} axisLine={false} tickLine={false}
                tickFormatter={(v) => v.split(" ")[0]} />
              <YAxis domain={[40, 100]} tick={{ fill: "#8892b0", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="avg" radius={[4, 4, 0, 0]}
                fill="#00d4ff"
                label={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="adm-bottom-row">
        {/* Performance Distribution */}
        <div className="adm-dist-card fade-up-delay-2">
          <h3 className="adm-card-title">Performance Distribution</h3>
          <p className="adm-card-sub">All scores categorized</p>
          <div className="adm-dist-list">
            {[
              { key: "excellent", label: "Excellent", color: "#00e5a0", count: dist.excellent || 0 },
              { key: "good", label: "Good", color: "#00d4ff", count: dist.good || 0 },
              { key: "average", label: "Average", color: "#ffb800", count: dist.average || 0 },
            ].map((item) => (
              <div key={item.key} className="adm-dist-row">
                <div className="adm-dist-left">
                  <span className="adm-dist-dot" style={{ background: item.color }} />
                  <span className="adm-dist-label">{item.label}</span>
                </div>
                <div className="adm-dist-bar-track">
                  <div className="adm-dist-bar" style={{
                    width: `${(item.count / distTotal) * 100}%`,
                    background: item.color,
                    boxShadow: `0 0 8px ${item.color}40`,
                  }} />
                </div>
                <span className="adm-dist-count" style={{ color: item.color }}>{item.count}</span>
                <span className="adm-dist-pct" style={{ color: item.color }}>
                  {Math.round((item.count / distTotal) * 100)}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Assessments */}
        <div className="adm-recent-card fade-up-delay-3">
          <div className="adm-recent-header">
            <div>
              <h3 className="adm-card-title">Recent Assessments</h3>
              <p className="adm-card-sub">Latest created/updated</p>
            </div>
            <button className="adm-view-all-btn" onClick={() => navigate("/admin/assessments")}>View all →</button>
          </div>
          <div className="adm-recent-list">
            {recentAssessments.map((a) => (
              <div key={a._id} className="adm-recent-item">
                <div className="adm-ri-left">
                  <div className="adm-ri-dot" style={{ background: getSubjectColor(a.subject) }} />
                  <div>
                    <p className="adm-ri-title">{a.title}</p>
                    <p className="adm-ri-sub">{a.subject} · {a.duration}m</p>
                  </div>
                </div>
                <div className="adm-ri-right">
                  <span className={`badge badge-${a.difficulty}`}>{a.difficulty}</span>
                  <span className={`status-dot status-${a.status}`}>{a.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
