import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import type { ApplicationStatus } from "@/lib/validators";

function getVisiblePages(currentPage: number, totalPages: number) {
  const pages: number[] = [];
  const start = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
  const end = Math.min(totalPages, start + 4);

  for (let page = start; page <= end; page += 1) {
    pages.push(page);
  }

  return pages;
}

export function ApplicationPagination({
  status,
  query,
  page,
  totalPages,
  total,
}: {
  status?: ApplicationStatus;
  query: string;
  page: number;
  totalPages: number;
  total: number;
}) {
  const createHref = (nextPage: number) => {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (query) params.set("q", query);
    if (nextPage > 1) params.set("page", String(nextPage));

    const queryString = params.toString();
    return queryString ? `/lamaran?${queryString}` : "/lamaran";
  };

  const visiblePages = getVisiblePages(page, totalPages);
  const startItem = (page - 1) * 10 + 1;
  const endItem = Math.min(page * 10, total);

  return (
    <nav
      aria-label="Navigasi halaman lamaran"
      className="mt-8 flex flex-col items-center gap-4"
    >
      <p className="text-xs text-muted">
        Menampilkan {startItem}-{endItem} dari {total} lamaran
      </p>
      <div className="flex max-w-full items-center gap-1 sm:gap-2">
        <Link
          href={createHref(Math.max(1, page - 1))}
          aria-label="Halaman sebelumnya"
          aria-disabled={page === 1}
          tabIndex={page === 1 ? -1 : undefined}
          className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-muted transition-colors dark:border-slate-700 ${
            page === 1
              ? "pointer-events-none opacity-40"
              : "hover:bg-slate-50 hover:text-foreground dark:hover:bg-slate-800"
          }`}
        >
          <ChevronLeft size={18} />
        </Link>

        {visiblePages[0] > 1 && (
          <>
            <Link
              href={createHref(1)}
              aria-label="Halaman 1"
              className="hidden h-10 min-w-10 items-center justify-center rounded-xl border border-slate-200 px-3 text-sm font-semibold text-muted transition-colors hover:bg-slate-50 hover:text-foreground dark:border-slate-700 dark:hover:bg-slate-800 sm:inline-flex"
            >
              1
            </Link>
            {visiblePages[0] > 2 && (
              <span aria-hidden="true" className="hidden px-1 text-muted sm:inline">
                ...
              </span>
            )}
          </>
        )}

        {visiblePages.map((pageNumber) => (
          <Link
            key={pageNumber}
            href={createHref(pageNumber)}
            aria-label={`Halaman ${pageNumber}`}
            aria-current={pageNumber === page ? "page" : undefined}
            className={`inline-flex h-10 min-w-10 items-center justify-center rounded-xl px-3 text-sm font-semibold transition-colors ${
              pageNumber === page
                ? "bg-primary text-white"
                : "border border-slate-200 text-muted hover:bg-slate-50 hover:text-foreground dark:border-slate-700 dark:hover:bg-slate-800"
            }`}
          >
            {pageNumber}
          </Link>
        ))}

        {visiblePages[visiblePages.length - 1] < totalPages && (
          <>
            {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
              <span aria-hidden="true" className="hidden px-1 text-muted sm:inline">
                ...
              </span>
            )}
            <Link
              href={createHref(totalPages)}
              aria-label={`Halaman ${totalPages}`}
              className="hidden h-10 min-w-10 items-center justify-center rounded-xl border border-slate-200 px-3 text-sm font-semibold text-muted transition-colors hover:bg-slate-50 hover:text-foreground dark:border-slate-700 dark:hover:bg-slate-800 sm:inline-flex"
            >
              {totalPages}
            </Link>
          </>
        )}

        <Link
          href={createHref(Math.min(totalPages, page + 1))}
          aria-label="Halaman berikutnya"
          aria-disabled={page === totalPages}
          tabIndex={page === totalPages ? -1 : undefined}
          className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-muted transition-colors dark:border-slate-700 ${
            page === totalPages
              ? "pointer-events-none opacity-40"
              : "hover:bg-slate-50 hover:text-foreground dark:hover:bg-slate-800"
          }`}
        >
          <ChevronRight size={18} />
        </Link>
      </div>
    </nav>
  );
}
