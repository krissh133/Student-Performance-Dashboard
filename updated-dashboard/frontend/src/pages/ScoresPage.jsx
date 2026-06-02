import { useState, useEffect } from "react";
import { scoreAPI } from "../utils/api";
import { getPerformanceLevel, getPerformanceColor, getSubjectColor, getScoreGrade } from "../utils/helpers";
import "./ScoresPage.css";

export default function ScoresPage() {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterSubject, setFilterSubject] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [expanded, setExpanded] = useState(null); // expanded score id

  useEffect(() => {
    scoreAPI.getAll()
      .then(({ data }) => setScores(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const subjects = ["all", ...new Set(scores.map((s) => s.subject))];

  const filtered = scores
    .filter((s) => filterSubject === "all" || s.subject === filterSubject)
    .sort((a, b) => {
      if (sortBy === "score") return (b.score / b.maxScore) - (a.score / a.maxScore);
      if (sortBy === "subject") return a.subject.localeCompare(b.subject);
      return new Date(b.submittedAt || b.createdAt) - new Date(a.submittedAt || a.createdAt);
    });

  const percentages = scores.map((s) => Math.round((s.score / s.maxScore) * 100));
  const avg = percentages.length ? Math.round(percentages.reduce((a, b) => a + b, 0) / percentages.length) : 0;
  const best = percentages.length ? Math.max(...percentages) : 0;
  const excellent = percentages.filter((p) => p >= 85).length;
  const mcqCount = scores.filter((s) => s.totalQuestions > 0).length;

  return (
    <div className="scores-page">
      <header className="scores-header fade-up">
        <div>
          <h1 className="scores-title">Score History</h1>
          <p className="scores-sub">All your assessment results in one place</p>
        </div>
      </header>

      {!loading && scores.length > 0 && (
        <div className="scores-quick-stats fade-up-delay-1">
          <div className="sqs-item">
            <span className="sqs-val" style={{ color: "var(--accent-cyan)" }}>{avg}%</span>
            <span className="sqs-label">Average</span>
          </div>
          <div className="sqs-divider" />
          <div className="sqs-item">
            <span className="sqs-val" style={{ color: "var(--excellent)" }}>{best}%</span>
            <span className="sqs-label">Best</span>
          </div>
          <div className="sqs-divider" />
          <div className="sqs-item">
            <span className="sqs-val" style={{ color: "var(--accent-violet)" }}>{scores.length}</span>
            <span className="sqs-label">Total Tests</span>
          </div>
          <div className="sqs-divider" />
          <div className="sqs-item">
            <span className="sqs-val" style={{ color: "var(--excellent)" }}>{excellent}</span>
            <span className="sqs-label">Excellent</span>
          </div>
          {mcqCount > 0 && (
            <>
              <div className="sqs-divider" />
              <div className="sqs-item">
                <span className="sqs-val" style={{ color: "#00e5a0" }}>{mcqCount}</span>
                <span className="sqs-label">MCQ Tests</span>
              </div>
            </>
          )}
        </div>
      )}

      <div className="scores-filters fade-up-delay-1">
        <div className="subject-filter">
          {subjects.map((s) => (
            <button
              key={s}
              onClick={() => setFilterSubject(s)}
              className={`filter-btn ${filterSubject === s ? "active" : ""}`}
              style={filterSubject === s && s !== "all"
                ? { borderColor: getSubjectColor(s), color: getSubjectColor(s), background: `${getSubjectColor(s)}10` }
                : {}}
            >
              {s === "all" ? "All Subjects" : s}
            </button>
          ))}
        </div>
        <div className="sort-group">
          <span className="sort-label">Sort:</span>
          {["date", "score", "subject"].map((s) => (
            <button key={s} className={`filter-btn ${sortBy === s ? "active" : ""}`} onClick={() => setSortBy(s)}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[...Array(8)].map((_, i) => <div key={i} className="skeleton" style={{ height: 64 }} />)}
        </div>
      ) : (
        <div className="scores-table-wrapper fade-up-delay-2">
          <table className="scores-table">
            <thead>
              <tr>
                <th>Subject</th>
                <th>Assessment</th>
                <th>Period</th>
                <th>Score</th>
                <th>Progress</th>
                <th>Grade</th>
                <th>Level</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => {
                const pct = Math.round((s.score / s.maxScore) * 100);
                const level = getPerformanceLevel(s.score, s.maxScore);
                const lvlColor = getPerformanceColor(level);
                const subColor = getSubjectColor(s.subject);
                const grade = getScoreGrade(pct);
                const isMCQ = s.totalQuestions > 0;
                const isExpanded = expanded === s._id;
                return (
                  <>
                    <tr key={s._id} className={`score-row ${isExpanded ? "expanded" : ""}`}>
                      <td>
                        <div className="subject-cell">
                          <span className="subj-dot" style={{ background: subColor }} />
                          <span style={{ color: subColor, fontWeight: 600 }}>{s.subject}</span>
                        </div>
                      </td>
                      <td className="assess-cell">
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          {s.assessment?.title || "—"}
                          {isMCQ && <span className="mcq-tag">MCQ</span>}
                        </div>
                      </td>
                      <td className="month-cell">{s.month} {s.year}</td>
                      <td>
                        <span className="score-num" style={{ color: lvlColor }}>
                          {s.score}
                          <span style={{ color: "var(--text-muted)", fontWeight: 400, fontSize: 12 }}>/{s.maxScore}</span>
                        </span>
                      </td>
                      <td>
                        <div className="pct-cell">
                          <div className="pct-bar-track">
                            <div className="pct-bar" style={{ width: `${pct}%`, background: lvlColor }} />
                          </div>
                          <span className="pct-num" style={{ color: lvlColor }}>{pct}%</span>
                        </div>
                      </td>
                      <td>
                        <span className="grade-badge" style={{ color: lvlColor, borderColor: `${lvlColor}30`, background: `${lvlColor}10` }}>
                          {grade}
                        </span>
                      </td>
                      <td>
                        <span className={`badge badge-${level.toLowerCase()}`}>{level}</span>
                      </td>
                      <td>
                        {isMCQ ? (
                          <button
                            className="score-expand-btn"
                            onClick={() => setExpanded(isExpanded ? null : s._id)}
                          >
                            {isExpanded ? "Hide" : "View"} MCQ
                          </button>
                        ) : (
                          <span className="feedback-cell">{s.feedback || "—"}</span>
                        )}
                      </td>
                    </tr>
                    {isMCQ && isExpanded && (
                      <tr key={`${s._id}-detail`} className="score-detail-row">
                        <td colSpan={8}>
                          <div className="mcq-detail-panel">
                            <div className="mcq-detail-stats">
                              <div className="mcq-ds-item">
                                <span className="mcq-ds-num" style={{ color: "#00e5a0" }}>{s.correctAnswers}</span>
                                <span className="mcq-ds-label">Correct</span>
                              </div>
                              <div className="mcq-ds-item">
                                <span className="mcq-ds-num" style={{ color: "#f87171" }}>{s.totalQuestions - s.correctAnswers}</span>
                                <span className="mcq-ds-label">Incorrect</span>
                              </div>
                              <div className="mcq-ds-item">
                                <span className="mcq-ds-num" style={{ color: "var(--accent-cyan)" }}>{s.totalQuestions}</span>
                                <span className="mcq-ds-label">Total Qs</span>
                              </div>
                              <div className="mcq-ds-item">
                                <span className="mcq-ds-num" style={{ color: "var(--accent-violet)" }}>{s.timeSpent || 0}m</span>
                                <span className="mcq-ds-label">Time Spent</span>
                              </div>
                            </div>
                            {s.feedback && (
                              <div className="mcq-detail-feedback">
                                <span className="mcq-detail-feedback-label">Feedback:</span>
                                <span>{s.feedback}</span>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: "48px", color: "var(--text-muted)", fontSize: 14 }}>
              No scores found{filterSubject !== "all" ? ` for ${filterSubject}` : ""}.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
