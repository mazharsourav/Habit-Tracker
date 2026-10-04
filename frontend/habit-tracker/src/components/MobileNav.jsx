import { useState } from "react";
import { NavLink } from "react-router-dom";
import { LogOut, Moon, Sun } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import Logo from "./Logo.jsx";
import SettingsModal from "./SettingsModal.jsx";
import { NAV } from "../utils/nav.js";

export default function MobileNav() {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-line-soft bg-surface pl-4 pr-1 md:hidden">
        <Logo to="/dashboard" />
        <div className="flex items-center">
          <button
            onClick={toggle}
            className="btn-icon h-11 w-11"
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? <Sun size={18} strokeWidth={1.5} /> : <Moon size={18} strokeWidth={1.5} />}
          </button>
          <button
            onClick={() => setSettingsOpen(true)}
            className="flex h-11 w-11 items-center justify-center"
            aria-label="Account and settings"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-[13px] font-semibold text-on-accent">
              {user?.avatar || user?.name?.charAt(0).toUpperCase() || "U"}
            </span>
          </button>
          <button onClick={logout} className="btn-icon h-11 w-11" aria-label="Log out">
            <LogOut size={18} strokeWidth={1.5} />
          </button>
        </div>
      </header>

      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-line bg-surface px-2 pb-[max(env(safe-area-inset-bottom),8px)] pt-1.5 md:hidden"
      >
        {NAV.map(({ to, short, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex min-h-[48px] flex-col items-center justify-center gap-0.5 text-[11px] ${
                isActive ? "font-semibold text-fg" : "text-faint"
              }`
            }
          >
            <Icon size={20} strokeWidth={1.5} />
            {short}
          </NavLink>
        ))}
      </nav>

      {settingsOpen && (
        <SettingsModal open onClose={() => setSettingsOpen(false)} />
      )}
    </>
  );
}
