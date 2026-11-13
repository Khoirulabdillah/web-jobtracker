import type { Application } from "@/db/schema";
import { statusLabels } from "@/lib/validators";

const GOOGLE_CALENDAR_URL =
  "https://calendar.google.com/calendar/render?action=TEMPLATE";
const EVENT_DURATION_MS = 60 * 60 * 1000;

function formatUtcDate(value: Date) {
  return value.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

function escapeIcsText(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;")
    .replace(/\r?\n/g, "\\n");
}

function eventSummary(application: Application) {
  return `${statusLabels[application.status]}: ${application.position} - ${application.company}`;
}

export function googleCalendarUrl(application: Application) {
  if (!application.reminderAt) {
    throw new Error("Lamaran tidak memiliki tanggal pengingat.");
  }

  const start = application.reminderAt;
  const end = new Date(start.getTime() + EVENT_DURATION_MS);
  const description = application.jobUrl
    ? `Link lowongan: ${application.jobUrl}`
    : "";
  const params = new URLSearchParams({
    text: eventSummary(application),
    dates: `${formatUtcDate(start)}/${formatUtcDate(end)}`,
    details: description,
  });

  return `${GOOGLE_CALENDAR_URL}&${params.toString()}`;
}

export function calendarIcs(application: Application) {
  if (!application.reminderAt) {
    throw new Error("Lamaran tidak memiliki tanggal pengingat.");
  }

  const start = application.reminderAt;
  const end = new Date(start.getTime() + EVENT_DURATION_MS);
  const summary = escapeIcsText(eventSummary(application));
  const description = escapeIcsText(
    application.jobUrl ? `Link lowongan: ${application.jobUrl}` : "",
  );
  const timestamp = formatUtcDate(new Date());
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Job Tracker//ID",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${application.id}@job-tracker`,
    `DTSTAMP:${timestamp}`,
    `DTSTART:${formatUtcDate(start)}`,
    `DTEND:${formatUtcDate(end)}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    "BEGIN:VALARM",
    "ACTION:DISPLAY",
    "DESCRIPTION:Pengingat jadwal lamaran",
    "TRIGGER:-PT1H",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  return `${lines.join("\r\n")}\r\n`;
}
