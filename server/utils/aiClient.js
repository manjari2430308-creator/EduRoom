const OpenAI = require("openai");

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || "sk-placeholder" 
});

const generateFeedback = async (submissionContent, assignmentTitle) => {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "You are a helpful teacher's assistant. Generate constructive, specific feedback for a student's assignment submission. Be encouraging but point out areas for improvement. Keep feedback under 200 words.",
      },
      {
        role: "user",
        content: `Assignment: ${assignmentTitle}\n\nStudent submission:\n${submissionContent}\n\nProvide constructive feedback:`,
      },
    ],
  });
  return completion.choices[0].message.content;
};

const answerDoubt = async (messages, assignmentTitle, subject) => {
  const systemMsg = {
    role: "system",
    content: `You are a helpful teaching assistant for the subject "${subject}". The student is working on an assignment titled "${assignmentTitle}". Answer their doubts clearly and concisely. Guide them rather than giving direct answers.`,
  };
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [systemMsg, ...messages],
  });
  return completion.choices[0].message.content;
};

const summarizeSubmissions = async (submissions, assignmentTitle, totalStudents) => {
  const submissionTexts = submissions
    .map((s, i) => `Student ${i + 1}: ${s.content || "[File submission - no text]"}`)
    .join("\n\n");

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "You are an AI assistant helping a teacher understand how their class performed on an assignment. Provide a concise summary with: number who attempted, common themes/mistakes, and suggested topics to revisit.",
      },
      {
        role: "user",
        content: `Assignment: "${assignmentTitle}"\nTotal students: ${totalStudents}\nStudents who submitted: ${submissions.length}\n\nSubmissions:\n${submissionTexts}\n\nProvide a class performance summary:`,
      },
    ],
  });
  return completion.choices[0].message.content;
};

module.exports = { generateFeedback, answerDoubt, summarizeSubmissions };
