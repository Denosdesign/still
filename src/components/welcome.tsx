import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export function Welcome() {
  return (
    <div className="flex min-h-dvh flex-col bg-harbour px-6 pb-10 pt-[max(3rem,env(safe-area-inset-top))] text-harbour-fg">
      <div className="stagger-in mx-auto flex w-full max-w-md flex-1 flex-col">
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-harbour-fg/60">
          A quieter spend
        </p>
        <h1 className="mt-6 font-display text-6xl leading-[0.9] tracking-tight">Still</h1>
        <p className="mt-6 max-w-[16rem] text-lg leading-relaxed text-harbour-fg/80">
          The want will pass. Your money does not have to go with it.
        </p>
        <div className="mt-10 space-y-3 text-sm text-harbour-fg/75">
          <p>When the itch hits, open Still first, before checkout.</p>
          <p>We hold the want for a cooling-off, ride the urge, and keep score of what you kept.</p>
          <p>No shame if you buy. Pausing is the win.</p>
        </div>
        <div className="mt-auto flex flex-col gap-3 pt-12">
          <Button
            asChild
            size="xl"
            className="w-full bg-card text-ink hover:bg-card/90"
          >
            <Link to="/start">Start</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="ghost"
            className="w-full border border-harbour-fg/40 text-harbour-fg hover:bg-harbour-fg/10 hover:text-harbour-fg"
          >
            <Link to="/pause" search={{ sample: true }}>
              Show me how it works
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
