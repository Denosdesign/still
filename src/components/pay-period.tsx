import { cn } from "@/lib/utils";
import type { PayPeriod } from "@/lib/format";

export const PAY_PERIODS: { id: PayPeriod; label: string }[] = [
  { id: "hour", label: "Hour" },
  { id: "month", label: "Month" },
  { id: "year", label: "Year" },
];

export function PayPeriodBar({
  value,
  onChange,
}: {
  value: PayPeriod;
  onChange: (period: PayPeriod) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-1.5 rounded-full bg-harbour-soft/80 p-1">
      {PAY_PERIODS.map((p) => (
        <button
          key={p.id}
          type="button"
          onClick={() => onChange(p.id)}
          className={cn(
            "h-10 rounded-full text-sm font-medium",
            value === p.id ? "bg-harbour text-harbour-fg" : "text-harbour",
          )}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}
