import type { HTMLAttributes } from "react";
import { cn } from "@/utils/cn";

export function Section({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return <section className={cn("section", className)} {...props} />;
}
