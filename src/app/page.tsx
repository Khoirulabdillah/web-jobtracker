import { ArrowRight, BriefcaseBusiness, Sparkles } from "lucide-react";
import Link from "next/link";

export default function Home() {
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

        <section className="grid gap-4 sm:grid-cols-3">
          {[
            ["Total lamaran", "0"],
            ["Dalam proses", "0"],
            ["Diterima", "0"],
          ].map(([label, value]) => (
            <div
              key={label}
              className="rounded-2xl border border-slate-200 bg-surface p-5 dark:border-slate-700"
            >
              <p className="text-sm text-muted">{label}</p>
              <p className="mt-2 text-3xl font-semibold">{value}</p>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
