import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { addHours, startOfWeek, todayKey, uid } from "@/lib/utils";
import { recommendedWaitHours } from "@/lib/science";
import {
  CATEGORIES,
  DEFAULT_PROFILE,
  SOURCES,
  uniqueTags,
  type CheckIn,
  type HaltState,
  type Profile,
  type TenTenTen,
  type Want,
  type WantStatus,
} from "@/lib/types";

type Draft = {
  name: string;
  priceHkd: string;
  category: string;
  source: string;
};

const emptyDraft = (): Draft => ({
  name: "",
  priceHkd: "",
  category: "",
  source: "",
});

type StillState = {
  profile: Profile;
  wants: Want[];
  checkIns: CheckIn[];
  customCategories: string[];
  customSources: string[];
  recentCategories: string[];
  recentSources: string[];
  walkAways: number[];
  draft: Draft;
  hydrated: boolean;
  setHydrated: (v: boolean) => void;
  updateProfile: (patch: Partial<Profile>) => void;
  setDraft: (patch: Partial<Draft>) => void;
  resetDraft: () => void;
  rememberTag: (kind: "category" | "source", tag: string) => void;
  logWant: (input: {
    name: string;
    priceHkd: number;
    category: string;
    source: string;
    halt: HaltState;
    tenTenTen: TenTenTen | null;
    gratitude: string[];
    status: WantStatus;
    waitHours: number;
    note?: string;
    sample?: boolean;
  }) => Want;
  decide: (id: string, status: Extract<WantStatus, "kept" | "bought">, extraWaitHours?: number) => void;
  extendWait: (id: string, extraHours: number) => void;
  walkAway: () => void;
  checkIn: (wantLevel: CheckIn["wantLevel"], gratitude: string) => void;
  resetAll: () => void;
};

export const useStillStore = create<StillState>()(
  persist(
    (set, get) => ({
      profile: DEFAULT_PROFILE,
      wants: [],
      checkIns: [],
      customCategories: [],
      customSources: [],
      recentCategories: [],
      recentSources: [],
      walkAways: [],
      draft: emptyDraft(),
      hydrated: false,
      setHydrated: (v) => set({ hydrated: v }),
      updateProfile: (patch) =>
        set({ profile: { ...get().profile, ...patch } }),
      setDraft: (patch) => set({ draft: { ...get().draft, ...patch } }),
      resetDraft: () => set({ draft: emptyDraft() }),
      rememberTag: (kind, tag) => {
        const t = tag.trim();
        if (!t) return;
        const presets = kind === "category" ? CATEGORIES : SOURCES;
        const isPreset = (presets as readonly string[]).includes(t);
        if (kind === "category") {
          set({
            customCategories: isPreset
              ? get().customCategories
              : uniqueTags([t, ...get().customCategories]).slice(0, 40),
            recentCategories: uniqueTags([t, ...get().recentCategories]).slice(0, 6),
          });
        } else {
          set({
            customSources: isPreset
              ? get().customSources
              : uniqueTags([t, ...get().customSources]).slice(0, 40),
            recentSources: uniqueTags([t, ...get().recentSources]).slice(0, 6),
          });
        }
      },
      logWant: (input) => {
        const now = Date.now();
        const waitHours =
          input.status === "waiting"
            ? input.waitHours || recommendedWaitHours(input.priceHkd)
            : 0;
        if (input.category) get().rememberTag("category", input.category);
        if (input.source) get().rememberTag("source", input.source);
        const want: Want = {
          id: uid(),
          name: input.name.trim() || "Untitled want",
          priceHkd: Math.max(0, input.priceHkd),
          category: input.category,
          source: input.source,
          halt: input.halt,
          tenTenTen: input.tenTenTen,
          gratitude: input.gratitude.filter(Boolean),
          createdAt: now,
          waitUntil: input.status === "waiting" ? addHours(now, waitHours) : now,
          decidedAt: input.status === "waiting" ? null : now,
          status: input.status,
          waitHours,
          note: input.note ?? "",
          sample: input.sample,
        };
        set({ wants: [want, ...get().wants] });
        return want;
      },
      decide: (id, status) => {
        set({
          wants: get().wants.map((w) =>
            w.id === id
              ? {
                  ...w,
                  status,
                  decidedAt: Date.now(),
                  waitUntil: Date.now(),
                }
              : w,
          ),
        });
      },
      extendWait: (id, extraHours) => {
        const now = Date.now();
        set({
          wants: get().wants.map((w) => {
            if (w.id !== id) return w;
            const base = Math.max(w.waitUntil ?? now, now);
            return {
              ...w,
              status: "waiting" as const,
              waitUntil: addHours(base, extraHours),
              waitHours: w.waitHours + extraHours,
              decidedAt: null,
            };
          }),
        });
      },
      walkAway: () => {
        set({ walkAways: [Date.now(), ...get().walkAways].slice(0, 200) });
      },
      checkIn: (wantLevel, gratitude) => {
        const date = todayKey();
        const entry: CheckIn = {
          date,
          wantLevel,
          gratitude: gratitude.trim(),
          at: Date.now(),
        };
        const rest = get().checkIns.filter((c) => c.date !== date);
        set({ checkIns: [entry, ...rest] });
      },
      resetAll: () =>
        set({
          profile: DEFAULT_PROFILE,
          wants: [],
          checkIns: [],
          customCategories: [],
          customSources: [],
          recentCategories: [],
          recentSources: [],
          walkAways: [],
          draft: emptyDraft(),
        }),
    }),
    {
      name: "still-app-v1",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (s) => ({
        profile: s.profile,
        wants: s.wants,
        checkIns: s.checkIns,
        customCategories: s.customCategories,
        customSources: s.customSources,
        recentCategories: s.recentCategories,
        recentSources: s.recentSources,
        walkAways: s.walkAways,
      }),
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<StillState>;
        return {
          ...current,
          ...p,
          wants: (Array.isArray(p.wants) ? p.wants : current.wants).filter(
            (w) => w && !w.sample,
          ),
          profile: {
            ...DEFAULT_PROFILE,
            ...(p.profile ?? current.profile),
            rateSet: Boolean((p.profile ?? current.profile)?.rateSet),
            currency: (p.profile ?? current.profile)?.currency || "HKD",
            customCurrencies: Array.isArray((p.profile ?? current.profile)?.customCurrencies)
              ? ((p.profile ?? current.profile)?.customCurrencies as string[])
              : [],
            installPromptSeen: Boolean(
              (p.profile ?? current.profile)?.installPromptSeen,
            ),
            installSnoozeCount:
              Number((p.profile ?? current.profile)?.installSnoozeCount) || 0,
            installPromptWantId:
              String((p.profile ?? current.profile)?.installPromptWantId ?? ""),
          },
          customCategories: p.customCategories ?? [],
          customSources: p.customSources ?? [],
          recentCategories: p.recentCategories ?? [],
          recentSources: p.recentSources ?? [],
          walkAways: Array.isArray(p.walkAways) ? p.walkAways : [],
          draft: current.draft,
          hydrated: current.hydrated,
        };
      },
    },
  ),
);

function realWants(wants: Want[]) {
  return wants.filter(
    (w) =>
      !w.sample &&
      !(w.status === "walked" && !w.priceHkd && w.name === "Walked away"),
  );
}

export function selectMonthSpent(wants: Want[], now = new Date()) {
  const y = now.getFullYear();
  const m = now.getMonth();
  return realWants(wants)
    .filter((w) => w.status === "bought" && w.decidedAt)
    .filter((w) => {
      const d = new Date(w.decidedAt as number);
      return d.getFullYear() === y && d.getMonth() === m;
    })
    .reduce((sum, w) => sum + w.priceHkd, 0);
}

export function selectKeptTotal(wants: Want[]) {
  return realWants(wants)
    .filter((w) => w.status === "kept" || w.status === "walked")
    .reduce((sum, w) => sum + w.priceHkd, 0);
}

export function selectWaiting(wants: Want[], now = Date.now()) {
  return realWants(wants)
    .filter((w) => w.status === "waiting" && (w.waitUntil ?? 0) > now)
    .sort((a, b) => (a.waitUntil ?? 0) - (b.waitUntil ?? 0));
}

export function selectReady(wants: Want[], now = Date.now()) {
  return realWants(wants)
    .filter((w) => w.status === "waiting" && (w.waitUntil ?? 0) <= now)
    .sort((a, b) => (a.waitUntil ?? 0) - (b.waitUntil ?? 0));
}

export function selectStreak(
  checkIns: CheckIn[],
  wants: Want[],
  now = new Date(),
  walkAways: number[] = [],
) {
  const days = new Set<string>();
  for (const c of checkIns) days.add(c.date);
  for (const w of realWants(wants)) days.add(todayKey(new Date(w.createdAt)));
  for (const t of walkAways) days.add(todayKey(new Date(t)));

  let streak = 0;
  const cursor = new Date(now);
  cursor.setHours(12, 0, 0, 0);

  if (!days.has(todayKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }

  while (days.has(todayKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function selectTodayCheckIn(checkIns: CheckIn[]) {
  const key = todayKey();
  return checkIns.find((c) => c.date === key) ?? null;
}

export function selectWalksThisWeek(walkAways: number[], now = Date.now()) {
  const from = startOfWeek(now);
  return walkAways.filter((t) => t >= from).length;
}
