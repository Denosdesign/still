import { DEFAULT_PROFILE, type CheckIn, type Profile, type Want } from "@/lib/types";
import { useStillStore } from "@/lib/store";

export const BACKUP_APP = "still";
export const BACKUP_VERSION = 1;

export type StillBackup = {
  app: typeof BACKUP_APP;
  version: number;
  exportedAt: string;
  data: {
    profile: Profile;
    wants: Want[];
    checkIns: CheckIn[];
    customCategories: string[];
    customSources: string[];
    recentCategories: string[];
    recentSources: string[];
    walkAways: number[];
  };
};

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function asArray<T>(value: unknown, guard: (item: unknown) => item is T): T[] {
  return Array.isArray(value) ? value.filter(guard) : [];
}

function isWant(value: unknown): value is Want {
  const w = asRecord(value);
  return Boolean(w && typeof w.id === "string" && typeof w.name === "string");
}

function isCheckIn(value: unknown): value is CheckIn {
  const c = asRecord(value);
  return Boolean(c && typeof c.date === "string");
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isTimestamp(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function pickData(raw: unknown): StillBackup["data"] | null {
  const root = asRecord(raw);
  if (!root) return null;

  const nested = asRecord(root.data) ?? asRecord(root.state) ?? root;
  const source = nested;
  if (!source.profile && !Array.isArray(source.wants)) return null;

  const profileIn = asRecord(source.profile) ?? {};
  return {
    profile: {
      ...DEFAULT_PROFILE,
      ...(profileIn as Partial<Profile>),
      name: typeof profileIn.name === "string" ? profileIn.name.slice(0, 20) : "",
      hourlyRate: Number(profileIn.hourlyRate) || DEFAULT_PROFILE.hourlyRate,
      funMoneyMonthly: Number(profileIn.funMoneyMonthly) || 0,
      goalName:
        typeof profileIn.goalName === "string" && profileIn.goalName.trim()
          ? profileIn.goalName
          : DEFAULT_PROFILE.goalName,
      seenWelcome: Boolean(profileIn.seenWelcome),
      setupDone: Boolean(profileIn.setupDone),
      rateSet: Boolean(profileIn.rateSet),
      currency:
        typeof profileIn.currency === "string" && profileIn.currency
          ? profileIn.currency
          : "HKD",
      customCurrencies: asArray(profileIn.customCurrencies, isString),
      installPromptSeen: Boolean(profileIn.installPromptSeen),
      installSnoozeUntil: Number(profileIn.installSnoozeUntil) || 0,
    },
    wants: asArray(source.wants, isWant).filter((w) => !w.sample),
    checkIns: asArray(source.checkIns, isCheckIn),
    customCategories: asArray(source.customCategories, isString),
    customSources: asArray(source.customSources, isString),
    recentCategories: asArray(source.recentCategories, isString),
    recentSources: asArray(source.recentSources, isString),
    walkAways: asArray(source.walkAways, isTimestamp),
  };
}

export function buildBackup(): StillBackup {
  const s = useStillStore.getState();
  return {
    app: BACKUP_APP,
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    data: {
      profile: s.profile,
      wants: s.wants.filter((w) => !w.sample),
      checkIns: s.checkIns,
      customCategories: s.customCategories,
      customSources: s.customSources,
      recentCategories: s.recentCategories,
      recentSources: s.recentSources,
      walkAways: s.walkAways,
    },
  };
}

export function parseBackup(raw: string): StillBackup["data"] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("That file is not readable JSON.");
  }
  const data = pickData(parsed);
  if (!data) {
    throw new Error("That file is not a Still copy.");
  }
  return data;
}

export function restoreBackup(data: StillBackup["data"]) {
  useStillStore.setState({
    profile: data.profile,
    wants: data.wants,
    checkIns: data.checkIns,
    customCategories: data.customCategories,
    customSources: data.customSources,
    recentCategories: data.recentCategories,
    recentSources: data.recentSources,
    walkAways: data.walkAways,
    draft: { name: "", priceHkd: "", category: "", source: "" },
  });
}

export function backupFileName(now = new Date()) {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `still-backup-${y}-${m}-${d}.json`;
}

export function downloadBackup() {
  const json = `${JSON.stringify(buildBackup(), null, 2)}\n`;
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = backupFileName();
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function readBackupFile(file: File) {
  const text = await file.text();
  return parseBackup(text);
}
