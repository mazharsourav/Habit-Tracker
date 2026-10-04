import { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Minus, RefreshCw } from "lucide-react";
import { format, subDays } from "date-fns";
import api from "../api/axios.js";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import Markdown from "../components/Markdown.jsx";
import ReviewSkeleton from "../components/ReviewSkeleton.jsx";
import StatStrip from "../components/StatStrip.jsx";
import { ColumnChart, CompareChart, RankedBars } from "../components/Charts.jsx";
import { weekKeysFor, streakFromKeys } from "../utils/dateHelpers.js";

const REPORT_CACHE_KEY = (weekStart) => `weekly-report-${weekStart}`;

export default function Insights() {
  const [habits, setHabits] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [report, setReport] = useState("");
  const [reportGeneratedAt, setReportGeneratedAt] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);

  const thisWeek = useMemo(() => weekKeysFor(new Date()), []);
  const lastWeek = useMemo(() => weekKeysFor(subDays(new Date(), 7)), []);

  const generateReport = async () => {
    setReportLoading(true);
    try {
      const res = await api.post("/ai/weekly-report");
      setReport(res.data.content);
      const now = new Date();
      setReportGeneratedAt(now);
      localStorage.setItem(
        REPORT_CACHE_KEY(thisWeek[0].key),
        JSON.stringify({ content: res.data.content, generatedAt: now })
      );
    } catch {
      setReport("Couldn't write your review right now. Try again in a moment.");
    } finally {
      setReportLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [habitsRes, logsRes] = await Promise.all([
          api.get("/habits"),
          api.get("/logs/range", {
            params: { start: lastWeek[0].key, end: thisWeek[6].key },
          }),
        ]);
        setHabits(habitsRes.data);
        setLogs(logsRes.data);

        const cached = localStorage.getItem(REPORT_CACHE_KEY(thisWeek[0].key));
        if (cached) {
          try {
            const { content, generatedAt } = JSON.parse(cached);
            setReport(content);
            setReportGeneratedAt(new Date(generatedAt));
          } catch {
            localStorage.removeItem(REPORT_CACHE_KEY(thisWeek[0].key));
          }
        } else {
          generateReport();
        }
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const thisWeekKeys = useMemo(() => new Set(thisWeek.map((d) => d.key)), [thisWeek]);
  const activeIds = useMemo(() => new Set(habits.map((h) => String(h._id))), [habits]);
  const thisWeekLogs = useMemo(
    () => logs.filter((l) => thisWeekKeys.has(l.completedDate) && activeIds.has(String(l.habitId))),
    [logs, thisWeekKeys, activeIds]
  );
  const lastWeekLogs = useMemo(
    () => logs.filter((l) => !thisWeekKeys.has(l.completedDate) && activeIds.has(String(l.habitId))),
    [logs, thisWeekKeys, activeIds]
  );

  const todayKey = format(new Date(), "yyyy-MM-dd");
  const totalSlots = habits.length * 7;
  const totalDone = thisWeekLogs.length;
  const totalLast = lastWeekLogs.length;
  const completionRate = totalSlots ? Math.round((totalDone / totalSlots) * 100) : 0;
  const delta = totalDone - totalLast;
  const deltaPct = totalLast ? Math.round((delta / totalLast) * 100) : totalDone > 0 ? 100 : 0;

  const countOn = (list, key) => list.filter((l) => l.completedDate === key).length;

  const dailyData = thisWeek.map((d) => ({
    label: d.label,
    value: countOn(thisWeekLogs, d.key),
    display: d.key > todayKey ? "–" : undefined,
    muted: d.key > todayKey,
  }));

  const compareData = thisWeek.map((d, i) => ({
    label: d.label,
    current: countOn(thisWeekLogs, d.key),
    previous: countOn(lastWeekLogs, lastWeek[i].key),
  }));

  const bestDay = thisWeek
    .map((d) => ({ ...d, count: countOn(thisWeekLogs, d.key) }))
    .sort((a, b) => b.count - a.count)[0];

  const perHabit = useMemo(
    () =>
      habits
        .map((h) => {
          const done = thisWeekLogs.filter((l) => String(l.habitId) === String(h._id)).length;
          const target = h.targetDays || 7;
          return { habit: h, done, target, pct: Math.min(100, Math.round((done / target) * 100)) };
        })
        .sort((a, b) => b.pct - a.pct),
    [habits, thisWeekLogs]
  );
  const topHabit = perHabit[0];

  const categoryData = useMemo(() => {
    const map = {};
    for (const h of habits) map[h._id] = h.category;
    const counts = {};
    for (const l of thisWeekLogs) {
      const cat = map[l.habitId];
      if (cat) counts[cat] = (counts[cat] || 0) + 1;
    }
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [habits, thisWeekLogs]);

  // Streaks from the two-week window (enough to show who is on a run this week)
  const streakBoard = useMemo(() => {
    const out = {};
    for (const h of habits) {
      const keys = logs
        .filter((l) => String(l.habitId) === String(h._id))
        .map((l) => l.completedDate)
        .sort()
        .reverse();
      out[h._id] = streakFromKeys(keys);
    }
    return out;
  }, [habits, logs]);
  const activeStreaks = Object.values(streakBoard).filter((s) => s.current > 0).length;

  if (loading) return <LoadingSpinner full />;

  const DeltaIcon = delta > 0 ? ArrowUp : delta < 0 ? ArrowDown : Minus;
  const deltaPill = (
    <span className="num ml-2.5 inline-flex items-center gap-1 rounded bg-fill px-1.5 py-0.5 align-middle text-xs font-medium tracking-normal">
      <DeltaIcon size={12} strokeWidth={2} />
      {delta === 0 ? "same" : `${Math.abs(delta)} · ${Math.abs(deltaPct)}%`}
    </span>
  );

  return (
    <div className="flex flex-col gap-7 animate-fade-in">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1.5">
          <h1 className="m-0 text-[26px] font-semibold tracking-tight md:text-[30px]">Insights</h1>
          <p className="num m-0 text-[13px] text-faint">
            {format(thisWeek[0].date, "d MMM")} – {format(thisWeek[6].date, "d MMM yyyy")}
          </p>
        </div>
        <button className="btn-secondary" onClick={generateReport} disabled={reportLoading}>
          <RefreshCw size={16} strokeWidth={1.5} className={reportLoading ? "animate-spin" : ""} />
          Regenerate review
        </button>
      </header>

      <article aria-labelledby="rev-h" className="card flex flex-col gap-4 px-6 py-6 md:px-8 md:py-7">
        <div className="flex items-center gap-2">
          <h2 id="rev-h" className="m-0 text-base font-semibold">Weekly review</h2>
          <span className="tag">AI</span>
          <span className="flex-1" />
          {reportGeneratedAt && (
            <span className="num text-xs text-faint">
              Generated {format(reportGeneratedAt, "EEE, HH:mm")}
            </span>
          )}
        </div>
        {reportLoading && !report ? (
          <>
            <p className="m-0 text-[13px] text-faint">Writing your review…</p>
            <ReviewSkeleton />
          </>
        ) : report ? (
          <Markdown className="max-w-[680px] text-base leading-[1.65]">{report}</Markdown>
        ) : (
          <div>
            <button onClick={generateReport} className="btn-primary">
              Write my weekly review
            </button>
          </div>
        )}
      </article>

      <StatStrip
        label="This week in numbers"
        items={[
          {
            label: "Check-ins",
            value: (
              <>
                {totalDone}
                {deltaPill}
              </>
            ),
            sub: `vs ${totalLast} last week`,
          },
          { label: "Completion rate", value: `${completionRate}%`, sub: `${totalDone} / ${totalSlots} slots` },
          {
            label: "Best day",
            value: bestDay?.count ? format(bestDay.date, "EEEE") : "—",
            valueClass: "text-[26px] font-medium",
            sub: bestDay?.count ? `${bestDay.count} habit${bestDay.count === 1 ? "" : "s"}` : "no data",
          },
          {
            label: "Top habit",
            value: topHabit?.done ? topHabit.habit.name : "—",
            valueClass: "text-xl font-medium leading-[28px]",
            sub: topHabit?.done ? `${topHabit.done} / ${topHabit.target} this week` : "no check-ins yet",
          },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <section aria-labelledby="byday-h" className="card flex flex-col gap-5 px-6 py-5">
          <h2 id="byday-h" className="m-0 text-base font-semibold">Check-ins by day</h2>
          <ColumnChart data={dailyData} height={200} />
        </section>
        <section aria-labelledby="cmp-h" className="card flex flex-col gap-5 px-6 py-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="cmp-h" className="m-0 text-base font-semibold">This week vs last week</h2>
            <div className="flex gap-4 text-xs text-muted">
              <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-fg" />This week</span>
              <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-line-strong" />Last week</span>
            </div>
          </div>
          <CompareChart data={compareData} height={200} />
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <section aria-labelledby="cat-h" className="card flex flex-col gap-4 px-6 py-5">
          <div className="flex items-baseline justify-between">
            <h2 id="cat-h" className="m-0 text-base font-semibold">By category</h2>
            <span className="text-xs text-faint">share of check-ins</span>
          </div>
          {categoryData.length === 0 ? (
            <p className="m-0 py-8 text-center text-sm text-faint">No check-ins yet this week.</p>
          ) : (
            <RankedBars
              items={categoryData.map((c) => ({
                name: c.name,
                value: c.value,
                right: `${c.value} · ${Math.round((c.value / totalDone) * 100)}%`,
              }))}
            />
          )}
        </section>

        <section aria-labelledby="perf-h" className="card flex flex-col gap-4 px-6 py-5">
          <div className="flex items-baseline justify-between">
            <h2 id="perf-h" className="m-0 text-base font-semibold">Habit performance</h2>
            <span className="text-xs text-faint">vs this week's target</span>
          </div>
          {perHabit.length === 0 ? (
            <p className="m-0 py-8 text-center text-sm text-faint">No active habits.</p>
          ) : (
            <RankedBars
              max={100}
              items={perHabit.map(({ habit, done, target, pct }) => ({
                name: habit.name,
                value: pct,
                right: `${done}/${target} · ${pct}%`,
              }))}
            />
          )}
        </section>
      </div>

      {habits.length > 0 && (
        <section aria-labelledby="streaks-h" className="card flex flex-col gap-4 px-6 py-5">
          <div className="flex items-baseline justify-between">
            <h2 id="streaks-h" className="m-0 text-base font-semibold">Active streaks</h2>
            <span className="num text-xs text-faint">
              {activeStreaks} of {habits.length}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {habits.map((h) => {
              const cur = streakBoard[h._id]?.current || 0;
              return (
                <div key={h._id} className="flex flex-col gap-1.5 rounded-lg border border-line-soft px-4 py-3.5">
                  <span className="truncate text-[13px] text-muted">{h.name}</span>
                  <span className="flex items-baseline gap-1">
                    <span className={`num text-[22px] font-medium ${cur > 0 ? "text-fg" : "text-faint"}`}>{cur}</span>
                    <span className="text-xs text-faint">day{cur === 1 ? "" : "s"}</span>
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
