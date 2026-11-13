import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ApplicationForm } from "@/components/applications/application-form";

export default function NewApplicationPage() {
  return (
    <main className="min-h-screen px-5 pb-32 pt-8 md:px-8 md:pb-12 md:pt-28">
      <div className="mx-auto w-full max-w-3xl">
        <Link
          href="/lamaran"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-foreground"
        >
          <ArrowLeft size={16} />
          Kembali ke lamaran
        </Link>
        <div className="mb-8 mt-6">
          <p className="text-sm font-semibold text-primary">Lamaran baru</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            Tambah lamaran
          </h1>
          <p className="mt-2 text-sm text-muted">
            Catat detail lowongan dan jadwal pentingnya.
          </p>
        </div>
        <ApplicationForm mode="create" />
      </div>
    </main>
  );
}
