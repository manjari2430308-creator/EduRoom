import { useState, useEffect } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { formatDate } from "../utils/formatDate";
import toast from "react-hot-toast";

const CustomTooltip = ({ active, payload }) => {
  if (active && payload?.length) {
    return (
      <div style={{ background: "#FDFCFF", border: "1px solid #CECBF6", borderRadius: 10, padding: "8px 12px" }}>
        <p style={{ color: "#534AB7", fontWeight: 500, fontSize: 14 }}>{payload[0].value}</p>
        <p style={{ color: "#AFA9EC", fontSize: 11 }}>marks</p>
      </div>
    );
  }
  return null;
};

export default function ProgressPage() {
  const { user } = useAuth();
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/submissions/my/grades")
      .then(r => setGrades(r.data))
      .catch(() => toast.error("Failed to load grades"))
      .finally(() => setLoading(false));
  }, []);

  const avg = grades.length ? Math.round(grades.reduce((a, g) => a + (g.grade || 0), 0) / grades.length) : 0;
  const best = grades.length ? Math.max(...grades.map(g => g.grade || 0)) : 0;

  const chartData = grades.map(g => ({
    name: g.assignmentId?.title?.slice(0, 12) + (g.assignmentId?.title?.length > 12 ? "…" : ""),
    grade: g.grade,
  }));

  if (loading) return <div className="text-center py-20" style={{ color: "#AFA9EC" }}>Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto p-6" style={{ background: "#F5F3FF", minHeight: "100vh" }}>
      <h1 className="text-xl font-medium mb-6" style={{ color: "#26215C" }}>My progress</h1>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Graded", value: grades.length, color: "#534AB7", bg: "#EEEDFE", border: "#AFA9EC" },
          { label: "Average", value: `${avg}%`, color: "#0F6E56", bg: "#E1F5EE", border: "#9FE1CB" },
          { label: "Best score", value: best, color: "#854F0B", bg: "#FAEEDA", border: "#FAC775" },
        ].map(s => (
          <div key={s.label} className="rounded-2xl p-4 text-center"
            style={{ background: s.bg, border: `1px solid ${s.border}` }}>
            <p className="text-2xl font-medium" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs mt-1" style={{ color: s.color, opacity: 0.75 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {grades.length > 0 && (
        <div className="card mb-5">
          <h2 className="font-medium text-sm mb-4" style={{ color: "#26215C" }}>Grade trend</h2>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="lavFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#534AB7" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#534AB7" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#EEEDFE" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#AFA9EC" }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#AFA9EC" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="grade" stroke="#534AB7" strokeWidth={2}
                fill="url(#lavFill)" dot={{ r: 4, fill: "#534AB7", strokeWidth: 0 }} activeDot={{ r: 5 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="card">
        <h2 className="font-medium text-sm mb-4" style={{ color: "#26215C" }}>All grades</h2>
        {grades.length === 0 ? (
          <p className="text-center py-8" style={{ color: "#AFA9EC" }}>No graded assignments yet</p>
        ) : (
          <div className="space-y-4">
            {grades.map(g => {
              const pct = Math.round((g.grade / (g.assignmentId?.totalMarks || 100)) * 100);
              return (
                <div key={g._id} className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate" style={{ color: "#26215C" }}>
                      {g.assignmentId?.title}
                    </p>
                    <p className="text-xs" style={{ color: "#AFA9EC" }}>
                      {g.assignmentId?.classroomId?.title} · {formatDate(g.createdAt)}
                    </p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <p className="font-medium text-sm" style={{ color: "#534AB7" }}>
                      {g.grade}<span style={{ color: "#AFA9EC", fontWeight: 400 }}>/{g.assignmentId?.totalMarks}</span>
                    </p>
                    <div className="progress-bar-bg mt-1.5" style={{ width: 80 }}>
                      <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
