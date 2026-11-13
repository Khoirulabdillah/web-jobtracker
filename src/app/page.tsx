import { ArrowRight, BriefcaseBusiness, Plus, Sparkles } from "lucide-react";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { format, startOfMonth, subMonths } from "date-fns";
import { getDashboardData } from "@/actions/applications";
import { DatabaseNotice } from "@/components/database-notice";
import { DashboardCharts } from "@/components/dashboard/dashboard-charts";
import { RecentApplications } from "@/components/dashboard/recent-applications";
import { StatCard } from "@/components/dashboard/stat-card";
import { UpcomingBanner } from "@/components/dashboard/upcoming-banner";
import { isDatabaseConfigured } from "@/db";
import { applicationStatuses, statusLabels } from "@/lib/validators";

export default async function Home() {
  return (
    <main className="min-h-screen px-5 pb-32 pt-8 md:px-8 md:pb-12 md:pt-28">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <section className="relative overflow-hidden rounded-3xl bg-navy px-6 py-10 text-white shadow-xl shadow-blue-950/10 sm:px-10 sm:py-14">
          <div className="relative z-10 max-w-2xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-sm text-blue-100">
              <Sparkles size={16} aria-hidden="true" />
              Ruang kerja kariermu
            </div>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-5xl">
              Pantau setiap langkah menuju pekerjaan impian.
            </h1>
            <p className="mt-4 max-w-xl leading-7 text-slate-300">
              Catat lamaran, kelola status, dan jangan lewatkan jadwal penting
              dalam satu tempat yang sederhana.
            </p>
            <Link
              href="/lamaran/baru"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 font-semibold transition-colors hover:bg-primary-hover"
            >
              Tambah lamaran
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>
          <BriefcaseBusiness
            aria-hidden="true"
            className="absolute -bottom-12 -right-8 size-56 rotate-12 text-white/5 sm:size-72"
            strokeWidth={1}
          />
        </section>

        <Suspense fallback={<DashboardLoading />}>
          <DashboardData />
        </Suspense>
      </div>
    </main>
  );
}

async function DashboardData() {
  await connection();
  const data = isDatabaseConfigured() ? await getDashboardData() : null;

  if (data === null) return <DatabaseNotice />;
  if (data.total === 0) return <EmptyDashboard />;
  return <DashboardContent data={data} />;
}

function DashboardLoading() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-surface p-8 text-sm text-muted dark:border-slate-700">
      Memuat ringkasan lamaran...
    </div>
  );
}

function DashboardContent({
  data,
}: {
  data: NonNullable<Awaited<ReturnType<typeof getDashboardData>>>;
}) {
  const counts = Object.fromEntries(
    data.statuses.map(({ status, count }) => [status, count]),
  ) as Partial<Record<(typeof applicationStatuses)[number], number>>;
  const monthly = Array.from({ length: 12 }, (_, index) => {
    const month = format(
      startOfMonth(subMonths(new Date(), 11 - index)),
      "yyyy-MM",
    );
    return {
      month,
      count: data.monthly.find((item) => item.month === month)?.count ?? 0,
    };
  });

  return (
    <>
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Total lamaran" value={data.total} accent="bg-primary" />
        {applicationStatuses.map((status) => (
          <StatCard
            key={status}
            label={statusLabels[status]}
            value={counts[status] ?? 0}
            accent={statusAccent[status]}
          />
        ))}
      </section>
      <DashboardCharts
        statuses={applicationStatuses.map((status) => ({
          status,
          count: counts[status] ?? 0,
        }))}
        monthly={monthly}
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <RecentApplications applications={data.recentApplications} />
        <UpcomingBanner application={data.upcoming} />
      </div>
    </>
  );
}

function EmptyDashboard() {
  return (
    <section className="rounded-2xl border border-dashed border-slate-300 bg-surface p-8 text-center dark:border-slate-700 sm:p-12">
      <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary-muted text-primary">
        <BriefcaseBusiness size={26} />
      </div>
      <h2 className="mt-5 text-xl font-semibold">Belum ada data lamaran</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
        Tambahkan lamaran pertamamu untuk mulai melihat statistik, jadwal, dan
        perkembangan proses rekrutmen di sini.
      </p>
      <Link
        href="/lamaran/baru"
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-primary-hover"
      >
        <Plus size={17} />
        Tambah lamaran pertama
      </Link>
    </section>
  );
}

const statusAccent: Record<(typeof applicationStatuses)[number], string> = {
  dikirim: "bg-blue-500",
  psikotes: "bg-violet-500",
  wawancara: "bg-amber-500",
  diterima: "bg-emerald-500",
  ditolak: "bg-red-500",
};
