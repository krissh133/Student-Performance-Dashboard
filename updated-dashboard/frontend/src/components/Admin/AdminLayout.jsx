import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./AdminLayout.css";

const NavItem = ({ to, icon, label }) => (
  <NavLink
    to={to}
    end={to === "/admin"}
    className={({ isActive }) => `anav-item ${isActive ? "active" : ""}`}
  >
    <span className="anav-icon">{icon}</span>
    <span className="anav-label">{label}</span>
  </NavLink>
);

export default function AdminLayout() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <div className="admin-brand-icon">KS</div>
          <div>
            <span className="admin-brand-name">Student Dashy</span>
            <span className="admin-brand-tag">Admin</span>
          </div>
        </div>

        <div className="anav-section-label">Overview</div>
        <nav className="admin-nav">
          <NavItem to="/admin" icon="◎" label="Dashboard" />
        </nav>

        <div className="anav-section-label">Manage</div>
        <nav className="admin-nav">
          <NavItem to="/admin/students" icon="◈" label="Students" />
          <NavItem to="/admin/assessments" icon="◉" label="Assessments" />
          <NavItem to="/admin/scores" icon="⬡" label="Scores" />
        </nav>

        <div className="anav-divider" />

        <button className="student-view-btn" onClick={() => navigate("/")}>
          <span>◁</span>
          <span>Student View</span>
        </button>

        <div className="admin-sidebar-footer">
          <div className="admin-user-card">
            <div className="admin-user-avatar">{user?.avatar || "AD"}</div>
            <div className="admin-user-info">
              <p className="admin-user-name">{user?.name || "Admin"}</p>
              <p className="admin-user-role">Administrator</p>
            </div>
          </div>
          <button
            className="admin-logout-btn"
            onClick={() => {
              localStorage.removeItem("studentUser");
              window.location.href = "/";
            }}
          >
            ⟵ Logout
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}