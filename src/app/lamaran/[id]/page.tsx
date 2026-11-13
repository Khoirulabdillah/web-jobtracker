import {
  ArrowLeft,
  CalendarClock,
  ExternalLink,
  Pencil,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DeleteButton } from "@/components/applications/delete-button";
import { DatabaseNotice } from "@/components/database-notice";
import { getApplicationById } from "@/actions/applications";
import { isDatabaseConfigured } from "@/db";
import {
  formatDate,
  formatReminder,
  statusLabels,
  statusStyles,
} from "@/lib/validators";

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!isDatabaseConfigured()) {
    return (
      <main className="min-h-screen px-5 pb-32 pt-8 md:px-8 md:pb-12 md:pt-28">
        <div className="mx-auto w-full max-w-3xl">
          <DatabaseNotice />
        </div>
      </main>
    );
  }

  const { id } = await params;
  const application = await getApplicationById(id);
  if (!application) notFound();

  return (
    <main className="min-h-screen px-5 pb-32 pt-8 md:px-8 md:pb-12 md:pt-28">
      <div className="mx-auto w-full max-w-3xl">
        <Link
          href="/lamaran"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-foreground"
        >
          <ArrowLeft size={16} />
          Kembali ke lamaran
        </Link>
        <article className="mt-6 rounded-2xl border border-slate-200 bg-surface p-6 shadow-sm dark:border-slate-700 sm:p-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
            <div>
              <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[application.status]}`}
              >
                {statusLabels[application.status]}
              </span>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight">
                {application.position}
              </h1>
              <p className="mt-2 text-lg text-muted">{application.company}</p>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/lamaran/${application.id}/ubah`}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold dark:border-slate-700"
              >
                <Pencil size={16} />
                Ubah
              </Link>
              <DeleteButton id={application.id} />
            </div>
          </div>

          <dl className="mt-8 grid gap-5 border-t border-slate-200 pt-6 dark:border-slate-700 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-muted">
                Tanggal melamar
              </dt>
              <dd className="mt-1 text-sm">{formatDate(application.appliedAt)}</dd>
            </div>
            {application.reminderAt && (
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-muted">
                  Pengingat
                </dt>
                <dd className="mt-1 inline-flex items-center gap-2 text-sm">
                  <CalendarClock size={16} className="text-primary" />
                  {formatReminder(application.reminderAt)}
                </dd>
              </div>
            )}
            {application.jobUrl && (
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-muted">
                  Link lowongan
                </dt>
                <dd className="mt-1">
                  <a
                    href={application.jobUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                  >
                    Buka lowongan <ExternalLink size={14} />
                  </a>
                </dd>
              </div>
            )}
          </dl>

          {application.notes && (
            <div className="mt-8 border-t border-slate-200 pt-6 dark:border-slate-700">
              <h2 className="text-xs font-medium uppercase tracking-wide text-muted">
                Catatan
              </h2>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-7">
                {application.notes}
              </p>
            </div>
          )}
        </article>
      </div>
    </main>
  );
}
