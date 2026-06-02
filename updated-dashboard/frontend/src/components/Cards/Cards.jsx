import { getPerformanceLevel, getPerformanceColor, formatMinutes } from "../../utils/helpers";
import "./Cards.css";

export const StatCard = ({ label, value, suffix = "", icon, color, sublabel, delay = 0 }) => (
  <div className="stat-card fade-up" style={{ animationDelay: `${delay}ms` }}>
    <div className="stat-card-top">
      <span className="stat-icon" style={{ background: `${color}18`, color }}>
        {icon}
      </span>
      <span className="stat-label">{label}</span>
    </div>
    <div className="stat-value" style={{ color }}>
      {value}<span className="stat-suffix">{suffix}</span>
    </div>
    {sublabel && <p className="stat-sublabel">{sublabel}</p>}
  </div>
);

export const BestScoreCard = ({ stats }) => {
  const level = getPerformanceLevel(stats?.bestScore || 0);
  const color = getPerformanceColor(level);

  return (
    <div className="best-score-card fade-up-delay-1">
      <div className="best-score-ring-container">
        <svg viewBox="0 0 120 120" className="ring-svg">
          <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
          <circle
            cx="60" cy="60" r="52"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${(stats?.bestScore || 0) * 3.267} 326.7`}
            strokeDashoffset="81.67"
            style={{ filter: `drop-shadow(0 0 6px ${color})`, transition: "stroke-dasharray 1s ease" }}
          />
        </svg>
        <div className="ring-content">
          <span className="ring-score" style={{ color }}>{stats?.bestScore || 0}</span>
          <span className="ring-label">Best</span>
        </div>
      </div>
      <div className="best-score-info">
        <h3 className="bsc-title">Best Score</h3>
        <span className={`badge badge-${level.toLowerCase()}`}>{level}</span>
        <p className="bsc-sub">All-time peak performance</p>
        <div className="bsc-improvement">
          <span className="imp-arrow">↑</span>
          <span className="imp-text">+{stats?.improvement || 0}% vs start</span>
        </div>
      </div>
    </div>
  );
};

export const RecentResultCard = ({ result }) => {
  const pct = Math.round((result.score / result.maxScore) * 100);
  const level = getPerformanceLevel(result.score, result.maxScore);
  const color = getPerformanceColor(level);

  return (
    <div className="result-card">
      <div className="result-left">
        <div className="result-subject-dot" style={{ background: color }} />
        <div>
          <p className="result-title">
            {result.assessment?.title || result.subject}
          </p>
          <p className="result-subject">{result.subject}</p>
        </div>
      </div>
      <div className="result-right">
        <span className={`badge badge-${level.toLowerCase()}`}>{level}</span>
        <span className="result-score" style={{ color }}>
          {result.score}<span style={{ color: "var(--text-muted)", fontSize: "12px" }}>/{result.maxScore}</span>
        </span>
        <div className="result-bar-track">
          <div className="result-bar-fill" style={{ width: `${pct}%`, background: color }} />
        </div>
      </div>
    </div>
  );
};

export const TimeCard = ({ hours, studyHours }) => (
  <div className="time-card fade-up-delay-2">
    <div className="time-header">
      <span>⏱</span>
      <span>Time Invested</span>
    </div>
    <div className="time-values">
      <div className="time-item">
        <span className="time-num" style={{ color: "var(--accent-cyan)" }}>
          {formatMinutes(hours || 0)}
        </span>
        <span className="time-desc">In assessments</span>
      </div>
      <div className="time-divider" />
      <div className="time-item">
        <span className="time-num" style={{ color: "var(--accent-violet)" }}>
          {studyHours || 0}h
        </span>
        <span className="time-desc">Total study time</span>
      </div>
    </div>
    <div className="time-bar-wrap">
      {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d, i) => {
        const h = [2, 3, 1.5, 4, 2.5, 1, 0.5][i];
        return (
          <div key={d} className="time-bar-col">
            <div className="time-bar-bg">
              <div
                className="time-bar-inner"
                style={{
                  height: `${(h / 4) * 100}%`,
                  background: i === 3 ? "var(--accent-cyan)" : "var(--border-light)",
                }}
              />
            </div>
            <span className="time-bar-label">{d[0]}</span>
          </div>
        );
      })}
    </div>
  </div>
);
