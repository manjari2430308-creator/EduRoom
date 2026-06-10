const mongoose = require("mongoose");
const { nanoid } = require("nanoid");

const classroomSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    subject: { type: String, required: true },
    description: { type: String, default: "" },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    joinCode: { type: String, unique: true },
    coverColor: { type: String, default: "#4F46E5" },
  },
  { timestamps: true }
);

classroomSchema.pre("save", function (next) {
  if (!this.joinCode) {
    this.joinCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  }
  next();
});

module.exports = mongoose.model("Classroom", classroomSchema);
