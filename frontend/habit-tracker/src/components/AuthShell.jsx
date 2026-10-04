import { Moon, Sun } from "lucide-react";
import { useTheme } from "../context/ThemeContext.jsx";
import Logo from "./Logo.jsx";
import Footer from "./Footer.jsx";

// Shared frame for the log-in and sign-up pages.
export default function AuthShell({ title, subtitle, children }) {
  const { theme, toggle } = useTheme();
  return (
    <div className="flex min-h-screen flex-col bg-page px-5 md:px-10">
      <header className="flex h-[72px] items-center justify-between">
        <Logo />
        <button
          onClick={toggle}
          className="btn-icon"
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          {theme === "dark" ? <Sun size={16} strokeWidth={1.5} /> : <Moon size={16} strokeWidth={1.5} />}
        </button>
      </header>
      <main className="flex flex-1 items-center justify-center py-12">
        <div className="flex w-full max-w-[380px] flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="m-0 font-serif text-[44px] font-normal leading-[1.05] tracking-[-0.01em]">
              {title}
            </h1>
            <p className="m-0 text-[15px] text-faint">{subtitle}</p>
          </div>
          {children}
        </div>
      </main>
      <Footer className="mb-8" />
    </div>
  );
}
