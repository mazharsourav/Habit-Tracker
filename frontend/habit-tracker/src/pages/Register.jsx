import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import AuthShell from "../components/AuthShell.jsx";

export default function Register() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/dashboard" replace />;

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const shortPassword = form.password.length > 0 && form.password.length < 6;

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    if (form.password.length < 6) {
      setErr("Your password needs at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      await register(form.name.trim(), form.email, form.password);
      navigate("/dashboard", { replace: true });
    } catch (e) {
      setErr(e.response?.data?.message || "Couldn't create your account. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Create your account" subtitle="Start your first streak in a minute.">
      <form onSubmit={submit} className="flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          <div>
            <label htmlFor="name" className="label">Name</label>
            <input
              id="name"
              className="input h-11 text-[15px]"
              autoComplete="name"
              value={form.name}
              onChange={set("name")}
              placeholder="Your name"
              required
              autoFocus
            />
          </div>
          <div>
            <label htmlFor="email" className="label">Email</label>
            <input
              id="email"
              className="input h-11 text-[15px]"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={set("email")}
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="label">Password</label>
            <input
              id="password"
              className="input h-11 text-[15px]"
              type="password"
              autoComplete="new-password"
              aria-describedby="pw-hint"
              aria-invalid={shortPassword}
              value={form.password}
              onChange={set("password")}
              required
            />
            <p id="pw-hint" className={`m-0 mt-1.5 text-[13px] ${shortPassword ? "text-fg" : "text-faint"}`}>
              At least 6 characters.
            </p>
          </div>
        </div>

        {err && (
          <p role="alert" className="m-0 flex items-start gap-2 rounded-lg border border-line-strong bg-surface px-3 py-2.5 text-sm">
            <AlertCircle size={16} strokeWidth={1.5} className="mt-px shrink-0" />
            {err}
          </p>
        )}

        <button type="submit" className="btn-primary h-11 text-[15px]" disabled={loading}>
          {loading ? "Creating account…" : "Create account"}
        </button>

        <p className="m-0 text-center text-sm text-faint">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-fg underline underline-offset-[3px]">
            Log in
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
