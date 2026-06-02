import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { adminAPI } from "../../utils/api";
import { getPerformanceLevel, getPerformanceColor, getSubjectColor, formatDate } from "../../utils/helpers";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import "./StudentDetail.css";
import "../admin/AdminStudents.css";
import "../admin/AdminDashboard.css";

export default function StudentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getStudentById(id).then(({ data }) => setStudent(data)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="admin-page">
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 120 }} />)}
      </div>
    </div>
  );

  if (!student) return <div className="admin-page"><p style={{ color: "var(--text-muted)" }}>Student not found.</p></div>;

  const avgLevel = getPerformanceLevel(student.avgScore);
  const avgColor = getPerformanceColor(avgLevel);

  // Build subject chart data
  const subjectMap = {};
  (student.scores || []).forEach((s) => {
    if (!subjectMap[s.subject]) subjectMap[s.subject] = [];
    subjectMap[s.subject].push({ month: s.month, score: s.score });
  });

  const months = [...new Set((student.scores || []).map((s) => s.month))];

  const chartData = months.map((m) => {
    const entry = { month: m };
    Object.entries(subjectMap).forEach(([subj, data]) => {
      const found = data.find((d) => d.month === m);
      if (found) entry[subj] = found.score;
    });
    return entry;
  });

  return (
    <div className="admin-page">
      <header className="adm-header fade-up">
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <button className="sd-back-btn" onClick={() => navigate("/admin/students")}>← Back</button>
          <div>
            <p className="adm-greeting">Student Profile</p>
            <h1 className="adm-title">{student.name}</h1>
          </div>
        </div>
        <div className="sd-avatar-lg">{student.avatar || student.name.slice(0, 2).toUpperCase()}</div>
      </header>

      {/* Profile Cards */}
      <div className="sd-overview-grid fade-up-delay-1">
        <div className="sd-info-card">
          <h3 className="adm-card-title">Profile Info</h3>
          <div className="sd-info-list">
            <div className="sd-info-row"><span>Email</span><span>{student.email}</span></div>
            <div className="sd-info-row"><span>Study Hours</span><span style={{ color: "var(--accent-cyan)", fontWeight: 700 }}>{student.totalStudyHours}h</span></div>
            <div className="sd-info-row">
              <span>Performance</span>
              <span className={`badge badge-${avgLevel.toLowerCase()}`}>{avgLevel}</span>
            </div>
            <div className="sd-info-row"><span>Joined</span><span>{formatDate(student.createdAt)}</span></div>
          </div>
          <div className="sd-courses">
            <p className="sd-courses-label">Enrolled Courses</p>
            <div className="sd-courses-grid">
              {(student.enrolledCourses || []).map((c) => (
                <span key={c} className="stu-course-pill">{c}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="sd-stats-row">
          {[
            { label: "Avg Score", value: `${student.avgScore}%`, color: avgColor },
            { label: "Best Score", value: `${student.bestScore}%`, color: "#00e5a0" },
            { label: "Total Tests", value: (student.scores || []).length, color: "#7c6cfc" },
            { label: "Study Hours", value: `${student.totalStudyHours}h`, color: "#ffb800" },
          ].map((item) => (
            <div key={item.label} className="sd-mini-stat">
              <span className="sd-mini-val" style={{ color: item.color }}>{item.value}</span>
              <span className="sd-mini-label">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Score Trend Chart */}
      {chartData.length > 0 && (
        <div className="adm-chart-card fade-up-delay-2">
          <h3 className="adm-card-title">Score Trends</h3>
          <p className="adm-card-sub">Performance across all subjects</p>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                {Object.keys(subjectMap).map((subj) => (
                  <linearGradient key={subj} id={`sdgrad-${subj}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={getSubjectColor(subj)} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={getSubjectColor(subj)} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fill: "#8892b0", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[40, 100]} tick={{ fill: "#8892b0", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "var(--bg-secondary)", border: "1px solid var(--border-light)", borderRadius: 8, fontSize: 12 }} />
              {Object.keys(subjectMap).map((subj) => (
                <Area key={subj} type="monotone" dataKey={subj}
                  stroke={getSubjectColor(subj)} strokeWidth={2}
                  fill={`url(#sdgrad-${subj})`}
                  dot={{ r: 3, fill: getSubjectColor(subj), strokeWidth: 0 }} />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Score Table */}
      <div className="adm-chart-card fade-up-delay-3">
        <h3 className="adm-card-title">All Scores</h3>
        <p className="adm-card-sub">{(student.scores || []).length} total results</p>
        <div className="sd-scores-table-wrap">
          <table className="stu-table" style={{ marginTop: 12 }}>
            <thead>
              <tr>
                <th>Subject</th>
                <th>Assessment</th>
                <th>Score</th>
                <th>%</th>
                <th>Level</th>
                <th>Month</th>
                <th>Feedback</th>
              </tr>
            </thead>
            <tbody>
              {(student.scores || []).map((s) => {
                const pct = Math.round((s.score / s.maxScore) * 100);
                const level = getPerformanceLevel(s.score, s.maxScore);
                const color = getPerformanceColor(level);
                return (
                  <tr key={s._id} className="stu-row">
                    <td style={{ color: getSubjectColor(s.subject), fontWeight: 600 }}>{s.subject}</td>
                    <td className="stu-email">{s.assessment?.title || "—"}</td>
                    <td>
                      <span style={{ color, fontFamily: "var(--font-display)", fontWeight: 700 }}>{s.score}</span>
                      <span style={{ color: "var(--text-muted)", fontSize: 11 }}>/{s.maxScore}</span>
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 50, height: 4, background: "var(--bg-secondary)", borderRadius: 2, overflow: "hidden" }}>
                          <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 2 }} />
                        </div>
                        <span style={{ color, fontSize: 12, fontWeight: 600 }}>{pct}%</span>
                      </div>
                    </td>
                    <td><span className={`badge badge-${level.toLowerCase()}`}>{level}</span></td>
                    <td className="stu-num">{s.month} {s.year}</td>
                    <td className="stu-email" style={{ fontStyle: "italic" }}>{s.feedback}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
