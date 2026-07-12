export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export interface PasswordChecks {
  minimumLength: boolean;
  uppercase: boolean;
  lowercase: boolean;
  digit: boolean;
  specialCharacter: boolean;
}

export function validateEmail(email: string): string {
  const value = email.trim();

  if (!value) return "Email address is required.";
  if (!EMAIL_PATTERN.test(value)) return "Enter a valid email address.";

  return "";
}

export function getPasswordChecks(password: string): PasswordChecks {
  return {
    minimumLength: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    digit: /\d/.test(password),
    specialCharacter: /[^A-Za-z0-9]/.test(password),
  };
}

export function validatePassword(password: string): string {
  if (!password) return "Password is required.";

  const checks = getPasswordChecks(password);
  const missing: string[] = [];

  if (!checks.minimumLength) missing.push("at least 8 characters");
  if (!checks.uppercase) missing.push("one uppercase letter");
  if (!checks.lowercase) missing.push("one lowercase letter");
  if (!checks.digit) missing.push("one digit");
  if (!checks.specialCharacter) missing.push("one special character");

  return missing.length ? `Password must contain ${missing.join(", ")}.` : "";
}
