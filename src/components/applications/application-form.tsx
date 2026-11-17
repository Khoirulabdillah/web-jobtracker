"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, LoaderCircle, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";
import {
  applicationSchema,
  applicationStatuses,
  statusLabels,
  type ApplicationFormValues,
} from "@/lib/validators";
import {
  createApplication,
  updateApplication,
} from "@/actions/applications";
import { useToast } from "@/components/toast-provider";
import { getTodayJakarta } from "@/lib/datetime";

type ApplicationFormProps = {
  mode: "create" | "edit";
  applicationId?: string;
  defaultValues?: ApplicationFormValues;
};

export function ApplicationForm({
  mode,
  applicationId,
  defaultValues,
}: ApplicationFormProps) {
  const router = useRouter();
  const toast = useToast();
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    reset,
    setError,
    setValue,
    formState: { errors },
  } = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationSchema),
    defaultValues: defaultValues ?? {
      company: "",
      position: "",
      jobUrl: "",
      appliedAt: "",
      reminderAt: "",
      status: "dikirim",
      notes: "",
    },
  });

  useEffect(() => {
    if (!defaultValues) {
      setValue("appliedAt", getTodayJakarta());
    }
  }, [defaultValues, setValue]);

  const onSubmit = (values: ApplicationFormValues) => {
    startTransition(async () => {
      const result =
        mode === "create"
          ? await createApplication(values)
          : await updateApplication(applicationId!, values);

      if (!result.success) {
        Object.entries(result.fieldErrors ?? {}).forEach(([field, message]) => {
          setError(field as keyof ApplicationFormValues, { message });
        });
        toast.error(result.error);
        return;
      }

      toast.success(
        mode === "create"
          ? "Lamaran berhasil ditambahkan."
          : "Lamaran berhasil diperbarui.",
      );
      if (mode === "create") {
        reset({
          company: "",
          position: "",
          jobUrl: "",
          appliedAt: getTodayJakarta(),
          reminderAt: "",
          status: "dikirim",
          notes: "",
        });
      }
      router.push("/lamaran");
      router.refresh();
    });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="rounded-2xl border border-slate-200 bg-surface p-5 shadow-sm dark:border-slate-700 sm:p-8"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Nama perusahaan"
          error={errors.company?.message}
          required
        >
          <input
            {...register("company")}
            placeholder="Contoh: PT Teknologi Indonesia"
            className={inputClass(Boolean(errors.company))}
          />
        </Field>
        <Field label="Posisi yang dilamar" error={errors.position?.message} required>
          <input
            {...register("position")}
            placeholder="Contoh: Frontend Developer"
            className={inputClass(Boolean(errors.position))}
          />
        </Field>
        <Field label="Link lowongan" error={errors.jobUrl?.message}>
          <input
            {...register("jobUrl")}
            type="url"
            placeholder="https://contoh.com/lowongan"
            className={inputClass(Boolean(errors.jobUrl))}
          />
        </Field>
        <Field label="Tanggal melamar" error={errors.appliedAt?.message} required>
          <input
            {...register("appliedAt")}
            type="date"
            className={inputClass(Boolean(errors.appliedAt))}
          />
        </Field>
        <Field
          label="Tanggal & jam pengingat"
          hint="Waktu dicatat dalam WIB."
          error={errors.reminderAt?.message}
        >
          <input
            {...register("reminderAt")}
            type="datetime-local"
            className={inputClass(Boolean(errors.reminderAt))}
          />
        </Field>
        <Field label="Status" error={errors.status?.message} required>
          <select {...register("status")} className={inputClass(Boolean(errors.status))}>
            {applicationStatuses.map((status) => (
              <option key={status} value={status}>
                {statusLabels[status]}
              </option>
            ))}
          </select>
        </Field>
        <Field
          label="Catatan"
          hint="Opsional"
          error={errors.notes?.message}
          className="sm:col-span-2"
        >
          <textarea
            {...register("notes")}
            rows={5}
            placeholder="Tambahkan catatan penting..."
            className={inputClass(Boolean(errors.notes))}
          />
        </Field>
      </div>

      <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link
          href="/lamaran"
          className="motion-safe:active:scale-[0.98] motion-safe:transition-transform inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <ArrowLeft size={17} />
          Batal
        </Link>
        <button
          type="submit"
          disabled={isPending}
          className="motion-safe:active:scale-[0.98] motion-safe:transition-transform inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? (
            <LoaderCircle className="animate-spin" size={17} />
          ) : (
            <Save size={17} />
          )}
          {mode === "create" ? "Simpan lamaran" : "Simpan perubahan"}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  hint,
  error,
  required,
  className = "",
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block text-sm font-medium">
        {label} {required && <span className="text-red-500">*</span>}
        {hint && <span className="ml-1 font-normal text-muted">({hint})</span>}
      </span>
      {children}
      {error && <span className="mt-1.5 block text-xs text-red-500">{error}</span>}
    </label>
  );
}

function inputClass(hasError: boolean) {
  return `w-full rounded-xl border bg-transparent px-4 py-3 text-sm outline-none transition-colors placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/15 dark:border-slate-600 ${
    hasError ? "border-red-500" : "border-slate-200"
  }`;
}