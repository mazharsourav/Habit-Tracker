import { CREDITS } from "../utils/constants.js";

const links = [
  { label: "GitHub", href: CREDITS.github },
  { label: "Portfolio", href: CREDITS.portfolio },
  { label: "LinkedIn", href: CREDITS.linkedin },
];

export default function Footer({ className = "" }) {
  return (
    <footer
      className={`flex flex-col items-center justify-between gap-3 border-t border-line pt-6 text-[13px] text-faint sm:flex-row ${className}`}
    >
      <p className="m-0">
        Designed &amp; built by{"  "}
        <a
          href={CREDITS.portfolio}
          target="_blank"
          rel="noreferrer"
          className="text-base font-bold tracking-tight text-fg hover:underline underline-offset-4"
        >
          {CREDITS.name}
        </a>
        <span className="num"> | ©{new Date().getFullYear()}</span>
      </p>
      <nav aria-label="Builder links" className="flex items-center gap-5">
        {links.map((l) => (
          <a
            key={l.label}
            href={l.href}
            target="_blank"
            rel="noreferrer"
            className="transition-colors hover:text-fg"
          >
            {l.label}
          </a>
        ))}
      </nav>
    </footer>
  );
}
