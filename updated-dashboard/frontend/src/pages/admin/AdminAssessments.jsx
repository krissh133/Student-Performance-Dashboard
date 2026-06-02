import { useState, useEffect } from "react";
import { adminAPI, assessmentAPI } from "../../utils/api";
import { getSubjectColor, formatDate } from "../../utils/helpers";
import "./AdminAssessments.css";

const SUBJECTS = ["Data Science", "Operating Systems", "Computer Science", "Software Engineering", "Web devlopment", "Computer Networks", "Database Managment Systems"];
const emptyForm = {
  title: "", subject: "Mathematics", maxScore: 100, duration: 60,
  dueDate: "", status: "upcoming", difficulty: "medium", description: "",
  questions: [],
};
const emptyQuestion = { question: "", options: [{ text: "" }, { text: "" }, { text: "" }, { text: "" }], correctOption: 0, marks: 1 };

/* ── MCQ Question Builder ─────────────────────────────── */
function QuestionBuilder({ questions, onChange }) {
  const addQuestion = () => onChange([...questions, JSON.parse(JSON.stringify(emptyQuestion))]);

  const removeQuestion = (qi) => onChange(questions.filter((_, i) => i !== qi));

  const updateQuestion = (qi, field, val) => {
    const updated = questions.map((q, i) => i === qi ? { ...q, [field]: val } : q);
    onChange(updated);
  };

  const updateOption = (qi, oi, val) => {
    const updated = questions.map((q, i) => {
      if (i !== qi) return q;
      const opts = q.options.map((o, j) => j === oi ? { text: val } : o);
      return { ...q, options: opts };
    });
    onChange(updated);
  };

  const addOption = (qi) => {
    const updated = questions.map((q, i) => {
      if (i !== qi || q.options.length >= 6) return q;
      return { ...q, options: [...q.options, { text: "" }] };
    });
    onChange(updated);
  };

  const removeOption = (qi, oi) => {
    const updated = questions.map((q, i) => {
      if (i !== qi || q.options.length <= 2) return q;
      const opts = q.options.filter((_, j) => j !== oi);
      const correctOption = q.correctOption >= opts.length ? opts.length - 1 : q.correctOption;
      return { ...q, options: opts, correctOption };
    });
    onChange(updated);
  };

  return (
    <div className="qb-root">
      <div className="qb-header">
        <div>
          <p className="qb-label">MCQ Questions</p>
          <p className="qb-sub">{questions.length} question{questions.length !== 1 ? "s" : ""} added</p>
        </div>
        <button type="button" className="qb-add-btn" onClick={addQuestion}>+ Add Question</button>
      </div>

      {questions.length === 0 && (
        <div className="qb-empty">
          <span>📝</span>
          <p>No questions yet. Click "Add Question" to create MCQs that students will answer.</p>
        </div>
      )}

      <div className="qb-list">
        {questions.map((q, qi) => (
          <div key={qi} className="qb-question-card">
            <div className="qb-q-header">
              <span className="qb-q-num">Q{qi + 1}</span>
              <div className="qb-q-actions">
                <div className="qb-marks-wrap">
                  <label className="qb-marks-label">Marks</label>
                  <input
                    type="number" min={1} max={10}
                    value={q.marks}
                    onChange={(e) => updateQuestion(qi, "marks", Number(e.target.value))}
                    className="qb-marks-input"
                  />
                </div>
                <button type="button" className="qb-remove-btn" onClick={() => removeQuestion(qi)} title="Remove question">✕</button>
              </div>
            </div>

            <textarea
              className="qb-question-input"
              placeholder={`Question ${qi + 1} — e.g. What is the value of π (pi)?`}
              value={q.question}
              onChange={(e) => updateQuestion(qi, "question", e.target.value)}
              rows={2}
            />

            <div className="qb-options-label">Options <span className="qb-correct-hint">(click radio to mark correct answer)</span></div>
            <div className="qb-options">
              {q.options.map((opt, oi) => (
                <div key={oi} className={`qb-option-row ${q.correctOption === oi ? "correct" : ""}`}>
                  <button
                    type="button"
                    className={`qb-radio ${q.correctOption === oi ? "checked" : ""}`}
                    onClick={() => updateQuestion(qi, "correctOption", oi)}
                    title="Mark as correct"
                  >
                    {q.correctOption === oi ? "●" : "○"}
                  </button>
                  <span className="qb-opt-letter">{String.fromCharCode(65 + oi)}</span>
                  <input
                    type="text"
                    className="qb-opt-input"
                    placeholder={`Option ${String.fromCharCode(65 + oi)}`}
                    value={opt.text}
                    onChange={(e) => updateOption(qi, oi, e.target.value)}
                  />
                  {q.options.length > 2 && (
                    <button type="button" className="qb-opt-remove" onClick={() => removeOption(qi, oi)} title="Remove option">✕</button>
                  )}
                </div>
              ))}
            </div>

            {q.options.length < 6 && (
              <button type="button" className="qb-add-opt-btn" onClick={() => addOption(qi)}>
                + Add Option
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Main Page ─────────────────────────────────────────── */
export default function AdminAssessments() {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [activeTab, setActiveTab] = useState("details"); // details | questions

  const load = () => {
    setLoading(true);
    assessmentAPI.getAll().then(({ data }) => setAssessments(data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditItem(null);
    setForm(emptyForm);
    setActiveTab("details");
    setShowModal(true);
  };

  const openEdit = (a) => {
    setEditItem(a);
    setForm({
      title: a.title, subject: a.subject, maxScore: a.maxScore,
      duration: a.duration, dueDate: a.dueDate ? a.dueDate.split("T")[0] : "",
      status: a.status, difficulty: a.difficulty, description: a.description || "",
      questions: a.questions ? JSON.parse(JSON.stringify(a.questions)) : [],
    });
    setActiveTab("details");
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Validate questions
      for (const q of form.questions) {
        if (!q.question.trim()) { alert("All questions must have text."); setSaving(false); return; }
        for (const opt of q.options) {
          if (!opt.text.trim()) { alert("All options must have text."); setSaving(false); return; }
        }
      }
      if (editItem) await adminAPI.updateAssessment(editItem._id, form);
      else await adminAPI.createAssessment(form);
      setShowModal(false);
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Error saving");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await adminAPI.deleteAssessment(id);
      setDeleteConfirm(null);
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Error deleting");
    }
  };

  const quickStatus = async (a, status) => {
    try { await adminAPI.updateAssessment(a._id, { ...a, status }); load(); } catch {}
  };

  const filtered = filterStatus === "all" ? assessments : assessments.filter((a) => a.status === filterStatus);
  const statusColor = { available: "#00e5a0", upcoming: "#ffb800", completed: "#8892b0" };

  return (
    <div className="admin-page">
      <header className="adm-header fade-up">
        <div>
          <p className="adm-greeting">Manage</p>
          <h1 className="adm-title">Assessments <span className="adm-title-accent">({assessments.length})</span></h1>
        </div>
        <div className="adm-header-actions">
          <div className="assess-tabs">
            {["all", "available", "upcoming", "completed"].map((t) => (
              <button key={t} className={`tab-btn ${filterStatus === t ? "active" : ""}`} onClick={() => setFilterStatus(t)}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
          <button className="adm-action-btn primary" onClick={openCreate}>+ New Assessment</button>
        </div>
      </header>

      <div className="publish-banner fade-up">
        <span className="publish-icon">ℹ</span>
        <p>
          Assessments set to <strong>"Available"</strong> are immediately visible to students. Add MCQ questions so students can take them directly — scores are auto-saved.
        </p>
      </div>

      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
          {[...Array(6)].map((_, i) => <div key={i} className="skeleton" style={{ height: 200 }} />)}
        </div>
      ) : (
        <div className="assess-admin-grid fade-up-delay-1">
          {filtered.map((a, i) => (
            <div key={a._id} className="assess-admin-card fade-up" style={{ animationDelay: `${i * 50}ms` }}>
              <div className="aac-header">
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  <span className={`badge badge-${a.difficulty}`}>{a.difficulty}</span>
                  <span className="status-pill" style={{
                    color: statusColor[a.status],
                    borderColor: `${statusColor[a.status]}30`,
                    background: `${statusColor[a.status]}10`,
                    display: "inline-flex", alignItems: "center",
                    gap: 4, padding: "3px 10px", borderRadius: 20,
                    fontSize: 11, fontWeight: 600, border: "1px solid",
                  }}>● {a.status}</span>
                </div>
                <span className="aac-due">Due {formatDate(a.dueDate)}</span>
              </div>

              <div className="aac-subject-bar" style={{ background: getSubjectColor(a.subject) }} />
              <h4 className="aac-title">{a.title}</h4>
              <p className="aac-subject" style={{ color: getSubjectColor(a.subject) }}>{a.subject}</p>

              {a.description && <p className="aac-desc">{a.description}</p>}

              <div className="aac-meta">
                <div className="aac-meta-item"><span>⏱</span><span>{a.duration}m</span></div>
                <div className="aac-meta-item"><span>🎯</span><span>{a.maxScore} pts</span></div>
                <div className="aac-meta-item">
                  <span>📝</span>
                  <span style={{ color: a.questions?.length > 0 ? "#00e5a0" : "var(--text-muted)" }}>
                    {a.questions?.length || 0} MCQs
                  </span>
                </div>
              </div>

              <div className="aac-quick-actions">
                <span className="aac-quick-label">Publish as:</span>
                {["available", "upcoming", "completed"].map((s) => (
                  <button
                    key={s}
                    className={`aac-quick-btn ${a.status === s ? "active-status" : ""}`}
                    style={{ color: statusColor[s], borderColor: `${statusColor[s]}20` }}
                    onClick={() => quickStatus(a, s)}
                  >
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>

              <div className="aac-footer">
                <button className="stu-btn edit" onClick={() => openEdit(a)}>Edit + MCQs</button>
                <button className="stu-btn del" onClick={() => setDeleteConfirm(a)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="stu-empty">
          No {filterStatus !== "all" ? filterStatus : ""} assessments found.{" "}
          <button style={{ color: "var(--accent-violet)", fontWeight: 600 }} onClick={openCreate}>Create one →</button>
        </div>
      )}

      {/* ── Create / Edit Modal ── */}
      {showModal && (
        <div className="adm-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="adm-modal adm-modal-wide" onClick={(e) => e.stopPropagation()}>
            <div className="adm-modal-header">
              <h2 className="adm-modal-title">{editItem ? "Edit Assessment" : "New Assessment"}</h2>
              <button className="adm-modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>

            {/* Tab switcher */}
            <div className="adm-modal-tabs">
              <button
                type="button"
                className={`adm-modal-tab ${activeTab === "details" ? "active" : ""}`}
                onClick={() => setActiveTab("details")}
              >
                📋 Details
              </button>
              <button
                type="button"
                className={`adm-modal-tab ${activeTab === "questions" ? "active" : ""}`}
                onClick={() => setActiveTab("questions")}
              >
                📝 MCQ Questions
                {form.questions.length > 0 && <span className="adm-tab-badge">{form.questions.length}</span>}
              </button>
            </div>

            <form onSubmit={handleSave} className="adm-modal-form">
              {activeTab === "details" && (
                <>
                  <div className="adm-form-group">
                    <label>Title</label>
                    <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Calculus Midterm" />
                  </div>
                  <div className="adm-form-row">
                    <div className="adm-form-group">
                      <label>Subject</label>
                      <select value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}>
                        {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="adm-form-group">
                      <label>Difficulty</label>
                      <select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })}>
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                    </div>
                  </div>
                  <div className="adm-form-row">
                    <div className="adm-form-group">
                      <label>Max Score</label>
                      <input type="number" value={form.maxScore} onChange={(e) => setForm({ ...form, maxScore: Number(e.target.value) })} min={1} />
                    </div>
                    <div className="adm-form-group">
                      <label>Duration (minutes)</label>
                      <input type="number" value={form.duration} onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })} min={1} />
                    </div>
                  </div>
                  <div className="adm-form-row">
                    <div className="adm-form-group">
                      <label>Due Date</label>
                      <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
                    </div>
                    <div className="adm-form-group">
                      <label>Status (Student Access)</label>
                      <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                        <option value="available">Available — Students can take now</option>
                        <option value="upcoming">Upcoming — Not yet accessible</option>
                        <option value="completed">Completed — Archived</option>
                      </select>
                    </div>
                  </div>
                  <div className="adm-form-group">
                    <label>Description <span className="adm-form-hint">(optional)</span></label>
                    <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Assessment description or instructions..." />
                  </div>
                  <div className="adm-form-group">
                    <div className="adm-details-next">
                      <p className="adm-details-next-hint">
                        💡 After setting details, go to the <strong>MCQ Questions</strong> tab to add questions students will answer.
                      </p>
                      <button type="button" className="adm-btn-outline" onClick={() => setActiveTab("questions")}>
                        Add MCQ Questions →
                      </button>
                    </div>
                  </div>
                </>
              )}

              {activeTab === "questions" && (
                <QuestionBuilder
                  questions={form.questions}
                  onChange={(qs) => setForm({ ...form, questions: qs })}
                />
              )}

              <div className="adm-modal-footer">
                <button type="button" className="adm-btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="adm-btn-save" disabled={saving}>
                  {saving ? "Saving..." : editItem ? "Save Changes" : "Create Assessment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirm ── */}
      {deleteConfirm && (
        <div className="adm-modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="adm-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="adm-confirm-icon">⚠</div>
            <h3>Delete Assessment?</h3>
            <p>This will permanently delete <strong>"{deleteConfirm.title}"</strong> and all associated scores.</p>
            <div className="adm-confirm-actions">
              <button className="adm-btn-cancel" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="adm-btn-delete" onClick={() => handleDelete(deleteConfirm._id)}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
