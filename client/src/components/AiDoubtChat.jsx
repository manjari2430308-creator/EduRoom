import { useState } from "react";
import api from "../api/axios";

export default function AiDoubtChat({ assignmentTitle, subject }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { role: "user", content: input };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    setLoading(true);
    try {
      const { data } = await api.post("/ai/doubt", { messages: updated, assignmentTitle, subject });
      setMessages([...updated, { role: "assistant", content: data.answer }]);
    } catch {
      setMessages([...updated, { role: "assistant", content: "Sorry, couldn't process that. Try again!" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 50 }}>
      {open && (
        <div style={{
          marginBottom: 12, width: 320, background: "#FDFCFF",
          border: "1px solid #CECBF6", borderRadius: 20,
          display: "flex", flexDirection: "column", height: 420, overflow: "hidden",
        }}>
          <div style={{ background: "#534AB7", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <p style={{ color: "#fff", fontWeight: 500, fontSize: 14, margin: 0 }}>AI Doubt Solver</p>
              <p style={{ color: "#AFA9EC", fontSize: 11, margin: 0 }}>Ask about "{assignmentTitle}"</p>
            </div>
            <button onClick={() => setOpen(false)}
              style={{ color: "#CECBF6", background: "none", border: "none", fontSize: 20, cursor: "pointer", lineHeight: 1 }}>
              ×
            </button>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: 12, background: "#F5F3FF", display: "flex", flexDirection: "column", gap: 8 }}>
            {messages.length === 0 && (
              <p style={{ color: "#AFA9EC", fontSize: 12, textAlign: "center", marginTop: 32 }}>
                Ask any doubt about this assignment
              </p>
            )}
            {messages.map((m, i) => (
              <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
                <div style={{
                  maxWidth: "82%", padding: "8px 12px", borderRadius: 12, fontSize: 12, lineHeight: 1.6,
                  background: m.role === "user" ? "#534AB7" : "#FDFCFF",
                  color: m.role === "user" ? "#fff" : "#3C3489",
                  border: m.role === "user" ? "none" : "1px solid #CECBF6",
                }}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <div style={{ background: "#FDFCFF", border: "1px solid #CECBF6", padding: "8px 12px", borderRadius: 12, display: "flex", gap: 4 }}>
                  {[0, 100, 200].map(d => (
                    <span key={d} style={{ width: 6, height: 6, borderRadius: "50%", background: "#7F77DD", display: "inline-block", animation: `bounce 1s ${d}ms infinite` }} />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div style={{ padding: 12, borderTop: "1px solid #CECBF6", display: "flex", gap: 8, background: "#FDFCFF" }}>
            <input className="input" style={{ flex: 1, fontSize: 12 }}
              placeholder="Type your doubt..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && sendMessage()}
            />
            <button onClick={sendMessage} disabled={loading} className="btn-primary" style={{ padding: "6px 12px", fontSize: 12 }}>
              Send
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: 52, height: 52, borderRadius: "50%", background: "#534AB7",
          color: "#fff", border: "none", cursor: "pointer", fontSize: 22,
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 14px rgba(83,74,183,0.35)",
        }}
      >
        🤖
      </button>

      <style>{`@keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }`}</style>
    </div>
  );
}
