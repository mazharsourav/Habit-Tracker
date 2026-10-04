import { useMemo } from "react";
import { format, parseISO } from "date-fns";

const level = (count, max) => {
  if (!count) return 0;
  const ratio = count / Math.max(1, max);
  if (ratio < 0.25) return 1;
  if (ratio < 0.5) return 2;
  if (ratio < 0.85) return 3;
  return 4;
};

const ROW_LABELS = ["Sat", "", "Mon", "", "Wed", "", "Fri"];

// 90-day consistency map. Columns are weeks, rows run Saturday → Friday.
export default function HeatmapChart({ data = [] }) {
  const { cols, max, total } = useMemo(() => {
    if (!data.length) return { cols: [], max: 0, total: 0 };
    const max = Math.max(...data.map((d) => d.count));
    const total = data.reduce((s, d) => s + d.count, 0);
    const cols = [];
    let col = [];
    data.forEach((d, i) => {
      const row = (parseISO(d.date).getDay() + 1) % 7; // Saturday = 0
      if (i === 0) for (let j = 0; j < row; j++) col.push(null);
      col.push(d);
      if (row === 6) {
        cols.push(col);
        col = [];
      }
    });
    if (col.length) {
      while (col.length < 7) col.push({ future: true });
      cols.push(col);
    }
    return { cols, max, total };
  }, [data]);

  return (
    <section aria-labelledby="heat-h" className="card flex flex-col gap-4 px-6 py-5">
      <div className="flex items-baseline justify-between">
        <h2 id="heat-h" className="m-0 text-base font-semibold">Consistency</h2>
        <span className="text-[13px] text-faint">Last 90 days</span>
      </div>

      <div className="flex gap-2.5 overflow-x-auto">
        <div className="num flex shrink-0 flex-col gap-1 text-[10px] text-faint" aria-hidden="true">
          {ROW_LABELS.map((l, i) => (
            <span key={i} className="h-3.5 leading-[14px]">{l}</span>
          ))}
        </div>
        <div className="flex gap-1">
          {cols.map((col, ci) => (
            <div key={ci} className="flex flex-col gap-1">
              {col.map((d, ri) =>
                !d ? (
                  <div key={ri} className="h-3.5 w-3.5" />
                ) : d.future ? (
                  <div key={ri} className="box-border h-3.5 w-3.5 rounded-[3px] border border-dashed border-line-strong" />
                ) : (
                  <div
                    key={ri}
                    className="h-3.5 w-3.5 rounded-[3px]"
                    style={{ background: `var(--heat-${level(d.count, max)})` }}
                    title={`${format(parseISO(d.date), "d MMM yyyy")} — ${d.count} check-in${d.count === 1 ? "" : "s"}`}
                  />
                )
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-faint">
        <span>
          <span className="num text-fg">{total}</span> check-ins
        </span>
        <div className="flex items-center gap-1" aria-hidden="true">
          Less
          {[0, 1, 2, 3, 4].map((l) => (
            <span key={l} className="h-3 w-3 rounded-[3px]" style={{ background: `var(--heat-${l})` }} />
          ))}
          More
        </div>
      </div>
    </section>
  );
}
