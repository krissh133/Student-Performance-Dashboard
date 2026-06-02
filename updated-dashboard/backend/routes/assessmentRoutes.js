const express = require("express");
const router = express.Router();
const { getAssessments, getAssessmentById, submitAssessment, getSubmissionStatus } = require("../controllers/assessmentController");
const { protect } = require("../middleware/authMiddleware");

router.get("/", protect, getAssessments);
router.get("/:id", protect, getAssessmentById);
router.post("/:id/submit", protect, submitAssessment);
router.get("/:id/status", protect, getSubmissionStatus);

module.exports = router;
