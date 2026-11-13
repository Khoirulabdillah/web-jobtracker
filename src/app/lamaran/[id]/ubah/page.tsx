import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ApplicationForm } from "@/components/applications/application-form";
import { DatabaseNotice } from "@/components/database-notice";
import { getApplicationById } from "@/actions/applications";
import { isDatabaseConfigured } from "@/db";
import { formatDateTimeLocal } from "@/lib/validators";

export default async function EditApplicationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!isDatabaseConfigured()) {
    return (
      <main className="min-h-screen px-5 pb-32 pt-8 md:px-8 md:pb-12 md:pt-28">
        <div className="mx-auto w-full max-w-3xl">
          <DatabaseNotice />
        </div>
      </main>
    );
  }

  const { id } = await params;
  const application = await getApplicationById(id);
  if (!application) notFound();

  return (
    <main className="min-h-screen px-5 pb-32 pt-8 md:px-8 md:pb-12 md:pt-28">
      <div className="mx-auto w-full max-w-3xl">
        <Link
          href={`/lamaran/${application.id}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-foreground"
        >
          <ArrowLeft size={16} />
          Kembali ke detail
        </Link>
        <div className="mb-8 mt-6">
          <p className="text-sm font-semibold text-primary">Perbarui lamaran</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            Ubah lamaran
          </h1>
        </div>
        <ApplicationForm
          mode="edit"
          applicationId={application.id}
          defaultValues={{
            company: application.company,
            position: application.position,
            jobUrl: application.jobUrl ?? "",
            appliedAt: application.appliedAt,
            reminderAt: formatDateTimeLocal(application.reminderAt),
            status: application.status,
            notes: application.notes ?? "",
          }}
        />
      </div>
    </main>
  );
}
