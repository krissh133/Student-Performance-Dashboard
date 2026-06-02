import axios from "axios";

const api = axios.create({ baseURL: "/api" });

api.interceptors.request.use((config) => {
  try {
    const user = JSON.parse(localStorage.getItem("studentUser") || "{}");
    if (user.token) config.headers.Authorization = `Bearer ${user.token}`;
  } catch {
    // corrupted storage — skip token
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("studentUser");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export const scoreAPI = {
  getStats: () => api.get("/scores/stats"),
  getTrends: () => api.get("/scores/trends"),
  getRecent: () => api.get("/scores/recent"),
  getAll: () => api.get("/scores"),
};

export const assessmentAPI = {
  getAll: (status) => api.get(`/assessments${status ? `?status=${status}` : ""}`),
  getById: (id) => api.get(`/assessments/${id}`),
  submit: (id, data) => api.post(`/assessments/${id}/submit`, data),
  getStatus: (id) => api.get(`/assessments/${id}/status`),
};

export const studentAPI = {
  getProfile: () => api.get("/students/profile"),
  updateProfile: (data) => api.put("/students/profile", data),
};

export const adminAPI = {
  // Overview
  getStats: () => api.get("/admin/stats"),
  getTrends: () => api.get("/admin/trends"),

  // Students
  getAllStudents: () => api.get("/admin/students"),
  getStudentById: (id) => api.get(`/admin/students/${id}`),
  createStudent: (data) => api.post("/admin/students", data),
  updateStudent: (id, data) => api.put(`/admin/students/${id}`, data),
  deleteStudent: (id) => api.delete(`/admin/students/${id}`),

  // Assessments
  createAssessment: (data) => api.post("/admin/assessments", data),
  updateAssessment: (id, data) => api.put(`/admin/assessments/${id}`, data),
  deleteAssessment: (id) => api.delete(`/admin/assessments/${id}`),

  // Scores
  getAllScores: () => api.get("/admin/scores"),
  addScore: (data) => api.post("/admin/scores", data),
  updateScore: (id, data) => api.put(`/admin/scores/${id}`, data),
  deleteScore: (id) => api.delete(`/admin/scores/${id}`),
};

export default api;
