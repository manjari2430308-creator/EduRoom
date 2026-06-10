const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema(
  {
    classroomId: { type: mongoose.Schema.Types.ObjectId, ref: "Classroom", required: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    dueDate: { type: Date, required: true },
    attachmentUrl: { type: String, default: "" },
    attachmentName: { type: String, default: "" },
    totalMarks: { type: Number, default: 100 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Assignment", assignmentSchema);
