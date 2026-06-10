const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    classroomId: { type: mongoose.Schema.Types.ObjectId, ref: "Classroom", required: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    type: { type: String, enum: ["announcement", "message"], default: "announcement" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);
