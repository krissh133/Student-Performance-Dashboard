import { useState, useEffect, useCallback } from "react";
import { assessmentAPI } from "../utils/api";
import { formatDate, getSubjectColor } from "../utils/helpers";
import "./AssessmentsPage.css";

const TABS = ["all", "available", "upcoming", "completed"];

/* ── MCQ Modal ───────────────────────────────────────────── */
function MCQModal({ assessment, onClose, onSubmitted }) {
  const [phase, setPhase] = useState("intro"); // intro | quiz | result
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(assessment.duration * 60);
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [startTime, setStartTime] = useState(null);

  const questions = assessment.questions || [];
  const hasQuestions = questions.length > 0;

  // Countdown
  useEffect(() => {
    if (phase !== "quiz") return;
    if (timeLeft <= 0) { handleSubmit(); return; }
    const t = setInterval(() => setTimeLeft(s => s - 1), 1000);
    return () => clearInterval(t);
  }, [phase, timeLeft]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    return `${m}:${(s % 60).toString().padStart(2, "0")}`;
  };

  const handleBegin = () => {
    setStartTime(Date.now());
    setPhase("quiz");
  };

  const handleSelect = (optIdx) => {
    setAnswers(prev => ({ ...prev, [current]: optIdx }));
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    const elapsed = startTime ? Math.round((Date.now() - startTime) / 60000) : 0;
    const answersArr = questions.map((_, i) => answers[i] !== undefined ? answers[i] : -1);
    try {
      const { data } = await assessmentAPI.submit(assessment._id, {
        answers: answersArr,
        timeSpent: elapsed,
      });
      setResult(data);
      setPhase("result");
      onSubmitted && onSubmitted();
    } catch (err) {
      const msg = err.response?.data?.message || "Submission failed";
      alert(msg);
      setSubmitting(false);
    }
  };

  const q = questions[current];
  const answered = Object.keys(answers).length;
  const progress = questions.length > 0 ? Math.round((answered / questions.length) * 100) : 0;

  return (
    <div className="adm-modal-overlay">
      <div className="take-assessment-modal mcq-modal">

        {/* ── INTRO ── */}
        {phase === "intro" && (
          <>
            <div className="tam-header">
              <div>
                <p className="tam-subject" style={{ color: getSubjectColor(assessment.subject) }}>
                  {assessment.subject}
                </p>
                <h2 className="tam-title">{assessment.title}</h2>
              </div>
            </div>
            <div className="tam-body">
              <div className="tam-info-grid">
                <div className="tam-info-item">
                  <span className="tam-info-label">Duration</span>
                  <span className="tam-info-val">{assessment.duration} min</span>
                </div>
                <div className="tam-info-item">
                  <span className="tam-info-label">Questions</span>
                  <span className="tam-info-val">{questions.length}</span>
                </div>
                <div className="tam-info-item">
                  <span className="tam-info-label">Max Score</span>
                  <span className="tam-info-val">{assessment.maxScore} pts</span>
                </div>
                <div className="tam-info-item">
                  <span className="tam-info-label">Difficulty</span>
                  <span className={`badge badge-${assessment.difficulty}`}>{assessment.difficulty}</span>
                </div>
              </div>
              {assessment.description && (
                <div className="tam-desc">
                  <p className="tam-desc-label">Instructions</p>
                  <p className="tam-desc-text">{assessment.description}</p>
                </div>
              )}
              {!hasQuestions && (
                <div className="tam-notice" style={{ borderColor: "#ffb80040", background: "#ffb80010" }}>
                  <span>⚠</span>
                  <p>No MCQ questions have been added yet. Contact your admin.</p>
                </div>
              )}
              {hasQuestions && (
                <div className="tam-notice">
                  <span>ℹ</span>
                  <p>Once you begin, the timer starts. Answer all questions and hit Submit. Your score will be saved automatically.</p>
                </div>
              )}
              <div className="tam-pre-actions">
                <button className="adm-btn-cancel" onClick={onClose}>Cancel</button>
                {hasQuestions && (
                  <button className="adm-btn-save" onClick={handleBegin}>Begin Assessment →</button>
                )}
              </div>
            </div>
          </>
        )}

        {/* ── QUIZ ── */}
        {phase === "quiz" && (
          <>
            <div className="mcq-quiz-header">
              <div className="mcq-qnum">
                <span className="mcq-qnum-cur">{current + 1}</span>
                <span className="mcq-qnum-sep">/</span>
                <span className="mcq-qnum-tot">{questions.length}</span>
              </div>
              <div className="mcq-progress-bar">
                <div className="mcq-progress-fill" style={{ width: `${progress}%` }} />
              </div>
              <div className={`tam-timer ${timeLeft < 300 ? "tam-timer-urgent" : ""}`}>
                ⏱ {formatTime(timeLeft)}
              </div>
            </div>

            <div className="mcq-body">
              <p className="mcq-question">{q.question}</p>
              <div className="mcq-options">
                {q.options.map((opt, i) => (
                  <button
                    key={i}
                    className={`mcq-option ${answers[current] === i ? "selected" : ""}`}
                    onClick={() => handleSelect(i)}
                  >
                    <span className="mcq-opt-letter">{String.fromCharCode(65 + i)}</span>
                    <span className="mcq-opt-text">{opt.text}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mcq-nav">
              <button
                className="adm-btn-cancel"
                onClick={() => setCurrent(c => Math.max(0, c - 1))}
                disabled={current === 0}
              >← Prev</button>

              <div className="mcq-dot-nav">
                {questions.map((_, i) => (
                  <button
                    key={i}
                    className={`mcq-dot ${answers[i] !== undefined ? "answered" : ""} ${i === current ? "active" : ""}`}
                    onClick={() => setCurrent(i)}
                    title={`Q${i + 1}`}
                  />
                ))}
              </div>

              {current < questions.length - 1 ? (
                <button className="adm-btn-save" onClick={() => setCurrent(c => c + 1)}>
                  Next →
                </button>
              ) : (
                <button className="adm-btn-save" onClick={handleSubmit} disabled={submitting}>
                  {submitting ? "Submitting…" : "Submit ✓"}
                </button>
              )}
            </div>
          </>
        )}

        {/* ── RESULT ── */}
        {phase === "result" && result && (
          <div className="mcq-result">
            <div className="mcq-result-circle" style={{
              borderColor: result.percentage >= 85 ? "#00e5a0" : result.percentage >= 60 ? "#ffb800" : "#f87171"
            }}>
              <span className="mcq-result-pct">{result.percentage}%</span>
              <span className="mcq-result-label">Score</span>
            </div>
            <h2 className="mcq-result-title">
              {result.percentage >= 85 ? "🎉 Excellent!" : result.percentage >= 60 ? "👍 Good Job!" : "📚 Keep Practicing"}
            </h2>
            <div className="mcq-result-stats">
              <div className="mcq-rstat"><span className="mcq-rstat-num" style={{ color: "#00e5a0" }}>{result.correct}</span><span className="mcq-rstat-lbl">Correct</span></div>
              <div className="mcq-rstat"><span className="mcq-rstat-num" style={{ color: "#f87171" }}>{result.total - result.correct}</span><span className="mcq-rstat-lbl">Wrong</span></div>
              <div className="mcq-rstat"><span className="mcq-rstat-num" style={{ color: "#a78bfa" }}>{result.score}/{result.maxScore}</span><span className="mcq-rstat-lbl">Points</span></div>
            </div>
            <p className="mcq-result-sub">Your score has been saved automatically. Check the Scores page for details.</p>
            <button className="adm-btn-save" style={{ marginTop: 16 }} onClick={onClose}>Close</button>
          </div>
        )}

      </div>
    </div>
  );
}

/* ── Main Page ───────────────────────────────────────────── */
export default function AssessmentsPage() {
  const [assessments, setAssessments] = useState([]);
  const [tab, setTab] = useState("all");
  const [loading, setLoading] = useState(true);
  const [activeAssessment, setActiveAssessment] = useState(null);
  const [submittedIds, setSubmittedIds] = useState(new Set());

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await assessmentAPI.getAll(tab === "all" ? "" : tab);
      setAssessments(data);
      // Check submission status for available ones
      const available = data.filter(a => a.status === "available");
      const statuses = await Promise.all(
        available.map(a => assessmentAPI.getStatus(a._id).catch(() => ({ data: { submitted: false } })))
      );
      const submitted = new Set();
      available.forEach((a, i) => {
        if (statuses[i]?.data?.submitted) submitted.add(a._id);
      });
      setSubmittedIds(submitted);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => { load(); }, [load]);

  // Auto-refresh every 30s so admin changes appear
  useEffect(() => {
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, [load]);

  const statusColor = { available: "#00e5a0", upcoming: "#ffb800", completed: "#8892b0" };
  const statusIcon  = { available: "●", upcoming: "◌", completed: "✓" };

  return (
    <div className="assess-page">
      {activeAssessment && (
        <MCQModal
          assessment={activeAssessment}
          onClose={() => { setActiveAssessment(null); load(); }}
          onSubmitted={() => setSubmittedIds(prev => new Set([...prev, activeAssessment._id]))}
        />
      )}

      <header className="assess-header fade-up">
        <div>
          <h1 className="assess-page-title">Assessments</h1>
          <p className="assess-page-sub">View and take tests published by your admin</p>
        </div>
        <div className="assess-tabs">
          {TABS.map((t) => (
            <button
              key={t}
              className={`tab-btn ${tab === t ? "active" : ""}`}
              onClick={() => setTab(t)}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </header>

      <div className="assess-legend fade-up">
        <div className="legend-item"><span style={{ color: "#00e5a0" }}>●</span> Available — Open for you to take now</div>
        <div className="legend-item"><span style={{ color: "#ffb800" }}>◌</span> Upcoming — Not yet open</div>
        <div className="legend-item"><span style={{ color: "#8892b0" }}>✓</span> Completed — Archived</div>
      </div>

      {loading ? (
        <div className="assess-skeleton-grid">
          {[...Array(6)].map((_, i) => <div key={i} className="skeleton" style={{ height: 200 }} />)}
        </div>
      ) : (
        <div className="assess-list-grid">
          {assessments.map((a, i) => {
            const isSubmitted = submittedIds.has(a._id);
            return (
              <div key={a._id} className="assess-list-card fade-up" style={{ animationDelay: `${i * 60}ms` }}>
                <div className="alc-subject-stripe" style={{ background: getSubjectColor(a.subject) }} />

                <div className="alc-header">
                  <div className="alc-meta">
                    <span className={`badge badge-${a.difficulty}`}>{a.difficulty}</span>
                    <span className="status-pill" style={{
                      color: statusColor[a.status],
                      borderColor: `${statusColor[a.status]}30`,
                      background: `${statusColor[a.status]}10`,
                    }}>
                      {statusIcon[a.status]} {a.status}
                    </span>
                    {(a.questions?.length > 0) && (
                      <span className="mcq-badge">📝 {a.questions.length} MCQs</span>
                    )}
                  </div>
                  <span className="alc-due">Due {formatDate(a.dueDate)}</span>
                </div>

                <h3 className="alc-title">{a.title}</h3>
                <p className="alc-subject" style={{ color: getSubjectColor(a.subject) }}>{a.subject}</p>

                {a.description && <p className="alc-desc">{a.description}</p>}

                <div className="alc-stats">
                  <div className="alc-stat">
                    <span className="alcs-label">Duration</span>
                    <span className="alcs-val">{a.duration}m</span>
                  </div>
                  <div className="alc-stat">
                    <span className="alcs-label">Max Score</span>
                    <span className="alcs-val">{a.maxScore} pts</span>
                  </div>
                </div>

                {a.status === "available" && !isSubmitted && (
                  <button className="alc-start-btn" onClick={() => setActiveAssessment(a)}>
                    {a.questions?.length > 0 ? "Take MCQ Assessment →" : "Start Assessment →"}
                  </button>
                )}
                {a.status === "available" && isSubmitted && (
                  <div className="alc-done" style={{ color: "#00e5a0" }}>✓ Submitted — Score Saved</div>
                )}
                {a.status === "completed" && (
                  <div className="alc-done">✓ Assessment Closed</div>
                )}
                {a.status === "upcoming" && (
                  <div className="alc-soon">🔒 Opens {formatDate(a.dueDate)}</div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {!loading && assessments.length === 0 && (
        <div className="assess-empty">
          <span style={{ fontSize: 48, display: "block", marginBottom: 12 }}>◌</span>
          <p>No {tab !== "all" ? tab : ""} assessments found.</p>
          <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
            Check back later — your admin will publish assessments here.
          </p>
        </div>
      )}
    </div>
  );
}
