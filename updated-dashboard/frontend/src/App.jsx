import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import AssessmentsPage from "./pages/AssessmentsPage";
import ScoresPage from "./pages/ScoresPage";
import Layout from "./components/Layout/Layout";

import AdminLayout from "./components/Admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminStudents from "./pages/admin/AdminStudents";
import AdminAssessments from "./pages/admin/AdminAssessments";
import AdminScores from "./pages/admin/AdminScores";
import StudentDetail from "./pages/admin/StudentDetail";

const Loader = () => (
  <div style={{
    display: "flex", alignItems: "center", justifyContent: "center",
    height: "100vh", background: "#0a0c12", color: "#8892b0",
    fontFamily: "DM Sans, sans-serif", gap: 12, fontSize: 14,
  }}>
    <div style={{
      width: 22, height: 22,
      border: "2px solid #1f2535",
      borderTop: "2px solid #00d4ff",
      borderRadius: "50%",
      animation: "spin 0.8s linear infinite",
    }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    Loading...
  </div>
);

// Waits for auth to resolve before rendering — prevents white flash
const AuthGate = ({ children }) => {
  const { loading } = useAuth();
  if (loading) return <Loader />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AuthGate>
          <Routes>
            {/* Login — works for switching accounts */}
            <Route path="/login" element={<LoginPage />} />

            {/* Student dashboard — direct access, no guard */}
            <Route path="/" element={<Layout />}>
              <Route index element={<DashboardPage />} />
              <Route path="assessments" element={<AssessmentsPage />} />
              <Route path="scores" element={<ScoresPage />} />
            </Route>

            {/* Admin dashboard — direct access, no guard */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="students" element={<AdminStudents />} />
              <Route path="students/:id" element={<StudentDetail />} />
              <Route path="assessments" element={<AdminAssessments />} />
              <Route path="scores" element={<AdminScores />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthGate>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;