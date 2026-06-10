import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import ClassCard from "../components/ClassCard";
import { SkeletonList } from "../components/Skeleton";
import toast from "react-hot-toast";

const COVERS = ["#CECBF6", "#AFA9EC", "#C0DD97", "#9FE1CB", "#FAC775", "#F4C0D1"];

export default function Dashboard() {
  const { user } = useAuth();
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [form, setForm] = useState({ title: "", subject: "", description: "", coverColor: "#CECBF6" });
  const [joinCode, setJoinCode] = useState("");

  useEffect(() => {
    api.get("/classrooms")
      .then(r => setClassrooms(r.data))
      .catch(() => toast.error("Failed to load classrooms"))
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post("/classrooms", form);
      setClassrooms([...classrooms, data]);
      setShowCreate(false);
      setForm({ title: "", subject: "", description: "", coverColor: "#CECBF6" });
      toast.success("Classroom created!");
    } catch (err) { toast.error(err.response?.data?.message || "Error"); }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post("/classrooms/join", { joinCode });
      setClassrooms([...classrooms, data.classroom]);
      setShowJoin(false);
      setJoinCode("");
      toast.success("Joined classroom!");
    } catch (err) { toast.error(err.response?.data?.message || "Invalid code"); }
  };

  const Modal = ({ title, onClose, children }) => (
    <div style={{ position: "fixed", inset: 0, background: "rgba(38,33,92,0.18)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 16 }}>
      <div className="card w-full max-w-md" style={{ borderRadius: 20 }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-medium" style={{ color: "#26215C", fontSize: 16 }}>{title}</h2>
          <button onClick={onClose} style={{ color: "#AFA9EC", background: "none", border: "none", fontSize: 20, cursor: "pointer" }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto p-6" style={{ background: "#F5F3FF", minHeight: "100vh" }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-medium" style={{ color: "#26215C" }}>
            Welcome, {user?.name}!
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "#7F77DD" }}>Your classrooms</p>
        </div>
        {user?.role === "teacher"
          ? <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-1.5">+ Create class</button>
          : <button onClick={() => setShowJoin(true)} className="btn-primary flex items-center gap-1.5">+ Join class</button>
        }
      </div>

      {loading ? <SkeletonList count={4} /> : classrooms.length === 0 ? (
        <div className="text-center py-20">
          <p style={{ fontSize: 48, marginBottom: 12 }}>🏫</p>
          <p className="font-medium" style={{ color: "#3C3489" }}>No classrooms yet</p>
          <p className="text-sm mt-1" style={{ color: "#7F77DD" }}>
            {user?.role === "teacher" ? "Create your first classroom above" : "Join a class with a code"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {classrooms.map(c => <ClassCard key={c._id} classroom={c} />)}
          <button onClick={user?.role === "teacher" ? () => setShowCreate(true) : () => setShowJoin(true)}
            className="card flex flex-col items-center justify-center gap-2 cursor-pointer transition-shadow hover:shadow-md"
            style={{ minHeight: 140, border: "1.5px dashed #AFA9EC", background: "#FDFCFF" }}>
            <span style={{ fontSize: 24, color: "#7F77DD" }}>+</span>
            <span className="text-sm font-medium" style={{ color: "#7F77DD" }}>
              {user?.role === "teacher" ? "New classroom" : "Join a class"}
            </span>
          </button>
        </div>
      )}

      {showCreate && (
        <Modal title="Create classroom" onClose={() => setShowCreate(false)}>
          <form onSubmit={handleCreate} className="space-y-3">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#7F77DD" }}>Class title</label>
              <input className="input" placeholder="e.g. Web Development" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#7F77DD" }}>Subject</label>
              <input className="input" placeholder="e.g. Computer Science" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} required />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#7F77DD" }}>Description (optional)</label>
              <textarea className="input resize-none" rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-2" style={{ color: "#7F77DD" }}>Cover color</label>
              <div className="flex gap-2">
                {COVERS.map(c => (
                  <button key={c} type="button" onClick={() => setForm({ ...form, coverColor: c })}
                    style={{
                      width: 28, height: 28, borderRadius: "50%", background: c, border: "none", cursor: "pointer",
                      outline: form.coverColor === c ? "2.5px solid #534AB7" : "none",
                      outlineOffset: 2,
                    }} />
                ))}
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button type="button" onClick={() => setShowCreate(false)} className="btn-ghost flex-1">Cancel</button>
              <button type="submit" className="btn-primary flex-1">Create</button>
            </div>
          </form>
        </Modal>
      )}

      {showJoin && (
        <Modal title="Join a classroom" onClose={() => setShowJoin(false)}>
          <form onSubmit={handleJoin} className="space-y-3">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#7F77DD" }}>Class join code</label>
              <input className="input text-center text-xl tracking-widest uppercase font-mono py-3"
                placeholder="XXXXXX" value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())} maxLength={6} required />
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => setShowJoin(false)} className="btn-ghost flex-1">Cancel</button>
              <button type="submit" className="btn-primary flex-1">Join</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
