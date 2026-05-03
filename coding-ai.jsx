import { useState, useRef, useEffect } from "react";

const SYSTEM_PROMPT = `You are an elite coding assistant — precise, fast, and deeply knowledgeable across all programming languages and frameworks. You specialize in:
- Writing clean, production-ready code
- Debugging and fixing errors
- Explaining complex concepts clearly
- Code reviews and optimizations
- Architecture and design patterns

Format all code in proper markdown code blocks with language tags. Be direct and technical. When asked to write code, write the full implementation — no placeholders, no "TODO" comments unless explicitly asked. If something is ambiguous, make a reasonable assumption and state it briefly.`;

const CodeBlock = ({ code, lang }) => {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div style={{ position: "relative", margin: "12px 0" }}>
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        background: "#0d0d0d", borderRadius: "8px 8px 0 0",
        padding: "6px 14px", borderBottom: "1px solid #2a2a2a"
      }}>
        <span style={{ color: "#666", fontSize: "11px", fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "1px" }}>{lang || "code"}</span>
        <button onClick={copy} style={{
          background: "none", border: "1px solid #333", borderRadius: "4px",
          color: copied ? "#4ade80" : "#888", fontSize: "11px", cursor: "pointer",
          padding: "2px 10px", fontFamily: "monospace", transition: "all 0.2s"
        }}>{copied ? "✓ copied" : "copy"}</button>
      </div>
      <pre style={{
        background: "#0a0a0a", margin: 0, padding: "16px", borderRadius: "0 0 8px 8px",
        overflowX: "auto", fontSize: "13px", lineHeight: "1.7",
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace", color: "#e2e8f0",
        border: "1px solid #1a1a1a", borderTop: "none"
      }}>
        <code>{code}</code>
      </pre>
    </div>
  );
};

const parseMessage = (text) => {
  const parts = [];
  const regex = /```(\w*)\n?([\s\S]*?)```/g;
  let last = 0, match;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) parts.push({ type: "text", content: text.slice(last, match.index) });
    parts.push({ type: "code", lang: match[1], content: match[2].trim() });
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push({ type: "text", content: text.slice(last) });
  return parts;
};

const MessageBubble = ({ msg }) => {
  const isUser = msg.role === "user";
  const parts = isUser ? null : parseMessage(msg.content);
  return (
    <div style={{
      display: "flex", justifyContent: isUser ? "flex-end" : "flex-start",
      marginBottom: "20px", gap: "10px", alignItems: "flex-start"
    }}>
      {!isUser && (
        <div style={{
          width: 32, height: 32, borderRadius: "8px", flexShrink: 0,
          background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "14px", fontWeight: "700", color: "white", marginTop: "2px"
        }}>∆</div>
      )}
      <div style={{ maxWidth: "80%" }}>
        {isUser ? (
          <div style={{
            background: "#1e1e2e", border: "1px solid #2d2d3d",
            borderRadius: "12px 12px 2px 12px", padding: "12px 16px",
            color: "#e2e8f0", fontSize: "14px", lineHeight: "1.6", whiteSpace: "pre-wrap"
          }}>{msg.content}</div>
        ) : (
          <div style={{ color: "#cbd5e1", fontSize: "14px", lineHeight: "1.7" }}>
            {parts.map((p, i) =>
              p.type === "code"
                ? <CodeBlock key={i} code={p.content} lang={p.lang} />
                : <span key={i} style={{ whiteSpace: "pre-wrap" }}>{p.content}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const SUGGESTIONS = [
  "Write a REST API in Express.js",
  "Explain async/await vs Promises",
  "Debug this Python error: IndexError",
  "Build a React useLocalStorage hook",
];

export default function CodingAI() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  const send = async (text) => {
    const userText = (text || input).trim();
    if (!userText || loading) return;
    setInput("");
    const newMessages = [...messages, { role: "user", content: userText }];
    setMessages(newMessages);
    setLoading(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-opus-4-6",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: newMessages.map(m => ({ role: m.role, content: m.content }))
        })
      });
      const data = await res.json();
      const reply = data.content?.find(b => b.type === "text")?.text || "No response.";
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: "assistant", content: "Error: " + e.message }]);
    }
    setLoading(false);
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const autoResize = (e) => {
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 160) + "px";
  };

  return (
    <div style={{
      minHeight: "100vh", background: "#080810",
      fontFamily: "'Inter', system-ui, sans-serif", display: "flex", flexDirection: "column"
    }}>
      {/* Header */}
      <div style={{
        borderBottom: "1px solid #1a1a2e", padding: "16px 24px",
        display: "flex", alignItems: "center", gap: "12px",
        background: "rgba(10,10,20,0.9)", backdropFilter: "blur(10px)",
        position: "sticky", top: 0, zIndex: 10
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: "10px",
          background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "16px", fontWeight: "800", color: "white"
        }}>∆</div>
        <div>
          <div style={{ color: "#e2e8f0", fontWeight: "700", fontSize: "15px", letterSpacing: "-0.3px" }}>CodeMind</div>
          <div style={{ color: "#4ade80", fontSize: "11px", display: "flex", alignItems: "center", gap: "4px" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80", display: "inline-block" }}></span>
            Powered by Claude Opus 4.6
          </div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: "8px" }}>
          {["JS", "PY", "TS", "Go"].map(l => (
            <span key={l} style={{
              background: "#1a1a2e", border: "1px solid #2d2d4e",
              borderRadius: "6px", padding: "3px 8px",
              color: "#6366f1", fontSize: "11px", fontFamily: "monospace", fontWeight: "600"
            }}>{l}</span>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div style={{ flex: 1, overflowY: "auto", padding: "24px", maxWidth: 860, width: "100%", margin: "0 auto", boxSizing: "border-box" }}>
        {messages.length === 0 ? (
          <div style={{ textAlign: "center", paddingTop: "60px" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>⌨️</div>
            <h2 style={{ color: "#e2e8f0", fontSize: "24px", fontWeight: "700", margin: "0 0 8px", letterSpacing: "-0.5px" }}>
              Your Elite Coding Assistant
            </h2>
            <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "40px" }}>
              Write code, debug errors, learn concepts — ask anything.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", maxWidth: 500, margin: "0 auto" }}>
              {SUGGESTIONS.map((s, i) => (
                <button key={i} onClick={() => send(s)} style={{
                  background: "#0f0f1a", border: "1px solid #2d2d3d",
                  borderRadius: "10px", padding: "12px 14px", color: "#94a3b8",
                  fontSize: "13px", cursor: "pointer", textAlign: "left",
                  transition: "all 0.2s", lineHeight: "1.4"
                }}
                  onMouseOver={e => { e.currentTarget.style.borderColor = "#6366f1"; e.currentTarget.style.color = "#e2e8f0"; }}
                  onMouseOut={e => { e.currentTarget.style.borderColor = "#2d2d3d"; e.currentTarget.style.color = "#94a3b8"; }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((m, i) => <MessageBubble key={i} msg={m} />)}
            {loading && (
              <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "20px" }}>
                <div style={{
                  width: 32, height: 32, borderRadius: "8px",
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "14px", fontWeight: "700", color: "white"
                }}>∆</div>
                <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{
                      width: 7, height: 7, borderRadius: "50%", background: "#6366f1",
                      animation: "pulse 1.2s ease-in-out infinite",
                      animationDelay: `${i * 0.2}s`
                    }} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{
        borderTop: "1px solid #1a1a2e", padding: "16px 24px",
        background: "rgba(8,8,16,0.95)", backdropFilter: "blur(10px)"
      }}>
        <div style={{ maxWidth: 860, margin: "0 auto", position: "relative" }}>
          <div style={{
            display: "flex", gap: "10px", alignItems: "flex-end",
            background: "#0f0f1a", border: "1px solid #2d2d3d",
            borderRadius: "14px", padding: "10px 12px",
            transition: "border-color 0.2s",
            boxShadow: "0 0 0 0 transparent"
          }}>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={e => { setInput(e.target.value); autoResize(e); }}
              onKeyDown={handleKey}
              placeholder="Ask about code, paste errors, request implementations..."
              rows={1}
              style={{
                flex: 1, background: "none", border: "none", outline: "none",
                color: "#e2e8f0", fontSize: "14px", lineHeight: "1.6", resize: "none",
                fontFamily: "inherit", minHeight: "24px", maxHeight: "160px"
              }}
            />
            <button onClick={() => send()} disabled={!input.trim() || loading} style={{
              width: 36, height: 36, borderRadius: "10px", flexShrink: 0,
              background: input.trim() && !loading ? "linear-gradient(135deg, #6366f1, #8b5cf6)" : "#1e1e2e",
              border: "none", cursor: input.trim() && !loading ? "pointer" : "default",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "16px", transition: "all 0.2s", color: "white"
            }}>↑</button>
          </div>
          <div style={{ textAlign: "center", marginTop: "8px", color: "#334155", fontSize: "11px" }}>
            Shift+Enter for new line · Enter to send
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.1); }
        }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #2d2d3d; border-radius: 3px; }
      `}</style>
    </div>
  );
}
