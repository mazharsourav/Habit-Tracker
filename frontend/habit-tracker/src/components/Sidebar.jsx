import { useState } from "react";
import { NavLink } from "react-router-dom";
import { LogOut, Moon, SlidersHorizontal, Sun } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import { NAV } from "../utils/nav.js";
import Logo from "./Logo.jsx";
import SettingsModal from "./SettingsModal.jsx";

const item =
  "flex h-10 items-center gap-3 rounded-lg px-2.5 text-sm transition-colors";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[232px] flex-col border-r border-line bg-surface px-3 py-5 md:flex">
      <Logo to="/dashboard" className="px-2.5 py-1.5" />

      <nav aria-label="Main" className="mt-7 flex flex-col gap-0.5">
        {NAV.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `${item} ${
                isActive
                  ? "bg-fill font-medium text-fg"
                  : "text-muted hover:bg-fill hover:text-fg"
              }`
            }
          >
            <Icon size={18} strokeWidth={1.5} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto flex flex-col gap-0.5 border-t border-line-soft pt-3">
        <button
          onClick={toggle}
          className={`${item} text-left text-muted hover:bg-fill hover:text-fg`}
        >
          {theme === "dark" ? (
            <Sun size={18} strokeWidth={1.5} />
          ) : (
            <Moon size={18} strokeWidth={1.5} />
          )}
          {theme === "dark" ? "Light mode" : "Dark mode"}
        </button>
        <button
          onClick={() => setSettingsOpen(true)}
          className={`${item} text-left text-muted hover:bg-fill hover:text-fg`}
        >
          <SlidersHorizontal size={18} strokeWidth={1.5} />
          Settings
        </button>

        <div className="flex items-center gap-2.5 pl-2.5 pt-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-[13px] font-semibold text-on-accent">
            {user?.avatar || user?.name?.charAt(0).toUpperCase() || "U"}
          </span>
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-[13px] font-medium">{user?.name}</span>
            <span className="truncate text-xs text-faint">{user?.email}</span>
          </div>
          <button
            onClick={logout}
            className="btn-icon h-9 w-9"
            aria-label="Log out"
            title="Log out"
          >
            <LogOut size={16} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {settingsOpen && (
        <SettingsModal open onClose={() => setSettingsOpen(false)} />
      )}
    </aside>
  );
}
