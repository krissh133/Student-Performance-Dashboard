const User = require("../models/User");
const Score = require("../models/Score");
const Assessment = require("../models/Assessment");
const bcrypt = require("bcryptjs");

/* ─── OVERVIEW STATS ─────────────────────────────────────── */
const getOverviewStats = async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: "student" });
    const totalAssessments = await Assessment.countDocuments();
    const totalScores = await Score.countDocuments();
    const availableAssessments = await Assessment.countDocuments({ status: "available" });

    const allScores = await Score.find();
    const avgScore = allScores.length
      ? Math.round(allScores.reduce((a, b) => a + (b.score / b.maxScore) * 100, 0) / allScores.length)
      : 0;

    const excellent = allScores.filter((s) => (s.score / s.maxScore) * 100 >= 85).length;
    const good = allScores.filter((s) => { const p = (s.score / s.maxScore) * 100; return p >= 70 && p < 85; }).length;
    const average = allScores.filter((s) => (s.score / s.maxScore) * 100 < 70).length;

    res.json({
      totalStudents,
      totalAssessments,
      totalScores,
      avgScore,
      availableAssessments,
      distribution: { excellent, good, average },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ─── STUDENT MANAGEMENT ─────────────────────────────────── */
const getAllStudents = async (req, res) => {
  try {
    const students = await User.find({ role: "student" }).select("-password").sort({ createdAt: -1 });

    // Attach score stats to each student
    const enriched = await Promise.all(
      students.map(async (s) => {
        const scores = await Score.find({ student: s._id });
        const percentages = scores.map((sc) => (sc.score / sc.maxScore) * 100);
        const avgScore = percentages.length
          ? Math.round(percentages.reduce((a, b) => a + b, 0) / percentages.length)
          : 0;
        const bestScore = percentages.length ? Math.round(Math.max(...percentages)) : 0;
        return { ...s.toObject(), avgScore, bestScore, totalScores: scores.length };
      })
    );

    res.json(enriched);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getStudentById = async (req, res) => {
  try {
    const student = await User.findById(req.params.id).select("-password");
    if (!student) return res.status(404).json({ message: "Student not found" });

    const scores = await Score.find({ student: student._id })
      .populate("assessment", "title subject difficulty")
      .sort({ createdAt: -1 });

    const percentages = scores.map((s) => (s.score / s.maxScore) * 100);
    const avgScore = percentages.length
      ? Math.round(percentages.reduce((a, b) => a + b, 0) / percentages.length)
      : 0;
    const bestScore = percentages.length ? Math.round(Math.max(...percentages)) : 0;

    res.json({ ...student.toObject(), scores, avgScore, bestScore });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateStudent = async (req, res) => {
  try {
    const { name, email, enrolledCourses, totalStudyHours } = req.body;
    const student = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, enrolledCourses, totalStudyHours },
      { new: true }
    ).select("-password");
    if (!student) return res.status(404).json({ message: "Student not found" });
    res.json(student);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteStudent = async (req, res) => {
  try {
    const student = await User.findById(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found" });
    if (student.role === "admin") return res.status(403).json({ message: "Cannot delete admin" });
    await Score.deleteMany({ student: student._id });
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "Student deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createStudent = async (req, res) => {
  try {
    const { name, email, password, enrolledCourses, totalStudyHours } = req.body;
    if (await User.findOne({ email }))
      return res.status(400).json({ message: "Email already in use" });
    const hashed = await bcrypt.hash(password || "password123", 10);
    const student = await User.create({
      name,
      email,
      password: hashed,
      role: "student",
      avatar: name.slice(0, 2).toUpperCase(),
      enrolledCourses: enrolledCourses || [],
      totalStudyHours: totalStudyHours || 0,
    });
    res.status(201).json({ ...student.toObject(), password: undefined });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ─── ASSESSMENT MANAGEMENT ──────────────────────────────── */
const createAssessment = async (req, res) => {
  try {
    const { title, subject, maxScore, duration, dueDate, status, difficulty, description, questions } = req.body;
    const assessment = await Assessment.create({
      title, subject, maxScore, duration, dueDate, status, difficulty, description,
      questions: questions || [],
    });
    res.status(201).json(assessment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateAssessment = async (req, res) => {
  try {
    const assessment = await Assessment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!assessment) return res.status(404).json({ message: "Assessment not found" });
    res.json(assessment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteAssessment = async (req, res) => {
  try {
    const assessment = await Assessment.findByIdAndDelete(req.params.id);
    if (!assessment) return res.status(404).json({ message: "Assessment not found" });
    await Score.deleteMany({ assessment: req.params.id });
    res.json({ message: "Assessment deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ─── SCORE MANAGEMENT ───────────────────────────────────── */
const getAllScores = async (req, res) => {
  try {
    const scores = await Score.find()
      .populate("student", "name email avatar")
      .populate("assessment", "title subject difficulty")
      .sort({ createdAt: -1 });
    res.json(scores);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const addScore = async (req, res) => {
  try {
    const { studentId, assessmentId, subject, score, maxScore, timeSpent, month, monthIndex, year, feedback } = req.body;
    const newScore = await Score.create({
      student: studentId,
      assessment: assessmentId,
      subject,
      score,
      maxScore,
      timeSpent,
      month,
      monthIndex,
      year,
      feedback,
    });
    const populated = await Score.findById(newScore._id)
      .populate("student", "name email")
      .populate("assessment", "title subject");
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateScore = async (req, res) => {
  try {
    const score = await Score.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate("student", "name email")
      .populate("assessment", "title subject");
    if (!score) return res.status(404).json({ message: "Score not found" });
    res.json(score);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteScore = async (req, res) => {
  try {
    const score = await Score.findByIdAndDelete(req.params.id);
    if (!score) return res.status(404).json({ message: "Score not found" });
    res.json({ message: "Score deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ─── PLATFORM-WIDE TRENDS ───────────────────────────────── */
const getPlatformTrends = async (req, res) => {
  try {
    const scores = await Score.find().sort({ monthIndex: 1 });
    const months = [...new Set(scores.map((s) => s.month))];

    const monthlyAvg = months.map((month) => {
      const ms = scores.filter((s) => s.month === month);
      const avg = ms.reduce((a, b) => a + (b.score / b.maxScore) * 100, 0) / ms.length;
      return { month, average: Math.round(avg) };
    });

    const subjectMap = {};
    scores.forEach((s) => {
      if (!subjectMap[s.subject]) subjectMap[s.subject] = [];
      subjectMap[s.subject].push({ month: s.month, score: s.score, maxScore: s.maxScore });
    });

    const subjectAvg = Object.entries(subjectMap).map(([subject, data]) => {
      const avg = data.reduce((a, b) => a + (b.score / b.maxScore) * 100, 0) / data.length;
      return { subject, avg: Math.round(avg) };
    });

    res.json({ monthlyAvg, subjectAvg, months });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
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
};
