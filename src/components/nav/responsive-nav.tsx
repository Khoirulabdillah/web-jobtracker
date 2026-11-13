"use client";

import {
  BriefcaseBusiness,
  House,
  Moon,
  Plus,
  Sun,
} from "lucide-react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

const navigationItems = [
  { href: "/", label: "Beranda", icon: House },
  { href: "/lamaran", label: "Lamaran", icon: BriefcaseBusiness },
  { href: "/lamaran/baru", label: "Tambah", icon: Plus },
];

export function ResponsiveNav() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <nav
      aria-label="Navigasi utama"
      className="fixed inset-x-0 bottom-0 z-50 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] md:inset-x-auto md:bottom-auto md:left-1/2 md:top-5 md:-translate-x-1/2 md:px-0"
    >
      <div className="mx-auto flex max-w-md items-center justify-around gap-1 rounded-2xl border border-slate-200/80 bg-white/90 p-2 shadow-lg shadow-slate-900/5 backdrop-blur-xl dark:border-slate-700/80 dark:bg-slate-900/90 dark:shadow-black/20 md:max-w-none md:gap-2 md:rounded-full md:px-3">
        {navigationItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="motion-safe:active:scale-[0.96] motion-safe:transition-transform flex min-w-16 flex-col items-center gap-1 rounded-xl px-3 py-2 text-xs font-medium text-slate-500 transition-colors hover:bg-blue-50 hover:text-blue-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-blue-300 md:flex-row md:gap-2 md:rounded-full md:px-4 md:text-sm"
          >
            <Icon aria-hidden="true" size={18} strokeWidth={2} />
            <span>{label}</span>
          </Link>
        ))}
        <button
          type="button"
          aria-label={isDark ? "Gunakan mode terang" : "Gunakan mode gelap"}
          onClick={() => setTheme(isDark ? "light" : "dark")}
          className="motion-safe:active:scale-[0.96] motion-safe:transition-transform flex min-w-16 flex-col items-center gap-1 rounded-xl px-3 py-2 text-xs font-medium text-slate-500 transition-colors hover:bg-blue-50 hover:text-blue-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-blue-300 md:flex-row md:gap-2 md:rounded-full md:px-4 md:text-sm"
        >
          {isDark ? (
            <Sun aria-hidden="true" size={18} strokeWidth={2} />
          ) : (
            <Moon aria-hidden="true" size={18} strokeWidth={2} />
          )}
          <span>Tema</span>
        </button>
      </div>
    </nav>
  );
}
