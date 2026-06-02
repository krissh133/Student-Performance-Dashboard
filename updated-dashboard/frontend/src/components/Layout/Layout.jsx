import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Layout.css";

const NavItem = ({ to, icon, label }) => (
  <NavLink
    to={to}
    end={to === "/"}
    className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
  >
    <span className="nav-icon">{icon}</span>
    <span className="nav-label">{label}</span>
  </NavLink>
);

export default function Layout() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-icon">KS</div>
          <span className="brand-name">Student Dashy</span>
        </div>

        <nav className="sidebar-nav">
          <NavItem to="/" icon="⬡" label="Dashboard" />
          <NavItem to="/scores" icon="◈" label="My Scores" />
          <NavItem to="/assessments" icon="◉" label="Assessments" />
        </nav>

        {user?.role === "admin" && (
          <div className="admin-switch-wrap">
            <button
              className="admin-switch-btn"
              onClick={() => navigate("/admin")}
            >
              <span>⚙</span>
              <span>Admin Panel</span>
            </button>
          </div>
        )}

        <div className="sidebar-footer">
          <div className="user-card">
            <div className="user-avatar">{user?.avatar || "ST"}</div>
            <div className="user-info">
              <p className="user-name">{user?.name || "Student"}</p>
              <p className="user-email">{user?.email}</p>
            </div>
          </div>
          {/* No logout redirect — just clears session */}
          <button
            className="logout-btn"
            onClick={() => {
              localStorage.removeItem("studentUser");
              window.location.href = "/";
            }}
          >
            ⟵ Logout
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}