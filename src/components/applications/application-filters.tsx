"use client";

import { Search, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  applicationStatuses,
  statusLabels,
  type ApplicationStatus,
} from "@/lib/validators";

export function ApplicationFilters({
  status,
  query,
}: {
  status?: ApplicationStatus;
  query: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [search, setSearch] = useState(query);
  const hasFilters = Boolean(status || query);

  const updateUrl = useCallback((updates: { status?: string | null; q?: string | null }) => {
    const params = new URLSearchParams();
    const nextStatus = updates.status !== undefined ? updates.status : status;
    const nextQuery = updates.q !== undefined ? updates.q : query;

    if (nextStatus) params.set("status", nextStatus);
    if (nextQuery) params.set("q", nextQuery);

    const queryString = params.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
      scroll: false,
    });
  }, [pathname, query, router, status]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      updateUrl({ q: search });
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [search, updateUrl]);

  return (
    <section className="mb-6 rounded-2xl border border-slate-200 bg-surface p-4 dark:border-slate-700 sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
        <label className="block flex-1">
          <span className="mb-2 block text-sm font-medium">Cari lamaran</span>
          <span className="relative block">
            <Search
              aria-hidden="true"
              size={17}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari perusahaan atau posisi..."
              className="w-full rounded-xl border border-slate-200 bg-transparent py-3 pl-10 pr-4 text-sm outline-none transition-colors placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/15 dark:border-slate-600"
            />
          </span>
        </label>
        <label className="block lg:w-56">
          <span className="mb-2 block text-sm font-medium">Status</span>
          <select
            value={status ?? ""}
            onChange={(event) =>
              updateUrl({ status: event.target.value })
            }
            className="w-full rounded-xl border border-slate-200 bg-transparent px-4 py-3 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/15 dark:border-slate-600"
          >
            <option value="">Semua</option>
            {applicationStatuses.map((item) => (
              <option key={item} value={item}>
                {statusLabels[item]}
              </option>
            ))}
          </select>
        </label>
        {hasFilters && (
          <Link
            href={pathname}
            className="motion-safe:active:scale-[0.98] motion-safe:transition-transform inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-muted transition-colors hover:bg-slate-50 hover:text-foreground dark:border-slate-700 dark:hover:bg-slate-800"
          >
            <X size={16} />
            Atur ulang
          </Link>
        )}
      </div>
      {hasFilters && (
        <p className="mt-3 text-xs text-muted">
          Hasil diperbarui berdasarkan filter status dan kata kunci.
        </p>
      )}
    </section>
  );
}
