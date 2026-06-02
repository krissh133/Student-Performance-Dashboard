import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import "./LoginPage.css";

const DEMO_CREDENTIALS = [
  { role: "Admin", email: "admin@studentiq.com", password: "password123", color: "#7c6cfc" },
  { role: "Student", email: "alex@student.com", password: "password123", color: "#00d4ff" },
];

export default function LoginPage() {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "login") {
        const data = await login(form.email, form.password);
        localStorage.setItem("studentUser", JSON.stringify(data));
        window.location.href = data.role === "admin" ? "/admin" : "/";
      } else {
        await register(form.name, form.email, form.password);
        window.location.href = "/";
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (cred) => {
    setForm({ name: "", email: cred.email, password: cred.password });
    setMode("login");
    setError("");
  };

  return (
    <div className="login-page">
      <div className="login-bg-grid" />
      <div className="login-orb login-orb-1" />
      <div className="login-orb login-orb-2" />

      <div className="login-card fade-up">
        <div className="login-brand">
          <div className="login-brand-icon">S</div>
          <span className="login-brand-name">StudentIQ</span>
        </div>

        <h1 className="login-title">
          {mode === "login" ? "Welcome back" : "Get started"}
        </h1>
        <p className="login-sub">
          {mode === "login"
            ? "Sign in to your dashboard"
            : "Create a student account"}
        </p>

        {/* Demo credentials */}
        {mode === "login" && (
          <div className="login-demos">
            <p className="login-demos-label">Quick demo login:</p>
            <div className="login-demo-btns">
              {DEMO_CREDENTIALS.map((c) => (
                <button
                  key={c.role}
                  className="demo-fill-btn"
                  style={{
                    borderColor: `${c.color}40`,
                    color: c.color,
                    background: `${c.color}08`,
                  }}
                  onClick={() => fillDemo(c)}
                >
                  <span className="demo-role-dot" style={{ background: c.color }} />
                  {c.role}
                </button>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          {mode === "register" && (
            <div className="form-group">
              <label>Full Name</label>
              <input
                name="name"
                type="text"
                placeholder="Your full name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>
          )}
          <div className="form-group">
            <label>Email</label>
            <input
              name="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              name="password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          {error && <p className="login-error">{error}</p>}

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "Signing in..." : mode === "login" ? "Sign In →" : "Create Account →"}
          </button>
        </form>

        <p className="login-switch">
          {mode === "login" ? "New student?" : "Already have an account?"}
          <button
            className="switch-btn"
            onClick={() => {
              setMode(mode === "login" ? "register" : "login");
              setError("");
            }}
          >
            {mode === "login" ? "Create account" : "Sign in"}
          </button>
        </p>

        <div className="login-role-note">
          <span>Admin accounts are created via seed script.</span>
        </div>
      </div>
    </div>
  );
}