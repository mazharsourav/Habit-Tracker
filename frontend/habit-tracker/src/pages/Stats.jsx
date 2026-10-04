import { useEffect, useMemo, useState } from "react";
import { format, subDays } from "date-fns";
import api from "../api/axios.js";
import AIChat from "../components/AIChat.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import StatStrip from "../components/StatStrip.jsx";
import { ColumnChart, RankedBars } from "../components/Charts.jsx";
import { frequencyLabel } from "../utils/constants.js";

export default function Stats() {
  const [stats, setStats] = useState(null);
  const [habits, setHabits] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [statsRes, habitsRes] = await Promise.all([
          api.get("/logs/stats"),
          api.get("/habits"),
        ]);
        setStats(statsRes.data);
        setHabits(habitsRes.data);
        const end = new Date();
        const rangeRes = await api.get("/logs/range", {
          params: {
            start: format(subDays(end, 29), "yyyy-MM-dd"),
            end: format(end, "yyyy-MM-dd"),
          },
        });
        setLogs(rangeRes.data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const activeLogs = useMemo(() => {
    const ids = new Set(habits.map((h) => String(h._id)));
    return logs.filter((l) => ids.has(String(l.habitId)));
  }, [logs, habits]);

  const countOn = (key) => activeLogs.filter((l) => l.completedDate === key).length;

  const month = useMemo(() => {
    const out = [];
    for (let i = 29; i >= 0; i--) {
      const d = subDays(new Date(), i);
      out.push({ label: format(d, "d MMM"), value: countOn(format(d, "yyyy-MM-dd")) });
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeLogs]);

  const week = month.slice(-7).map((d, i) => ({
    label: format(subDays(new Date(), 6 - i), "EEE"),
    value: d.value,
  }));

  const categoryData = useMemo(() => {
    const map = {};
    for (const h of habits) map[h._id] = h.category;
    const counts = {};
    for (const l of activeLogs) {
      const cat = map[l.habitId];
      if (cat) counts[cat] = (counts[cat] || 0) + 1;
    }
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [habits, activeLogs]);

  if (loading || !stats) return <LoadingSpinner full />;

  const per = stats.perHabit;
  const best = [...per].sort((a, b) => b.currentStreak - a.currentStreak)[0];
  const longest = [...per].sort((a, b) => b.longestStreak - a.longestStreak)[0];
  const worst = [...per]
    .filter((s) => s.completions30d < 30)
    .sort((a, b) => a.completions30d - b.completions30d)[0];
  const byCompletion = [...per].sort((a, b) => b.completions30d - a.completions30d);
  const total30 = activeLogs.length;
  const habitById = Object.fromEntries(habits.map((h) => [h._id, h]));

  const highlight = (value, unit, name) => ({
    value: (
      <>
        {value}
        <span className="ml-2 font-sans text-[13px] font-normal text-faint">{unit}</span>
      </>
    ),
    sub: <span className="text-sm font-medium text-fg">{name}</span>,
  });

  return (
    <div className="flex flex-col gap-7 animate-fade-in">
      <header className="flex flex-col gap-1.5">
        <h1 className="m-0 text-[26px] font-semibold tracking-tight md:text-[30px]">Statistics</h1>
        <p className="m-0 text-sm text-faint">The last 30 days, habit by habit.</p>
      </header>

      {per.length === 0 ? (
        <div className="card flex flex-col items-center gap-2 px-6 py-12 text-center">
          <span className="text-[15px] font-medium">No data yet</span>
          <span className="max-w-sm text-sm text-faint">
            Create a habit and check it off a few times to unlock statistics.
          </span>
        </div>
      ) : (
        <>
          <StatStrip
            label="Highlights"
            items={[
              { label: "Best streak", ...highlight(best?.currentStreak ?? 0, "days running", best?.name) },
              { label: "Longest ever", ...highlight(longest?.longestStreak ?? 0, "day record", longest?.name) },
              worst
                ? { label: "Needs attention", ...highlight(worst.completions30d, "of 30 days", worst.name) }
                : { label: "Needs attention", value: "—", sub: "Everything is on track" },
            ]}
          />

          <div className="grid gap-6 lg:grid-cols-[1fr_1.6fr]">
            <section aria-labelledby="l7-h" className="card flex flex-col gap-5 px-6 py-5">
              <h2 id="l7-h" className="m-0 text-base font-semibold">Last 7 days</h2>
              <ColumnChart data={week} height={180} gap={10} barMax={36} />
            </section>
            <section aria-labelledby="l30-h" className="card flex flex-col gap-5 px-6 py-5">
              <div className="flex items-baseline justify-between">
                <h2 id="l30-h" className="m-0 text-base font-semibold">Last 30 days</h2>
                <span className="num text-xs text-faint">{total30} check-ins</span>
              </div>
              <ColumnChart data={month} height={180} gap={4} showValues={false} tickEvery={7} />
            </section>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <section aria-labelledby="cat30-h" className="card flex flex-col gap-4 px-6 py-5">
              <div className="flex items-baseline justify-between">
                <h2 id="cat30-h" className="m-0 text-base font-semibold">By category</h2>
                <span className="text-xs text-faint">30 days</span>
              </div>
              {categoryData.length === 0 ? (
                <p className="m-0 py-8 text-center text-sm text-faint">No check-ins yet.</p>
              ) : (
                <RankedBars
                  items={categoryData.map((c) => ({
                    name: c.name,
                    value: c.value,
                    right: `${c.value} · ${Math.round((c.value / total30) * 100)}%`,
                  }))}
                />
              )}
            </section>
            <section aria-labelledby="top-h" className="card flex flex-col gap-4 px-6 py-5">
              <div className="flex items-baseline justify-between">
                <h2 id="top-h" className="m-0 text-base font-semibold">Top habits</h2>
                <span className="text-xs text-faint">days completed of 30</span>
              </div>
              <RankedBars
                max={30}
                items={byCompletion.slice(0, 5).map((s) => ({
                  name: s.name,
                  value: s.completions30d,
                  right: `${s.completions30d}/30 · ${Math.round((s.completions30d / 30) * 100)}%`,
                }))}
              />
            </section>
          </div>

          <section aria-labelledby="all-h" className="card overflow-hidden">
            <h2 id="all-h" className="m-0 px-6 pb-3 pt-5 text-base font-semibold">All habits</h2>
            <div className="hidden h-10 grid-cols-[minmax(0,1fr)_100px_100px_100px_200px] items-center border-y border-line-soft px-6 text-xs text-faint md:grid">
              <div>Habit</div>
              <div className="text-right">Current</div>
              <div className="text-right">Longest</div>
              <div className="text-right">30 days</div>
              <div className="pl-6">Rate</div>
            </div>
            <div className="divide-y divide-line-soft border-t border-line-soft md:border-t-0">
              {per.map((s) => {
                const pct = Math.round((s.completions30d / 30) * 100);
                const h = habitById[s.habitId];
                return (
                  <div
                    key={s.habitId}
                    className="flex items-center gap-4 px-6 py-3.5 md:grid md:h-14 md:grid-cols-[minmax(0,1fr)_100px_100px_100px_200px] md:gap-0 md:py-0"
                  >
                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="truncate text-sm font-medium">{s.name}</span>
                      <span className="truncate text-xs text-faint">
                        {s.category}
                        {h ? ` · ${frequencyLabel(h)}` : ""}
                        <span className="md:hidden">
                          {" "}· <span className="num">{s.currentStreak}d now · {s.longestStreak}d best</span>
                        </span>
                      </span>
                    </div>
                    <div className="num hidden text-right text-sm md:block">{s.currentStreak}</div>
                    <div className="num hidden text-right text-sm text-muted md:block">{s.longestStreak}</div>
                    <div className="num hidden text-right text-sm text-muted md:block">{s.completions30d}</div>
                    <div className="flex w-28 shrink-0 items-center gap-2.5 md:w-auto md:pl-6">
                      <div className="h-1.5 flex-1 rounded-full bg-fill">
                        <div className="h-1.5 rounded-full bg-fg" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="num w-9 text-right text-xs text-muted">{pct}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </>
      )}

      <AIChat />
    </div>
  );
}
