import { Link } from "react-router-dom";

// Streak grid: nine cells filling from light to solid. Same drawing as public/favicon.svg.
const CELLS = [
  [0.28, 0.55, 1],
  [0.55, 1, 1],
  [1, 1, 1],
];
const POS = [6.5, 13.5, 20.5];

export function LogoMark({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" className="shrink-0">
      <rect width="32" height="32" rx="8" fill="currentColor" />
      {CELLS.map((row, r) =>
        row.map((opacity, c) => (
          <rect
            key={`${r}-${c}`}
            x={POS[c]}
            y={POS[r]}
            width="5"
            height="5"
            rx="1.2"
            fill="var(--page)"
            fillOpacity={opacity}
          />
        ))
      )}
    </svg>
  );
}

export default function Logo({ to = "/", className = "" }) {
  return (
    <Link
      to={to}
      className={`inline-flex items-center gap-2.5 text-[15px] font-semibold tracking-tight text-fg ${className}`}
    >
      <LogoMark />
      Habit Tracker
    </Link>
  );
}
