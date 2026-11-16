"use client";

import { LoaderCircle, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useTransition } from "react";
import { deleteApplication } from "@/actions/applications";
import { useToast } from "@/components/toast-provider";

export function DeleteButton({ id }: { id: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const router = useRouter();
  const toast = useToast();
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteApplication(id);
      if (!result.success) {
        toast.error(result.error);
        return;
      }

      dialogRef.current?.close();
      toast.success("Lamaran berhasil dihapus.");
      router.push("/lamaran");
      router.refresh();
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        className="motion-safe:active:scale-[0.98] motion-safe:transition-transform inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 dark:border-red-900/70 dark:text-red-400 dark:hover:bg-red-950/40"
      >
        <Trash2 size={16} />
        Hapus
      </button>
      <dialog
        ref={dialogRef}
        className="fixed left-1/2 top-1/2 m-0 w-[min(28rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-200 bg-surface p-0 text-foreground shadow-2xl backdrop:bg-slate-950/50 dark:border-slate-700"
      >
        <div className="p-6">
          <h2 className="text-lg font-semibold">Hapus lamaran?</h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            Data lamaran ini akan dihapus permanen dan tidak dapat dipulihkan.
          </p>
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              className="motion-safe:active:scale-[0.98] motion-safe:transition-transform rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold dark:border-slate-700"
            >
              Batal
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={handleDelete}
              className="motion-safe:active:scale-[0.98] motion-safe:transition-transform inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
            >
              {isPending && <LoaderCircle className="animate-spin" size={16} />}
              Hapus permanen
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
