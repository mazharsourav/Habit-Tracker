import { useEffect, useMemo, useState } from "react";
import { Archive, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { format, subDays } from "date-fns";
import api from "../api/axios.js";
import Modal from "../components/Modal.jsx";
import HabitForm from "../components/HabitForm.jsx";
import HabitIcon from "../components/HabitIcon.jsx";
import HabitSuggestionModal from "../components/HabitSuggestionModal.jsx";
import DeleteHabitModal from "../components/DeleteHabitModal.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import { CATEGORIES, frequencyLabel, resolveIconKey } from "../utils/constants.js";
import { streakFromKeys } from "../utils/dateHelpers.js";

const COLS =
  "md:grid md:grid-cols-[minmax(0,1fr)_120px_150px_72px_72px_80px_136px]";

export default function Habits() {
  const [habits, setHabits] = useState([]);
  const [logsByHabit, setLogsByHabit] = useState({});
  const [loading, setLoading] = useState(true);

  const [showArchived, setShowArchived] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [habitsRes, rangeRes] = await Promise.all([
        api.get("/habits", { params: { includeArchived: "true" } }),
        api.get("/logs/range", {
          params: {
            start: format(subDays(new Date(), 89), "yyyy-MM-dd"),
            end: format(new Date(), "yyyy-MM-dd"),
          },
        }),
      ]);
      setHabits(habitsRes.data);
      const byId = {};
      for (const h of habitsRes.data) byId[h._id] = [];
      for (const l of rangeRes.data) {
        if (!byId[l.habitId]) byId[l.habitId] = [];
        byId[l.habitId].push(l.completedDate);
      }
      for (const k of Object.keys(byId)) byId[k] = byId[k].sort().reverse();
      setLogsByHabit(byId);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return habits.filter((h) => {
      if (!showArchived && h.isArchived) return false;
      if (showArchived && !h.isArchived) return false;
      if (category !== "All" && h.category !== category) return false;
      if (q && !h.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [habits, query, category, showArchived]);

  const activeCount = habits.filter((h) => !h.isArchived).length;
  const archivedCount = habits.filter((h) => h.isArchived).length;

  const save = async (data) => {
    setSubmitting(true);
    try {
      if (editing) {
        const res = await api.put(`/habits/${editing._id}`, data);
        setHabits((hs) => hs.map((h) => (h._id === res.data._id ? res.data : h)));
      } else {
        const res = await api.post("/habits", data);
        setHabits((hs) => [...hs, res.data]);
        setLogsByHabit((p) => ({ ...p, [res.data._id]: [] }));
      }
      setFormOpen(false);
      setEditing(null);
    } finally {
      setSubmitting(false);
    }
  };

  const archive = async (habit) => {
    const res = await api.put(`/habits/${habit._id}/archive`);
    setHabits((hs) => hs.map((h) => (h._id === res.data._id ? res.data : h)));
    setDeleteTarget(null);
  };

  const remove = async (habit) => {
    await api.delete(`/habits/${habit._id}`);
    setHabits((hs) => hs.filter((h) => h._id !== habit._id));
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
    setLogsByHabit((p) => ({ ...p, [res.data._id]: [] }));
  };

  const openNew = () => {
    setEditing(null);
    setFormOpen(true);
  };

  if (loading) return <LoadingSpinner full />;

  return (
    <div className="flex flex-col gap-7 animate-fade-in">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1.5">
          <h1 className="m-0 text-[26px] font-semibold tracking-tight md:text-[30px]">Habits</h1>
          <p className="m-0 text-sm text-faint">Every habit you've created, active and archived.</p>
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

      <div role="search" className="flex flex-col gap-3 md:flex-row md:items-center">
        <label htmlFor="habit-search" className="relative flex flex-1 items-center">
          <Search size={16} className="pointer-events-none absolute left-3 text-faint" />
          <input
            id="habit-search"
            type="search"
            className="input pl-9"
            placeholder="Search habits"
            aria-label="Search habits"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <div className="flex gap-3">
          <select
            aria-label="Category"
            className="input flex-1 md:w-52 md:flex-none"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="All">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <div role="group" aria-label="Show" className="segmented">
            <button aria-pressed={!showArchived} onClick={() => setShowArchived(false)}>
              Active <span className="num opacity-70">{activeCount}</span>
            </button>
            <button aria-pressed={showArchived} onClick={() => setShowArchived(true)}>
              Archived <span className="num opacity-70">{archivedCount}</span>
            </button>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card flex flex-col items-center gap-2.5 px-6 py-12 text-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-full border border-dashed border-line-strong text-muted">
            {showArchived ? <Archive size={18} strokeWidth={1.5} /> : <Plus size={18} />}
          </span>
          <span className="text-[15px] font-medium">
            {showArchived
              ? "Nothing archived"
              : habits.length === 0
                ? "No habits yet"
                : "No habits match your filter"}
          </span>
          <span className="max-w-sm text-sm text-faint">
            {showArchived
              ? "Archived habits keep their history but stay off your daily list."
              : habits.length === 0
                ? "Start with something you can do in under five minutes."
                : "Try clearing your search or category filter."}
          </span>
          {!showArchived && habits.length === 0 && (
            <button className="btn-primary mt-1.5" onClick={openNew}>
              Create a habit
            </button>
          )}
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className={`hidden h-11 items-center border-b border-line-soft px-5 text-xs text-faint ${COLS}`}>
            <div>Habit</div>
            <div>Category</div>
            <div>Frequency</div>
            <div className="text-right">Streak</div>
            <div className="text-right">Best</div>
            <div className="text-right">90 days</div>
            <div />
          </div>

          <div className="divide-y divide-line-soft">
            {filtered.map((h) => {
              const keys = logsByHabit[h._id] || [];
              const { current, longest } = streakFromKeys(keys);
              const dim = h.isArchived ? "text-faint" : "";
              return (
                <div
                  key={h._id}
                  className={`flex min-h-[68px] items-center gap-3 py-3 pl-4 pr-3 transition-colors hover:bg-surface-2 md:gap-0 md:pl-5 ${COLS}`}
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3.5 md:pr-4">
                    <HabitIcon icon={h.icon} className={dim} />
                    <div className="flex min-w-0 flex-col gap-0.5">
                      <div className="flex min-w-0 items-center gap-2">
                        <span className={`truncate text-[15px] font-medium ${dim}`}>{h.name}</span>
                        {h.isArchived && <span className="tag">ARCHIVED</span>}
                      </div>
                      <span className="truncate text-[13px] text-faint">
                        <span className="md:hidden">
                          {h.category} · {frequencyLabel(h)} · <span className="num">{current}d</span>
                        </span>
                        <span className="hidden md:inline">{h.description}</span>
                      </span>
                    </div>
                  </div>
                  <div className={`hidden text-sm md:block ${dim || "text-muted"}`}>{h.category}</div>
                  <div className={`hidden text-sm md:block ${dim || "text-muted"}`}>{frequencyLabel(h)}</div>
                  <div className={`num hidden text-right text-sm md:block ${current > 0 && !h.isArchived ? "" : "text-faint"}`}>{current}</div>
                  <div className={`num hidden text-right text-sm md:block ${dim || "text-muted"}`}>{longest}</div>
                  <div className={`num hidden text-right text-sm md:block ${dim || "text-muted"}`}>{keys.length}</div>
                  <div className="flex shrink-0 items-center justify-end gap-0.5">
                    <button
                      className="btn-icon"
                      onClick={() => {
                        setEditing(h);
                        setFormOpen(true);
                      }}
                      aria-label={`Edit ${h.name}`}
                      title="Edit"
                    >
                      <Pencil size={16} strokeWidth={1.5} />
                    </button>
                    {h.isArchived ? (
                      <button className="btn-secondary btn-sm mx-1" onClick={() => archive(h)}>
                        Restore
                      </button>
                    ) : (
                      <button
                        className="btn-icon"
                        onClick={() => archive(h)}
                        aria-label={`Archive ${h.name}`}
                        title="Archive"
                      >
                        <Archive size={16} strokeWidth={1.5} />
                      </button>
                    )}
                    <button
                      className="btn-icon"
                      onClick={() => setDeleteTarget(h)}
                      aria-label={`Delete ${h.name}`}
                      title="Delete"
                    >
                      <Trash2 size={16} strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

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
          onSubmit={save}
        />
      </Modal>

      <DeleteHabitModal
        habit={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onDelete={remove}
        onArchive={archive}
      />

      <HabitSuggestionModal
        open={suggestOpen}
        onClose={() => setSuggestOpen(false)}
        onAccept={acceptSuggestion}
      />
    </div>
  );
}
