import { useEffect, useMemo, useState } from "react";

/**
 * 🕓 Convert a number, string, or Date into a readable "time ago" format.
 * Handles:
 *  - UNIX timestamp (number)
 *  - ISO string (string)
 *  - Date object
 * Returns human-readable relative time like "2h ago"
 */
export function timeAgo(dateInput: string | number | Date | null | undefined): string {
  if (!dateInput) return "just now";

  // ✅ Safely normalize to Date
  let past: Date;
  try {
    if (typeof dateInput === "number") {
      past = new Date(dateInput);
    } else if (dateInput instanceof Date) {
      past = dateInput;
    } else {
      past = new Date(dateInput);
    }
  } catch {
    return "just now";
  }

  if (isNaN(past.getTime())) return "just now";

  const now = new Date();
  const seconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (seconds <= 0) return "just now";
  if (seconds < 60) return `${seconds}s ago`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;

  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;

  const years = Math.floor(days / 365);
  return `${years}y ago`;
}

/**
 * ⏱️ React Hook: Automatically updates "time ago" text.
 *
 * @param dateInput - number | string | Date
 * @param refreshRate - interval in ms (default: 10 seconds)
 */
export function useTimeAgo(dateInput?: string | number | Date | null, refreshRate = 10000) {
  // Convert the input to a date ONCE when input changes
  const normalizedDate = useMemo(() => {
    if (!dateInput) return null;

    if (typeof dateInput === "number") return new Date(dateInput);
    if (dateInput instanceof Date) return dateInput;
    return new Date(dateInput);
  }, [dateInput]);

  const getDisplay = () =>
    normalizedDate ? timeAgo(normalizedDate) : "just now";

  const [display, setDisplay] = useState<string>(getDisplay);

  useEffect(() => {
    setDisplay(getDisplay());

    const interval = setInterval(() => {
      setDisplay(getDisplay());
    }, refreshRate);

    return () => clearInterval(interval);
  }, [normalizedDate, refreshRate]); // fixed, stable deps

  return display;
}
