import { useMemo } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Shell } from "@/components/shell";
import { Button } from "@/components/ui/button";
import { formatDateGb, hoursOfWork } from "@/lib/format";
import { useMoney } from "@/lib/currency";
import { KEEP_PRAISE, pick, waitLabel } from "@/lib/science";
import { useStillStore } from "@/lib/store";
import { displayCategory, displaySource } from "@/lib/types";

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
  const praise = useMemo(() => pick(KEEP_PRAISE, id.length), [id]);
  const { format } = useMoney();

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
  const cat = displayCategory(want.category);
  const src = displaySource(want.source);

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
        onClick={() => navigate({ to: "/waitlist" })}
        className="mb-4 flex size-11 items-center justify-center rounded-[var(--radius-md)] hover:bg-harbour-soft/60"
        aria-label="Back"
      >
        <ArrowLeft className="size-5" />
      </button>

      <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted">
        {want.status === "waiting" ? (ready ? "Time’s up" : "Still holding") : want.status}
      </p>
      <h1 className="mt-2 font-display text-3xl">{want.name}</h1>
      <p className="mt-2 font-display text-3xl tabular text-harbour">
        {format(want.priceHkd)}
      </p>
      <p className="mt-2 text-sm text-muted">
        Logged {formatDateGb(want.createdAt)}
        {cat ? ` · ${cat}` : ""}
        {src ? ` · ${src}` : ""}
      </p>

      {work && (
        <p className="mt-5 rounded-[var(--radius-lg)] bg-harbour-soft/80 px-4 py-3 text-sm text-harbour">
          Still {work.label}. The price has not changed. You have.
        </p>
      )}

      {want.status === "waiting" ? (
        <div className="mt-8 flex flex-1 flex-col gap-3">
          <p className="font-display text-xl">
            {ready ? "Has the itch faded?" : `Cooling for ${waitLabel(want.waitHours)}.`}
          </p>
          <p className="text-sm text-muted">
            If it still feels essential after the wait, buying it is not a failure. If it feels
            silly, that is information worth {format(want.priceHkd)}.
          </p>
          <div className="mt-auto flex flex-col gap-2 pt-6">
            <Button size="lg" className="w-full" onClick={keep}>
              It faded — keep the money
            </Button>
            <Button size="lg" variant="secondary" className="w-full" onClick={holdMore}>
              Need more time — hold 48 hours
            </Button>
            <button
              type="button"
              onClick={buy}
              className="py-3 text-sm text-muted"
            >
              Still want it — buy with intention
            </button>
          </div>
        </div>
      ) : (
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
      )}
    </Shell>
  );
}
