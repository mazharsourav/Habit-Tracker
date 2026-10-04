import { Check } from "lucide-react";
import { weekKeys, toKey } from "../utils/dateHelpers.js";
import { frequencyLabel } from "../utils/constants.js";

const cellClass = {
  done: "bg-accent border border-accent text-on-accent",
  missed: "bg-surface border border-line-strong",
  today: "bg-surface border-[1.5px] border-fg",
  future: "border border-dashed border-line-strong",
};

// Habits × days grid. `size="lg"` is the Weekly page version with per-day totals.
export default function WeeklyGrid({ habits, logsByHabit, days: customDays, size = "sm", legend = false }) {
  const days = customDays || weekKeys();
  const todayKey = toKey(new Date());
  const lg = size === "lg";
  const cols = lg
    ? "grid-cols-[minmax(150px,1.6fr)_repeat(7,minmax(40px,1fr))_56px]"
    : "grid-cols-[minmax(140px,1.4fr)_repeat(7,minmax(36px,1fr))]";
  const cell = lg ? "h-8 w-8 rounded-[7px]" : "h-[26px] w-[26px] rounded-md";

  const stateOf = (done, key) => {
    if (done.has(key)) return "done";
    if (key > todayKey) return "future";
    if (key === todayKey) return "today";
    return "missed";
  };

  const perDay = days.map((d) =>
    habits.reduce((n, h) => n + ((logsByHabit[h._id] || []).includes(d.key) ? 1 : 0), 0)
  );
  const total = perDay.reduce((a, b) => a + b, 0);

  return (
    <div className="card overflow-x-auto px-5 py-2 md:px-6">
      <div className={lg ? "min-w-[640px]" : "min-w-[520px]"}>
        <div className={`grid ${cols} items-center border-b border-line-soft ${lg ? "h-14" : "h-11"}`}>
          <div className="text-xs text-faint">Habit</div>
          {days.map((d) => (
            <div
              key={d.key}
              className={`flex flex-col items-center gap-0.5 ${
                d.key === todayKey ? "font-semibold text-fg" : "text-faint"
              }`}
            >
              <span className={lg ? "text-[13px]" : "text-xs"}>{d.label}</span>
              <span className="num text-[11px]">{d.short}</span>
            </div>
          ))}
          {lg && <div className="text-right text-xs text-faint">Done</div>}
        </div>

        {habits.map((h) => {
          const done = new Set(logsByHabit[h._id] || []);
          const count = days.filter((d) => done.has(d.key)).length;
          return (
            <div
              key={h._id}
              className={`grid ${cols} items-center border-b border-line-soft ${lg ? "h-[60px]" : "h-12"}`}
            >
              <div className="flex min-w-0 flex-col gap-0.5 pr-3">
                <div className="flex min-w-0 items-baseline gap-2">
                  <span className={`truncate ${lg ? "font-medium" : ""} text-sm`}>{h.name}</span>
                  {!lg && <span className="num shrink-0 text-xs text-faint">{count}/7</span>}
                </div>
                {lg && <span className="truncate text-xs text-faint">{h.category} · {frequencyLabel(h)}</span>}
              </div>
              {days.map((d) => {
                const state = stateOf(done, d.key);
                return (
                  <div key={d.key} className="flex justify-center">
                    <div
                      className={`${cell} box-border flex items-center justify-center ${cellClass[state]}`}
                      title={`${h.name} · ${d.label} ${d.short}: ${state === "done" ? "done" : state === "future" ? "upcoming" : state === "today" ? "not yet" : "missed"}`}
                    >
                      {state === "done" && <Check size={lg ? 16 : 14} strokeWidth={2.25} />}
                    </div>
                  </div>
                );
              })}
              {lg && (
                <div className="num text-right text-[13px]">
                  {count}/{h.targetDays || 7}
                </div>
              )}
            </div>
          );
        })}

        {lg && (
          <div className={`grid ${cols} h-[52px] items-center`}>
            <div className="text-xs text-faint">Per day</div>
            {days.map((d, i) => (
              <div
                key={d.key}
                className={`num text-center text-[13px] ${
                  d.key === todayKey ? "font-medium text-fg" : "text-muted"
                }`}
              >
                {d.key > todayKey ? "–" : perDay[i]}
              </div>
            ))}
            <div className="num text-right text-[13px] font-medium">{total}</div>
          </div>
        )}

        {legend && (
          <div className="flex flex-wrap gap-x-5 gap-y-2 py-3 text-xs text-faint">
            <span className="inline-flex items-center gap-1.5"><span className="h-3 w-3 rounded-[3px] bg-accent" />Done</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-3 w-3 rounded-[3px] border border-line-strong" />Missed</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-3 w-3 rounded-[3px] border-[1.5px] border-fg" />Today, not yet</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-3 w-3 rounded-[3px] border border-dashed border-line-strong" />Upcoming</span>
          </div>
        )}
      </div>
    </div>
  );
}
