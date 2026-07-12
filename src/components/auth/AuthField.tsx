import type { HTMLInputTypeAttribute } from "react";

type AuthFieldProps = {
  id: string;
  label: string;
  type?: HTMLInputTypeAttribute;
  placeholder: string;
  autoComplete?: string;
  required?: boolean;
};

export function AuthField({
  id,
  label,
  type = "text",
  placeholder,
  autoComplete,
  required = true,
}: AuthFieldProps) {
  return (
    <div className="auth-field">
      <label htmlFor={id}>{label}</label>
      <input
        className="input-base"
        id={id}
        name={id}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
      />
    </div>
  );
}
