import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/utils/cn";
import { FormLabel } from "./FormLabel";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: ReactNode;
  rightAction?: ReactNode;
}

export function Input({
  id,
  label,
  helperText,
  error,
  leftIcon,
  rightAction,
  required,
  className,
  ...props
}: InputProps) {
  return (
    <div className={cn("form-field", className)}>
      {label && <FormLabel htmlFor={id} required={required}>{label}</FormLabel>}
      <div className={cn("input-shell", error && "input-shell--error")}>
        {leftIcon}
        <input id={id} required={required} aria-invalid={Boolean(error)} {...props} />
        {rightAction}
      </div>
      {error ? (
        <span className="form-error">{error}</span>
      ) : helperText ? (
        <span className="form-helper">{helperText}</span>
      ) : null}
    </div>
  );
}
