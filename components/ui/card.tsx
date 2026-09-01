import * as React from "react";
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** "solid" (default) keeps dense/data surfaces fully legible — dashboard
   * forms, admin tables. "glass" is the deliberate flagship treatment for
   * primary content surfaces (marketplace cards, modals, hero panels) —
   * used selectively, not on every card site-wide. */
  variant?: "solid" | "glass";
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "solid", ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-2xl border border-line shadow-soft",
        variant === "glass" ? "glass" : "bg-panel",
        className
      )}
      {...props}
    />
  )
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-5 border-b border-line", className)} {...props} />
  )
);
CardHeader.displayName = "CardHeader";

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-5", className)} {...props} />
  )
);
CardContent.displayName = "CardContent";

export { Card, CardHeader, CardContent };
