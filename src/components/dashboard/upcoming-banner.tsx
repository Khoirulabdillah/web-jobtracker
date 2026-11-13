import { CalendarClock, ChevronRight } from "lucide-react";
import Link from "next/link";
import type { Application } from "@/db/schema";
import { formatReminder, statusLabels } from "@/lib/validators";

export function UpcomingBanner({
  application,
}: {
  application: Application | null;
}) {
  if (!application) {
    return (
      <section className="rounded-2xl border border-dashed border-slate-300 p-5 dark:border-slate-700">
        <div className="flex items-center gap-3">
          <CalendarClock className="text-muted" size={22} />
          <div>
            <h2 className="font-semibold">Jadwal terdekat</h2>
            <p className="mt-1 text-sm text-muted">
              Belum ada jadwal psikotes atau wawancara yang akan datang.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl bg-primary p-5 text-white shadow-lg shadow-blue-600/15">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-start gap-3">
          <CalendarClock className="mt-0.5 shrink-0" size={22} />
          <div>
            <p className="text-sm font-medium text-blue-100">Jadwal terdekat</p>
            <h2 className="mt-1 font-semibold">
              {statusLabels[application.status]} · {application.position}
            </h2>
            <p className="mt-1 text-sm text-blue-100">
              {application.company} · {formatReminder(application.reminderAt!)}
            </p>
          </div>
        </div>
        <Link
          href={`/lamaran/${application.id}`}
          className="inline-flex items-center gap-1 self-start text-sm font-semibold hover:underline sm:self-auto"
        >
          Lihat detail <ChevronRight size={16} />
        </Link>
      </div>
    </section>
  );
}
