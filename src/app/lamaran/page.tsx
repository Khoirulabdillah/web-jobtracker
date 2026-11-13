import { Plus } from "lucide-react";
import Link from "next/link";
import { ApplicationCard } from "@/components/applications/application-card";
import { ApplicationFilters } from "@/components/applications/application-filters";
import { DatabaseNotice } from "@/components/database-notice";
import { getApplications } from "@/actions/applications";
import { isDatabaseConfigured } from "@/db";
import {
  applicationStatuses,
  type ApplicationStatus,
} from "@/lib/validators";

export const instant = false;

export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const status = applicationStatuses.includes(
    params.status as ApplicationStatus,
  )
    ? (params.status as ApplicationStatus)
    : undefined;
  const applications = isDatabaseConfigured()
    ? await getApplications({ status, query })
    : null;
  const hasFilters = Boolean(status || query);

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
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-primary-hover"
          >
            <Plus size={17} />
            Tambah lamaran
          </Link>
        </div>

        {applications !== null && (
          <ApplicationFilters status={status} query={query} />
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
                className="mt-5 inline-flex rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover"
              >
                Atur ulang filter
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {applications.map((application) => (
              <ApplicationCard key={application.id} application={application} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
