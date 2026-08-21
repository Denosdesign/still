import { createFileRoute, Link } from "@tanstack/react-router";
import { Award, Heart, PauseCircle } from "lucide-react";
import { Shell } from "@/components/shell";
import { formatDateGb } from "@/lib/format";
import { fromHkd, useMoney } from "@/lib/currency";
import {
  selectKeptTotal,
  selectMonthSpent,
  selectStreak,
  useStillStore,
} from "@/lib/store";
import type { Want } from "@/lib/types";

export const Route = createFileRoute("/wins")({ component: WinsPage });

function WinsPage() {
  const wantsAll = useStillStore((s) => s.wants);
  const wants = wantsAll.filter(
    (w) => !w.sample && !(w.status === "walked" && !w.priceHkd && w.name === "Walked away"),
  );
  const checkIns = useStillStore((s) => s.checkIns);
  const walkAways = useStillStore((s) => s.walkAways);
  const profile = useStillStore((s) => s.profile);
  const kept = selectKeptTotal(wants);
  const spent = selectMonthSpent(wants);
  const streak = selectStreak(checkIns, wants, new Date(), walkAways);
  const pauses = wants.length;
  const letGo =
    wants.filter((w) => w.status === "kept" || w.status === "walked").length +
    walkAways.length;
  const considered = wants.filter((w) => w.status === "bought").length;
  const { format, code } = useMoney();
  const grand = fromHkd(1000, code);
  const badges = badgesFor(
    { pauses, letGo, kept, streak, checkIns: checkIns.length },
    { format, grand },
  );
  const recent = wants.slice(0, 8);

  return (
    <Shell>
      <header className="mb-6">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted">
          Evidence you showed up
        </p>
        <h1 className="mt-1 font-display text-3xl">Wins</h1>
        <p className="mt-2 text-sm text-muted">
          We count pauses, not perfection. Buying after a wait is still a win.
        </p>
      </header>

      <div className="rounded-[var(--radius-2xl)] bg-harbour px-5 py-6 text-harbour-fg">
        <p className="text-xs uppercase tracking-[0.14em] text-harbour-fg/60">Money kept</p>
        <p className="mt-2 font-display text-4xl tabular">{format(kept)}</p>
        <p className="mt-2 text-sm text-harbour-fg/75">
          {profile.setupDone
            ? `Money that did not leave. Joy used this month: ${format(spent)}.`
            : "Money that did not leave, because you paused first."}
        </p>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <Mini k="Pauses" v={String(pauses)} />
        <Mini k="Let go" v={String(letGo)} />
        <Mini k="Rhythm" v={streak ? `${streak}d` : "\u2014"} />
      </div>

      <section className="mt-8">
        <h2 className="font-display text-xl">Marks of showing up</h2>
        <ul className="mt-3 space-y-2">
          {badges.map((b) => (
            <li
              key={b.id}
              className="flex items-start gap-3 rounded-[var(--radius-lg)] border border-border bg-card p-3"
            >
              <span className="mt-0.5 flex size-9 items-center justify-center rounded-[var(--radius-sm)] bg-harbour-soft text-harbour">
                <b.icon className="size-4" />
              </span>
              <div>
                <p className="font-medium text-ink">{b.title}</p>
                <p className="text-sm text-muted">{b.detail}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-xl">Recent</h2>
          <Link to="/insights" className="text-sm text-harbour">
            Patterns
          </Link>
        </div>
        {recent.length === 0 ? (
          <p className="mt-3 text-sm text-muted">
            Your first pause will live here. It does not have to be a big one.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {recent.map((w) => (
              <RecentRow key={w.id} want={w} />
            ))}
          </ul>
        )}
        {considered > 0 && (
          <p className="mt-4 text-sm text-muted">
            {considered} considered purchase{considered === 1 ? "" : "s"} after a pause —
            that is the opposite of impulse.
          </p>
        )}
      </section>
    </Shell>
  );
}

function Mini({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-[var(--radius-lg)] bg-card px-3 py-3">
      <p className="text-[11px] uppercase tracking-[0.12em] text-faint">{k}</p>
      <p className="mt-1 font-display text-xl tabular">{v}</p>
    </div>
  );
}

function RecentRow({ want }: { want: Want }) {
  const { format } = useMoney();
  const label =
    want.status === "kept"
      ? "Kept"
      : want.status === "walked"
        ? "Walked away"
        : want.status === "bought"
          ? "Bought, considered"
          : "Holding";
  return (
    <li className="flex items-center justify-between gap-3 rounded-[var(--radius-lg)] border border-border bg-card px-4 py-3">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{want.name}</p>
        <p className="text-xs text-muted">
          {label} · {formatDateGb(want.createdAt)}
        </p>
      </div>
      <p className="tabular text-sm text-harbour">{format(want.priceHkd)}</p>
    </li>
  );
}

function badgesFor(
  stats: {
    pauses: number;
    letGo: number;
    kept: number;
    streak: number;
    checkIns: number;
  },
  money: { format: (n: number) => string; grand: number },
) {
  const all = [
    {
      id: "first",
      icon: PauseCircle,
      title: "The first pause",
      detail: stats.pauses > 0 ? "You opened the door. That is the whole game." : "Waiting for you.",
      on: stats.pauses > 0,
    },
    {
      id: "week",
      icon: Heart,
      title: "A week of showing up",
      detail:
        stats.streak >= 7
          ? "Seven days. Not a personality transplant — a rhythm."
          : "Check in or pause on seven days in a row.",
      on: stats.streak >= 7,
    },
    {
      id: "grand",
      icon: Award,
      title: `First ${money.format(money.grand)} kept`,
      detail:
        stats.kept >= money.grand
          ? "A thousand dollars that did not leave. Quietly enormous."
          : `Let wants go until ${money.format(money.grand)} stays with you.`,
      on: stats.kept >= money.grand,
    },
    {
      id: "three",
      icon: Heart,
      title: "Three releases",
      detail:
        stats.letGo >= 3
          ? "Three times you let the want leave without the money."
          : "Let three wants go. They get easier.",
      on: stats.letGo >= 3,
    },
  ];
  const earned = all.filter((b) => b.on);
  const next = all.find((b) => !b.on);
  return next ? [...earned, next] : earned.length ? earned : all.slice(0, 2);
}
