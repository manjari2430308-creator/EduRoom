const Assignment = require("../models/Assignment");
const Classroom = require("../models/Classroom");

const createAssignment = async (req, res) => {
  try {
    const { title, description, dueDate, totalMarks } = req.body;
    const classroom = await Classroom.findById(req.params.classroomId);
    if (!classroom) return res.status(404).json({ message: "Classroom not found" });
    if (classroom.teacherId.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });

    const assignment = await Assignment.create({
      classroomId: req.params.classroomId,
      title, description, dueDate,
      totalMarks: totalMarks || 100,
      attachmentUrl: req.file?.path || "",
      attachmentName: req.file?.originalname || "",
    });

    req.io.to(req.params.classroomId).emit("newAssignment", assignment);
    res.status(201).json(assignment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find({ classroomId: req.params.classroomId }).sort({ dueDate: 1 });
    res.json(assignments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getAssignmentById = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id).populate("classroomId", "title subject");
    if (!assignment) return res.status(404).json({ message: "Assignment not found" });
    res.json(assignment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ message: "Assignment not found" });
    const classroom = await Classroom.findById(assignment.classroomId);
    if (classroom.teacherId.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });
    await assignment.deleteOne();
    res.json({ message: "Assignment deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createAssignment, getAssignments, getAssignmentById, deleteAssignment };
