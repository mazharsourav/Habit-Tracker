import { useEffect, useRef, useState } from "react";
import { ArrowUp, MessageCircle, X } from "lucide-react";
import api from "../api/axios.js";
import Markdown from "./Markdown.jsx";

const SAMPLES = [
  "Which day of the week am I most consistent?",
  "What is my best performing category?",
  "Why do I keep missing my exercise habit?",
];

export default function AIChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages, open, loading]);

  const send = async (text) => {
    const q = (text ?? input).trim();
    if (!q || loading) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", content: q }]);
    setLoading(true);
    try {
      const res = await api.post("/ai/chat", { question: q });
      setMessages((m) => [...m, { role: "assistant", content: res.data.content }]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "Sorry, I couldn't answer that right now." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-24 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-on-accent transition-colors hover:bg-accent-hover md:bottom-6 md:right-6"
        style={{ boxShadow: "var(--shadow-pop)" }}
        aria-label={open ? "Close habit chat" : "Ask about your habits"}
        aria-expanded={open}
      >
        {open ? <X size={20} /> : <MessageCircle size={20} strokeWidth={1.5} />}
      </button>

      {open && (
        <aside
          aria-label="Ask about your habits"
          className="fixed bottom-40 right-5 z-40 flex h-[min(70vh,540px)] w-[min(92vw,400px)] flex-col overflow-hidden rounded-xl border border-line-strong bg-surface animate-fade-in md:bottom-24 md:right-6"
          style={{ boxShadow: "var(--shadow-pop)" }}
        >
          <div className="flex items-center gap-2 border-b border-line-soft py-3 pl-[18px] pr-2">
            <span className="text-sm font-semibold">Ask about your habits</span>
            <span className="tag">AI</span>
            <span className="flex-1" />
            <button className="btn-icon h-9 w-9" onClick={() => setOpen(false)} aria-label="Close">
              <X size={16} />
            </button>
          </div>

          <div ref={scrollRef} className="flex flex-1 flex-col gap-3.5 overflow-y-auto px-[18px] py-4">
            {messages.length === 0 && (
              <>
                <p className="m-0 text-sm leading-relaxed text-fg-2">
                  Ask anything about your habit data. Try one of these:
                </p>
                <div className="flex flex-col gap-1.5">
                  {SAMPLES.map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="rounded-lg border border-line px-3 py-2 text-left text-[13px] text-muted transition-colors hover:border-fg hover:text-fg"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </>
            )}
            {messages.map((m, i) =>
              m.role === "user" ? (
                <div
                  key={i}
                  className="max-w-[80%] self-end rounded-[12px_12px_4px_12px] bg-accent px-3.5 py-2.5 text-sm leading-normal text-on-accent"
                >
                  {m.content}
                </div>
              ) : (
                <div key={i} className="max-w-[88%] self-start rounded-[12px_12px_12px_4px] bg-fill px-3.5 py-2.5">
                  <Markdown className="text-sm">{m.content}</Markdown>
                </div>
              )
            )}
            {loading && (
              <div className="self-start rounded-[12px_12px_12px_4px] bg-fill px-3.5 py-2.5 text-sm text-faint">
                Thinking…
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
            className="flex gap-2 border-t border-line-soft p-3"
          >
            <label htmlFor="chat-input" className="sr-only">Your question</label>
            <input
              id="chat-input"
              className="input"
              placeholder="Ask about your habits"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button type="submit" className="btn-primary w-10 shrink-0 px-0" disabled={loading || !input.trim()} aria-label="Send">
              <ArrowUp size={16} />
            </button>
          </form>
        </aside>
      )}
    </>
  );
}
