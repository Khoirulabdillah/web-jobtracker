import { z } from "zod";

export const applicationStatuses = [
  "dikirim",
  "psikotes",
  "wawancara",
  "diterima",
  "ditolak",
] as const;

export const statusLabels: Record<(typeof applicationStatuses)[number], string> =
  {
    dikirim: "Dikirim",
    psikotes: "Psikotes",
    wawancara: "Wawancara",
    diterima: "Diterima",
    ditolak: "Ditolak",
  };

export const statusStyles: Record<
  (typeof applicationStatuses)[number],
  string
> = {
  dikirim: "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300",
  psikotes:
    "bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300",
  wawancara:
    "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300",
  diterima:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
  ditolak: "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300",
};

const localDateTimePattern =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2})?$/;

export const applicationSchema = z.object({
  company: z.string().trim().min(1, "Nama perusahaan wajib diisi."),
  position: z.string().trim().min(1, "Posisi yang dilamar wajib diisi."),
  jobUrl: z
    .string()
    .trim()
    .refine((value) => value === "" || z.string().url().safeParse(value).success, {
      message: "Link lowongan harus berupa URL yang valid.",
    }),
  appliedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggal melamar wajib diisi."),
  reminderAt: z
    .string()
    .refine(
      (value) => value === "" || localDateTimePattern.test(value),
      "Format pengingat tidak valid.",
    ),
  status: z.enum(applicationStatuses),
  notes: z.string().trim(),
});

export type ApplicationFormValues = z.infer<typeof applicationSchema>;

export function formatDateTimeLocal(value: Date | null) {
  if (!value) return "";

  const parts = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(value);
  const values = Object.fromEntries(
    parts.map(({ type, value: partValue }) => [type, partValue]),
  );

  return `${values.year}-${values.month}-${values.day}T${values.hour}:${values.minute}`;
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "long",
    timeZone: "Asia/Jakarta",
  }).format(new Date(`${value}T00:00:00+07:00`));
}

export function formatReminder(value: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Asia/Jakarta",
  }).format(value);
}
