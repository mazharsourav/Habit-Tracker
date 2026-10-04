import { useEffect, useState } from "react";
import { X } from "lucide-react";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import Markdown from "./Markdown.jsx";
import { todayKey } from "../utils/dateHelpers.js";

export default function MorningMotivation() {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user?.morningMotivation) return;
    const today = todayKey();
    const seen = localStorage.getItem("morning-seen");
    if (seen === today) return;
    setLoading(true);
    api
      .get("/ai/morning")
      .then((res) => {
        setContent(res.data.content);
        localStorage.setItem("morning-seen", today);
      })
      .finally(() => setLoading(false));
  }, [user?.morningMotivation]);

  if (!user?.morningMotivation || dismissed || (!content && !loading)) return null;

  return (
    <section
      aria-label="Morning note"
      className="card flex items-start gap-4 py-5 pl-6 pr-3 animate-fade-in"
    >
      <div className="flex flex-1 flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-medium">Morning note</span>
          <span className="tag">AI</span>
        </div>
        {loading ? (
          <p className="m-0 text-[15px] text-faint">Writing today's note…</p>
        ) : (
          <Markdown className="max-w-[760px] text-[15px]">{content}</Markdown>
        )}
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="btn-icon"
        aria-label="Dismiss morning note"
      >
        <X size={16} />
      </button>
    </section>
  );
}
