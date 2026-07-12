import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/utils/cn";

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  icon: ReactNode;
}

export function IconButton({ label, icon, className, ...props }: IconButtonProps) {
  return (
    <button
      type="button"
      className={cn("ui-icon-button", className)}
      aria-label={label}
      title={label}
      {...props}
    >
      {icon}
    </button>
  );
}
