const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middleware/authMiddleware");
const {
  getOverviewStats,
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  createStudent,
  createAssessment,
  updateAssessment,
  deleteAssessment,
  getAllScores,
  addScore,
  updateScore,
  deleteScore,
  getPlatformTrends,
} = require("../controllers/adminController");

const guard = [protect, adminOnly];

// Overview
router.get("/stats", guard, getOverviewStats);
router.get("/trends", guard, getPlatformTrends);

// Students
router.get("/students", guard, getAllStudents);
router.post("/students", guard, createStudent);
router.get("/students/:id", guard, getStudentById);
router.put("/students/:id", guard, updateStudent);
router.delete("/students/:id", guard, deleteStudent);

// Assessments (admin create/edit/delete)
router.post("/assessments", guard, createAssessment);
router.put("/assessments/:id", guard, updateAssessment);
router.delete("/assessments/:id", guard, deleteAssessment);

// Scores (admin view all + manage)
router.get("/scores", guard, getAllScores);
router.post("/scores", guard, addScore);
router.put("/scores/:id", guard, updateScore);
router.delete("/scores/:id", guard, deleteScore);

module.exports = router;
