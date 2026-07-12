"use client";

export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export function Toggle({ checked, onChange, label, disabled = false }: ToggleProps) {
  return (
    <label className="toggle-row">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        className="ui-toggle"
        data-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
      >
        <span className="ui-toggle__thumb" />
      </button>
      {label && <span>{label}</span>}
    </label>
  );
}
