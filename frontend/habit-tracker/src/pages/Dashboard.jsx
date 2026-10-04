import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Plus } from "lucide-react";
import { format } from "date-fns";
import api from "../api/axios.js";
import Modal from "../components/Modal.jsx";
import HabitForm from "../components/HabitForm.jsx";
import TodayHabitCard from "../components/TodayHabitCard.jsx";
import WeeklyGrid from "../components/WeeklyGrid.jsx";
import HeatmapChart from "../components/HeatmapChart.jsx";
import StatStrip from "../components/StatStrip.jsx";
import AIWeeklyReport from "../components/AIWeeklyReport.jsx";
import MorningMotivation from "../components/MorningMotivation.jsx";
import HabitSuggestionModal from "../components/HabitSuggestionModal.jsx";
import StreakRecoveryCard from "../components/StreakRecoveryCard.jsx";
import DeleteHabitModal from "../components/DeleteHabitModal.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import { celebrate, celebrateBig } from "../utils/confetti.js";
import { resolveIconKey } from "../utils/constants.js";
import {
  streakFromKeys,
  todayKey,
  weekKeys,
  last90Days,
} from "../utils/dateHelpers.js";
import { useAuth } from "../context/AuthContext.jsx";

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
};

export default function Dashboard() {
  const { user } = useAuth();
  const [habits, setHabits] = useState([]);
  const [todayLogs, setTodayLogs] = useState([]);
  const [weekLogs, setWeekLogs] = useState([]);
  const [heatmap, setHeatmap] = useState([]);
  const [allLogsByHabit, setAllLogsByHabit] = useState({});
  const [loading, setLoading] = useState(true);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [suggestOpen, setSuggestOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [recoveryHabit, setRecoveryHabit] = useState(null);

  const week = useMemo(() => weekKeys(), []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const start = week[0].key;
      const end = week[week.length - 1].key;

      const [habitsRes, todayRes, rangeRes, heatRes] = await Promise.all([
        api.get("/habits"),
        api.get("/logs/today"),
        api.get("/logs/range", { params: { start, end } }),
        api.get("/logs/heatmap"),
      ]);

      setHabits(habitsRes.data);
      setTodayLogs(todayRes.data);
      setWeekLogs(rangeRes.data);
      setHeatmap(heatRes.data);

      const byId = {};
      const days90 = last90Days();
      const allRange = await api.get("/logs/range", {
        params: { start: days90[0], end: days90[days90.length - 1] },
      });
      for (const h of habitsRes.data) byId[h._id] = [];
      for (const l of allRange.data) {
        if (!byId[l.habitId]) byId[l.habitId] = [];
        byId[l.habitId].push(l.completedDate);
      }
      for (const k of Object.keys(byId)) byId[k] = byId[k].sort().reverse();
      setAllLogsByHabit(byId);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const completedToday = useMemo(
    () => new Set(todayLogs.map((l) => String(l.habitId))),
    [todayLogs]
  );

  const weekLogsByHabit = useMemo(() => {
    const out = {};
    for (const l of weekLogs) {
      if (!out[l.habitId]) out[l.habitId] = [];
      out[l.habitId].push(l.completedDate);
    }
    return out;
  }, [weekLogs]);

  const streaksById = useMemo(() => {
    const out = {};
    for (const h of habits) out[h._id] = streakFromKeys(allLogsByHabit[h._id] || []);
    return out;
  }, [habits, allLogsByHabit]);

  const doneCount = habits.filter((h) => completedToday.has(String(h._id))).length;
  const todayProgress = habits.length ? Math.round((doneCount / habits.length) * 100) : 0;

  const activeStreaks = Object.values(streaksById).filter((s) => s.current > 0).length;
  const bestStreak = Math.max(0, ...Object.values(streaksById).map((s) => s.longest));

  const weekTotal = habits.length * 7;
  const weekDone = habits.reduce((s, h) => s + (weekLogsByHabit[h._id]?.length || 0), 0);
  const weekRate = weekTotal ? Math.round((weekDone / weekTotal) * 100) : 0;

  // Recovery candidates — habits whose longest streak was >= 7 and current is 0
  useEffect(() => {
    if (recoveryHabit) return;
    if (!habits.length) return;
    const dismissed = JSON.parse(localStorage.getItem("recovery-dismissed") || "{}");
    for (const h of habits) {
      const s = streaksById[h._id];
      if (!s) continue;
      if (s.longest >= 7 && s.current === 0 && !dismissed[h._id]) {
        setRecoveryHabit(h);
        return;
      }
    }
  }, [habits, streaksById, recoveryHabit]);

  const toggle = async (habit) => {
    const done = completedToday.has(String(habit._id));
    const today = todayKey();
    if (done) {
      await api.delete("/logs", { data: { habitId: habit._id, date: today } });
      setTodayLogs((logs) => logs.filter((l) => String(l.habitId) !== String(habit._id)));
      setWeekLogs((logs) =>
        logs.filter(
          (l) => !(String(l.habitId) === String(habit._id) && l.completedDate === today)
        )
      );
      setAllLogsByHabit((prev) => ({
        ...prev,
        [habit._id]: (prev[habit._id] || []).filter((d) => d !== today),
      }));
    } else {
      const res = await api.post("/logs", { habitId: habit._id, date: today });
      setTodayLogs((logs) => [...logs, res.data]);
      setWeekLogs((logs) => [...logs, res.data]);
      setAllLogsByHabit((prev) => ({
        ...prev,
        [habit._id]: [today, ...(prev[habit._id] || [])],
      }));
      celebrate();
      if (doneCount + 1 === habits.length) setTimeout(celebrateBig, 150);
    }
  };

  const saveHabit = async (data) => {
    setSubmitting(true);
    try {
      if (editing) {
        const res = await api.put(`/habits/${editing._id}`, data);
        setHabits((hs) => hs.map((h) => (h._id === res.data._id ? res.data : h)));
      } else {
        const res = await api.post("/habits", data);
        setHabits((hs) => [...hs, res.data]);
        setAllLogsByHabit((p) => ({ ...p, [res.data._id]: [] }));
      }
      setFormOpen(false);
      setEditing(null);
    } finally {
      setSubmitting(false);
    }
  };

  const deleteHabit = async (habit) => {
    await api.delete(`/habits/${habit._id}`);
    setHabits((hs) => hs.filter((h) => h._id !== habit._id));
    setTodayLogs((ls) => ls.filter((l) => String(l.habitId) !== String(habit._id)));
    setWeekLogs((ls) => ls.filter((l) => String(l.habitId) !== String(habit._id)));
    setAllLogsByHabit((prev) => {
      const next = { ...prev };
      delete next[habit._id];
      return next;
    });
    setDeleteTarget(null);
  };

  const archiveHabit = async (habit) => {
    const res = await api.put(`/habits/${habit._id}/archive`);
    if (res.data.isArchived) setHabits((hs) => hs.filter((h) => h._id !== habit._id));
    else setHabits((hs) => hs.map((h) => (h._id === res.data._id ? res.data : h)));
    setDeleteTarget(null);
  };

  const acceptSuggestion = async (s) => {
    const res = await api.post("/habits", {
      name: s.name,
      description: s.description,
      category: s.category,
      frequency: s.frequency,
      icon: resolveIconKey(s.icon),
      targetDays: s.frequency === "daily" ? 7 : 3,
    });
    setHabits((hs) => [...hs, res.data]);
    setAllLogsByHabit((p) => ({ ...p, [res.data._id]: [] }));
  };

  const dismissRecovery = () => {
    const dismissed = JSON.parse(localStorage.getItem("recovery-dismissed") || "{}");
    dismissed[recoveryHabit._id] = Date.now();
    localStorage.setItem("recovery-dismissed", JSON.stringify(dismissed));
    setRecoveryHabit(null);
  };

  const openNew = () => {
    setEditing(null);
    setFormOpen(true);
  };

  if (loading) return <LoadingSpinner full />;

  return (
    <div className="flex flex-col gap-9 animate-fade-in">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1.5">
          <div className="eyebrow">{format(new Date(), "EEE · d MMM yyyy")}</div>
          <h1 className="m-0 text-[26px] font-semibold tracking-tight md:text-[30px]">
            {greeting()}, {user?.name?.split(" ")[0]}
          </h1>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary" onClick={() => setSuggestOpen(true)}>
            Suggest habits
          </button>
          <button className="btn-primary" onClick={openNew}>
            <Plus size={16} />
            New habit
          </button>
        </div>
      </header>

      <MorningMotivation />

      <StatStrip
        items={[
          { label: "Habits", value: habits.length },
          { label: "Active streaks", value: activeStreaks },
          {
            label: "Best streak",
            value: (
              <>
                {bestStreak}
                <span className="ml-1.5 font-sans text-[13px] font-normal text-faint">days</span>
              </>
            ),
          },
          {
            label: "This week",
            value: (
              <>
                {weekRate}%
                <span className="num ml-2 text-[13px] font-normal text-faint">
                  {weekDone} / {weekTotal}
                </span>
              </>
            ),
          },
        ]}
      />

      <section aria-labelledby="today-h" className="flex flex-col gap-3.5">
        <div className="flex items-center justify-between gap-4">
          <h2 id="today-h" className="m-0 text-base font-semibold">Today</h2>
          {habits.length > 0 && (
            <div className="flex items-center gap-3">
              <span className="num text-[13px] text-muted">
                {doneCount} of {habits.length} done
              </span>
              <div
                role="progressbar"
                aria-label="Today's progress"
                aria-valuenow={todayProgress}
                aria-valuemin={0}
                aria-valuemax={100}
                className="h-1 w-32 rounded-full bg-line-soft sm:w-40"
              >
                <div
                  className="h-1 rounded-full bg-fg transition-[width] duration-500"
                  style={{ width: `${todayProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {habits.length === 0 ? (
          <div className="card flex flex-col items-center gap-2.5 px-6 py-12 text-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-full border border-dashed border-line-strong text-muted">
              <Plus size={18} />
            </span>
            <span className="text-[15px] font-medium">No habits yet</span>
            <span className="max-w-xs text-sm text-faint">
              Start with something you can do in under five minutes.
            </span>
            <button className="btn-primary mt-1.5" onClick={openNew}>
              Create a habit
            </button>
          </div>
        ) : (
          <div className="card divide-y divide-line-soft overflow-hidden">
            {habits.map((h) => (
              <TodayHabitCard
                key={h._id}
                habit={h}
                completed={completedToday.has(String(h._id))}
                streak={streaksById[h._id]?.current || 0}
                onToggle={() => toggle(h)}
                onEdit={() => {
                  setEditing(h);
                  setFormOpen(true);
                }}
                onArchive={() => archiveHabit(h)}
                onDelete={() => setDeleteTarget(h)}
              />
            ))}
          </div>
        )}
      </section>

      {recoveryHabit && (
        <StreakRecoveryCard
          habit={recoveryHabit}
          longest={streaksById[recoveryHabit._id]?.longest || 0}
          onDismiss={dismissRecovery}
        />
      )}

      {habits.length > 0 && (
        <section aria-labelledby="week-h" className="flex flex-col gap-3.5">
          <div className="flex items-baseline justify-between gap-4">
            <div className="flex items-baseline gap-3">
              <h2 id="week-h" className="m-0 text-base font-semibold">This week</h2>
              <span className="num text-[13px] text-faint">
                {format(week[0].date, "d MMM")} – {format(week[6].date, "d MMM")}
              </span>
            </div>
            <Link
              to="/weekly"
              className="inline-flex items-center gap-1.5 text-[13px] font-medium text-fg hover:text-muted"
            >
              Weekly view <ArrowRight size={14} />
            </Link>
          </div>
          <WeeklyGrid habits={habits} logsByHabit={weekLogsByHabit} days={week} legend />
        </section>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <HeatmapChart data={heatmap} />
        <AIWeeklyReport />
      </div>

      <Modal
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        title={editing ? "Edit habit" : "New habit"}
      >
        <HabitForm
          initial={editing}
          submitting={submitting}
          onCancel={() => {
            setFormOpen(false);
            setEditing(null);
          }}
          onSubmit={saveHabit}
        />
      </Modal>

      <DeleteHabitModal
        habit={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onDelete={deleteHabit}
        onArchive={archiveHabit}
      />

      <HabitSuggestionModal
        open={suggestOpen}
        onClose={() => setSuggestOpen(false)}
        onAccept={acceptSuggestion}
      />
    </div>
  );
}
