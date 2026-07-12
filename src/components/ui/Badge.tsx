import type { HTMLAttributes } from "react";
import { cn } from "@/utils/cn";

type BadgeTone = "neutral" | "success" | "warning" | "danger" | "info";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

export function Badge({ tone = "neutral", className, ...props }: BadgeProps) {
  return <span className={cn("ui-badge", `ui-badge--${tone}`, className)} {...props} />;
}
