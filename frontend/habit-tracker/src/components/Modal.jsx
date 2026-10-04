import { useEffect, useId } from "react";
import { X } from "lucide-react";

export default function Modal({
  open,
  onClose,
  title,
  badge,
  children,
  maxWidth = "max-w-[520px]",
}) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const handler = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      style={{ background: "var(--overlay)" }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`${maxWidth} flex max-h-[90vh] w-full flex-col overflow-hidden rounded-xl bg-surface`}
        style={{ boxShadow: "var(--shadow-pop)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center gap-2 border-b border-line-soft py-3 pl-6 pr-3">
          <h2 id={titleId} className="m-0 text-[17px] font-semibold">
            {title}
          </h2>
          {badge}
          <span className="flex-1" />
          <button className="btn-icon" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6 pt-5">{children}</div>
      </div>
    </div>
  );
}
