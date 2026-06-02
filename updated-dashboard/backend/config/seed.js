const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
dotenv.config();

const User = require("../models/User");
const Score = require("../models/Score");
const Assessment = require("../models/Assessment");

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to DB...");

  await User.deleteMany({});
  await Score.deleteMany({});
  await Assessment.deleteMany({});

  const hashedPw = await bcrypt.hash("password123", 10);

  // Create admin
  await User.create({
    name: "Admin User",
    email: "admin@studentiq.com",
    password: hashedPw,
    role: "admin",
    avatar: "AD",
  });

  // Create multiple students
  const students = await User.insertMany([
    { name: "Alex Johnson", email: "alex@student.com", password: hashedPw, role: "student", avatar: "AJ", enrolledCourses: ["Mathematics", "Physics", "Computer Science", "Chemistry", "English"], totalStudyHours: 247 },
    { name: "Priya Sharma", email: "priya@student.com", password: hashedPw, role: "student", avatar: "PS", enrolledCourses: ["Mathematics", "Chemistry", "Biology"], totalStudyHours: 180 },
    { name: "Marcus Lee", email: "marcus@student.com", password: hashedPw, role: "student", avatar: "ML", enrolledCourses: ["Computer Science", "Physics", "English"], totalStudyHours: 210 },
    { name: "Sofia Reyes", email: "sofia@student.com", password: hashedPw, role: "student", avatar: "SR", enrolledCourses: ["Mathematics", "English", "History"], totalStudyHours: 155 },
  ]);

  const assessments = await Assessment.insertMany([
    { title: "Calculus Midterm", subject: "Mathematics", maxScore: 100, duration: 90, dueDate: new Date("2024-12-20"), status: "completed", difficulty: "hard" },
    { title: "Quantum Physics Quiz", subject: "Physics", maxScore: 50, duration: 45, dueDate: new Date("2024-12-22"), status: "completed", difficulty: "hard" },
    { title: "Data Structures Exam", subject: "Computer Science", maxScore: 100, duration: 120, dueDate: new Date("2024-12-25"), status: "available", difficulty: "medium" },
    { title: "Organic Chemistry Test", subject: "Chemistry", maxScore: 80, duration: 60, dueDate: new Date("2024-12-28"), status: "available", difficulty: "medium" },
    { title: "Essay Writing", subject: "English", maxScore: 100, duration: 90, dueDate: new Date("2025-01-05"), status: "upcoming", difficulty: "easy" },
    { title: "Linear Algebra Final", subject: "Mathematics", maxScore: 100, duration: 150, dueDate: new Date("2025-01-10"), status: "upcoming", difficulty: "hard" },
    { title: "Thermodynamics Quiz", subject: "Physics", maxScore: 50, duration: 30, dueDate: new Date("2025-01-15"), status: "upcoming", difficulty: "medium" },
  ]);

  const months = ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const subjects = ["Mathematics", "Physics", "Computer Science", "Chemistry", "English"];
  const scoreData = [
    [62, 70, 75, 80, 85, 91],
    [55, 60, 68, 72, 78, 84],
    [70, 74, 80, 85, 88, 93],
    [58, 65, 70, 76, 80, 87],
    [72, 75, 78, 82, 85, 90],
  ];

  const scores = [];

  // Add scores for each student with slight variation
  students.forEach((student, studentIdx) => {
    const variation = [0, -5, 3, -8][studentIdx] || 0;
    subjects.forEach((subject, sIdx) => {
      months.forEach((month, mIdx) => {
        const rawScore = Math.min(100, Math.max(40, scoreData[sIdx][mIdx] + variation + Math.floor(Math.random() * 6) - 3));
        scores.push({
          student: student._id,
          subject,
          assessment: assessments[sIdx % assessments.length]._id,
          score: rawScore,
          maxScore: 100,
          timeSpent: Math.floor(Math.random() * 60) + 30,
          month,
          monthIndex: mIdx,
          year: 2024,
          feedback: rawScore >= 85 ? "Excellent work!" : rawScore >= 70 ? "Good progress." : "Keep practicing.",
        });
      });
    });
  });

  await Score.insertMany(scores);
  console.log("✅ Seed complete!");
  console.log("   Admin:   admin@studentiq.com / password123");
  console.log("   Student: alex@student.com / password123");
  process.exit();
};

seed().catch((e) => { console.error(e); process.exit(1); });
