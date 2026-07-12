import type { LabelHTMLAttributes } from "react";

export interface FormLabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export function FormLabel({ children, required, ...props }: FormLabelProps) {
  return (
    <label className="form-label" {...props}>
      {children}
      {required && <span className="form-required"> *</span>}
    </label>
  );
}
