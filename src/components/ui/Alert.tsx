import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/utils/cn";

type AlertTone = "success" | "warning" | "danger" | "info";

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  tone?: AlertTone;
  icon?: ReactNode;
}

export function Alert({ tone = "info", icon, className, children, ...props }: AlertProps) {
  return (
    <div className={cn("ui-alert", `ui-alert--${tone}`, className)} role="alert" {...props}>
      {icon}
      <div>{children}</div>
    </div>
  );
}
