const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendDeadlineReminder = async ({ to, name, assignmentTitle, dueDate, classroomTitle }) => {
  await transporter.sendMail({
    from: `"EduRoom" <${process.env.EMAIL_USER}>`,
    to,
    subject: `Reminder: "${assignmentTitle}" is due tomorrow!`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:24px;border:1px solid #e5e7eb;border-radius:12px">
        <h2 style="color:#4F46E5">EduRoom Reminder</h2>
        <p>Hi <strong>${name}</strong>,</p>
        <p>This is a reminder that your assignment <strong>"${assignmentTitle}"</strong> in <strong>${classroomTitle}</strong> is due tomorrow.</p>
        <p style="color:#6b7280">Due date: ${new Date(dueDate).toLocaleDateString()}</p>
        <a href="${process.env.CLIENT_URL}" style="display:inline-block;margin-top:16px;padding:10px 20px;background:#4F46E5;color:#fff;border-radius:8px;text-decoration:none">Open EduRoom</a>
      </div>
    `,
  });
};

module.exports = { sendDeadlineReminder };
