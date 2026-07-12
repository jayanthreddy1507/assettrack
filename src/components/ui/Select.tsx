import type { SelectHTMLAttributes } from "react";
import { cn } from "@/utils/cn";
import { FormLabel } from "./FormLabel";

export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  placeholder?: string;
  helperText?: string;
  error?: string;
}

export function Select({
  id,
  label,
  options,
  placeholder,
  helperText,
  error,
  required,
  className,
  ...props
}: SelectProps) {
  return (
    <div className={cn("form-field", className)}>
      {label && (
        <FormLabel htmlFor={id} required={required}>
          {label}
        </FormLabel>
      )}
      <div className={cn("input-shell", error && "input-shell--error")}>
        <select id={id} required={required} aria-invalid={Boolean(error)} {...props}>
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      {error ? (
        <span className="form-error">{error}</span>
      ) : helperText ? (
        <span className="form-helper">{helperText}</span>
      ) : null}
    </div>
  );
}
