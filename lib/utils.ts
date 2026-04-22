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

// ── Phone normalization ───────────────────────────────────────────────────────
// Scalable: add more countries to PHONE_CONFIGS as needed.
// Future: read DEFAULT_COUNTRY from tenant settings.

type CountryCode = "AR";

interface CountryPhoneConfig {
  countryCode: string;   // e.g. "54"
  mobilePrefix: string;  // e.g. "9"  (required by WA for AR mobile)
  localLength: number;   // digits in local number, excluding 0 prefix
}

const PHONE_CONFIGS: Record<CountryCode, CountryPhoneConfig> = {
  AR: { countryCode: "54", mobilePrefix: "9", localLength: 10 },
};

const DEFAULT_COUNTRY: CountryCode = "AR";

/**
 * Converts any phone input to a clean international digit string
 * suitable for both the backend (digits only) and wa.me links.
 * Examples for AR:
 *   "3424639480"          → "5493424639480"
 *   "03424639480"         → "5493424639480"
 *   "543424639480"        → "5493424639480"
 *   "5493424639480"       → "5493424639480"
 *   "+54 9 342 463-9480"  → "5493424639480"
 */
export function sanitizePhone(phone: string, country: CountryCode = DEFAULT_COUNTRY): string {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return "";
  const { countryCode, mobilePrefix, localLength } = PHONE_CONFIGS[country];
  const fullLength = countryCode.length + mobilePrefix.length + localLength;

  // Already full international with mobile prefix
  if (digits.length === fullLength && digits.startsWith(countryCode + mobilePrefix)) return digits;

  // Has country code but missing mobile prefix (e.g. 543424... → 5493424...)
  if (digits.length === countryCode.length + localLength && digits.startsWith(countryCode)) {
    return countryCode + mobilePrefix + digits.slice(countryCode.length);
  }

  // Local 10-digit (most common user input)
  if (digits.length === localLength) return countryCode + mobilePrefix + digits;

  // 11-digit with leading 0 (e.g. 03424639480)
  if (digits.length === localLength + 1 && digits.startsWith("0")) {
    return countryCode + mobilePrefix + digits.slice(1);
  }

  return digits; // unknown format, store as-is
}

export function isValidWhatsappPhone(phone: string, country: CountryCode = DEFAULT_COUNTRY): boolean {
  const sanitized = sanitizePhone(phone, country);
  const { countryCode, mobilePrefix, localLength } = PHONE_CONFIGS[country];
  return sanitized.length === countryCode.length + mobilePrefix.length + localLength;
}

export function whatsappLink(phone: string, message: string): string {
  return `https://wa.me/${sanitizePhone(phone)}?text=${encodeURIComponent(message)}`;
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

export function diagnosisWhatsappMessage({
  firstName,
  vehicle,
  diagnosis,
  price,
  estimatedTime,
  estimatedUnit,
  trackingUrl,
}: {
  firstName: string;
  vehicle: string;
  diagnosis: string;
  price: number;
  estimatedTime: number;
  estimatedUnit: "horas" | "días";
  trackingUrl: string;
}): string {
  const priceFormatted = price.toLocaleString("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });
  return `Hola ${firstName}. ¡Ya encontramos el problema! Su vehículo ${vehicle} tiene ${diagnosis}. El costo de reparación es de ${priceFormatted} y estará disponible aproximadamente en ${estimatedTime} ${estimatedUnit}.\n\nEsperamos confirmación para comenzar la reparación. Recordá que podés hacer el seguimiento de tu vehículo en tiempo real con el siguiente link:\n${trackingUrl}`;
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
