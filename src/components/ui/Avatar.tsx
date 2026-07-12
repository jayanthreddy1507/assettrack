import type { HTMLAttributes } from "react";
import { cn } from "@/utils/cn";

type AvatarSize = "sm" | "md" | "lg";

export interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
  name: string;
  src?: string;
  size?: AvatarSize;
}

export function Avatar({ name, src, size = "md", className, ...props }: AvatarProps) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <span className={cn("ui-avatar", `ui-avatar--${size}`, className)} {...props}>
      {src ? <img src={src} alt={name} /> : initials}
    </span>
  );
}
