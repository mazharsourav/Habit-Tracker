import { Link, Navigate } from "react-router-dom";
import { ArrowRight, Check, Flame, Moon, Sun } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import Logo from "../components/Logo.jsx";
import Footer from "../components/Footer.jsx";
import { IconGlyph } from "../components/HabitIcon.jsx";

const features = [
  { title: "Daily check-offs", desc: "One tap per habit, with streaks and a 90-day consistency map." },
  { title: "Weekly review", desc: "What worked, what slipped, and one thing to try next week." },
  { title: "Streak recovery", desc: "When a streak breaks, get a gentle three-day plan to rebuild it." },
  { title: "Statistics you can ask", desc: "Patterns across days and categories, and a chat that answers from your data." },
];

// Hairlines between feature cells: 1 column → 2×2 → 4 across.
const FEATURE_CELL = [
  "sm:pl-0",
  "border-t sm:border-t-0 sm:border-l",
  "border-t sm:pl-0 lg:border-t-0 lg:border-l lg:pl-8",
  "border-t sm:border-l lg:border-t-0 lg:pr-0",
];

const steps = [
  { title: "Create an account", desc: "Name, email, password." },
  { title: "Add a habit", desc: "Pick something small — or answer three questions and get suggestions." },
  { title: "Check it off", desc: "Your first streak starts today." },
];

const preview = [
  { icon: "droplet", name: "Drink 2L of water", streak: 12, done: true },
  { icon: "book", name: "Read 20 minutes", streak: 7, done: true },
  { icon: "activity", name: "Morning run", streak: 3, done: false },
];

export default function Landing() {
  const { user } = useAuth();
  const { theme, toggle } = useTheme();
  if (user) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen bg-page">
      <header className="border-b border-line-soft">
        <div className="mx-auto flex h-[72px] max-w-[1200px] items-center justify-between px-5 md:px-10">
          <Logo />
          <nav aria-label="Account" className="flex items-center gap-1.5">
            <button
              onClick={toggle}
              className="btn-icon"
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? <Sun size={16} strokeWidth={1.5} /> : <Moon size={16} strokeWidth={1.5} />}
            </button>
            <Link to="/login" className="btn-ghost text-fg">
              Log in
            </Link>
            <Link to="/register" className="btn-primary">
              Get started
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-[1200px] px-5 md:px-10">
        <section className="grid items-center gap-14 py-16 md:py-28 lg:grid-cols-[1.15fr_1fr] lg:gap-[72px]">
          <div className="flex flex-col gap-7">
            <div className="eyebrow">Habit tracker · with an AI coach</div>
            <h1 className="m-0 font-serif text-[56px] font-normal leading-[0.98] tracking-[-0.02em] sm:text-[72px] md:text-[88px]">
              Build habits
              <br />
              that <em className="italic">stick</em>.
            </h1>
            <p className="m-0 max-w-[480px] text-lg leading-relaxed text-muted">
              Check off your habits, watch your streaks, and get a
              plain-language review each week written from your own data — not
              generic motivation.
            </p>
            <div className="flex flex-wrap gap-2.5 pt-2">
              <Link to="/register" className="btn-primary h-12 px-[22px] text-[15px]">
                Create an account <ArrowRight size={16} />
              </Link>
              <Link to="/login" className="btn-secondary h-12 px-[22px] text-[15px]">
                I have an account
              </Link>
            </div>
          </div>

          <div aria-hidden="true" className="card overflow-hidden" style={{ boxShadow: "0 24px 64px rgba(0,0,0,0.06)" }}>
            <div className="flex items-center justify-between border-b border-line-soft px-5 py-4">
              <span className="text-sm font-semibold">Today</span>
              <span className="num text-xs text-faint">2 of 3 done</span>
            </div>
            {preview.map((h, i) => (
              <div
                key={h.name}
                className={`flex items-center gap-3.5 px-5 py-3.5 ${i < preview.length - 1 ? "border-b border-line-soft" : ""}`}
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-surface-2">
                  <IconGlyph icon={h.icon} size={16} />
                </span>
                <span className={`flex-1 text-sm ${h.done ? "text-faint" : "font-medium"}`}>{h.name}</span>
                <span className="num inline-flex items-center gap-1 text-xs">
                  <Flame size={12} strokeWidth={1.5} />
                  {h.streak}d
                </span>
                {h.done ? (
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-on-accent">
                    <Check size={14} strokeWidth={2.25} />
                  </span>
                ) : (
                  <span className="h-8 w-8 rounded-full border-[1.5px] border-line-strong" />
                )}
              </div>
            ))}
            <div className="flex flex-col gap-2 border-t border-line-soft bg-surface-2 px-5 pb-5 pt-4">
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-medium">Weekly review</span>
                <span className="tag">AI</span>
              </div>
              <p className="m-0 text-[13px] leading-relaxed text-muted">
                Hydration was 7 for 7. Runs slipped to 3 of 5 on weekdays — put
                your shoes by the door tonight.
              </p>
            </div>
          </div>
        </section>

        <section aria-label="Features" className="grid border-y border-line sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <div
              key={f.title}
              className={`flex flex-col gap-3 border-line py-9 sm:px-8 ${FEATURE_CELL[i]}`}
            >
              <span className="num text-xs text-faint">0{i + 1}</span>
              <h3 className="m-0 text-[17px] font-semibold">{f.title}</h3>
              <p className="m-0 text-sm leading-relaxed text-muted">{f.desc}</p>
            </div>
          ))}
        </section>

        <section aria-labelledby="how-h" className="grid gap-12 py-20 md:py-28 lg:grid-cols-[1fr_1.4fr] lg:gap-[72px]">
          <h2 id="how-h" className="m-0 font-serif text-[44px] font-normal leading-[1.02] tracking-[-0.015em] md:text-[56px]">
            Three steps.
            <br />
            That's the setup.
          </h2>
          <ol className="m-0 flex list-none flex-col p-0">
            {steps.map((s, i) => (
              <li
                key={s.title}
                className={`grid grid-cols-[48px_1fr] gap-4 border-t border-line py-6 md:grid-cols-[64px_1fr] ${
                  i === steps.length - 1 ? "border-b" : ""
                }`}
              >
                <span className="num text-[13px] text-faint">{i + 1}</span>
                <div className="flex flex-col gap-1.5">
                  <span className="text-[17px] font-semibold">{s.title}</span>
                  <span className="text-sm leading-relaxed text-muted">{s.desc}</span>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="flex flex-col items-start justify-between gap-8 rounded-2xl bg-accent px-8 py-14 text-on-accent md:flex-row md:items-center md:px-16 md:py-[72px]">
          <div className="flex flex-col gap-3">
            <h2 className="m-0 font-serif text-[40px] font-normal leading-[1.02] tracking-[-0.015em] md:text-[52px]">
              Your first streak starts today.
            </h2>
            <p className="m-0 text-base opacity-70">Free to use. No credit card.</p>
          </div>
          <Link
            to="/register"
            className="inline-flex h-12 shrink-0 items-center gap-2 rounded-lg bg-on-accent px-[22px] text-[15px] font-medium text-accent transition-opacity hover:opacity-90"
          >
            Create an account <ArrowRight size={16} />
          </Link>
        </section>

        <Footer className="mb-10 mt-16" />
      </main>
    </div>
  );
}
