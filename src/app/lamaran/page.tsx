import { Plus } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ApplicationCard } from "@/components/applications/application-card";
import { ApplicationFilters } from "@/components/applications/application-filters";
import { DatabaseNotice } from "@/components/database-notice";
import { getApplicationsPage } from "@/actions/applications";
import { isDatabaseConfigured } from "@/db";
import {
  applicationStatuses,
  type ApplicationStatus,
} from "@/lib/validators";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/reveal";
import { ApplicationPagination } from "@/components/applications/application-pagination";

export const instant = false;

export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; page?: string }>;
}) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q.trim() : "";
  const statusParam =
    typeof params.status === "string" ? params.status.trim() : "";
  const status = applicationStatuses.includes(statusParam as ApplicationStatus)
    ? (statusParam as ApplicationStatus)
    : undefined;
  const pageParam =
    typeof params.page === "string" ? params.page.trim() : "";
  const requestedPage =
    /^\d+$/.test(pageParam) && pageParam !== ""
      ? Number.parseInt(pageParam, 10)
      : 1;
  const page =
    Number.isSafeInteger(requestedPage) && requestedPage > 0
      ? requestedPage
      : 1;
  const result = isDatabaseConfigured()
    ? await getApplicationsPage({ status, query, page, pageSize: 10 })
    : null;

  if (result !== null) {
    const canonicalParams = new URLSearchParams();
    if (status) canonicalParams.set("status", status);
    if (query) canonicalParams.set("q", query);
    if (result.page > 1) canonicalParams.set("page", String(result.page));

    const canonicalSearch = canonicalParams.toString();
    const originalStatus = typeof params.status === "string" ? params.status : "";
    const originalQuery = typeof params.q === "string" ? params.q : "";
    const originalPage = typeof params.page === "string" ? params.page : "";
    const canonicalStatus = status ?? "";
    const canonicalQuery = query;
    const canonicalPage = result.page > 1 ? String(result.page) : "";
    const needsCanonicalUrl =
      originalStatus !== canonicalStatus ||
      originalQuery !== canonicalQuery ||
      originalPage !== canonicalPage;

    if (needsCanonicalUrl) {
      redirect(canonicalSearch ? `/lamaran?${canonicalSearch}` : "/lamaran");
    }
  }

  const hasFilters = Boolean(status || query);
  const applications = result?.applications ?? null;

  return (
    <main className="min-h-screen px-5 pb-32 pt-8 md:px-8 md:pb-12 md:pt-28">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold text-primary">Koleksi lamaran</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight">
              Semua lamaran
            </h1>
            <p className="mt-2 text-sm text-muted">
              Simpan dan pantau setiap peluang kariermu.
            </p>
          </div>
          <Link
            href="/lamaran/baru"
            className="motion-safe:active:scale-[0.98] motion-safe:transition-transform inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-primary-hover"
          >
            <Plus size={17} />
            Tambah lamaran
          </Link>
        </div>

        {applications !== null && (
          <Reveal>
            <ApplicationFilters
              key={`${status ?? "all"}:${query}`}
              status={status}
              query={query}
            />
          </Reveal>
        )}

        {applications === null ? (
          <DatabaseNotice />
        ) : applications.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center dark:border-slate-700">
            <h2 className="font-semibold">
              {hasFilters ? "Lamaran tidak ditemukan" : "Belum ada lamaran"}
            </h2>
            <p className="mt-2 text-sm text-muted">
              {hasFilters
                ? "Coba ubah kata kunci atau status untuk menemukan lamaran lain."
                : "Mulai catat lamaran pertamamu untuk melihatnya di sini."}
            </p>
            {hasFilters && (
              <Link
                href="/lamaran"
                className="motion-safe:active:scale-[0.98] motion-safe:transition-transform mt-5 inline-flex rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover"
              >
                Atur ulang filter
              </Link>
            )}
          </div>
        ) : (
          <>
            <StaggerGroup
              key={`${status ?? "all"}:${query}:${result?.page ?? 1}`}
              className="grid gap-4 md:grid-cols-2"
            >
              {applications.map((application) => (
                <StaggerItem key={application.id}>
                  <ApplicationCard application={application} />
                </StaggerItem>
              ))}
            </StaggerGroup>
            {result !== null && result.totalPages > 1 && (
              <ApplicationPagination
                status={status}
                query={query}
                page={result.page}
                totalPages={result.totalPages}
                total={result.total}
              />
            )}
          </>
        )}
      </div>
    </main>
  );
}
