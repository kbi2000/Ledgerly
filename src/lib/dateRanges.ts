import {
  addMonths,
  differenceInCalendarDays,
  endOfMonth,
  endOfQuarter,
  endOfYear,
  format,
  startOfMonth,
  startOfQuarter,
  startOfYear,
  subDays,
  subMonths,
  subYears,
} from "date-fns";

export type DateRangePreset =
  | "all-time"
  | "this-month"
  | "last-month"
  | "this-quarter"
  | "this-fiscal-year"
  | "last-fiscal-year"
  | "this-calendar-year"
  | "last-12-months"
  | "custom";

export interface DateRange {
  preset: DateRangePreset;
  start: string | null; // ISO date, null = unbounded
  end: string | null; // ISO date, null = unbounded
  label: string;
}

export const DATE_RANGE_PRESETS: { key: DateRangePreset; label: string }[] = [
  { key: "all-time", label: "All time" },
  { key: "this-month", label: "This month" },
  { key: "last-month", label: "Last month" },
  { key: "this-quarter", label: "This quarter" },
  { key: "this-fiscal-year", label: "This fiscal year" },
  { key: "last-fiscal-year", label: "Last fiscal year" },
  { key: "this-calendar-year", label: "This calendar year" },
  { key: "last-12-months", label: "Last 12 months" },
];

function iso(d: Date): string {
  return format(d, "yyyy-MM-dd");
}

function fiscalYearStart(reference: Date, fiscalYearStartMonth: number): Date {
  const monthIndex = Math.min(Math.max(fiscalYearStartMonth, 1), 12) - 1;
  const candidate = new Date(reference.getFullYear(), monthIndex, 1);
  if (candidate > reference) candidate.setFullYear(candidate.getFullYear() - 1);
  return candidate;
}

export function getPresetRange(
  preset: DateRangePreset,
  fiscalYearStartMonth: number = 1,
  today: Date = new Date()
): DateRange {
  switch (preset) {
    case "this-month":
      return { preset, start: iso(startOfMonth(today)), end: iso(endOfMonth(today)), label: "This month" };
    case "last-month": {
      const prev = subMonths(today, 1);
      return { preset, start: iso(startOfMonth(prev)), end: iso(endOfMonth(prev)), label: "Last month" };
    }
    case "this-quarter":
      return { preset, start: iso(startOfQuarter(today)), end: iso(endOfQuarter(today)), label: "This quarter" };
    case "this-fiscal-year": {
      const start = fiscalYearStart(today, fiscalYearStartMonth);
      return { preset, start: iso(start), end: iso(subDays(addMonths(start, 12), 1)), label: "This fiscal year" };
    }
    case "last-fiscal-year": {
      const start = subYears(fiscalYearStart(today, fiscalYearStartMonth), 1);
      return { preset, start: iso(start), end: iso(subDays(addMonths(start, 12), 1)), label: "Last fiscal year" };
    }
    case "this-calendar-year":
      return { preset, start: iso(startOfYear(today)), end: iso(endOfYear(today)), label: "This calendar year" };
    case "last-12-months":
      return { preset, start: iso(subMonths(today, 12)), end: iso(today), label: "Last 12 months" };
    case "all-time":
    default:
      return { preset: "all-time", start: null, end: null, label: "All time" };
  }
}

/** The immediately preceding period of equal length, for period-over-period comparison. */
export function getComparisonRange(range: DateRange): DateRange | null {
  if (!range.start || !range.end) return null;
  const start = new Date(range.start);
  const end = new Date(range.end);
  const lengthDays = differenceInCalendarDays(end, start) + 1;
  const compEnd = subDays(start, 1);
  const compStart = subDays(compEnd, lengthDays - 1);
  return { preset: "custom", start: iso(compStart), end: iso(compEnd), label: "Previous period" };
}

export function inRange(dateIso: string, range: DateRange): boolean {
  if (range.start && dateIso < range.start) return false;
  if (range.end && dateIso > range.end) return false;
  return true;
}
