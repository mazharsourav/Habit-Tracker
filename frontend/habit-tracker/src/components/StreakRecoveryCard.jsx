import { useState } from "react";
import api from "../api/axios.js";
import Markdown from "./Markdown.jsx";
import HabitIcon from "./HabitIcon.jsx";
import ReviewSkeleton from "./ReviewSkeleton.jsx";

export default function StreakRecoveryCard({ habit, longest, onDismiss }) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    try {
      const res = await api.post("/ai/recovery-plan", { habitId: habit._id });
      setContent(res.data.content);
    } catch {
      setContent("Couldn't build a plan right now. Try again in a moment.");
    } finally {
      setLoading(false);
    }
  };

  if (content || loading) {
    return (
      <section
        aria-label="Streak recovery plan"
        className="flex flex-col gap-3.5 rounded-[10px] border border-dashed border-line-strong bg-surface px-6 py-5 animate-fade-in"
      >
        <div className="flex items-center gap-2">
          <span className="text-[15px] font-medium">Back to {habit.name}</span>
          <span className="tag">AI</span>
          <span className="flex-1" />
          <button className="btn-ghost btn-sm" onClick={onDismiss}>
            Dismiss
          </button>
        </div>
        {loading ? <ReviewSkeleton /> : <Markdown className="text-sm">{content}</Markdown>}
      </section>
    );
  }

  return (
    <section
      aria-label="Streak recovery"
      className="flex flex-col gap-4 rounded-[10px] border border-dashed border-line-strong bg-surface py-4 pl-5 pr-4 sm:flex-row sm:items-center animate-fade-in"
    >
      <div className="flex flex-1 items-center gap-4">
        <HabitIcon icon={habit.icon} />
        <div className="flex flex-col gap-0.5">
          <div className="text-[15px] font-medium">
            Your {habit.name} streak ended at {longest} days
          </div>
          <div className="text-[13px] text-faint">
            Streaks break. A short 3-day plan can help you pick it back up.
          </div>
        </div>
      </div>
      <div className="flex gap-2 self-end sm:self-auto">
        <button className="btn-ghost" onClick={onDismiss}>
          Dismiss
        </button>
        <button className="btn-secondary" onClick={generate}>
          Get a 3-day plan
        </button>
      </div>
    </section>
  );
}
