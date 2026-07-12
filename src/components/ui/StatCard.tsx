import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

type StatTone = "mint" | "sky" | "cream" | "peach" | "sage";

export interface StatCardProps {
  label: string;
  value: string | number;
  meta?: ReactNode;
  tone?: StatTone;
}

export function StatCard({
  label,
  value,
  meta,
  tone = "mint",
}: StatCardProps) {
  return (
    <article className={cn("stat-card", `stat-card--${tone}`)}>
      <div className="stat-card__label">{label}</div>
      <div className="stat-card__value">{value}</div>
      {meta && <div className="stat-card__meta">{meta}</div>}
    </article>
  );
}
