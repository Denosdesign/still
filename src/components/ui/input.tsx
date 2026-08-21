import * as React from "react";
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        "flex h-12 w-full rounded-[var(--radius-md)] border border-border bg-card px-4 text-base text-ink shadow-[0_1px_0_rgba(28,24,20,0.03)] transition-[border-color,box-shadow] duration-[var(--motion-quick)] placeholder:text-faint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-harbour/30 focus-visible:border-harbour",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
