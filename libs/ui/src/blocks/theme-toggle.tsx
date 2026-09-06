"use client";

import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { useIsMounted } from "@repo/utils";
import { Button } from "../components/button";

export type ThemeToggleProps = {
  /** Accessible label; defaults to English. */
  label?: string;
};

/** Light/dark switch backed by next-themes. Renders nothing until mounted to avoid a hydration mismatch. */
export const ThemeToggle: React.FC<ThemeToggleProps> = ({ label = "Toggle theme" }) => {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useIsMounted();
  if (!mounted) return <Button variant="ghost" size="icon" aria-label={label} disabled />;

  const isDark = resolvedTheme === "dark";
  return (
    <Button variant="ghost" size="icon" aria-label={label} onClick={() => setTheme(isDark ? "light" : "dark")}>
      {isDark ? <SunIcon className="size-4" aria-hidden /> : <MoonIcon className="size-4" aria-hidden />}
    </Button>
  );
};
