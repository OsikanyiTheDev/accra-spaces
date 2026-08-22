import { COMMISSION_LABELS, MAINTENANCE_LABELS } from "@/lib/constants";
import type { Commission, PropertyType, SaleMode } from "@/lib/types";

const currency = new Intl.NumberFormat("en-GH", {
  style: "currency",
  currency: "GHS",
  maximumFractionDigits: 0,
});

export function formatGhs(value: number): string {
  return currency.format(value).replace("GHS", "GH₵");
}

export function priceSuffix(mode: SaleMode): string {
  return mode === "rent" ? "/ month" : "";
}

export function typeLabel(type: PropertyType): string {
  return type === "shop" ? "Store / Shop" : `${type.charAt(0).toUpperCase()}${type.slice(1)}`;
}

export function maintenanceLabel(value: string): string {
  return MAINTENANCE_LABELS[value] ?? "Policy disclosed on request";
}

export function commissionLabel(commission?: Commission): string {
  if (!commission) return "Not provided";
  const base = COMMISSION_LABELS[commission.type] ?? "Disclosed";
  if (commission.type === "percentage" && commission.value !== undefined) return `${commission.value}%`;
  if (commission.type === "flat_fee" && commission.value !== undefined) return formatGhs(commission.value);
  return base;
}

export function readableDate(value?: string): string {
  if (!value) return "Recently added";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently added";
  return new Intl.DateTimeFormat("en-GH", { dateStyle: "medium" }).format(date);
}

export function whatsappHref(number: string, title: string): string {
  const digits = number.replace(/\D/g, "");
  const text = encodeURIComponent(`Hello, I’m interested in “${title}” on Accra Spaces. Is it still available?`);
  return `https://wa.me/${digits}?text=${text}`;
}
