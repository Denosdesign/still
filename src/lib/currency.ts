import { useStillStore } from "@/lib/store";

export const PRESET_CODES = ["HKD", "TWD", "JPY", "KRW", "GBP", "USD", "EUR"] as const;
export type PresetCode = (typeof PRESET_CODES)[number];

export type CurrencyDef = {
  code: string;
  name: string;
  symbol: string;
  fraction: 0 | 2;
  /** Local units per 1 Hong Kong dollar. Used for sample prices and milestones. */
  perHkd: number;
  pay: { hour: number[]; month: number[]; year: number[] };
  joyChips: number[];
  joyMax: number;
  joyDefault: number;
  skipHourly: number;
  step: number;
  known: boolean;
};

const PRESETS: Record<PresetCode, CurrencyDef> = {
  HKD: {
    code: "HKD",
    name: "Hong Kong dollar",
    symbol: "HK$",
    fraction: 2,
    perHkd: 1,
    pay: { hour: [80, 150, 250], month: [15000, 25000, 40000], year: [180000, 300000, 480000] },
    joyChips: [1000, 2500, 4000, 6000],
    joyMax: 8000,
    joyDefault: 2500,
    skipHourly: 150,
    step: 50,
    known: true,
  },
  TWD: {
    code: "TWD",
    name: "New Taiwan dollar",
    symbol: "NT$",
    fraction: 2,
    perHkd: 4,
    pay: { hour: [200, 350, 500], month: [35000, 50000, 70000], year: [420000, 600000, 840000] },
    joyChips: [3000, 5000, 8000, 12000],
    joyMax: 20000,
    joyDefault: 5000,
    skipHourly: 350,
    step: 100,
    known: true,
  },
  JPY: {
    code: "JPY",
    name: "Japanese yen",
    symbol: "¥",
    fraction: 2,
    perHkd: 19,
    pay: { hour: [1200, 1800, 2500], month: [220000, 300000, 400000], year: [2600000, 3600000, 4800000] },
    joyChips: [10000, 20000, 30000, 50000],
    joyMax: 80000,
    joyDefault: 20000,
    skipHourly: 1800,
    step: 500,
    known: true,
  },
  KRW: {
    code: "KRW",
    name: "South Korean won",
    symbol: "₩",
    fraction: 2,
    perHkd: 175,
    pay: { hour: [12000, 18000, 25000], month: [2200000, 3000000, 4000000], year: [26000000, 36000000, 48000000] },
    joyChips: [100000, 200000, 300000, 500000],
    joyMax: 800000,
    joyDefault: 200000,
    skipHourly: 18000,
    step: 5000,
    known: true,
  },
  GBP: {
    code: "GBP",
    name: "Pound sterling",
    symbol: "£",
    fraction: 2,
    perHkd: 0.1,
    pay: { hour: [12, 18, 28], month: [2200, 3200, 4800], year: [26000, 38000, 58000] },
    joyChips: [80, 150, 250, 400],
    joyMax: 600,
    joyDefault: 150,
    skipHourly: 18,
    step: 5,
    known: true,
  },
  USD: {
    code: "USD",
    name: "US dollar",
    symbol: "US$",
    fraction: 2,
    perHkd: 0.13,
    pay: { hour: [15, 25, 40], month: [2800, 4500, 7000], year: [34000, 54000, 84000] },
    joyChips: [100, 200, 350, 500],
    joyMax: 800,
    joyDefault: 200,
    skipHourly: 25,
    step: 5,
    known: true,
  },
  EUR: {
    code: "EUR",
    name: "Euro",
    symbol: "€",
    fraction: 2,
    perHkd: 0.12,
    pay: { hour: [14, 22, 35], month: [2500, 3800, 5500], year: [30000, 45000, 66000] },
    joyChips: [80, 150, 250, 400],
    joyMax: 600,
    joyDefault: 150,
    skipHourly: 22,
    step: 5,
    known: true,
  },
};

export function isPreset(code: string): code is PresetCode {
  return (PRESET_CODES as readonly string[]).includes(code);
}

export function normaliseCurrency(raw: string) {
  return raw.replace(/[^a-zA-Z]/g, "").toUpperCase().slice(0, 3);
}

export function getCurrency(code?: string): CurrencyDef {
  const key = (code || "HKD").toUpperCase();
  if (isPreset(key)) return PRESETS[key];
  return {
    code: key || "CUR",
    name: key || "Custom",
    symbol: key ? `${key} ` : "",
    fraction: 2,
    perHkd: 1,
    pay: { hour: [], month: [], year: [] },
    joyChips: [],
    joyMax: 0,
    joyDefault: 0,
    skipHourly: 0,
    step: 1,
    known: false,
  };
}

export function sanitiseMoneyInput(raw: string, fraction: 0 | 2 = 0) {
  const cleaned = raw.replace(/[^\d.]/g, "");
  if (fraction === 0) return cleaned.replace(/\./g, "");
  const first = cleaned.indexOf(".");
  if (first === -1) return cleaned;
  const head = cleaned.slice(0, first).replace(/\./g, "");
  const tail = cleaned.slice(first + 1).replace(/\./g, "").slice(0, 2);
  return `${head}.${tail}`;
}

export function formatMoney(amount: number, code = "HKD", withCents = false) {
  const c = getCurrency(code);
  const safe = Number.isFinite(amount) ? amount : 0;
  const n = c.fraction === 2 ? Math.round(safe * 100) / 100 : Math.round(safe);
  const showCents = c.fraction === 2 && (withCents || Math.abs(n % 1) > 1e-9);
  const digits = showCents ? 2 : 0;
  const body = n.toLocaleString("en-GB", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
  return `${c.symbol}${body}`;
}

export function fromHkd(amountHkd: number, code = "HKD") {
  const c = getCurrency(code);
  const raw = amountHkd * (c.perHkd || 1);
  if (c.code === "KRW") return Math.round(raw / 1000) * 1000;
  if (c.code === "JPY") return Math.round(raw / 100) * 100;
  if (c.code === "TWD") return Math.round(raw / 50) * 50;
  if (c.fraction === 2) return Math.round(raw * 100) / 100;
  return Math.round(raw);
}

export function toHkd(amount: number, code = "HKD") {
  const c = getCurrency(code);
  if (!c.perHkd) return amount;
  return amount / c.perHkd;
}

export function useMoney() {
  const code = useStillStore((s) => s.profile.currency || "HKD");
  const c = getCurrency(code);
  return {
    code,
    currency: c,
    symbol: c.symbol,
    format: (n: number, withCents = false) => formatMoney(n, code, withCents),
  };
}