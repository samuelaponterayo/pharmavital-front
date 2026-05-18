import { useState, useEffect, useCallback } from "react";

const THEME_KEY = "pharmacy_theme";

function getInitialTheme(): boolean {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored !== null) return stored === "dark";
  } catch {}
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function applyTheme(dark: boolean) {
  document.documentElement.classList.toggle("dark", dark);
}

export function useTheme() {
  const [isDark, setIsDark] = useState(getInitialTheme);

  useEffect(() => {
    applyTheme(isDark);
  }, [isDark]);

  const toggle = useCallback(() => {
    setIsDark((prev) => {
      const next = !prev;
      try { localStorage.setItem(THEME_KEY, next ? "dark" : "light"); } catch {}
      applyTheme(next);
      return next;
    });
  }, []);

  return { isDark, toggle };
}
