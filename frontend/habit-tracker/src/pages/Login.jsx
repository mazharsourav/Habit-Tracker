import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import AuthShell from "../components/AuthShell.jsx";

export default function Login() {
  const { user, login } = useAuth();
  const loc = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/dashboard" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      await login(email, password);
      navigate(loc.state?.from || "/dashboard", { replace: true });
    } catch (e) {
      setErr(e.response?.data?.message || "Couldn't log you in. Check your details and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Welcome back" subtitle="Log in to see today's habits.">
      <form onSubmit={submit} className="flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          <div>
            <label htmlFor="email" className="label">Email</label>
            <input
              id="email"
              className="input h-11 text-[15px]"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoFocus
            />
          </div>
          <div>
            <label htmlFor="password" className="label">Password</label>
            <input
              id="password"
              className="input h-11 text-[15px]"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
        </div>

        {err && (
          <p role="alert" className="m-0 flex items-start gap-2 rounded-lg border border-line-strong bg-surface px-3 py-2.5 text-sm">
            <AlertCircle size={16} strokeWidth={1.5} className="mt-px shrink-0" />
            {err}
          </p>
        )}

        <button type="submit" className="btn-primary h-11 text-[15px]" disabled={loading}>
          {loading ? "Logging in…" : "Log in"}
        </button>

        <p className="m-0 text-center text-sm text-faint">
          No account yet?{" "}
          <Link to="/register" className="font-medium text-fg underline underline-offset-[3px]">
            Create one
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
