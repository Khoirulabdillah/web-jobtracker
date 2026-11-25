import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { Application } from "@/db/schema";
import { formatDate, statusLabels, statusStyles } from "@/lib/validators";
import { formatApplicationNumber } from "@/lib/utils";

export function RecentApplications({
  applications,
}: {
  applications: Application[];
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-surface p-5 dark:border-slate-700">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-semibold">Lamaran terbaru</h2>
        <Link href="/lamaran" className="text-sm font-semibold text-primary hover:underline">
          Lihat semua
        </Link>
      </div>
      <div className="mt-4 divide-y divide-slate-200 dark:divide-slate-700">
        {applications.map((application) => (
          <Link
            key={application.id}
            href={`/lamaran/${application.id}`}
            className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
          >
            <div className="min-w-0">
              <div className="flex min-w-0 items-center gap-2">
                <span className="shrink-0 font-mono text-xs font-semibold text-muted">
                  {formatApplicationNumber(application.applicationNumber)}
                </span>
                <p className="truncate text-sm font-semibold">{application.position}</p>
              </div>
              <p className="mt-1 truncate text-xs text-muted">
                {application.company} · {formatDate(application.appliedAt)}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span
                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusStyles[application.status]}`}
              >
                {statusLabels[application.status]}
              </span>
              <ArrowRight className="text-muted" size={15} />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
