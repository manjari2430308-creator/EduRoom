const Classroom = require("../models/Classroom");
const User = require("../models/User");
const Message = require("../models/Message");

const createClassroom = async (req, res) => {
  try {
    const { title, subject, description, coverColor } = req.body;
    const classroom = await Classroom.create({
      title, subject, description, coverColor,
      teacherId: req.user._id,
    });
    res.status(201).json(classroom);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getMyClassrooms = async (req, res) => {
  try {
    let classrooms;
    if (req.user.role === "teacher") {
      classrooms = await Classroom.find({ teacherId: req.user._id }).populate("teacherId", "name avatar");
    } else {
      classrooms = await Classroom.find({ students: req.user._id }).populate("teacherId", "name avatar");
    }
    res.json(classrooms);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getClassroomById = async (req, res) => {
  try {
    const classroom = await Classroom.findById(req.params.id)
      .populate("teacherId", "name avatar email")
      .populate("students", "name avatar email");
    if (!classroom) return res.status(404).json({ message: "Classroom not found" });
    res.json(classroom);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const joinClassroom = async (req, res) => {
  try {
    const { joinCode } = req.body;
    const classroom = await Classroom.findOne({ joinCode: joinCode.toUpperCase() });
    if (!classroom) return res.status(404).json({ message: "Invalid join code" });
    if (classroom.students.includes(req.user._id))
      return res.status(400).json({ message: "Already enrolled" });

    classroom.students.push(req.user._id);
    await classroom.save();
    res.json({ message: "Joined successfully", classroom });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const removeStudent = async (req, res) => {
  try {
    const classroom = await Classroom.findById(req.params.id);
    if (!classroom) return res.status(404).json({ message: "Classroom not found" });
    if (classroom.teacherId.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });

    classroom.students = classroom.students.filter(s => s.toString() !== req.params.studentId);
    await classroom.save();
    res.json({ message: "Student removed" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getAnnouncements = async (req, res) => {
  try {
    const messages = await Message.find({ classroomId: req.params.id })
      .populate("senderId", "name avatar role")
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const postAnnouncement = async (req, res) => {
  try {
    const { content } = req.body;
    const message = await Message.create({
      classroomId: req.params.id,
      senderId: req.user._id,
      content,
      type: "announcement",
    });
    const populated = await message.populate("senderId", "name avatar role");
    req.io.to(req.params.id).emit("newAnnouncement", populated);
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createClassroom, getMyClassrooms, getClassroomById, joinClassroom, removeStudent, getAnnouncements, postAnnouncement };
