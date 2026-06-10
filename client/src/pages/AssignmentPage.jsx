import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import AiDoubtChat from "../components/AiDoubtChat";
import { formatDate, timeUntil, isOverdue } from "../utils/formatDate";
import toast from "react-hot-toast";

export default function AssignmentPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [assignment, setAssignment] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [content, setContent] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [summarizing, setSummarizing] = useState(false);
  const [summary, setSummary] = useState("");

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get(`/assignments/${id}`);
        setAssignment(data);
        if (user?.role === "student") {
          const sub = await api.get(`/submissions/${id}/mine`);
          setSubmission(sub.data);
        } else {
          const subs = await api.get(`/submissions/${id}/all`);
          setSubmissions(subs.data);
        }
      } catch { toast.error("Failed to load"); }
      finally { setLoading(false); }
    };
    fetch();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("content", content);
      if (file) fd.append("file", file);
      const { data } = await api.post(`/submissions/${id}/submit`, fd);
      setSubmission(data);
      toast.success("Submitted!");
    } catch (err) { toast.error(err.response?.data?.message || "Failed"); }
    finally { setSubmitting(false); }
  };

  const handleSummarize = async () => {
    setSummarizing(true);
    try {
      const { data } = await api.post("/ai/summarize", { assignmentId: id });
      setSummary(data.summary);
    } catch { toast.error("AI failed"); }
    finally { setSummarizing(false); }
  };

  if (loading) return <div className="max-w-3xl mx-auto p-6 text-center" style={{ color: "#AFA9EC" }}>Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto p-6" style={{ background: "#F5F3FF", minHeight: "100vh" }}>
      <div className="card mb-5">
        <Link to={`/classroom/${assignment?.classroomId?._id}`}
          className="text-xs flex items-center gap-1 mb-3" style={{ color: "#534AB7" }}>
          ← {assignment?.classroomId?.title}
        </Link>
        <div className="flex items-start justify-between mb-3 gap-3 flex-wrap">
          <h1 className="text-xl font-medium" style={{ color: "#26215C" }}>{assignment?.title}</h1>
          <span className={`badge ${isOverdue(assignment?.dueDate) ? "badge-red" : "badge-amber"}`}>
            {timeUntil(assignment?.dueDate)}
          </span>
        </div>
        <p className="text-sm mb-4" style={{ color: "#534AB7", lineHeight: 1.65 }}>{assignment?.description}</p>
        <div className="flex items-center gap-5 text-sm flex-wrap" style={{ color: "#7F77DD" }}>
          <span>📅 Due: {formatDate(assignment?.dueDate)}</span>
          <span>🏆 {assignment?.totalMarks} marks</span>
          {assignment?.attachmentUrl && (
            <a href={assignment.attachmentUrl} target="_blank" rel="noreferrer" style={{ color: "#534AB7" }}>
              📎 Attachment
            </a>
          )}
        </div>
      </div>

      {user?.role === "student" && (
        <div className="card mb-5">
          <h2 className="font-medium text-sm mb-4" style={{ color: "#26215C" }}>Your submission</h2>
          {submission ? (
            <div>
              <div className="rounded-xl p-4 mb-4 text-sm whitespace-pre-wrap"
                style={{ background: "#F5F3FF", border: "1px solid #CECBF6", color: "#3C3489", lineHeight: 1.65 }}>
                {submission.content || "File submitted"}
              </div>
              {submission.fileUrl && (
                <a href={submission.fileUrl} target="_blank" rel="noreferrer"
                  className="text-sm block mb-3" style={{ color: "#534AB7" }}>
                  📎 {submission.fileName}
                </a>
              )}
              {submission.status === "graded" ? (
                <div className="rounded-xl p-4" style={{ background: "#E1F5EE", border: "1px solid #9FE1CB" }}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl font-medium" style={{ color: "#0F6E56" }}>{submission.grade}</span>
                    <span className="text-sm" style={{ color: "#1D9E75" }}>/ {assignment?.totalMarks}</span>
                  </div>
                  {submission.feedback && <p className="text-sm mb-2" style={{ color: "#085041" }}><strong>Feedback:</strong> {submission.feedback}</p>}
                  {submission.aiFeedback && (
                    <div className="rounded-xl p-3 mt-2" style={{ background: "#EEEDFE", border: "1px solid #AFA9EC" }}>
                      <p className="text-xs font-medium mb-1" style={{ color: "#534AB7" }}>🤖 AI Feedback</p>
                      <p className="text-sm" style={{ color: "#3C3489" }}>{submission.aiFeedback}</p>
                    </div>
                  )}
                </div>
              ) : (
                <span className="badge badge-purple">Awaiting grade</span>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <textarea className="input resize-none" rows={5} placeholder="Write your answer here..."
                value={content} onChange={e => setContent(e.target.value)} />
              <div>
                <label className="block text-xs mb-1" style={{ color: "#7F77DD" }}>Or attach a file</label>
                <input type="file" className="input pt-1.5" onChange={e => setFile(e.target.files[0])} />
              </div>
              <button type="submit" disabled={submitting || (!content.trim() && !file)} className="btn-primary w-full py-2.5">
                {submitting ? "Submitting..." : "Submit Assignment"}
              </button>
            </form>
          )}
        </div>
      )}

      {user?.role === "teacher" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-medium text-sm" style={{ color: "#26215C" }}>
              Submissions ({submissions.length})
            </h2>
            <button onClick={handleSummarize} disabled={summarizing || submissions.length === 0}
              className="btn-secondary text-xs flex items-center gap-1.5">
              🤖 {summarizing ? "Analysing..." : "AI Summary"}
            </button>
          </div>
          {summary && (
            <div className="card mb-4" style={{ background: "#EEEDFE", border: "1px solid #AFA9EC" }}>
              <p className="text-xs font-medium mb-2" style={{ color: "#534AB7" }}>🤖 AI Class Performance Summary</p>
              <p className="text-sm whitespace-pre-wrap" style={{ color: "#3C3489" }}>{summary}</p>
            </div>
          )}
          <div className="space-y-3">
            {submissions.length === 0
              ? <p className="text-center py-10" style={{ color: "#AFA9EC" }}>No submissions yet</p>
              : submissions.map(s => (
                <Link key={s._id} to={`/assignment/${id}/grade/${s._id}`}>
                  <div className="card hover:shadow-md transition-shadow cursor-pointer flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="avatar" style={{ width: 36, height: 36, borderRadius: 10, fontSize: 13 }}>
                        {s.studentId?.name?.[0]}
                      </div>
                      <div>
                        <p className="font-medium text-sm" style={{ color: "#26215C" }}>{s.studentId?.name}</p>
                        <p className="text-xs" style={{ color: "#AFA9EC" }}>{formatDate(s.createdAt)}</p>
                      </div>
                    </div>
                    {s.status === "graded"
                      ? <span className="badge badge-green">{s.grade}/{assignment?.totalMarks}</span>
                      : <span className="badge badge-amber">Needs grading</span>
                    }
                  </div>
                </Link>
              ))
            }
          </div>
        </div>
      )}

      {user?.role === "student" && (
        <AiDoubtChat assignmentTitle={assignment?.title} subject={assignment?.classroomId?.subject} />
      )}
    </div>
  );
}
