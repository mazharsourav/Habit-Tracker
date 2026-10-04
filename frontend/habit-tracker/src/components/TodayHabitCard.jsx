import { Archive, ArchiveRestore, Check, Flame, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import HabitIcon from "./HabitIcon.jsx";
import { frequencyLabel } from "../utils/constants.js";

const MENU_W = 200;
const MENU_H = 140;

// One habit row in the dashboard's "Today" list.
export default function TodayHabitCard({
  habit,
  completed,
  onToggle,
  streak = 0,
  onEdit,
  onDelete,
  onArchive,
}) {
  const [menu, setMenu] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);

  useLayoutEffect(() => {
    if (!menu || !triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const flipUp = rect.bottom + MENU_H + 8 > window.innerHeight;
    setPos({
      top: flipUp ? rect.top - MENU_H - 4 : rect.bottom + 4,
      left: Math.max(8, rect.right - MENU_W),
    });
  }, [menu]);

  useEffect(() => {
    if (!menu) return;
    const close = () => setMenu(false);
    const onKey = (e) => e.key === "Escape" && close();
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
      window.removeEventListener("keydown", onKey);
    };
  }, [menu]);

  const menuItem =
    "flex h-[38px] w-full items-center gap-2.5 rounded-md px-2.5 text-left text-sm transition-colors hover:bg-fill";

  return (
    <div className="flex items-center gap-3 py-3.5 pl-4 pr-3 transition-colors hover:bg-surface-2 sm:gap-4 sm:pl-5">
      <HabitIcon icon={habit.icon} />

      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className={`truncate text-[15px] font-medium ${completed ? "text-faint" : ""}`}>
          {habit.name}
        </div>
        <div className="truncate text-[13px] text-faint">
          {habit.category} · {frequencyLabel(habit)}
        </div>
      </div>

      <div
        title="Current streak"
        className={`hidden items-center gap-1 font-mono text-[13px] sm:flex ${
          streak > 0 ? "text-fg" : "text-faint"
        }`}
      >
        <Flame size={14} strokeWidth={1.5} />
        {streak}d
      </div>

      <button
        ref={triggerRef}
        className={`btn-icon ${menu ? "bg-fill text-fg" : ""}`}
        onClick={() => setMenu((m) => !m)}
        aria-label={`Options for ${habit.name}`}
        aria-haspopup="menu"
        aria-expanded={menu}
      >
        <MoreHorizontal size={16} />
      </button>

      {menu &&
        createPortal(
          <>
            <div className="fixed inset-0 z-[100]" onClick={() => setMenu(false)} />
            <div
              role="menu"
              aria-label={`${habit.name} options`}
              className="fixed z-[110] flex flex-col gap-0.5 rounded-[10px] border border-line bg-surface p-1.5 animate-fade-in"
              style={{ top: pos.top, left: pos.left, width: MENU_W, boxShadow: "var(--shadow-pop)" }}
            >
              <button
                role="menuitem"
                className={`${menuItem} text-fg-2`}
                onClick={() => {
                  setMenu(false);
                  onEdit();
                }}
              >
                <Pencil size={15} strokeWidth={1.5} /> Edit
              </button>
              <button
                role="menuitem"
                className={`${menuItem} text-fg-2`}
                onClick={() => {
                  setMenu(false);
                  onArchive();
                }}
              >
                {habit.isArchived ? (
                  <ArchiveRestore size={15} strokeWidth={1.5} />
                ) : (
                  <Archive size={15} strokeWidth={1.5} />
                )}
                {habit.isArchived ? "Restore" : "Archive"}
              </button>
              <div role="separator" className="mx-1.5 my-1 h-px bg-line-soft" />
              <button
                role="menuitem"
                className={`${menuItem} font-medium text-fg`}
                onClick={() => {
                  setMenu(false);
                  onDelete();
                }}
              >
                <Trash2 size={15} strokeWidth={1.5} /> Delete…
              </button>
            </div>
          </>,
          document.body
        )}

      <button
        onClick={onToggle}
        aria-pressed={completed}
        aria-label={completed ? `Mark ${habit.name} as not done` : `Mark ${habit.name} as done`}
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-[1.5px] transition-colors ${
          completed
            ? "border-accent bg-accent text-on-accent animate-pop"
            : "border-line-strong bg-surface text-transparent hover:border-fg hover:text-disabled"
        }`}
      >
        <Check size={18} strokeWidth={2.25} />
      </button>
    </div>
  );
}
