import { useState } from "react";
import { CATEGORIES, HABIT_ICONS, ICON_LABELS, resolveIconKey } from "../utils/constants.js";
import { IconGlyph } from "./HabitIcon.jsx";

export default function HabitForm({ initial, onSubmit, onCancel, submitting }) {
  const [form, setForm] = useState({
    name: initial?.name || "",
    description: initial?.description || "",
    category: initial?.category || "Health",
    frequency: initial?.frequency || "daily",
    targetDays: initial?.targetDays || 7,
    icon: resolveIconKey(initial?.icon || HABIT_ICONS[0]),
  });

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    onSubmit({ ...form, name: form.name.trim(), targetDays: Number(form.targetDays) });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div>
        <label htmlFor="hf-name" className="label">Name</label>
        <input
          id="hf-name"
          className="input"
          placeholder="e.g. Drink 2L of water"
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          autoFocus
          required
        />
      </div>

      <div>
        <label htmlFor="hf-desc" className="label">
          Why it matters <span className="font-normal text-faint">— optional</span>
        </label>
        <textarea
          id="hf-desc"
          className="input resize-none"
          rows={2}
          placeholder="A line to remind yourself"
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="hf-cat" className="label">Category</label>
          <select
            id="hf-cat"
            className="input"
            value={form.category}
            onChange={(e) => set("category", e.target.value)}
          >
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <span id="hf-freq" className="label">Frequency</span>
          <div role="group" aria-labelledby="hf-freq" className="segmented grid w-full grid-cols-2">
            <button type="button" aria-pressed={form.frequency === "daily"} onClick={() => set("frequency", "daily")}>
              Daily
            </button>
            <button type="button" aria-pressed={form.frequency === "weekly"} onClick={() => set("frequency", "weekly")}>
              Weekly
            </button>
          </div>
        </div>
      </div>

      <div>
        <span id="hf-days" className="label">Days per week</span>
        <div role="radiogroup" aria-labelledby="hf-days" className="grid grid-cols-7 gap-1.5">
          {[1, 2, 3, 4, 5, 6, 7].map((n) => {
            const on = Number(form.targetDays) === n;
            return (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => set("targetDays", n)}
                className={`num h-10 rounded-lg border text-sm transition-colors ${
                  on
                    ? "border-accent bg-accent text-on-accent"
                    : "border-line bg-surface text-fg-2 hover:border-fg"
                }`}
              >
                {n}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <span id="hf-icon" className="label">Icon</span>
        <div role="radiogroup" aria-labelledby="hf-icon" className="grid grid-cols-6 gap-1.5">
          {HABIT_ICONS.map((key) => {
            const on = form.icon === key;
            return (
              <button
                key={key}
                type="button"
                role="radio"
                aria-checked={on}
                aria-label={ICON_LABELS[key]}
                title={ICON_LABELS[key]}
                onClick={() => set("icon", key)}
                className={`flex h-11 items-center justify-center rounded-lg border transition-colors ${
                  on
                    ? "border-accent bg-accent text-on-accent"
                    : "border-line bg-surface text-fg-2 hover:border-fg"
                }`}
              >
                <IconGlyph icon={key} />
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-1">
        <button type="button" className="btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn-primary" disabled={submitting || !form.name.trim()}>
          {submitting ? "Saving…" : initial ? "Save changes" : "Create habit"}
        </button>
      </div>
    </form>
  );
}
