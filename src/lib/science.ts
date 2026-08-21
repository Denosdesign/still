/** Evidence-informed helpers. Cooling-off, HALT, 10-10-10, gratitude. */

import { displayCategory, displaySource, type HaltState, type Want } from "@/lib/types";
import { startOfWeek } from "@/lib/utils";

export function recommendedWaitHours(priceHkd: number) {
  if (priceHkd < 150) return 12;
  if (priceHkd < 400) return 24;
  if (priceHkd < 1200) return 48;
  if (priceHkd < 5000) return 24 * 7;
  return 24 * 14;
}

export function waitLabel(hours: number) {
  if (hours < 24) return `${hours} hours`;
  if (hours === 24) return "24 hours";
  if (hours === 48) return "48 hours";
  const days = Math.round(hours / 24);
  if (days === 7) return "a week";
  if (days === 14) return "a fortnight";
  return `${days} days`;
}

export const WAIT_OPTIONS = [12, 24, 48, 24 * 7, 24 * 14] as const;

export const HALT_COPY = {
  hungry: {
    title: "Hungry",
    hint: "Low blood sugar quietly steals patience. Eat first — the listing will still be there.",
  },
  angry: {
    title: "Angry or stressed",
    hint: "Retail is a very expensive mood regulator. The want is trying to soothe you, not clothe you.",
  },
  lonely: {
    title: "Lonely",
    hint: "Packages are a poor substitute for people. A message to a friend is cheaper than a checkout.",
  },
  tired: {
    title: "Tired",
    hint: "Evening scrolling is when most impulse buys happen. Sleep on it — quite literally.",
  },
} as const;

export function haltFacts(halt?: HaltState | null) {
  if (!halt) return [];
  const out: string[] = [];
  if (halt.hungry) out.push("hungry");
  if (halt.angry) out.push("angry or stressed");
  if (halt.lonely) out.push("lonely");
  if (halt.tired) out.push("tired");
  return out;
}

export function haltSentence(halt?: HaltState | null) {
  const facts = haltFacts(halt);
  if (facts.length === 0) return "";
  if (facts.length === 1) return `You were ${facts[0]}.`;
  if (facts.length === 2) return `You were ${facts[0]} and ${facts[1]}.`;
  return `You were ${facts.slice(0, -1).join(", ")} and ${facts[facts.length - 1]}.`;
}

export function pauseEvidence(want: Want) {
  const halt = haltSentence(want.halt);
  const src = displaySource(want.source);
  const parts = [halt, src ? `Source: ${src}.` : ""].filter(Boolean);
  return parts.join(" ");
}

export const URGE_LINES = [
  "The urge will peak. Then it falls. You do not have to dive in.",
  "You are allowed to want it and still not buy it.",
  "This feeling is chemistry, not a command.",
  "Ride the wave. It always reaches the shore.",
  "Wanting it is allowed. Buying it can wait.",
];

export const KEEP_PRAISE = [
  "That is the hard part, and you did it.",
  "Most people never even pause. You did.",
  "Quietly brilliant. The want can go; the money stays.",
  "You chose future-you. They will thank you.",
  "Not deprivation — discernment. Well done.",
];

export const BUY_AFTER_WAIT_PRAISE = [
  "You waited, and you still wanted it. That is a considered purchase, not an impulse.",
  "Cooling off and then choosing is the whole point. Well done for thinking it through.",
  "Bought with a clear head. That is grown-up spending.",
];

export const WALKED_PRAISE = [
  "You walked away. That is a real win — log it, feel it, carry on.",
  "The want did not get the last word. Nice work.",
  "A small refusal, a large kindness to yourself.",
];

export function pick<T>(list: readonly T[], seed = Date.now()) {
  return list[seed % list.length] as T;
}

export const GRATITUDE_PROMPTS = [
  "A thing you already own that you actually use",
  "Something in your home that still makes you glad",
  "A purchase from the past that earned its keep",
];

export const PRACTICE_TIPS: Record<string, string> = {
  capture:
    "An unnamed itch stays in the body. Getting it onto a page turns a mood into a decision you can actually make.",
  halt: "The 'I deserve this' thought is often hunger or tiredness in disguise. Catch the state, and the want usually shrinks.",
  surf: "Shops are timed for the spike, not for you. Outlast one wave and 'must have it now' usually loses its teeth.",
  see: "A round price is easy to shrug off. Hours of your life are not. Stretch the feeling to ten months and most must-haves look like a mood that passed.",
  gratitude:
    "Wanting more is often the sense that nothing here is enough. Naming what already earns its keep closes that gap — long enough to choose.",
  decide:
    "Holding is not a forever no. It is asking whether morning-you still wants it. Most impulses expire if you give them a night.",
};

export const SCIENCE_NOTES = [
  {
    title: "Cooling-off",
    body: "Present bias makes the now feel larger than the later. A waiting period lets slower, wiser thinking catch up — the same idea behind statutory cooling-off on big sales.",
  },
  {
    title: "Urge surfing",
    body: "From DBT: cravings rise, peak and fall like a wave, often within a few minutes. You do not have to fight them. You ride them.",
  },
  {
    title: "HALT",
    body: "Hungry, Angry, Lonely, Tired — four states that reliably weaken self-control. Shopping in any of them is a studied trap, not a personality flaw.",
  },
  {
    title: "Gratitude",
    body: "Brief gratitude practice reduces the belief that more stuff equals more happiness, and lowers materialistic wanting in controlled studies.",
  },
  {
    title: "Cost in hours",
    body: "Translating a price into hours of your work makes the trade real. Mental accounting is easier to trick with a round dollar figure than with an afternoon of your life.",
  },
  {
    title: "10-10-10",
    body: "How will this feel in ten minutes, ten days, ten months? Stretching the timeline counters hyperbolic discounting — our habit of overvaluing the immediate.",
  },
];

export function isInGameSpend(category: string) {
  return displayCategory(category) === "In-game spend";
}

export function inGameSpendThisWeek(wants: Want[], now = Date.now()) {
  const from = startOfWeek(now);
  return wants.filter(
    (w) => !w.sample && isInGameSpend(w.category) && w.createdAt >= from,
  ).length;
}

export type PatternHighlight = {
  kicker: string;
  headline: string;
  detail: string;
};

export function loudestPattern(wants: Want[], now = Date.now()): PatternHighlight | null {
  const real = wants.filter((w) => !w.sample);
  const inGame = inGameSpendThisWeek(real, now);
  if (inGame >= 2) {
    return {
      kicker: "This week",
      headline: `${inGame} in-game spends`,
      detail: "The sting is the streak, not one top-up.",
    };
  }

  const bySource = new Map<string, number>();
  const byCat = new Map<string, number>();
  for (const w of real) {
    const src = displaySource(w.source);
    if (src) bySource.set(src, (bySource.get(src) ?? 0) + 1);
    const cat = displayCategory(w.category);
    if (cat) byCat.set(cat, (byCat.get(cat) ?? 0) + 1);
  }
  const topSource = [...bySource.entries()].sort((a, b) => b[1] - a[1])[0];
  const topCat = [...byCat.entries()].sort((a, b) => b[1] - a[1])[0];

  if (topSource && topSource[1] >= 2) {
    return {
      kicker: "Where it starts",
      headline: `${topSource[1]} from ${topSource[0]}`,
      detail: "That door is the one to watch.",
    };
  }
  if (topCat && topCat[1] >= 2) {
    return {
      kicker: "Loudest category",
      headline: `${topCat[1]} in ${topCat[0]}`,
      detail: "Seeing the pile is already a form of control.",
    };
  }
  if (real.length >= 1) {
    return {
      kicker: "Patterns",
      headline: `${real.length} pause${real.length === 1 ? "" : "s"} so far`,
      detail: "A few more and the picture sharpens.",
    };
  }
  return null;
}
