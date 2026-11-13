import { CountUpNumber } from "./count-up";

export function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: string;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-surface p-5 shadow-sm dark:border-slate-700">
      <div className={`mb-4 size-2 rounded-full ${accent}`} />
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 text-3xl font-semibold tracking-tight">
        <CountUpNumber value={value} />
      </p>
    </section>
  );
}
