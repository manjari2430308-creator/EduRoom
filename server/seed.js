require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const Classroom = require("./models/Classroom");
const Assignment = require("./models/Assignment");

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to DB");

  await User.deleteMany({});
  await Classroom.deleteMany({});
  await Assignment.deleteMany({});

  const teacher = await User.create({
    name: "Prof. Sharma", email: "teacher@eduroom.com", password: "password123", role: "teacher",
  });

  const students = await User.insertMany([
    { name: "Rahul Kumar", email: "rahul@eduroom.com", password: "password123", role: "student" },
    { name: "Priya Singh", email: "priya@eduroom.com", password: "password123", role: "student" },
    { name: "Amit Verma", email: "amit@eduroom.com", password: "password123", role: "student" },
  ]);

  const classroom = await Classroom.create({
    title: "Web Development Bootcamp",
    subject: "Computer Science",
    description: "Full stack web development with MERN",
    teacherId: teacher._id,
    students: students.map(s => s._id),
    coverColor: "#4F46E5",
  });

  await Assignment.insertMany([
    {
      classroomId: classroom._id,
      title: "Build a Todo App",
      description: "Create a functional todo application using React. Include add, delete, and mark complete features.",
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      totalMarks: 100,
    },
    {
      classroomId: classroom._id,
      title: "REST API Design",
      description: "Design and implement a RESTful API for a library management system using Node.js and Express.",
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      totalMarks: 100,
    },
  ]);

  console.log("\n✅ Seed complete!");
  console.log("Teacher  → teacher@eduroom.com / password123");
  console.log("Student  → rahul@eduroom.com   / password123");
  console.log("Student  → priya@eduroom.com   / password123");
  console.log("Student  → amit@eduroom.com    / password123");
  console.log(`Class join code: ${classroom.joinCode}`);
  process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });
