import type { InputHTMLAttributes, ReactNode } from "react";

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: ReactNode;
}

export function Checkbox({ label, ...props }: CheckboxProps) {
  return (
    <label className="checkbox-row">
      <input type="checkbox" className="ui-checkbox" {...props} />
      <span>{label}</span>
    </label>
  );
}
