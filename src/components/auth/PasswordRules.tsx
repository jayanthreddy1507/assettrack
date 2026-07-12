import { getPasswordChecks } from "@/lib/auth-validation";

export interface PasswordRulesProps {
  password: string;
}

const rules = [
  ["minimumLength", "At least 8 characters"],
  ["uppercase", "One uppercase letter"],
  ["lowercase", "One lowercase letter"],
  ["digit", "One number"],
  ["specialCharacter", "One special character"],
] as const;

export function PasswordRules({ password }: PasswordRulesProps) {
  const checks = getPasswordChecks(password);

  return (
    <div className="password-rules" aria-live="polite">
      {rules.map(([key, label]) => (
        <div
          key={key}
          className="password-rule"
          data-valid={checks[key]}
        >
          <span className="password-rule__icon" aria-hidden="true">
            {checks[key] ? "✓" : "•"}
          </span>
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}
