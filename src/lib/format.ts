import { formatMoney } from "@/lib/currency";

/** @deprecated Prefer formatMoney(amount, currency). Kept for HKD fallbacks. */
export function formatHkd(amount: number, withCents = false) {
  return formatMoney(amount, "HKD", withCents);
}

export function hoursOfWork(priceHkd: number, hourlyRate: number) {
  if (!hourlyRate || hourlyRate <= 0) return null;
  const hours = priceHkd / hourlyRate;
  if (hours < 1) {
    const mins = Math.max(1, Math.round(hours * 60));
    return {
      value: mins,
      unit: mins === 1 ? "minute" : "minutes",
      label: `${mins} ${mins === 1 ? "minute" : "minutes"} of your work`,
    };
  }
  const rounded = hours >= 10 ? Math.round(hours) : Math.round(hours * 10) / 10;
  return {
    value: rounded,
    unit: rounded === 1 ? "hour" : "hours",
    label: `${rounded} ${rounded === 1 ? "hour" : "hours"} of your work`,
  };
}

export type PayPeriod = "hour" | "month" | "year";

/** 8-hour days \u00d7 22 working days. Transparent, not a tax calculation. */
export const HOURS_PER_MONTH = 8 * 22;
export const HOURS_PER_YEAR = HOURS_PER_MONTH * 12;

export const PAY_CHIPS: Record<PayPeriod, number[]> = {
  hour: [80, 150, 250],
  month: [15000, 25000, 40000],
  year: [180000, 300000, 480000],
};

export function toHourlyRate(amount: number, period: PayPeriod) {
  if (!Number.isFinite(amount) || amount <= 0) return 0;
  if (period === "hour") return amount;
  if (period === "month") return amount / HOURS_PER_MONTH;
  return amount / HOURS_PER_YEAR;
}

export function fromHourlyRate(hourly: number, period: PayPeriod) {
  if (!Number.isFinite(hourly) || hourly <= 0) return 0;
  if (period === "hour") return roundPay(hourly);
  if (period === "month") return Math.round(hourly * HOURS_PER_MONTH);
  return Math.round(hourly * HOURS_PER_YEAR);
}

export function roundPay(hourly: number) {
  if (hourly >= 10) return Math.round(hourly);
  return Math.round(hourly * 10) / 10;
}

export function formatRelative(ts: number, now = Date.now()) {
  const diff = ts - now;
  const abs = Math.abs(diff);
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (abs < minute) return diff >= 0 ? "moments" : "just now";
  if (abs < hour) {
    const n = Math.round(abs / minute);
    return `${n} min`;
  }
  if (abs < day) {
    const n = Math.round(abs / hour);
    return `${n} hr`;
  }
  const n = Math.round(abs / day);
  return `${n} day${n === 1 ? "" : "s"}`;
}

export function formatCountdown(msRemaining: number) {
  const clamped = Math.max(0, msRemaining);
  const totalMins = Math.floor(clamped / 60000);
  const days = Math.floor(totalMins / (60 * 24));
  const hours = Math.floor((totalMins - days * 60 * 24) / 60);
  const mins = totalMins % 60;
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

export function greeting(now = new Date()) {
  const h = now.getHours();
  if (h < 5) return "Still up";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  if (h < 21) return "Good evening";
  return "Good evening";
}

export function formatDateGb(ts: number) {
  return new Date(ts).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

export function formatClockGb(ts: number) {
  return new Date(ts).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function formatWhenGb(ts: number) {
  const d = new Date(ts);
  const day = d.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
  return `${formatClockGb(ts)}, ${day}`;
}

export function percentOf(part: number, whole: number) {
  if (!whole) return 0;
  return Math.min(100, Math.round((part / whole) * 100));
}
