import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat("es-CL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function formatDateInput(date: Date | string) {
  return new Date(date).toISOString().split("T")[0] ?? "";
}

export function formatRelativeDate(date: Date | string) {
  const value = new Date(date);
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const targetStart = new Date(
    value.getFullYear(),
    value.getMonth(),
    value.getDate(),
  );
  const diff = Math.round(
    (targetStart.getTime() - todayStart.getTime()) / (24 * 60 * 60 * 1000),
  );

  if (diff === 0) {
    return "Hoy";
  }

  if (diff === -1) {
    return "Ayer";
  }

  return formatDate(value);
}

export function absoluteUrl(path: string) {
  const base =
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.APP_URL ??
    "http://localhost:3000";

  return new URL(path, base).toString();
}

export function parseBulkItems(text: string): { text: string; note: string }[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => ({ text: line, note: "" }));
}

export function convertReportToChecklistItems(
  checklistItems: { text: string; note?: string | null }[]
): { text: string; note: string }[] {
  return checklistItems.map((item) => ({
    text: item.text.trim(),
    note: (item.note || "").trim(),
  }));
}
