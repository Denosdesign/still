import { useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Shell } from "@/components/shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CalendarRemind } from "@/components/hold-loop";
import {
  formatClockGb,
  formatCountdown,
  formatDateGb,
  formatWhenGb,
  hoursOfWork,
} from "@/lib/format";
import { useMoney } from "@/lib/currency";
import { KEEP_PRAISE, haltSentence, pick } from "@/lib/science";
import { useStillStore } from "@/lib/store";
import { BUY_LATER_WHYS, displaySource, type BuyLaterWhy, type Want } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/review/$id")({
  component: ReviewPage,
});

function ReviewPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const want = useStillStore((s) => s.wants.find((w) => w.id === id));
  const profile = useStillStore((s) => s.profile);
  const decide = useStillStore((s) => s.decide);
  const extendWait = useStillStore((s) => s.extendWait);
  const setHideUntilReview = useStillStore((s) => s.setHideUntilReview);
  const markBoughtLater = useStillStore((s) => s.markBoughtLater);
  const praise = useMemo(() => pick(KEEP_PRAISE, id.length), [id]);
  const { format } = useMoney();
  const [hideConfirm, setHideConfirm] = useState(false);

  if (!want) {
    return (
      <Shell hideNav>
        <p className="mt-12 text-center text-muted">That want has drifted off.</p>
        <Button asChild className="mx-auto mt-4 block w-fit">
          <Link to="/waitlist">Back to the waitlist</Link>
        </Button>
      </Shell>
    );
  }

  const work = hoursOfWork(want.priceHkd, profile.hourlyRate);
  const ready = want.status === "waiting" && (want.waitUntil ?? 0) <= Date.now();
  const halt = haltSentence(want.halt);
  const src = displaySource(want.source);
  const clock = formatClockGb(want.createdAt);
  const remaining = (want.waitUntil ?? 0) - Date.now();

  function keep() {
    decide(want!.id, "kept");
  }
  function buy() {
    decide(want!.id, "bought");
  }
  function holdMore() {
    extendWait(want!.id, 48);
    navigate({ to: "/waitlist" });
  }

  return (
    <Shell hideNav>
      <button
        type="button"
        onClick={() => navigate({ to: want.status === "waiting" ? "/waitlist" : "/wins" })}
        className="mb-4 flex size-11 items-center justify-center rounded-[var(--radius-md)] hover:bg-harbour-soft/60"
        aria-label="Back"
      >
        <ArrowLeft className="size-5" />
      </button>

      <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted">
        {want.nearMiss
          ? want.boughtLater
            ? "Bought later"
            : "Glad I didn’t"
          : want.status === "waiting"
            ? ready
              ? "Time’s up"
              : "Still holding"
            : want.status}
      </p>
      <h1 className="mt-2 font-display text-3xl">{want.name}</h1>
      <p className="mt-2 font-display text-3xl tabular text-harbour">
        {format(want.priceHkd)}
      </p>

      {want.nearMiss ? (
        <NearMissLog want={want} onBoughtLater={markBoughtLater} />
      ) : (
        <>
      <section className="mt-6 rounded-[var(--radius-xl)] bg-harbour-soft/80 px-4 py-4">
        <p className="text-[11px] uppercase tracking-[0.12em] text-harbour/70">
          When you paused
        </p>
        <p className="mt-2 text-sm leading-relaxed text-harbour">
          {halt ? `${halt} ` : ""}It was {clock}.
          {src ? ` Source: ${src}.` : ""}
        </p>
      </section>

      {work && (
        <p className="mt-4 text-sm text-muted">
          Still {work.label}. The price has not changed. You have.
        </p>
      )}

      {want.status === "waiting" && !ready ? (
        <div className="mt-8 flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1">
            <p className="text-sm text-muted">Come back</p>
            <p className="font-display text-3xl tabular text-harbour">
              {want.waitUntil ? formatWhenGb(want.waitUntil) : "when the wait ends"}
            </p>
            <p className="mt-2 text-sm text-muted">
              {want.waitUntil ? `${formatCountdown(remaining)} left. ` : ""}
              The wait is still running. Nothing to decide yet.
            </p>
          </div>
          <div
            className="mt-auto shrink-0 space-y-2 border-t border-border bg-surface pt-3"
            style={{ paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))" }}
          >
            <Button
              size="lg"
              className="w-full"
              onClick={() => navigate({ to: "/waitlist" })}
            >
              Keep holding
            </Button>
            {want.waitUntil ? (
              <CalendarRemind
                id={want.id}
                name={want.name}
                at={want.waitUntil}
                variant="secondary"
                label="Add a calendar reminder"
              />
            ) : null}
            {want.hideUntilReview ? (
              <button
                type="button"
                className="w-full py-2 text-sm text-muted"
                onClick={() => {
                  setHideUntilReview(want.id, false);
                  navigate({ to: "/" });
                }}
              >
                Show on homepage again
              </button>
            ) : hideConfirm ? (
              <div className="px-1 pt-1 text-center">
                <p className="text-sm leading-relaxed text-muted">
                  It only hides from the homepage. The wait still runs.
                </p>
                <button
                  type="button"
                  className="mt-3 w-full py-2 text-sm font-medium text-harbour"
                  onClick={() => {
                    setHideUntilReview(want.id, true);
                    navigate({ to: "/" });
                  }}
                >
                  I understand
                </button>
                <button
                  type="button"
                  className="w-full py-2 text-sm text-muted"
                  onClick={() => setHideConfirm(false)}
                >
                  Not now
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="w-full py-2 text-sm text-muted"
                onClick={() => setHideConfirm(true)}
              >
                Hide from homepage
              </button>
            )}
          </div>
        </div>
      ) : null}

      {want.status === "waiting" && ready ? (
        <div className="mt-8 flex flex-1 flex-col gap-3">
          <p className="font-display text-xl">Has the itch faded?</p>
          <div className="mt-auto flex flex-col gap-2 pt-6">
            <Button size="lg" className="w-full" onClick={keep}>
              It faded. Keep the money
            </Button>
            <Button size="lg" variant="secondary" className="w-full" onClick={holdMore}>
              Need more time. Hold 48 hours
            </Button>
            <button
              type="button"
              onClick={buy}
              className="py-3 text-sm text-muted"
            >
              Still want it. Buy with intention
            </button>
          </div>
        </div>
      ) : null}

      {want.status !== "waiting" ? (
        <div className="mt-8 rounded-[var(--radius-xl)] border border-border bg-card p-5">
          <p className="font-display text-2xl">
            {want.status === "kept"
              ? "Kept."
              : want.status === "walked"
                ? "Walked away."
                : "Bought, on purpose."}
          </p>
          <p className="mt-2 text-sm text-muted">{praise}</p>
          <Button asChild className="mt-6 w-full">
            <Link to="/wins">See the wins</Link>
          </Button>
        </div>
      ) : null}
        </>
      )}
    </Shell>
  );
}

function gladWord(want: Want) {
  if (want.gladness === "lighter") return "Lighter";
  if (want.gladness === "relieved") return "Relieved";
  if (want.gladness === "glad") return "Glad";
  return "Glad I didn’t";
}

function whyLabel(why?: BuyLaterWhy) {
  return BUY_LATER_WHYS.find((w) => w.id === why)?.label ?? "";
}

function NearMissLog({
  want,
  onBoughtLater,
}: {
  want: Want;
  onBoughtLater: (id: string, why: BuyLaterWhy, note?: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [why, setWhy] = useState<BuyLaterWhy | "">("");
  const [note, setNote] = useState("");
  const [sure, setSure] = useState(false);
  const can = Boolean(why) && (why !== "other" || note.trim().length > 0);

  function close() {
    setOpen(false);
    setWhy("");
    setNote("");
    setSure(false);
  }

  return (
    <div className="mt-6 flex min-h-0 flex-1 flex-col">
      <section className="rounded-[var(--radius-xl)] bg-harbour-soft/80 px-4 py-4">
        <p className="text-[11px] uppercase tracking-[0.12em] text-harbour/70">
          When you logged it
        </p>
        <p className="mt-2 text-sm leading-relaxed text-harbour">
          {gladWord(want)}. {formatDateGb(want.createdAt)}.
        </p>
      </section>

      {want.boughtLater ? (
        <div className="mt-6 rounded-[var(--radius-xl)] border border-border bg-card p-5">
          <p className="font-display text-2xl">Bought later.</p>
          <p className="mt-2 text-sm text-muted">
            The skip was real.
            {want.boughtLaterWhy
              ? ` Then: ${whyLabel(want.boughtLaterWhy)}${want.boughtLaterNote ? `. ${want.boughtLaterNote}` : "."}`
              : ""}
          </p>
        </div>
      ) : open ? (
        <div className="mt-8">
          <p className="text-sm leading-relaxed text-muted">
            It was true then. This only records that you bought it later.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {BUY_LATER_WHYS.map((w) => (
              <button
                key={w.id}
                type="button"
                onClick={() => {
                  setWhy(w.id);
                  setSure(false);
                }}
                className={cn(
                  "h-9 rounded-full border px-3 text-sm",
                  why === w.id
                    ? "border-harbour bg-harbour-soft text-harbour"
                    : "border-border bg-card text-muted",
                )}
              >
                {w.label}
              </button>
            ))}
          </div>
          {why === "other" ? (
            <Input
              className="mt-3"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="In a few words"
            />
          ) : null}
          <Button
            size="lg"
            variant={sure ? "danger" : "primary"}
            className="mt-6 w-full"
            disabled={!can}
            onClick={() => {
              if (!why) return;
              if (!sure) {
                setSure(true);
                return;
              }
              onBoughtLater(want.id, why, why === "other" ? note : undefined);
            }}
          >
            Log it
          </Button>
          <button
            type="button"
            className="mt-1 w-full py-2 text-sm text-muted"
            onClick={close}
          >
            Not now
          </button>
        </div>
      ) : (
        <button
          type="button"
          className="mt-auto w-full py-3 text-sm text-muted"
          onClick={() => setOpen(true)}
        >
          I bought it later
        </button>
      )}
    </div>
  );
}
