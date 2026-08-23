export const CATEGORIES = [
  "Clothing",
  "Beauty",
  "Daily essentials",
  "Electronics",
  "Home",
  "Food & drink",
  "Books & stationery",
  "Sport & outdoors",
  "Games & toys",
  "Health",
  "Subscriptions",
  "Travel & transport",
  "In-game spend",
] as const;

export const SOURCES = [
  "Website",
  "Online shop",
  "Social media",
  "App / messages",
  "Shop",
  "Friend",
  "Phone scrolling",
  "Video game",
] as const;

export type WantStatus = "waiting" | "kept" | "bought" | "walked";

export const GLADNESS = [
  { id: "lighter", label: "Lighter" },
  { id: "glad", label: "Glad" },
  { id: "relieved", label: "Relieved" },
] as const;

export type Gladness = (typeof GLADNESS)[number]["id"];

export const BUY_LATER_WHYS = [
  { id: "sale", label: "On sale" },
  { id: "payday", label: "Payday" },
  { id: "still", label: "Still wanted it" },
  { id: "other", label: "Something else" },
] as const;

export type BuyLaterWhy = (typeof BUY_LATER_WHYS)[number]["id"];

export type HaltState = {
  hungry: boolean;
  angry: boolean;
  lonely: boolean;
  tired: boolean;
};

export type TenTenTen = {
  minutes: "relieved" | "itchy" | "unsure";
  days: "forgotten" | "still" | "unsure";
  months: "regret" | "glad" | "unsure";
};

export type Want = {
  id: string;
  name: string;
  priceHkd: number;
  category: string;
  source: string;
  halt: HaltState;
  tenTenTen: TenTenTen | null;
  gratitude: string[];
  createdAt: number;
  waitUntil: number | null;
  decidedAt: number | null;
  status: WantStatus;
  waitHours: number;
  note: string;
  sample?: boolean;
  hideUntilReview?: boolean;
  nearMiss?: boolean;
  gladness?: Gladness;
  boughtLater?: boolean;
  boughtLaterWhy?: BuyLaterWhy;
  boughtLaterNote?: string;
};

export type CheckIn = {
  date: string;
  wantLevel: 1 | 2 | 3 | 4 | 5;
  gratitude: string;
  at: number;
};

export type Profile = {
  name: string;
  hourlyRate: number;
  funMoneyMonthly: number;
  goalName: string;
  goalTarget: number;
  seenWelcome: boolean;
  setupDone: boolean;
  rateSet: boolean;
  currency: string;
  customCurrencies: string[];
  installPromptSeen: boolean;
  installSnoozeCount: number;
  installPromptWantId: string;
};

export const DEFAULT_PROFILE: Profile = {
  name: "",
  hourlyRate: 150,
  funMoneyMonthly: 2500,
  goalName: "A quieter year",
  goalTarget: 20000,
  seenWelcome: false,
  setupDone: false,
  rateSet: false,
  currency: "HKD",
  customCurrencies: [],
  installPromptSeen: false,
  installSnoozeCount: 0,
  installPromptWantId: "",
};

export const EMPTY_HALT: HaltState = {
  hungry: false,
  angry: false,
  lonely: false,
  tired: false,
};

const LEGACY_CATEGORY: Record<string, string> = {
  fashion: "Clothing",
  beauty: "Beauty",
  electronics: "Electronics",
  collectibles: "Games & toys",
  food: "Food & drink",
  home: "Home",
  experiences: "Travel & transport",
  other: "",
};

const LEGACY_SOURCE: Record<string, string> = {
  instagram: "Social media",
  taobao: "Online shop",
  shopee: "Online shop",
  livestream: "Social media",
  mall: "Shop",
  friends: "Friend",
  advert: "Website",
  other: "",
};

export function displayCategory(value: string) {
  if (!value) return "";
  return LEGACY_CATEGORY[value] ?? value;
}

export function displaySource(value: string) {
  if (!value) return "";
  return LEGACY_SOURCE[value] ?? value;
}

export function normaliseTag(value: string) {
  return value.trim().replace(/\s+/g, " ").slice(0, 32);
}

export function tagMatches(tag: string, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return tag.toLowerCase().includes(q);
}

export function uniqueTags(tags: string[]) {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of tags) {
    const t = normaliseTag(raw);
    if (!t) continue;
    const key = t.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(t);
  }
  return out;
}
