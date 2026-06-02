const Assessment = require("../models/Assessment");
const Score = require("../models/Score");

const getAssessments = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    // Don't return correctOption to students
    const assessments = await Assessment.find(filter)
      .select("-questions.correctOption")
      .sort({ dueDate: 1 });
    res.json(assessments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getAssessmentById = async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id).select("-questions.correctOption");
    if (!assessment) return res.status(404).json({ message: "Assessment not found" });
    res.json(assessment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Student submits MCQ answers — auto-graded
const submitAssessment = async (req, res) => {
  try {
    const { answers, timeSpent } = req.body;
    const assessment = await Assessment.findById(req.params.id);
    if (!assessment) return res.status(404).json({ message: "Assessment not found" });
    if (assessment.status !== "available")
      return res.status(400).json({ message: "This assessment is not available for submission" });

    // Check if already submitted
    const existing = await Score.findOne({ student: req.user._id, assessment: assessment._id });
    if (existing) return res.status(400).json({ message: "You have already submitted this assessment" });

    // Grade the answers
    let correct = 0;
    const questions = assessment.questions || [];
    questions.forEach((q, idx) => {
      if (answers[idx] !== undefined && answers[idx] === q.correctOption) correct++;
    });

    const totalQ = questions.length;
    const score = totalQ > 0 ? Math.round((correct / totalQ) * assessment.maxScore) : 0;

    const now = new Date();
    const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const month = monthNames[now.getMonth()];
    const monthIndex = now.getMonth();
    const year = now.getFullYear();

    const savedScore = await Score.create({
      student: req.user._id,
      assessment: assessment._id,
      subject: assessment.subject,
      score,
      maxScore: assessment.maxScore,
      timeSpent: timeSpent || 0,
      month,
      monthIndex,
      year,
      submittedAnswers: answers,
      correctAnswers: correct,
      totalQuestions: totalQ,
      submittedAt: now,
    });

    res.status(201).json({
      score,
      maxScore: assessment.maxScore,
      correct,
      total: totalQ,
      percentage: Math.round((score / assessment.maxScore) * 100),
      scoreId: savedScore._id,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Check if current student already submitted this assessment
const getSubmissionStatus = async (req, res) => {
  try {
    const score = await Score.findOne({
      student: req.user._id,
      assessment: req.params.id,
    });
    res.json({ submitted: !!score, score: score || null });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getAssessments, getAssessmentById, submitAssessment, getSubmissionStatus };
