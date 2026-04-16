import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDistanceToNow, differenceInDays } from "date-fns";
import { es } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number | string): string {
  return Number(value).toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  });
}

export function daysBetween(date: string | Date): number {
  return differenceInDays(new Date(), new Date(date));
}

export function timeAgo(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: es });
}

export function whatsappLink(phone: string, message: string): string {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export function trackingWhatsappMessage(
  firstName: string,
  brand: string,
  model: string,
  trackingCode: string,
  appUrl: string
): string {
  return `Hola ${firstName}, podés seguir el estado de tu ${brand} ${model} en tiempo real desde este link: ${appUrl}/tracking/${trackingCode}`;
}

export const STATUS_LABELS: Record<string, string> = {
  new: "Nuevo",
  progress: "En proceso",
  delayed: "Demorado",
  completed: "Completado",
  incomplete: "Incompleto",
  retired: "Retirado",
};

export const STATUS_COLORS: Record<string, { color: string; bg: string }> = {
  new: { color: "var(--green)", bg: "var(--green-soft)" },
  progress: { color: "var(--yellow)", bg: "var(--yellow-soft)" },
  delayed: { color: "var(--red)", bg: "var(--red-soft)" },
  completed: { color: "var(--accent)", bg: "var(--accent-soft)" },
  incomplete: { color: "var(--orange)", bg: "var(--orange-soft)" },
  retired: { color: "var(--text-muted)", bg: "var(--surface-alt)" },
};
