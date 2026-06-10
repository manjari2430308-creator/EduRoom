import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "student" });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.role);
      toast.success("Account created!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "#F5F3FF" }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div style={{
            width: 60, height: 60, borderRadius: 18, background: "#EEEDFE",
            border: "1.5px solid #AFA9EC", display: "flex", alignItems: "center",
            justifyContent: "center", margin: "0 auto 14px", fontSize: 28,
          }}>🎓</div>
          <h1 className="text-2xl font-medium" style={{ color: "#26215C" }}>Join EduRoom</h1>
          <p className="text-sm mt-1" style={{ color: "#7F77DD" }}>Create your free account</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "#7F77DD" }}>Full name</label>
              <input className="input" placeholder="Your name"
                value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "#7F77DD" }}>Email address</label>
              <input className="input" type="email" placeholder="you@example.com"
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "#7F77DD" }}>Password</label>
              <input className="input" type="password" placeholder="Min 6 characters"
                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required minLength={6} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-2" style={{ color: "#7F77DD" }}>I am a</label>
              <div className="grid grid-cols-2 gap-3">
                {["student", "teacher"].map(r => (
                  <button key={r} type="button"
                    onClick={() => setForm({ ...form, role: r })}
                    className="py-2.5 rounded-xl text-sm font-medium transition-all"
                    style={{
                      border: form.role === r ? "2px solid #534AB7" : "1px solid #CECBF6",
                      background: form.role === r ? "#EEEDFE" : "#FDFCFF",
                      color: form.role === r ? "#3C3489" : "#7F77DD",
                    }}>
                    {r === "student" ? "🎓 Student" : "👨‍🏫 Teacher"}
                  </button>
                ))}
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>
          <p className="text-center text-sm mt-4" style={{ color: "#7F77DD" }}>
            Have an account?{" "}
            <Link to="/login" className="font-medium" style={{ color: "#534AB7" }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
