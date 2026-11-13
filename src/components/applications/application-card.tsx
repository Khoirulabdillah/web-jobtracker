import {
  ArrowRight,
  CalendarClock,
  CalendarDays,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import type { Application } from "@/db/schema";
import {
  formatDate,
  formatReminder,
  statusLabels,
  statusStyles,
} from "@/lib/validators";

export function ApplicationCard({ application }: { application: Application }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-surface p-5 shadow-sm transition-shadow hover:shadow-md dark:border-slate-700">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-semibold">{application.position}</h2>
          <p className="mt-1 text-sm text-muted">{application.company}</p>
        </div>
        <span
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[application.status]}`}
        >
          {statusLabels[application.status]}
        </span>
      </div>
      <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted">
        <span>Dilamar {formatDate(application.appliedAt)}</span>
        {application.reminderAt && (
          <>
            <span className="inline-flex items-center gap-1">
              <CalendarClock size={14} />
              {formatReminder(application.reminderAt)}
            </span>
            <a
              href={`/api/ics/${application.id}`}
              download
              aria-label="Unduh pengingat kalender"
              title="Unduh pengingat kalender"
              className="inline-flex items-center rounded-md p-1 text-primary transition-colors hover:bg-primary-muted"
            >
              <CalendarDays size={16} />
            </a>
          </>
        )}
        {application.jobUrl && (
          <a
            href={application.jobUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-primary hover:underline"
          >
            Lowongan <ExternalLink size={13} />
          </a>
        )}
      </div>
      <Link
        href={`/lamaran/${application.id}`}
        className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary-hover"
      >
        Lihat detail <ArrowRight size={16} />
      </Link>
    </article>
  );
}
