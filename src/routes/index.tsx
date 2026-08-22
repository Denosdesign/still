import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Pause, Sparkles } from "lucide-react";
import { Shell } from "@/components/shell";
import { Welcome } from "@/components/welcome";
import { WantCard } from "@/components/want-card";
import { InstallHome } from "@/components/hold-loop";
import { greeting } from "@/lib/format";
import { useMoney } from "@/lib/currency";
import { loudestPattern } from "@/lib/science";
import {
  selectKeptTotal,
  selectMonthSpent,
  selectReady,
  selectWaiting,
  useStillStore,
} from "@/lib/store";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const profile = useStillStore((s) => s.profile);
  const wants = useStillStore((s) => s.wants);
  const updateProfile = useStillStore((s) => s.updateProfile);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 30000);
    return () => window.clearInterval(t);
  }, []);

  const notStarted = !profile.rateSet && !profile.setupDone;
  if (!profile.seenWelcome || notStarted) {
    return <Welcome />;
  }

  const waiting = selectWaiting(wants, now);
  const ready = selectReady(wants, now);
  const kept = selectKeptTotal(wants);
  const spent = selectMonthSpent(wants);
  const funLeft = Math.max(0, profile.funMoneyMonthly - spent);
  const name = profile.name.trim();
  const pattern = loudestPattern(wants, now);
  const why = profile.setupDone ? profile.goalName.trim() : "";
  const { format } = useMoney();

  const showKept = kept > 0;
  const showJoy = profile.setupDone;
  const showNumbers = showKept || showJoy;
  const holdingEmpty = waiting.length === 0 && ready.length === 0;
  const hasHeld = wants.some(
    (w) => !w.sample && (w.status === "waiting" || w.waitHours > 0),
  );
  const showInstall = hasHeld && !profile.installPromptSeen;

  return (
    <Shell>
      <div className="stagger-in flex flex-1 flex-col gap-5">
        <header>
          <p className="text-sm text-muted">
            {greeting()}
            {name ? `, ${name}` : ""}
          </p>
          <h1 className="mt-1 font-display text-3xl text-ink">Still here.</h1>
        </header>

        <Link
          to={profile.rateSet ? "/pause" : "/start"}
          search={profile.rateSet ? {} : undefined}
          className="relative overflow-hidden rounded-[var(--radius-2xl)] bg-harbour px-6 py-7 text-harbour-fg shadow-[var(--shadow-card)] transition-transform active:scale-[0.98]"
        >
          <WaveDeco />
          <span className="relative flex size-11 items-center justify-center rounded-full bg-harbour-fg/10">
            <Pause className="size-5" strokeWidth={1.8} />
          </span>
          <p className="relative mt-4 font-display text-3xl leading-tight">I want something</p>
          <p className="relative mt-2 max-w-[16rem] text-sm text-harbour-fg/75">
            {why
              ? `This is for ${why.charAt(0).toLowerCase() + why.slice(1)}.`
              : "Name it, hold it. The rest can wait."}
          </p>
          <ArrowRight className="absolute bottom-6 right-6 size-6 opacity-70" />
        </Link>

        {showNumbers && (
          <section className="rounded-[var(--radius-xl)] border border-border bg-card px-4 py-4">
            <div className={`grid gap-4 ${showKept && showJoy ? "grid-cols-2" : "grid-cols-1"}`}>
              {showKept && (
                <div>
                  <p className="text-[11px] uppercase tracking-[0.12em] text-faint">Kept</p>
                  <p className="mt-1 font-display text-xl tabular text-ink">{format(kept)}</p>
                </div>
              )}
              {showJoy && (
                <div>
                  <p className="text-[11px] uppercase tracking-[0.12em] text-faint">Joy left</p>
                  <p className="mt-1 font-display text-xl tabular text-ink">{format(funLeft)}</p>
                </div>
              )}
            </div>
          </section>
        )}

        {ready.length > 0 && (
          <section>
            <p className="mb-1 font-display text-lg">The itch had a night</p>
            <p className="mb-3 text-sm text-muted">
              {ready.length === 1
                ? `How does ${ready[0].name} feel?`
                : `${ready.length} wants had the night. How do they feel?`}
            </p>
            <div className="space-y-2">
              {ready.map((w) => (
                <WantCard key={w.id} want={w} now={now} ready />
              ))}
            </div>
          </section>
        )}

        {waiting.length > 0 && (
          <section>
            <div className="mb-2 flex items-baseline justify-between">
              <p className="font-display text-lg">Holding</p>
              {waiting.length > 2 ? (
                <Link to="/waitlist" className="text-sm text-harbour">
                  See all
                </Link>
              ) : null}
            </div>
            <div className="space-y-2">
              {waiting.slice(0, 2).map((w) => (
                <WantCard key={w.id} want={w} now={now} />
              ))}
            </div>
          </section>
        )}

        {showInstall ? (
          <InstallHome onDismiss={() => updateProfile({ installPromptSeen: true })} />
        ) : null}

        {holdingEmpty && (
          <section className="rounded-[var(--radius-xl)] border border-dashed border-border px-4 py-6 text-center">
            <WaveMark />
            <p className="mt-3 font-display text-lg text-ink">Nothing holding yet</p>
            <p className="mt-1 text-sm text-muted">
              The next want lives here while it cools.
            </p>
          </section>
        )}

        <Link
          to="/insights"
          className="flex items-center gap-4 rounded-[var(--radius-xl)] border border-border bg-card px-4 py-4 transition-transform active:scale-[0.98]"
        >
          <span className="flex size-11 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-harbour-soft text-harbour">
            <Sparkles className="size-5" strokeWidth={1.8} />
          </span>
          <span className="min-w-0 flex-1">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-faint">
              {pattern?.kicker ?? "Patterns"}
            </p>
            <p className="mt-0.5 truncate font-display text-lg leading-tight text-ink">
              {pattern?.headline ?? "See what keeps showing up"}
            </p>
          </span>
          <ArrowRight className="size-4 shrink-0 text-faint" />
        </Link>

        {!profile.setupDone && (
          <Link
            to="/start"
            className="rounded-[var(--radius-lg)] bg-harbour-soft/70 px-4 py-3 text-sm text-harbour"
          >
            Add your numbers — the hours get honest.
          </Link>
        )}
      </div>
    </Shell>
  );
}

function WaveDeco() {
  return (
    <div
      className="pointer-events-none absolute inset-x-0 bottom-0 h-28 overflow-hidden text-harbour-fg opacity-[0.16]"
      aria-hidden="true"
    >
      <div className="wave-track absolute inset-y-0 left-0 flex h-full w-[200%]">
        <WaveSvg />
        <WaveSvg />
      </div>
    </div>
  );
}

function WaveSvg() {
  return (
    <svg
      className="h-full w-1/2 shrink-0"
      viewBox="0 0 640 112"
      preserveAspectRatio="none"
    >
      <path
        fill="currentColor"
        d="M0 48c80-32 160-32 240 0s160 32 240 0 160-32 160 0v64H0z"
      />
      <path
        fill="currentColor"
        opacity="0.45"
        d="M0 72c72-22 144-22 216 0s144 22 216 0 144-22 208 0v40H0z"
      />
    </svg>
  );
}

function WaveMark() {
  return (
    <svg viewBox="0 0 64 40" className="mx-auto h-8 w-14 text-harbour" aria-hidden="true">
      <path
        d="M4 16c10-10 18-10 28 0s18 10 28 0"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M8 26c8-8 16-8 24 0s16 8 24 0"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity="0.4"
      />
    </svg>
  );
}
