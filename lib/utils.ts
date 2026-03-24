import { clsx, type ClassValue } from "clsx";

import { followerBandLabels } from "@/lib/constants";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function optionalString(value: FormDataEntryValue | string | null | undefined) {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function optionalNumber(value: FormDataEntryValue | string | null | undefined) {
  const stringValue = optionalString(value);
  if (!stringValue) {
    return undefined;
  }

  const parsed = Number(stringValue);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function splitCommaList(value: FormDataEntryValue | string | null | undefined) {
  const stringValue = optionalString(value);
  if (!stringValue) {
    return [];
  }

  return stringValue
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export function titleCase(value: string) {
  return value
    .toLowerCase()
    .split(" ")
    .map((entry) => entry.charAt(0).toUpperCase() + entry.slice(1))
    .join(" ");
}

export function followerBandFromCount(followerCount?: number | null) {
  if (followerCount == null) {
    return undefined;
  }

  if (followerCount < 10_000) {
    return "NANO" as const;
  }

  if (followerCount < 50_000) {
    return "MICRO" as const;
  }

  if (followerCount < 150_000) {
    return "RISING" as const;
  }

  if (followerCount < 500_000) {
    return "ESTABLISHED" as const;
  }

  return "LARGE" as const;
}

export function followerBandSummary(followerBand?: keyof typeof followerBandLabels | null, followerCount?: number | null) {
  if (followerCount != null) {
    return `${formatCompactNumber(followerCount)} followers`;
  }

  if (!followerBand) {
    return "Follower size unknown";
  }

  return `${followerBandLabels[followerBand]} creator`;
}

export function formatCompactNumber(value: number) {
  return new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function normalizeKeywordSource(...values: Array<string | null | undefined>) {
  return values
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ");
}

const stopWords = new Set([
  "and",
  "for",
  "with",
  "the",
  "that",
  "this",
  "from",
  "your",
  "their",
  "about",
  "into",
  "across",
  "around",
  "help",
  "helps",
  "brand",
  "brands",
  "creator",
  "creators",
  "content",
  "audience",
  "people",
  "community",
]);

export function tokenize(value: string) {
  return new Set(
    value
      .split(/\s+/)
      .map((entry) => entry.trim())
      .filter((entry) => entry.length > 2 && !stopWords.has(entry)),
  );
}

export function keywordOverlap(a: Set<string>, b: Set<string>) {
  let overlap = 0;

  for (const entry of a) {
    if (b.has(entry)) {
      overlap += 1;
    }
  }

  return overlap;
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function toDateValue(value: FormDataEntryValue | string | null | undefined) {
  const stringValue = optionalString(value);
  return stringValue ? new Date(`${stringValue}T09:00:00.000Z`) : undefined;
}

export function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}

export function safeRedirectPath(value: string | undefined, fallback = "/") {
  if (!value) {
    return fallback;
  }

  if (!value.startsWith("/") || value.startsWith("//")) {
    return fallback;
  }

  return value;
}
