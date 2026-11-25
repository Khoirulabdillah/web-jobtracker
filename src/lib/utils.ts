export function formatApplicationNumber(applicationNumber: number) {
  return `#${String(applicationNumber).padStart(4, "0")}`;
}
