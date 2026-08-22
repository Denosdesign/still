import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Shell } from "@/components/shell";
import { SCIENCE_NOTES, inGameSpendThisWeek, loudestPattern } from "@/lib/science";
import { displayCategory, displaySource, type Want } from "@/lib/types";
import { useStillStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/insights")({ component: InsightsPage });

function InsightsPage() {
  const wantsAll = useStillStore((s) => s.wants);
  const checkIns = useStillStore((s) => s.checkIns);
  const wants = wantsAll.filter((w) => !w.sample);
  const highlight = loudestPattern(wants);
  const notes = extraNotes(wants);
  const inGameWeek = inGameSpendThisWeek(wants);

  const catCounts = new Map<string, number>();
  for (const w of wants) {
    const label = displayCategory(w.category);
    if (!label) continue;
    catCounts.set(label, (catCounts.get(label) ?? 0) + 1);
  }
  const byCat = [...catCounts.entries()]
    .map(([name, n]) => ({ name, n }))
    .sort((a, b) => b.n - a.n)
    .slice(0, 8);
  const catMax = byCat[0]?.n ?? 1;

  const srcCounts = new Map<string, number>();
  for (const w of wants) {
    const label = displaySource(w.source);
    if (!label) continue;
    srcCounts.set(label, (srcCounts.get(label) ?? 0) + 1);
  }
  const bySrc = [...srcCounts.entries()]
    .map(([name, n]) => ({ name, n }))
    .sort((a, b) => b.n - a.n)
    .slice(0, 6);
  const srcMax = bySrc[0]?.n ?? 1;

  const haltHits = [
    { k: "Hungry", n: wants.filter((w) => w.halt?.hungry).length },
    { k: "Angry", n: wants.filter((w) => w.halt?.angry).length },
    { k: "Lonely", n: wants.filter((w) => w.halt?.lonely).length },
    { k: "Tired", n: wants.filter((w) => w.halt?.tired).length },
  ];

  return (
    <Shell>
      <Link
        to="/"
        className="mb-4 flex size-11 items-center justify-center rounded-[var(--radius-md)] hover:bg-harbour-soft/60"
        aria-label="Back"
      >
        <ArrowLeft className="size-5" />
      </Link>
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted">
        Patterns, not sermons
      </p>
      <h1 className="mt-1 font-display text-3xl">Insights</h1>
      <p className="mt-2 text-sm text-muted">
        Useful only if they are kind. None of this is a verdict on your character.
      </p>

      {highlight ? (
        <section className="mt-6 rounded-[var(--radius-2xl)] bg-harbour px-5 py-6 text-harbour-fg shadow-[var(--shadow-card)]">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-harbour-fg/60">
            {highlight.kicker}
          </p>
          <p className="mt-2 font-display text-3xl leading-tight">{highlight.headline}</p>
          <p className="mt-3 text-sm text-harbour-fg/80">{highlight.detail}</p>
        </section>
      ) : (
        <p className="mt-6 rounded-[var(--radius-lg)] bg-harbour-soft/70 px-4 py-3 text-sm text-harbour">
          Pause a few wants and the picture sharpens. One data point is a mood; three is a
          pattern.
        </p>
      )}

      {inGameWeek >= 2 && highlight?.kicker !== "This week" && (
        <p className="mt-3 rounded-[var(--radius-lg)] border border-border bg-card px-4 py-3 text-sm">
          <span className="font-display text-xl tabular text-harbour">{inGameWeek}</span>
          <span className="ml-2 text-muted">in-game spends this week. The streak is the cost.</span>
        </p>
      )}

      {notes.length > 0 && (
        <div className="mt-4 space-y-3">
          {notes.map((n) => (
            <p
              key={n}
              className="rounded-[var(--radius-lg)] border border-border bg-card px-4 py-3 text-sm leading-relaxed"
            >
              {n}
            </p>
          ))}
        </div>
      )}

      {bySrc.length > 0 && (
        <section className="mt-8">
          <h2 className="font-display text-xl">Where it starts</h2>
          <ul className="mt-3 space-y-3 rounded-[var(--radius-xl)] border border-border bg-card p-4">
            {bySrc.map((row) => (
              <BarRow key={row.name} name={row.name} n={row.n} max={srcMax} />
            ))}
          </ul>
        </section>
      )}

      {byCat.length > 0 && (
        <section className="mt-8">
          <h2 className="font-display text-xl">Where the wants gather</h2>
          <ul className="mt-3 space-y-3 rounded-[var(--radius-xl)] border border-border bg-card p-4">
            {byCat.map((row) => (
              <BarRow key={row.name} name={row.name} n={row.n} max={catMax} />
            ))}
          </ul>
        </section>
      )}

      <section className="mt-8">
        <h2 className="font-display text-xl">HALT flags</h2>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {haltHits.map((h) => (
            <div key={h.k} className="rounded-[var(--radius-lg)] bg-card px-4 py-3">
              <p className="text-xs uppercase tracking-[0.12em] text-faint">{h.k}</p>
              <p className="font-display text-2xl tabular">{h.n}</p>
            </div>
          ))}
        </div>
      </section>

      {checkIns.length > 0 && (
        <p className="mt-6 text-sm text-muted">
          Average want-level on check-in days:{" "}
          {(
            checkIns.reduce((s, c) => s + c.wantLevel, 0) / checkIns.length
          ).toFixed(1)}{" "}
          out of 5.
        </p>
      )}

      <section className="mt-10 pb-4">
        <h2 className="font-display text-xl">The science, in brief</h2>
        <ul className="mt-3 space-y-3">
          {SCIENCE_NOTES.map((s) => (
            <li key={s.title} className="rounded-[var(--radius-lg)] border border-border bg-card p-4">
              <p className="font-medium">{s.title}</p>
              <p className="mt-1 text-sm text-muted">{s.body}</p>
            </li>
          ))}
        </ul>
      </section>
    </Shell>
  );
}

function BarRow({ name, n, max }: { name: string; n: number; max: number }) {
  return (
    <li>
      <div className="mb-1 flex items-baseline justify-between gap-3">
        <span className="truncate text-sm text-ink">{name}</span>
        <span className="shrink-0 font-display text-sm tabular text-harbour">{n}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-harbour-soft">
        <div
          className={cn("h-full rounded-full bg-harbour")}
          style={{ width: `${Math.max(8, (n / max) * 100)}%` }}
        />
      </div>
    </li>
  );
}

function extraNotes(wants: Want[]) {
  const out: string[] = [];
  if (!wants.length) return out;

  const tired = wants.filter((w) => w.halt?.tired).length;
  if (tired >= 2) {
    out.push(
      `Tired shows up in ${tired} of your logged wants. Evening scrolling is a classic trap. Try opening Still before the shop apps.`,
    );
  }
  const hungry = wants.filter((w) => w.halt?.hungry).length;
  if (hungry >= 2) {
    out.push(`Hunger is riding along with ${hungry} wants. A snack is cheaper than a parcel.`);
  }

  const keptRate =
    wants.filter((w) => w.status === "kept" || w.status === "walked").length / wants.length;
  if (wants.length >= 3) {
    out.push(
      `You let go of ${Math.round(keptRate * 100)}% of logged wants. That is not luck. That is a practice.`,
    );
  }
  return out;
}