const TIME_ZONE = "Asia/Jakarta";

function getParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const get = (type: string) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
    hour: get("hour"),
    minute: get("minute"),
  };
}

/** Tanggal hari ini di WIB, format "YYYY-MM-DD". */
export function getTodayJakarta() {
  const { year, month, day } = getParts(new Date());
  return `${year}-${month}-${day}`;
}

/** Nilai untuk <input type="datetime-local">, format "YYYY-MM-DDTHH:mm" (WIB). */
export function toJakartaInputValue(date: Date | null | undefined) {
  if (!date) return "";
  const { year, month, day, hour, minute } = getParts(date);
  return `${year}-${month}-${day}T${hour}:${minute}`;
}

/** Tampilan untuk pengguna, contoh: "Sabtu, 14 November 2026, 09.00 WIB". */
export function formatJakarta(date: Date | null | undefined) {
  if (!date) return "";
  const text = new Intl.DateTimeFormat("id-ID", {
    timeZone: TIME_ZONE,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(date);
  return `${text} WIB`;
}