import { useState } from "react";
import { ArrowRight, Check, Plus } from "lucide-react";
import Modal from "./Modal.jsx";
import HabitIcon from "./HabitIcon.jsx";
import ReviewSkeleton from "./ReviewSkeleton.jsx";
import api from "../api/axios.js";

const QUESTIONS = [
  {
    key: "goals",
    label: "What are you working towards right now?",
    placeholder: "e.g. Get fitter, read more, spend less time on my phone",
  },
  {
    key: "productiveTime",
    label: "When in the day do you have the most energy?",
    placeholder: "e.g. Early mornings, or late evenings once the kids are asleep",
  },
  {
    key: "struggles",
    label: "What has made habits hard to keep before?",
    placeholder: "e.g. Gym in the morning never sticks, journaling feels like homework",
  },
];

export default function HabitSuggestionModal({ open, onClose, onAccept }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({ goals: "", productiveTime: "", struggles: "" });
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState({});

  const reset = () => {
    setStep(0);
    setAnswers({ goals: "", productiveTime: "", struggles: "" });
    setSuggestions([]);
    setAdded({});
  };

  const close = () => {
    reset();
    onClose();
  };

  const submit = async () => {
    setLoading(true);
    setStep(3);
    try {
      const res = await api.post("/ai/suggest-habits", answers);
      setSuggestions(res.data.suggestions || []);
    } catch {
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const accept = async (s, idx) => {
    await onAccept(s);
    setAdded((a) => ({ ...a, [idx]: true }));
  };

  const q = QUESTIONS[step];

  return (
    <Modal
      open={open}
      onClose={close}
      title={step === 3 ? "Suggested for you" : "Suggest habits"}
      badge={<span className="tag">AI</span>}
      maxWidth="max-w-[560px]"
    >
      {step < 3 ? (
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between text-xs text-faint">
              <span className="num">Question {step + 1} of 3</span>
              <span>About a minute</span>
            </div>
            <div aria-hidden="true" className="grid grid-cols-3 gap-1">
              {[0, 1, 2].map((i) => (
                <span key={i} className={`h-[3px] rounded-full ${i <= step ? "bg-fg" : "bg-line"}`} />
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2.5">
            <label htmlFor={`sg-${q.key}`} className="text-[22px] font-semibold leading-tight tracking-tight">
              {q.label}
            </label>
            <textarea
              key={q.key}
              id={`sg-${q.key}`}
              className="input resize-none text-[15px]"
              rows={4}
              placeholder={q.placeholder}
              value={answers[q.key]}
              onChange={(e) => setAnswers((a) => ({ ...a, [q.key]: e.target.value }))}
              autoFocus
            />
          </div>

          <div className="flex justify-between gap-2">
            {step === 0 ? (
              <button className="btn-secondary" onClick={close}>Cancel</button>
            ) : (
              <button className="btn-ghost" onClick={() => setStep(step - 1)}>Back</button>
            )}
            <button
              className="btn-primary"
              disabled={!answers[q.key].trim()}
              onClick={() => (step === 2 ? submit() : setStep(step + 1))}
            >
              {step === 2 ? "Get suggestions" : "Next"}
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {loading ? (
            <>
              <p className="m-0 text-sm text-faint">Picking habits that fit your answers…</p>
              <ReviewSkeleton />
            </>
          ) : suggestions.length === 0 ? (
            <p className="m-0 text-sm text-muted">No suggestions came back. Try again in a moment.</p>
          ) : (
            suggestions.map((s, i) => (
              <div key={i} className="flex items-start gap-3.5 rounded-[10px] border border-line p-4">
                <HabitIcon icon={s.icon} />
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <div className="flex flex-wrap items-baseline gap-x-2">
                    <span className="text-[15px] font-medium">{s.name}</span>
                    <span className="text-xs text-faint">
                      {s.category} · {s.frequency === "weekly" ? "Weekly" : "Daily"}
                    </span>
                  </div>
                  {s.description && <p className="m-0 text-sm leading-normal text-fg-2">{s.description}</p>}
                  {s.reason && <p className="m-0 text-[13px] leading-normal text-faint">Why you: {s.reason}</p>}
                </div>
                {added[i] ? (
                  <span className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-line bg-fill px-3 text-[13px] font-medium text-muted">
                    <Check size={14} strokeWidth={2} /> Added
                  </span>
                ) : (
                  <button className="btn-secondary btn-sm shrink-0" onClick={() => accept(s, i)}>
                    <Plus size={14} /> Add
                  </button>
                )}
              </div>
            ))
          )}

          <div className="flex justify-between gap-2 pt-1">
            <button className="btn-ghost" onClick={reset} disabled={loading}>
              Start over
            </button>
            <button className="btn-primary" onClick={close}>
              Done
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
