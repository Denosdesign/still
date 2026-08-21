import { createFileRoute } from "@tanstack/react-router";
import { PauseFlow } from "@/components/pause-flow";
import { Shell } from "@/components/shell";

type PauseSearch = {
  sample?: boolean;
};

function isSampleFlag(value: unknown) {
  return value === true || value === "true" || value === "1" || value === 1;
}

export const Route = createFileRoute("/pause")({
  validateSearch: (search: Record<string, unknown>): PauseSearch => ({
    sample: isSampleFlag(search?.sample),
  }),
  component: PausePage,
});

function PausePage() {
  const { sample } = Route.useSearch();
  return (
    <Shell hideNav>
      <PauseFlow key={sample ? "practice" : "live"} sample={Boolean(sample)} />
    </Shell>
  );
}
