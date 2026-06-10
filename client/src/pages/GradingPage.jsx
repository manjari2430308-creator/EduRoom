import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import toast from "react-hot-toast";

export default function GradingPage() {
  const { id, submissionId } = useParams();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [grade, setGrade] = useState("");
  const [feedback, setFeedback] = useState("");
  const [aiFeedback, setAiFeedback] = useState("");
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([api.get(`/assignments/${id}`), api.get(`/submissions/${id}/all`)]).then(([a, subs]) => {
      setAssignment(a.data);
      const sub = subs.data.find(s => s._id === submissionId);
      if (sub) { setSubmission(sub); setGrade(sub.grade ?? ""); setFeedback(sub.feedback || ""); setAiFeedback(sub.aiFeedback || ""); }
    }).catch(() => toast.error("Failed to load"));
  }, [id, submissionId]);

  const generateAiFeedback = async () => {
    if (!submission?.content) { toast.error("No text content to analyse"); return; }
    setGenerating(true);
    try {
      const { data } = await api.post("/ai/feedback", { submissionContent: submission.content, assignmentTitle: assignment?.title });
      setAiFeedback(data.feedback); toast.success("AI feedback generated!");
    } catch { toast.error("AI failed"); }
    finally { setGenerating(false); }
  };

  const handleGrade = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.patch(`/submissions/${submissionId}/grade`, { grade: Number(grade), feedback, aiFeedback });
      toast.success("Graded!");
      navigate(`/assignment/${id}`);
    } catch { toast.error("Failed to save"); }
    finally { setSaving(false); }
  };

  const pct = assignment?.totalMarks ? Math.round((Number(grade) / assignment.totalMarks) * 100) : 0;
  const perf = pct >= 90 ? { label: "Excellent", color: "#085041", bg: "#E1F5EE", border: "#9FE1CB" }
    : pct >= 75 ? { label: "Good", color: "#3C3489", bg: "#EEEDFE", border: "#AFA9EC" }
    : pct >= 50 ? { label: "Average", color: "#633806", bg: "#FAEEDA", border: "#FAC775" }
    : { label: "Needs work", color: "#791F1F", bg: "#FCEBEB", border: "#F7C1C1" };

  return (
    <div className="max-w-2xl mx-auto p-6" style={{ background: "#F5F3FF", minHeight: "100vh" }}>
      <div className="flex items-center gap-3 mb-5">
        <div className="avatar" style={{ width: 42, height: 42, borderRadius: 12, fontSize: 15 }}>
          {submission?.studentId?.name?.[0]}
        </div>
        <div>
          <h1 className="text-lg font-medium" style={{ color: "#26215C" }}>
            {submission?.studentId?.name}
          </h1>
          <p className="text-xs" style={{ color: "#7F77DD" }}>{assignment?.title}</p>
        </div>
      </div>

      <div className="card mb-4">
        <h3 className="font-medium text-sm mb-3 flex items-center gap-2" style={{ color: "#26215C" }}>
          <span style={{ color: "#534AB7" }}>📄</span> Student's submission
        </h3>
        {submission?.content ? (
          <div className="rounded-xl p-4 text-sm whitespace-pre-wrap"
            style={{ background: "#F5F3FF", border: "1px solid #CECBF6", color: "#3C3489", lineHeight: 1.65 }}>
            {submission.content}
          </div>
        ) : <p className="text-sm" style={{ color: "#AFA9EC" }}>File-only submission</p>}
        {submission?.fileUrl && (
          <a href={submission.fileUrl} target="_blank" rel="noreferrer"
            className="inline-flex items-center gap-1 mt-3 text-sm" style={{ color: "#534AB7" }}>
            📎 {submission.fileName || "View file"}
          </a>
        )}
      </div>

      <div className="card mb-4" style={{ background: "#EEEDFE", border: "1px solid #AFA9EC" }}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-sm flex items-center gap-2" style={{ color: "#26215C" }}>
            🤖 AI feedback suggestion
          </h3>
          <button onClick={generateAiFeedback} disabled={generating} className="btn-ghost text-xs flex items-center gap-1.5">
            {generating ? "Generating..." : "Generate AI feedback"}
          </button>
        </div>
        {aiFeedback ? (
          <div className="rounded-xl p-4 text-sm" style={{ background: "#FDFCFF", border: "1px solid #CECBF6", color: "#3C3489", lineHeight: 1.7 }}>
            {aiFeedback}
          </div>
        ) : (
          <p className="text-sm" style={{ color: "#7F77DD" }}>
            Click "Generate AI feedback" to get a suggested response based on the student's submission.
          </p>
        )}
      </div>

      <div className="card">
        <h3 className="font-medium text-sm mb-4" style={{ color: "#26215C" }}>Your grade &amp; feedback</h3>
        <form onSubmit={handleGrade} className="space-y-4">
          <div className="flex items-end gap-4">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#7F77DD" }}>
                Grade (out of {assignment?.totalMarks})
              </label>
              <input className="input w-24 text-center text-lg font-medium" type="number"
                min={0} max={assignment?.totalMarks}
                value={grade} onChange={e => setGrade(e.target.value)} required />
            </div>
            {grade !== "" && (
              <div className="flex-1">
                <div className="progress-bar-bg mb-1.5">
                  <div className="progress-bar-fill transition-all" style={{ width: `${pct}%` }} />
                </div>
                <span className="badge text-xs" style={{ background: perf.bg, color: perf.color, border: `1px solid ${perf.border}` }}>
                  {perf.label} · {pct}%
                </span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "#7F77DD" }}>Written feedback</label>
            <textarea className="input resize-none" rows={4}
              placeholder="Write your feedback to the student..."
              value={feedback} onChange={e => setFeedback(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button type="button" onClick={() => navigate(`/assignment/${id}`)} className="btn-ghost">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? "Saving..." : "Save grade"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
