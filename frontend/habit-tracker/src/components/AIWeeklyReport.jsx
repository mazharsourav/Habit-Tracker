import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, RefreshCw } from "lucide-react";
import api from "../api/axios.js";
import Markdown from "./Markdown.jsx";
import ReviewSkeleton from "./ReviewSkeleton.jsx";

// Compact weekly review card for the dashboard.
export default function AIWeeklyReport() {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedAt, setGeneratedAt] = useState(null);

  const generate = async () => {
    setLoading(true);
    try {
      const res = await api.post("/ai/weekly-report");
      setContent(res.data.content);
      setGeneratedAt(new Date());
    } catch {
      setContent("Couldn't write your review right now. Try again in a moment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section aria-labelledby="review-h" className="card flex flex-col gap-3.5 px-6 py-5">
      <div className="flex items-center gap-2">
        <h2 id="review-h" className="m-0 text-base font-semibold">Weekly review</h2>
        <span className="tag">AI</span>
        <span className="flex-1" />
        {generatedAt && (
          <span className="num text-xs text-faint">
            {generatedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        )}
        {content && (
          <button
            className="btn-icon h-9 w-9"
            onClick={generate}
            disabled={loading}
            aria-label="Regenerate weekly review"
          >
            <RefreshCw size={16} strokeWidth={1.5} className={loading ? "animate-spin" : ""} />
          </button>
        )}
      </div>

      {loading && !content ? (
        <>
          <p className="m-0 text-[13px] text-faint">Writing your review…</p>
          <ReviewSkeleton />
        </>
      ) : content ? (
        <Markdown className="text-[15px]">{content}</Markdown>
      ) : (
        <div className="flex flex-col items-start gap-3">
          <p className="m-0 text-sm leading-relaxed text-muted">
            What worked, what slipped, and one thing to try — written from the
            last seven days of your data.
          </p>
          <button className="btn-secondary" onClick={generate}>
            Write my weekly review
          </button>
        </div>
      )}

      <Link
        to="/insights"
        className="mt-auto inline-flex items-center gap-1.5 self-start pt-1 text-[13px] font-medium text-fg hover:text-muted"
      >
        Full insights <ArrowRight size={14} />
      </Link>
    </section>
  );
}
