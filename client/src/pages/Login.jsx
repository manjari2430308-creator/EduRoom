import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
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
          <h1 className="text-2xl font-medium" style={{ color: "#26215C" }}>EduRoom</h1>
          <p className="text-sm mt-1" style={{ color: "#7F77DD" }}>Your smart classroom, reimagined</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "#7F77DD" }}>Email address</label>
              <input className="input" type="email" placeholder="you@example.com"
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "#7F77DD" }}>Password</label>
              <input className="input" type="password" placeholder="••••••••"
                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 text-sm">
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="text-center text-sm mt-4" style={{ color: "#7F77DD" }}>
            No account?{" "}
            <Link to="/register" className="font-medium" style={{ color: "#534AB7" }}>Create one free</Link>
          </p>

          <div style={{ borderTop: "1px solid #CECBF6", marginTop: 16, paddingTop: 14 }}>
            <p className="text-xs font-medium mb-2" style={{ color: "#AFA9EC" }}>Demo accounts</p>
            <div className="space-y-1">
              <p className="text-xs" style={{ color: "#7F77DD" }}>Teacher: teacher@eduroom.com / password123</p>
              <p className="text-xs" style={{ color: "#7F77DD" }}>Student: rahul@eduroom.com / password123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
