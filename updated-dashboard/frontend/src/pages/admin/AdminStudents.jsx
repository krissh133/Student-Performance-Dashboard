import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { adminAPI } from "../../utils/api";
import { getPerformanceColor, getPerformanceLevel } from "../../utils/helpers";
import "./AdminStudents.css";

const COURSES = ["Mathematics", "Physics", "Computer Science", "Chemistry", "English", "Biology", "History"];

const emptyForm = { name: "", email: "", password: "", enrolledCourses: [], totalStudyHours: 0 };

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editStudent, setEditStudent] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const navigate = useNavigate();

  const load = () => {
    setLoading(true);
    adminAPI.getAllStudents().then(({ data }) => setStudents(data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditStudent(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (s) => {
    setEditStudent(s);
    setForm({ name: s.name, email: s.email, password: "", enrolledCourses: s.enrolledCourses || [], totalStudyHours: s.totalStudyHours || 0 });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editStudent) {
        const payload = { name: form.name, email: form.email, enrolledCourses: form.enrolledCourses, totalStudyHours: form.totalStudyHours };
        await adminAPI.updateStudent(editStudent._id, payload);
      } else {
        await adminAPI.createStudent(form);
      }
      setShowModal(false);
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Error saving student");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await adminAPI.deleteStudent(id);
      setDeleteConfirm(null);
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Error deleting student");
    }
  };

  const toggleCourse = (course) => {
    setForm((f) => ({
      ...f,
      enrolledCourses: f.enrolledCourses.includes(course)
        ? f.enrolledCourses.filter((c) => c !== course)
        : [...f.enrolledCourses, course],
    }));
  };

  const filtered = students.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="admin-page">
      <header className="adm-header fade-up">
        <div>
          <p className="adm-greeting">Manage</p>
          <h1 className="adm-title">Students <span className="adm-title-accent">({students.length})</span></h1>
        </div>
        <div className="adm-header-actions">
          <input
            className="adm-search"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="adm-action-btn primary" onClick={openCreate}>+ Add Student</button>
        </div>
      </header>

      {loading ? (
        <div className="stu-skeleton">{[...Array(5)].map((_, i) => <div key={i} className="skeleton" style={{ height: 68 }} />)}</div>
      ) : (
        <div className="stu-table-wrap fade-up-delay-1">
          <table className="stu-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Email</th>
                <th>Enrolled Courses</th>
                <th>Avg Score</th>
                <th>Best Score</th>
                <th>Tests</th>
                <th>Study Hrs</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => {
                const level = getPerformanceLevel(s.avgScore);
                const color = getPerformanceColor(level);
                return (
                  <tr key={s._id} className="stu-row">
                    <td>
                      <div className="stu-name-cell">
                        <div className="stu-avatar">{s.avatar || s.name.slice(0,2).toUpperCase()}</div>
                        <span className="stu-name">{s.name}</span>
                      </div>
                    </td>
                    <td className="stu-email">{s.email}</td>
                    <td>
                      <div className="stu-courses">
                        {(s.enrolledCourses || []).slice(0, 2).map((c) => (
                          <span key={c} className="stu-course-pill">{c}</span>
                        ))}
                        {(s.enrolledCourses || []).length > 2 && (
                          <span className="stu-course-more">+{s.enrolledCourses.length - 2}</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={`badge badge-${level.toLowerCase()}`} style={{ color }}>{s.avgScore}%</span>
                    </td>
                    <td>
                      <span style={{ color, fontFamily: "var(--font-display)", fontWeight: 700 }}>{s.bestScore}%</span>
                    </td>
                    <td className="stu-num">{s.totalScores}</td>
                    <td className="stu-num">{s.totalStudyHours}h</td>
                    <td>
                      <div className="stu-actions">
                        <button className="stu-btn view" onClick={() => navigate(`/admin/students/${s._id}`)}>View</button>
                        <button className="stu-btn edit" onClick={() => openEdit(s)}>Edit</button>
                        <button className="stu-btn del" onClick={() => setDeleteConfirm(s)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="stu-empty">No students found{search ? ` for "${search}"` : ""}.</div>
          )}
        </div>
      )}

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="adm-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="adm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="adm-modal-header">
              <h2 className="adm-modal-title">{editStudent ? "Edit Student" : "Add Student"}</h2>
              <button className="adm-modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSave} className="adm-modal-form">
              <div className="adm-form-row">
                <div className="adm-form-group">
                  <label>Full Name</label>
                  <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Student name" />
                </div>
                <div className="adm-form-group">
                  <label>Email</label>
                  <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email address" />
                </div>
              </div>
              {!editStudent && (
                <div className="adm-form-group">
                  <label>Password <span className="adm-form-hint">(default: password123)</span></label>
                  <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Leave blank for default" />
                </div>
              )}
              <div className="adm-form-group">
                <label>Study Hours</label>
                <input type="number" value={form.totalStudyHours} onChange={(e) => setForm({ ...form, totalStudyHours: Number(e.target.value) })} min={0} />
              </div>
              <div className="adm-form-group">
                <label>Enrolled Courses</label>
                <div className="adm-course-grid">
                  {COURSES.map((c) => (
                    <button key={c} type="button"
                      className={`adm-course-chip ${form.enrolledCourses.includes(c) ? "selected" : ""}`}
                      onClick={() => toggleCourse(c)}>{c}</button>
                  ))}
                </div>
              </div>
              <div className="adm-modal-footer">
                <button type="button" className="adm-btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="adm-btn-save" disabled={saving}>
                  {saving ? "Saving..." : editStudent ? "Save Changes" : "Create Student"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="adm-modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="adm-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="adm-confirm-icon">⚠</div>
            <h3>Delete Student?</h3>
            <p>This will permanently delete <strong>{deleteConfirm.name}</strong> and all their scores.</p>
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
