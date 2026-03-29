import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatRelativeTime(date: string | Date) {
  const now = new Date();
  const then = new Date(date);
  const diff = now.getTime() - then.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return formatDate(date);
}

export function getStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case "pending": return "badge-pending";
    case "in_progress": 
    case "in-progress": return "badge-in-progress";
    case "resolved": return "badge-resolved";
    case "critical": return "badge-critical";
    default: return "badge-pending";
  }
}

export function getStatusLabel(status: string) {
  switch (status.toLowerCase()) {
    case "pending": return "Pending";
    case "in_progress": return "In Progress";
    case "resolved": return "Resolved";
    case "critical": return "Critical";
    default: return status;
  }
}
