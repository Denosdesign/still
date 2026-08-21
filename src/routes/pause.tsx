import { createFileRoute } from "@tanstack/react-router";
import { PauseFlow } from "@/components/pause-flow";
import { Shell } from "@/components/shell";

type PauseSearch = {
  sample?: boolean;
};

export const Route = createFileRoute("/pause")({
  validateSearch: (search: Record<string, unknown>): PauseSearch => ({
    sample: search.sample === true || search.sample === "1" || search.sample === 1,
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
