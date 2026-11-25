"use server";

import {
  and,
  count,
  desc,
  eq,
  gt,
  gte,
  ilike,
  inArray,
  or,
  sql,
} from "drizzle-orm";
import { format, startOfMonth, subMonths } from "date-fns";
import { revalidatePath } from "next/cache";
import {
  applicationSchema,
  type ApplicationFormValues,
  type ApplicationStatus,
} from "@/lib/validators";
import { getDb } from "@/db";
import { applications } from "@/db/schema";

type ActionResult =
  | { success: true }
  | { success: false; error: string; fieldErrors?: Record<string, string> };

function parseReminderAt(value: string) {
  if (!value) return null;

  // datetime-local normalnya "YYYY-MM-DDTHH:mm"; tambahkan detik hanya jika belum ada
  const normalized = value.length === 16 ? `${value}:00` : value.slice(0, 19);
  const parsed = new Date(`${normalized}+07:00`);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error("Tanggal pengingat tidak valid.");
  }

  return parsed;
}

function toDatabaseValues(values: ApplicationFormValues) {
  return {
    company: values.company,
    position: values.position,
    jobUrl: values.jobUrl || null,
    appliedAt: values.appliedAt,
    reminderAt: parseReminderAt(values.reminderAt),
    status: values.status,
    notes: values.notes || null,
  };
}

function validationError(error: {
  flatten: () => { fieldErrors: Record<string, string[]> };
}): ActionResult {
  const fieldErrors = Object.fromEntries(
    Object.entries(error.flatten().fieldErrors).flatMap(([field, messages]) =>
      messages[0] ? [[field, messages[0]]] : [],
    ),
  );

  return {
    success: false,
    error: "Periksa kembali data yang diisi.",
    fieldErrors,
  };
}

export async function createApplication(
  input: ApplicationFormValues,
): Promise<ActionResult> {
  const parsed = applicationSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);

  try {
    await getDb().insert(applications).values(toDatabaseValues(parsed.data));
    revalidatePath("/lamaran");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Gagal menambahkan lamaran:", error);
    return {
      success: false,
      error: "Lamaran gagal disimpan. Periksa koneksi database dan coba lagi.",
    };
  }
}

export async function updateApplication(
  id: string,
  input: ApplicationFormValues,
): Promise<ActionResult> {
  const parsed = applicationSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);

  try {
    await getDb()
      .update(applications)
      .set({ ...toDatabaseValues(parsed.data), updatedAt: new Date() })
      .where(eq(applications.id, id));
    revalidatePath("/lamaran");
    revalidatePath(`/lamaran/${id}`);
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Gagal mengubah lamaran:", error);
    return {
      success: false,
      error: "Lamaran gagal diubah. Periksa koneksi database dan coba lagi.",
    };
  }
}

export async function deleteApplication(id: string): Promise<ActionResult> {
  try {
    await getDb().delete(applications).where(eq(applications.id, id));
    revalidatePath("/lamaran");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Gagal menghapus lamaran:", error);
    return {
      success: false,
      error: "Lamaran gagal dihapus. Periksa koneksi database dan coba lagi.",
    };
  }
}

function escapeLike(value: string) {
  return value.replace(/[\\%_]/g, "\\$&");
}

function buildApplicationConditions({
  status,
  query,
}: {
  status?: ApplicationStatus;
  query?: string;
}) {
  const conditions = [];

  if (status) {
    conditions.push(eq(applications.status, status));
  }

  const normalizedQuery = query?.trim();
  if (normalizedQuery) {
    const searchPattern = `%${escapeLike(normalizedQuery)}%`;
    const numericQuery = normalizedQuery.replace(/^#+/, "");
    const applicationNumber =
      /^\d+$/.test(numericQuery) &&
      Number.isSafeInteger(Number(numericQuery)) &&
      Number(numericQuery) <= 2147483647
        ? Number(numericQuery)
        : null;
    const textAndOptionalNumberConditions = [
      ilike(applications.company, searchPattern),
      ilike(applications.position, searchPattern),
    ];
    if (applicationNumber !== null) {
      textAndOptionalNumberConditions.push(
        eq(applications.applicationNumber, applicationNumber),
      );
    }
    conditions.push(
      or(...textAndOptionalNumberConditions),
    );
  }

  return conditions.length ? and(...conditions) : undefined;
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function getApplications({
  status,
  query,
}: {
  status?: ApplicationStatus;
  query?: string;
} = {}) {
  const where = buildApplicationConditions({ status, query });
  return getDb()
    .select()
    .from(applications)
    .where(where)
    .orderBy(desc(applications.appliedAt), desc(applications.createdAt));
}

export async function getApplicationsPage({
  status,
  query,
  page = 1,
  pageSize = 10,
}: {
  status?: ApplicationStatus;
  query?: string;
  page?: number;
  pageSize?: number;
} = {}) {
  const where = buildApplicationConditions({ status, query });
  const safePageSize =
    Number.isSafeInteger(pageSize) && pageSize > 0 ? pageSize : 10;
  const countRows = await getDb()
    .select({ count: count() })
    .from(applications)
    .where(where);
  const total = Number(countRows[0]?.count ?? 0);
  const totalPages = Math.max(1, Math.ceil(total / safePageSize));
  const safePage = Number.isSafeInteger(page) && page > 0 ? page : 1;
  const currentPage = Math.min(safePage, totalPages);
  const rows = await getDb()
    .select()
    .from(applications)
    .where(where)
    .orderBy(desc(applications.appliedAt), desc(applications.createdAt))
    .limit(safePageSize)
    .offset((currentPage - 1) * safePageSize);

  return {
    applications: rows,
    total,
    page: currentPage,
    totalPages,
  };
}

export async function getApplicationById(id: string) {
  if (!UUID_PATTERN.test(id)) return undefined;

  const rows = await getDb()
    .select()
    .from(applications)
    .where(eq(applications.id, id))
    .limit(1);
  return rows[0];
}

export async function getDashboardData() {
  const db = getDb();
  const monthStart = format(
    startOfMonth(subMonths(new Date(), 11)),
    "yyyy-MM-dd",
  );
  const monthExpression = sql<string>`to_char(date_trunc('month', ${applications.appliedAt}), 'YYYY-MM')`;

  const [totalRows, statusRows, monthlyRows, recentApplications, upcomingRows] =
    await Promise.all([
      db.select({ count: count() }).from(applications),
      db
        .select({ status: applications.status, count: count() })
        .from(applications)
        .groupBy(applications.status),
      db
        .select({ month: monthExpression, count: count() })
        .from(applications)
        .where(gte(applications.appliedAt, monthStart))
        .groupBy(monthExpression)
        .orderBy(monthExpression),
      db
        .select()
        .from(applications)
        .orderBy(desc(applications.appliedAt), desc(applications.createdAt))
        .limit(5),
      db
        .select()
        .from(applications)
        .where(
          and(
            gt(applications.reminderAt, new Date()),
            inArray(applications.status, ["psikotes", "wawancara"]),
          ),
        )
        .orderBy(applications.reminderAt)
        .limit(1),
    ]);

  return {
    total: Number(totalRows[0]?.count ?? 0),
    statuses: statusRows.map((row) => ({
      status: row.status,
      count: Number(row.count),
    })),
    monthly: monthlyRows.map((row) => ({
      month: row.month,
      count: Number(row.count),
    })),
    recentApplications,
    upcoming: upcomingRows[0] ?? null,
  };
}
