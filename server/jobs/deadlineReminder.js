const cron = require("node-cron");
const Assignment = require("../models/Assignment");
const Classroom = require("../models/Classroom");
const User = require("../models/User");
const Submission = require("../models/Submission");
const { sendDeadlineReminder } = require("../utils/sendEmail");

const startDeadlineJob = () => {
  // Run every day at 8 AM
  cron.schedule("0 8 * * *", async () => {
    console.log("Running deadline reminder job...");
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const start = new Date(tomorrow.setHours(0, 0, 0, 0));
      const end = new Date(tomorrow.setHours(23, 59, 59, 999));

      const assignments = await Assignment.find({ dueDate: { $gte: start, $lte: end } })
        .populate("classroomId");

      for (const assignment of assignments) {
        const classroom = assignment.classroomId;
        const students = await User.find({ _id: { $in: classroom.students } });

        for (const student of students) {
          const submitted = await Submission.findOne({
            assignmentId: assignment._id,
            studentId: student._id,
          });
          if (!submitted) {
            await sendDeadlineReminder({
              to: student.email,
              name: student.name,
              assignmentTitle: assignment.title,
              dueDate: assignment.dueDate,
              classroomTitle: classroom.title,
            });
          }
        }
      }
    } catch (err) {
      console.error("Deadline reminder job error:", err.message);
    }
  });
  console.log("Deadline reminder cron job started");
};

module.exports = { startDeadlineJob };
