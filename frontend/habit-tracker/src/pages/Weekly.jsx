import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, addWeeks, isSameWeek } from "date-fns";
import api from "../api/axios.js";
import WeeklyGrid from "../components/WeeklyGrid.jsx";
import StatStrip from "../components/StatStrip.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import { weekKeysFor } from "../utils/dateHelpers.js";

export default function Weekly() {
  const [cursor, setCursor] = useState(new Date());
  const [habits, setHabits] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const days = useMemo(() => weekKeysFor(cursor), [cursor]);
  const isCurrentWeek = isSameWeek(cursor, new Date(), { weekStartsOn: 6 });

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const start = days[0].key;
        const end = days[days.length - 1].key;
        const [habitsRes, rangeRes] = await Promise.all([
          api.get("/habits"),
          api.get("/logs/range", { params: { start, end } }),
        ]);
        setHabits(habitsRes.data);
        setLogs(rangeRes.data);
      } finally {
        setLoading(false);
      }
    })();
  }, [days]);

  const logsByHabit = useMemo(() => {
    const out = {};
    for (const l of logs) {
      if (!out[l.habitId]) out[l.habitId] = [];
      out[l.habitId].push(l.completedDate);
    }
    return out;
  }, [logs]);

  const activeIds = new Set(habits.map((h) => String(h._id)));
  const weekLogs = logs.filter((l) => activeIds.has(String(l.habitId)));
  const totalSlots = habits.length * 7;
  const totalDone = weekLogs.length;
  const weekRate = totalSlots ? Math.round((totalDone / totalSlots) * 100) : 0;

  const bestDay = days
    .map((d) => ({ ...d, count: weekLogs.filter((l) => l.completedDate === d.key).length }))
    .sort((a, b) => b.count - a.count)[0];

  const topHabit = habits
    .map((h) => ({ h, count: (logsByHabit[h._id] || []).length }))
    .sort((a, b) => b.count - a.count)[0];

  return (
    <div className="flex flex-col gap-7 animate-fade-in">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1.5">
          <h1 className="m-0 text-[26px] font-semibold tracking-tight md:text-[30px]">Week</h1>
          <p className="m-0 text-sm text-faint">
            Every habit across all seven days. Weeks start on Saturday.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="btn-secondary w-10 px-0"
            onClick={() => setCursor((d) => addWeeks(d, -1))}
            aria-label="Previous week"
          >
            <ChevronLeft size={16} />
          </button>
          <div className="num flex h-10 items-center rounded-lg border border-line bg-surface px-4 text-[13px]">
            {format(days[0].date, "d MMM")} – {format(days[6].date, "d MMM yyyy")}
          </div>
          <button
            className="btn-secondary w-10 px-0"
            onClick={() => setCursor((d) => addWeeks(d, 1))}
            disabled={isCurrentWeek}
            aria-label="Next week"
          >
            <ChevronRight size={16} />
          </button>
          {!isCurrentWeek && (
            <button className="btn-ghost" onClick={() => setCursor(new Date())}>
              This week
            </button>
          )}
        </div>
      </header>

      {loading ? (
        <LoadingSpinner full />
      ) : (
        <>
          <StatStrip
            label="Week summary"
            items={[
              { label: "Week rate", value: `${weekRate}%`, sub: `${totalDone} of ${totalSlots}` },
              { label: "Check-ins", value: totalDone, sub: isCurrentWeek ? "this week" : "that week" },
              {
                label: "Best day",
                value: bestDay?.count ? format(bestDay.date, "EEEE") : "—",
                valueClass: "text-[26px] font-medium",
                sub: bestDay?.count ? `${bestDay.count} habit${bestDay.count === 1 ? "" : "s"} done` : "no data",
              },
              {
                label: "Top habit",
                value: topHabit?.count ? topHabit.h.name : "—",
                valueClass: "text-xl font-medium leading-[28px]",
                sub: topHabit?.count ? `${topHabit.count} / 7 days` : "no data",
              },
            ]}
          />

          {habits.length === 0 ? (
            <div className="card px-6 py-12 text-center text-sm text-faint">
              Create a habit to start filling in your week.
            </div>
          ) : (
            <WeeklyGrid habits={habits} logsByHabit={logsByHabit} days={days} size="lg" />
          )}
        </>
      )}
    </div>
  );
}
