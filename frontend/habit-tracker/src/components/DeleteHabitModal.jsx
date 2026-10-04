import { useEffect, useId } from "react";
import { Trash2 } from "lucide-react";

// Confirmation for deleting a habit, with archiving offered as the gentler option.
export default function DeleteHabitModal({ habit, onClose, onDelete, onArchive }) {
  const titleId = useId();
  const descId = useId();

  useEffect(() => {
    if (!habit) return;
    const handler = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [habit, onClose]);

  if (!habit) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      style={{ background: "var(--overlay)" }}
      onClick={onClose}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        className="flex w-full max-w-[400px] flex-col gap-3 rounded-xl bg-surface p-6"
        style={{ boxShadow: "var(--shadow-pop)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface-2">
          <Trash2 size={18} strokeWidth={1.5} />
        </span>
        <h2 id={titleId} className="m-0 mt-1 text-[17px] font-semibold">
          Delete {habit.name}?
        </h2>
        <p id={descId} className="m-0 text-sm leading-relaxed text-muted">
          This permanently removes the habit and all its check-ins.
          {!habit.isArchived &&
            " If you only want it off your daily list, archive it instead."}
        </p>
        <div className="flex justify-end gap-2 pt-3">
          {habit.isArchived ? (
            <button className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
          ) : (
            <button className="btn-secondary" onClick={() => onArchive(habit)}>
              Archive instead
            </button>
          )}
          <button className="btn-primary" onClick={() => onDelete(habit)}>
            Delete habit
          </button>
        </div>
      </div>
    </div>
  );
}
