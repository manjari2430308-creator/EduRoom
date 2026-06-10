import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out");
    navigate("/login");
  };

  return (
    <nav style={{ background: "#FDFCFF", borderBottom: "1px solid #CECBF6" }}
      className="px-5 py-3 flex items-center justify-between sticky top-0 z-40">
      <Link to="/dashboard" className="flex items-center gap-2 text-base font-medium" style={{ color: "#534AB7" }}>
        <span style={{ fontSize: 20 }}>🎓</span>
        EduRoom
      </Link>

      <div className="flex items-center gap-3">
        {user?.role === "student" && (
          <Link to="/progress" className="text-sm" style={{ color: "#7F77DD" }}>
            My Progress
          </Link>
        )}
        <div className="flex items-center gap-2">
          <div className="avatar" style={{ width: 32, height: 32, fontSize: 13 }}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <span className="text-sm font-medium hidden sm:block" style={{ color: "#26215C" }}>
            {user?.name}
          </span>
          <span className="badge badge-purple">{user?.role}</span>
        </div>
        <button
          onClick={handleLogout}
          className="text-sm transition-colors"
          style={{ color: "#AFA9EC" }}
          onMouseOver={e => e.target.style.color = "#534AB7"}
          onMouseOut={e => e.target.style.color = "#AFA9EC"}
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
