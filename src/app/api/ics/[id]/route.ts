import { z } from "zod";
import { getApplicationById } from "@/actions/applications";
import { calendarIcs } from "@/lib/calendar";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) {
    return new Response("Not Found", { status: 404 });
  }

  try {
    const application = await getApplicationById(id);
    if (!application?.reminderAt) {
      return new Response("Not Found", { status: 404 });
    }

    return new Response(calendarIcs(application), {
      headers: {
        "Content-Disposition": `attachment; filename="lamaran-${id}.ics"`,
        "Content-Type": "text/calendar; charset=utf-8",
      },
    });
  } catch (error) {
    console.error("Gagal membuat file kalender:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
