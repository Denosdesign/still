import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-[transform,background-color,color,box-shadow,opacity] duration-[var(--motion-quick)] ease-[var(--ease-out)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-harbour/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:not-disabled:scale-[0.96]",
  {
    variants: {
      variant: {
        primary:
          "bg-harbour text-harbour-fg shadow-[0_1px_0_rgba(255,255,255,0.12)_inset] hover:bg-harbour-deep",
        secondary:
          "bg-card text-ink border border-border hover:bg-harbour-soft/60",
        ghost: "bg-transparent text-ink hover:bg-harbour-soft/50",
        quiet: "bg-transparent text-muted hover:text-ink",
        danger: "bg-danger text-card hover:opacity-90",
      },
      size: {
        sm: "h-9 rounded-[var(--radius-sm)] px-3 text-sm",
        md: "h-11 rounded-[var(--radius-md)] px-4 text-sm",
        lg: "h-12 rounded-[var(--radius-lg)] px-5 text-base",
        xl: "h-14 rounded-[var(--radius-lg)] px-6 text-base",
        icon: "size-11 rounded-[var(--radius-md)]",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    static?: boolean;
  };

function Button({
  className,
  variant,
  size,
  asChild = false,
  static: isStatic,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={cn(
        buttonVariants({ variant, size }),
        isStatic && "active:scale-100",
        className,
      )}
      {...props}
    />
  );
}

export { Button, buttonVariants };
