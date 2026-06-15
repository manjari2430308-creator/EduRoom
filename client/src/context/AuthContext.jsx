import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/auth/me")
      .then(r => setUser(r.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

 const login = async (email, password) => {
  const { data } = await api.post("/auth/login", { email, password });
  localStorage.setItem("token", data.accessToken);
  setUser(data);
  return data;
};

const register = async (name, email, password, role) => {
  const { data } = await api.post("/auth/register", { name, email, password, role });
  localStorage.setItem("token", data.accessToken);
  setUser(data);
  return data;
};

const logout = async () => {
  await api.post("/auth/logout");
  localStorage.removeItem("token");
  setUser(null);
};

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "#F5F3FF",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 16
      }}>
        <div style={{
          width: 52, height: 52, borderRadius: 16,
          background: "#EEEDFE", border: "1.5px solid #AFA9EC",
          display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: 26
        }}>🎓</div>
        <p style={{ color: "#7F77DD", fontSize: 14 }}>Loading EduRoom...</p>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);