import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/utils/cn";
import { FormLabel } from "./FormLabel";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

export function Textarea({
  id,
  label,
  helperText,
  error,
  required,
  className,
  ...props
}: TextareaProps) {
  return (
    <div className={cn("form-field", className)}>
      {label && <FormLabel htmlFor={id} required={required}>{label}</FormLabel>}
      <div className={cn("input-shell", "input-shell--textarea", error && "input-shell--error")}>
        <textarea id={id} required={required} aria-invalid={Boolean(error)} {...props} />
      </div>
      {error ? <span className="form-error">{error}</span> :
        helperText ? <span className="form-helper">{helperText}</span> : null}
    </div>
  );
}
