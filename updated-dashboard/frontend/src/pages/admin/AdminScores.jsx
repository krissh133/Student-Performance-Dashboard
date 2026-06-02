import { useState, useEffect } from "react";
import { adminAPI, assessmentAPI } from "../../utils/api";
import { getPerformanceLevel, getPerformanceColor, getSubjectColor } from "../../utils/helpers";
import "./AdminScores.css";
import "../admin/AdminStudents.css";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const emptyForm = { studentId: "", assessmentId: "", subject: "Mathematics", score: "", maxScore: 100, timeSpent: 45, month: "Jan", monthIndex: 0, year: 2024, feedback: "" };

export default function AdminScores() {
  const [scores, setScores] = useState([]);
  const [students, setStudents] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [filterStudent, setFilterStudent] = useState("all");
  const [search, setSearch] = useState("");

  const load = () => {
    setLoading(true);
    Promise.all([adminAPI.getAllScores(), adminAPI.getAllStudents(), assessmentAPI.getAll()])
      .then(([sc, st, as]) => { setScores(sc.data); setStudents(st.data); setAssessments(as.data); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditItem(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (s) => {
    setEditItem(s);
    setForm({
      studentId: s.student?._id || "",
      assessmentId: s.assessment?._id || "",
      subject: s.subject,
      score: s.score,
      maxScore: s.maxScore,
      timeSpent: s.timeSpent || 0,
      month: s.month || "Jan",
      monthIndex: s.monthIndex || 0,
      year: s.year || 2024,
      feedback: s.feedback || "",
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, monthIndex: MONTHS.indexOf(form.month) };
      if (editItem) await adminAPI.updateScore(editItem._id, payload);
      else await adminAPI.addScore(payload);
      setShowModal(false);
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Error saving");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try { await adminAPI.deleteScore(id); setDeleteConfirm(null); load(); }
    catch (err) { alert(err.response?.data?.message || "Error deleting"); }
  };

  const filtered = scores.filter((s) => {
    const matchStudent = filterStudent === "all" || s.student?._id === filterStudent;
    const matchSearch = !search || s.subject.toLowerCase().includes(search.toLowerCase()) ||
      s.student?.name?.toLowerCase().includes(search.toLowerCase());
    return matchStudent && matchSearch;
  });

  return (
    <div className="admin-page">
      <header className="adm-header fade-up">
        <div>
          <p className="adm-greeting">Manage</p>
          <h1 className="adm-title">All Scores <span className="adm-title-accent">({scores.length})</span></h1>
        </div>
        <div className="adm-header-actions">
          <input className="adm-search" placeholder="Search subject or student..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <select className="adm-select" value={filterStudent} onChange={(e) => setFilterStudent(e.target.value)}>
            <option value="all">All Students</option>
            {students.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>
          <button className="adm-action-btn primary" onClick={openCreate}>+ Add Score</button>
        </div>
      </header>

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[...Array(8)].map((_, i) => <div key={i} className="skeleton" style={{ height: 60 }} />)}
        </div>
      ) : (
        <div className="stu-table-wrap fade-up-delay-1">
          <table className="stu-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Subject</th>
                <th>Assessment</th>
                <th>Score</th>
                <th>Percentage</th>
                <th>Level</th>
                <th>Period</th>
                <th>Feedback</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => {
                const pct = Math.round((s.score / s.maxScore) * 100);
                const level = getPerformanceLevel(s.score, s.maxScore);
                const color = getPerformanceColor(level);
                return (
                  <tr key={s._id} className="stu-row">
                    <td>
                      <div className="stu-name-cell">
                        <div className="stu-avatar" style={{ fontSize: 10 }}>{s.student?.avatar || "ST"}</div>
                        <span className="stu-name">{s.student?.name || "—"}</span>
                      </div>
                    </td>
                    <td style={{ color: getSubjectColor(s.subject), fontWeight: 600, fontSize: 12 }}>{s.subject}</td>
                    <td className="stu-email">
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        {s.assessment?.title || "—"}
                        {s.totalQuestions > 0 && (
                          <span style={{
                            background: "rgba(0,229,160,0.1)", border: "1px solid rgba(0,229,160,0.25)",
                            color: "#00e5a0", fontSize: 9, fontWeight: 800, padding: "1px 6px",
                            borderRadius: 8, letterSpacing: "0.04em"
                          }}>MCQ</span>
                        )}
                      </div>
                      {s.totalQuestions > 0 && (
                        <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                          {s.correctAnswers}/{s.totalQuestions} correct
                        </div>
                      )}
                    </td>
                    <td>
                      <span style={{ color, fontFamily: "var(--font-display)", fontWeight: 700 }}>{s.score}</span>
                      <span style={{ color: "var(--text-muted)", fontSize: 11 }}>/{s.maxScore}</span>
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 60, height: 5, background: "var(--bg-secondary)", borderRadius: 3, overflow: "hidden" }}>
                          <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 3 }} />
                        </div>
                        <span style={{ color, fontSize: 12, fontWeight: 700 }}>{pct}%</span>
                      </div>
                    </td>
                    <td><span className={`badge badge-${level.toLowerCase()}`}>{level}</span></td>
                    <td className="stu-num">{s.month} {s.year}</td>
                    <td className="stu-email" style={{ fontStyle: "italic", maxWidth: 140 }}>{s.feedback}</td>
                    <td>
                      <div className="stu-actions">
                        <button className="stu-btn edit" onClick={() => openEdit(s)}>Edit</button>
                        <button className="stu-btn del" onClick={() => setDeleteConfirm(s)}>Del</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="stu-empty">No scores found.</div>}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="adm-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="adm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="adm-modal-header">
              <h2 className="adm-modal-title">{editItem ? "Edit Score" : "Add Score"}</h2>
              <button className="adm-modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSave} className="adm-modal-form">
              <div className="adm-form-row">
                <div className="adm-form-group">
                  <label>Student</label>
                  <select required value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })}>
                    <option value="">Select student</option>
                    {students.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
                  </select>
                </div>
                <div className="adm-form-group">
                  <label>Assessment</label>
                  <select value={form.assessmentId} onChange={(e) => setForm({ ...form, assessmentId: e.target.value })}>
                    <option value="">None</option>
                    {assessments.map((a) => <option key={a._id} value={a._id}>{a.title}</option>)}
                  </select>
                </div>
              </div>
              <div className="adm-form-row">
                <div className="adm-form-group">
                  <label>Subject</label>
                  <input required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="e.g. Mathematics" />
                </div>
                <div className="adm-form-group">
                  <label>Month</label>
                  <select value={form.month} onChange={(e) => setForm({ ...form, month: e.target.value, monthIndex: MONTHS.indexOf(e.target.value) })}>
                    {MONTHS.map((m) => <option key={m}>{m}</option>)}
                  </select>
                </div>
              </div>
              <div className="adm-form-row">
                <div className="adm-form-group">
                  <label>Score</label>
                  <input required type="number" value={form.score} onChange={(e) => setForm({ ...form, score: Number(e.target.value) })} min={0} max={form.maxScore} />
                </div>
                <div className="adm-form-group">
                  <label>Max Score</label>
                  <input required type="number" value={form.maxScore} onChange={(e) => setForm({ ...form, maxScore: Number(e.target.value) })} min={1} />
                </div>
              </div>
              <div className="adm-form-row">
                <div className="adm-form-group">
                  <label>Time Spent (min)</label>
                  <input type="number" value={form.timeSpent} onChange={(e) => setForm({ ...form, timeSpent: Number(e.target.value) })} min={0} />
                </div>
                <div className="adm-form-group">
                  <label>Year</label>
                  <input type="number" value={form.year} onChange={(e) => setForm({ ...form, year: Number(e.target.value) })} min={2020} max={2030} />
                </div>
              </div>
              <div className="adm-form-group">
                <label>Feedback</label>
                <input value={form.feedback} onChange={(e) => setForm({ ...form, feedback: e.target.value })} placeholder="e.g. Excellent work!" />
              </div>
              <div className="adm-modal-footer">
                <button type="button" className="adm-btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="adm-btn-save" disabled={saving}>
                  {saving ? "Saving..." : editItem ? "Save Changes" : "Add Score"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="adm-modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="adm-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="adm-confirm-icon">⚠</div>
            <h3>Delete Score?</h3>
            <p>This will remove <strong>{deleteConfirm.student?.name}'s</strong> {deleteConfirm.subject} score permanently.</p>
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
