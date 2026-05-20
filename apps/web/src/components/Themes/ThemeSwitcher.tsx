"use client";

import { Button } from "@repo/ui/button";
import { useTheme } from "./ThemeContext";

const ThemeSwitch = () => {
  const { theme, toggleTheme, mounted } = useTheme();

  if (!mounted) {
    // Render stable placeholder text until the browser theme value is available.
    return (
      <Button className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-[var(--text)] shadow-sm dark:border-gray-700">
        Theme
      </Button>
    );
  }

  return (
    <Button
      onClick={toggleTheme}
      className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-[var(--text)] shadow-sm hover:text-[var(--textHover)] dark:border-gray-700"
    >
      {theme === "light" ? "🌙 Dark Mode" : "☀️ Light Mode"}
    </Button>
  );
};

export default ThemeSwitch;
