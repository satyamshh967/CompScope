"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem(
      "compscope-theme"
    ) as Theme | null;

    const initialTheme: Theme =
      savedTheme === "dark" || savedTheme === "light"
        ? savedTheme
        : "light";

    document.documentElement.dataset.theme = initialTheme;

    setTheme(initialTheme);
    setMounted(true);
  }, []);

  function toggleTheme() {
    const nextTheme: Theme =
      theme === "light" ? "dark" : "light";

    document.documentElement.dataset.theme = nextTheme;

    localStorage.setItem("compscope-theme", nextTheme);

    setTheme(nextTheme);
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={
        mounted
          ? `Switch to ${
              theme === "light" ? "dark" : "light"
            } mode`
          : "Toggle theme"
      }
      aria-label={
        mounted
          ? `Switch to ${
              theme === "light" ? "dark" : "light"
            } mode`
          : "Toggle theme"
      }
      className="
        flex
        h-9
        w-9
        cursor-pointer
        items-center
        justify-center
        rounded-lg
        border
        border-border
        bg-surface
        text-sm
        text-muted-strong
        transition-all
        duration-150
        hover:border-accent
        hover:bg-accent-soft
        hover:text-accent
        active:scale-95
      "
    >
      {mounted
        ? theme === "light"
          ? "☾"
          : "☀"
        : "☾"}
    </button>
  );
}