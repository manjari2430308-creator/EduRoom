import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import AssignmentCard from "../components/AssignmentCard";
import { SkeletonList } from "../components/Skeleton";
import { formatDate } from "../utils/formatDate";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

export default function ClassroomPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [classroom, setClassroom] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("stream");
  const [announcement, setAnnouncement] = useState("");
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", dueDate: "", totalMarks: 100 });
  const [file, setFile] = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [cls, assign, ann] = await Promise.all([
          api.get(`/classrooms/${id}`),
          api.get(`/assignments/classroom/${id}`),
          api.get(`/classrooms/${id}/announcements`),
        ]);
        setClassroom(cls.data); setAssignments(assign.data); setAnnouncements(ann.data);
      } catch { toast.error("Failed to load classroom"); }
      finally { setLoading(false); }
    };
    fetchAll();
    const socket = io({ withCredentials: true });
    socket.emit("joinRoom", id);
    socket.on("newAnnouncement", msg => setAnnouncements(prev => [msg, ...prev]));
    socket.on("newAssignment", a => setAssignments(prev => [a, ...prev]));
    socket.on("newSubmission", ({ student }) => toast.success(`${student} submitted!`));
    return () => { socket.emit("leaveRoom", id); socket.disconnect(); };
  }, [id]);

  const postAnnouncement = async () => {
    if (!announcement.trim()) return;
    try {
      await api.post(`/classrooms/${id}/announcements`, { content: announcement });
      setAnnouncement(""); toast.success("Posted!");
    } catch { toast.error("Failed to post"); }
  };

  const createAssignment = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (file) fd.append("file", file);
      const { data } = await api.post(`/assignments/classroom/${id}`, fd);
      setAssignments([data, ...assignments]);
      setShowAssignForm(false);
      setForm({ title: "", description: "", dueDate: "", totalMarks: 100 });
      toast.success("Assignment created!");
    } catch { toast.error("Failed"); }
  };

  if (loading) return <div className="max-w-4xl mx-auto p-6"><SkeletonList /></div>;

  const TABS = ["stream", "assignments", "students"];

  return (
    <div className="max-w-4xl mx-auto p-6" style={{ background: "#F5F3FF", minHeight: "100vh" }}>
      <div className="rounded-2xl p-5 mb-5 flex items-end justify-between"
        style={{ background: classroom?.coverColor || "#CECBF6", minHeight: 100, border: "1px solid #AFA9EC" }}>
        <div>
          <h1 className="text-xl font-medium" style={{ color: "#26215C" }}>{classroom?.title}</h1>
          <p className="text-sm mt-1" style={{ color: "#3C3489" }}>
            {classroom?.subject} · {classroom?.teacherId?.name}
          </p>
        </div>
        {user?.role === "teacher" && (
          <span className="text-xs font-mono px-3 py-1 rounded-full"
            style={{ background: "rgba(255,255,255,0.5)", color: "#26215C", border: "1px solid rgba(83,74,183,0.2)" }}>
            Code: {classroom?.joinCode}
          </span>
        )}
      </div>

      <div className="tab-bar w-fit mb-5">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} className={`tab-item capitalize ${tab === t ? "active" : ""}`}>{t}</button>
        ))}
      </div>

      {tab === "stream" && (
        <div className="space-y-4">
          {user?.role === "teacher" && (
            <div className="card">
              <textarea className="input resize-none w-full mb-3" rows={2}
                placeholder="Share an announcement with your class..."
                value={announcement} onChange={e => setAnnouncement(e.target.value)} />
              <button onClick={postAnnouncement} className="btn-primary text-sm">Post announcement</button>
            </div>
          )}
          {announcements.length === 0
            ? <p className="text-center py-12" style={{ color: "#AFA9EC" }}>No announcements yet</p>
            : announcements.map(a => (
              <div key={a._id} className="card">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="avatar" style={{ width: 36, height: 36, borderRadius: 10, fontSize: 14 }}>
                    {a.senderId?.name?.[0]}
                  </div>
                  <div>
                    <p className="font-medium text-sm" style={{ color: "#26215C" }}>{a.senderId?.name}</p>
                    <p className="text-xs" style={{ color: "#AFA9EC" }}>{formatDate(a.createdAt)}</p>
                  </div>
                  <span className="badge badge-purple ml-auto">Announcement</span>
                </div>
                <p className="text-sm" style={{ color: "#3C3489", lineHeight: 1.65 }}>{a.content}</p>
              </div>
            ))
          }
        </div>
      )}

      {tab === "assignments" && (
        <div className="space-y-3">
          {user?.role === "teacher" && (
            <button onClick={() => setShowAssignForm(true)} className="btn-primary w-full">+ New Assignment</button>
          )}
          {assignments.length === 0
            ? <p className="text-center py-12" style={{ color: "#AFA9EC" }}>No assignments yet</p>
            : assignments.map(a => <AssignmentCard key={a._id} assignment={a} />)
          }
        </div>
      )}

      {tab === "students" && (
        <div className="card">
          <p className="text-sm mb-3" style={{ color: "#7F77DD" }}>{classroom?.students?.length} students enrolled</p>
          <div className="space-y-1">
            {classroom?.students?.map(s => (
              <div key={s._id} className="flex items-center justify-between py-2.5"
                style={{ borderBottom: "1px solid #EEEDFE" }}>
                <div className="flex items-center gap-2.5">
                  <div className="avatar" style={{ width: 34, height: 34, borderRadius: 10, fontSize: 13 }}>{s.name?.[0]}</div>
                  <div>
                    <p className="font-medium text-sm" style={{ color: "#26215C" }}>{s.name}</p>
                    <p className="text-xs" style={{ color: "#AFA9EC" }}>{s.email}</p>
                  </div>
                </div>
                {user?.role === "teacher" && (
                  <button onClick={async () => {
                    await api.delete(`/classrooms/${id}/students/${s._id}`);
                    setClassroom(prev => ({ ...prev, students: prev.students.filter(st => st._id !== s._id) }));
                    toast.success("Student removed");
                  }} className="text-xs transition-colors" style={{ color: "#AFA9EC" }}
                    onMouseOver={e => e.target.style.color = "#E24B4A"}
                    onMouseOut={e => e.target.style.color = "#AFA9EC"}>
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {showAssignForm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(38,33,92,0.18)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 16 }}>
          <div className="card w-full max-w-lg" style={{ borderRadius: 20 }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-medium" style={{ color: "#26215C" }}>New Assignment</h2>
              <button onClick={() => setShowAssignForm(false)} style={{ color: "#AFA9EC", background: "none", border: "none", fontSize: 20, cursor: "pointer" }}>×</button>
            </div>
            <form onSubmit={createAssignment} className="space-y-3">
              <input className="input" placeholder="Assignment title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
              <textarea className="input resize-none" rows={3} placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs mb-1" style={{ color: "#7F77DD" }}>Due date</label>
                  <input className="input" type="datetime-local" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: "#7F77DD" }}>Total marks</label>
                  <input className="input" type="number" value={form.totalMarks} onChange={e => setForm({ ...form, totalMarks: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: "#7F77DD" }}>Attachment (optional)</label>
                <input type="file" className="input pt-1.5" onChange={e => setFile(e.target.files[0])} />
              </div>
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setShowAssignForm(false)} className="btn-ghost flex-1">Cancel</button>
                <button type="submit" className="btn-primary flex-1">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
