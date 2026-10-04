// One bordered strip of stats, split by hairlines (replaces the old stat cards).
// items: [{ label, value, sub, valueClass }]
const cellBorder = (i, cols) => {
  if (i === 0) return "";
  if (cols === 3) return "border-t md:border-t-0 md:border-l";
  // 4 columns: 2×2 on mobile, one row from md up
  if (i === 1) return "border-l";
  if (i === 2) return "border-t md:border-t-0 md:border-l";
  return "border-t border-l md:border-t-0";
};

export default function StatStrip({ items, label = "Summary" }) {
  const cols = items.length === 3 ? 3 : 4;
  return (
    <section
      aria-label={label}
      className={`card grid ${cols === 3 ? "grid-cols-1 md:grid-cols-3" : "grid-cols-2 md:grid-cols-4"}`}
    >
      {items.map((s, i) => (
        <div
          key={s.label}
          className={`flex min-w-0 flex-col gap-2 border-line-soft px-5 py-5 md:px-6 ${cellBorder(i, cols)}`}
        >
          <div className="text-[13px] text-faint">{s.label}</div>
          <div
            className={`min-w-0 truncate leading-none tracking-tight ${
              s.valueClass || "num text-[28px] font-medium"
            }`}
          >
            {s.value}
          </div>
          {s.sub && <div className="text-xs text-faint">{s.sub}</div>}
        </div>
      ))}
    </section>
  );
}
