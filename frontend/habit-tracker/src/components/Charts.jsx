// Minimal monochrome charts built from plain elements.

// data: [{ label, value, display?, muted? }]
export function ColumnChart({
  data,
  height = 180,
  gap = 12,
  barMax = 44,
  showValues = true,
  tickEvery = 1,
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const room = showValues ? height - 24 : height;
  return (
    <div>
      <div
        className="flex items-end border-b border-line"
        style={{ height, gap }}
      >
        {data.map((d, i) => (
          <div
            key={i}
            title={`${d.label}: ${d.value}`}
            className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1.5"
          >
            {showValues && (
              <span className="num text-xs text-muted">{d.display ?? d.value}</span>
            )}
            <div
              className={`w-full rounded-t-[3px] ${d.muted ? "bg-line" : "bg-fg"}`}
              style={{
                maxWidth: barMax,
                height: Math.max(2, Math.round((d.value / max) * room)),
              }}
            />
          </div>
        ))}
      </div>
      <div className="mt-2 flex" style={{ gap }}>
        {data.map((d, i) => (
          <span
            key={i}
            className="min-w-0 flex-1 whitespace-nowrap text-center text-xs text-faint"
          >
            {i % tickEvery === 0 ? d.label : ""}
          </span>
        ))}
      </div>
    </div>
  );
}

// data: [{ label, current, previous }]
export function CompareChart({ data, height = 180 }) {
  const max = Math.max(1, ...data.flatMap((d) => [d.current, d.previous]));
  const h = (v) => Math.max(v ? 2 : 0, Math.round((v / max) * height));
  return (
    <div>
      <div className="flex items-end gap-3 border-b border-line" style={{ height }}>
        {data.map((d) => (
          <div
            key={d.label}
            title={`${d.label}: ${d.current} this week, ${d.previous} last week`}
            className="flex h-full flex-1 items-end justify-center gap-1"
          >
            <div className="w-4 rounded-t-[3px] bg-line-strong" style={{ height: h(d.previous) }} />
            <div className="w-4 rounded-t-[3px] bg-fg" style={{ height: h(d.current) }} />
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-3">
        {data.map((d) => (
          <span key={d.label} className="flex-1 text-center text-xs text-faint">
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
}

// items: [{ name, value, right }] — bar width is value / max
export function RankedBars({ items, max }) {
  const top = max ?? Math.max(1, ...items.map((i) => i.value));
  return (
    <div className="flex flex-col gap-4">
      {items.map((it) => (
        <div key={it.name} className="flex flex-col gap-1.5">
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="min-w-0 truncate">{it.name}</span>
            <span className="num shrink-0 text-[13px] text-muted">{it.right}</span>
          </div>
          <div className="h-1.5 rounded-full bg-fill">
            <div
              className="h-1.5 rounded-full bg-fg transition-[width] duration-500"
              style={{ width: `${Math.min(100, Math.round((it.value / top) * 100))}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
