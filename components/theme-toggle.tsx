"use client";

import { useTheme } from "@/hooks/use-theme";

export function ThemeToggle() {
  const { isReady, theme, toggleTheme } = useTheme();

  return (
    <button
      aria-label="Toggle theme"
      className="inline-flex h-10 items-center gap-2 rounded-full border border-border bg-surface px-3 text-sm font-medium text-foreground transition hover:border-foreground/40 hover:bg-surface-strong"
      onClick={toggleTheme}
      type="button"
    >
      <span aria-hidden="true" className="text-base">
        {theme === "dark" ? "â—" : "â—‘"}
      </span>
      <span>{isReady ? (theme === "dark" ? "Dark" : "Light") : "Theme"}</span>
    </button>
  );
}

