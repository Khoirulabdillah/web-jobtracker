import { Database } from "lucide-react";

export function DatabaseNotice() {
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
      <div className="flex items-start gap-3">
        <Database className="mt-0.5 shrink-0" size={20} />
        <div>
          <h2 className="font-semibold">Database belum dikonfigurasi</h2>
          <p className="mt-1 text-sm leading-6">
            Isi <code>DATABASE_URL</code> di environment lokal untuk melihat
            dan menyimpan data lamaran.
          </p>
        </div>
      </div>
    </div>
  );
}
