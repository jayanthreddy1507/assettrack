import type { HTMLAttributes } from "react";
import { cn } from "@/utils/cn";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padded?: boolean;
  interactive?: boolean;
}

export function Card({
  className,
  padded = true,
  interactive = false,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "ui-card",
        padded && "ui-card--padded",
        interactive && "ui-card--interactive",
        className
      )}
      {...props}
    />
  );
}
