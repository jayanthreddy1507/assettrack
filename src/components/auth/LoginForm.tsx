"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Alert, Button, Checkbox, Input, PasswordInput } from "@/components/ui";
import { validateEmail, validatePassword } from "@/lib/auth-validation";
import { getRedirectPath, loginUser } from "@/services/auth-api";

interface LoginErrors {
  email?: string;
  password?: string;
  form?: string;
}

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<LoginErrors>({});
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors: LoginErrors = {
      email: validateEmail(email),
      password: validatePassword(password),
    };

    if (nextErrors.email || nextErrors.password) {
      setErrors(nextErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const response = await loginUser({
        email: email.trim().toLowerCase(),
        password,
        rememberMe,
      });

      router.replace(getRedirectPath(response));
      router.refresh();
    } catch (error) {
      setErrors({
        form:
          error instanceof Error ? error.message : "Unable to sign in. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      {errors.form && <Alert tone="danger">{errors.form}</Alert>}

      <Input
        id="login-email"
        name="email"
        type="email"
        label="Email address"
        placeholder="name@company.com"
        autoComplete="email"
        value={email}
        error={errors.email}
        required
        onChange={(event) => {
          setEmail(event.target.value);
          if (errors.email) setErrors((current) => ({ ...current, email: "" }));
        }}
      />

      <PasswordInput
        id="login-password"
        name="password"
        label="Password"
        placeholder="Enter your password"
        autoComplete="current-password"
        value={password}
        error={errors.password}
        required
        onChange={(event) => {
          setPassword(event.target.value);
          if (errors.password) {
            setErrors((current) => ({ ...current, password: "" }));
          }
        }}
      />

      <div className="auth-form__options">
        <Checkbox
          checked={rememberMe}
          onChange={(event) => setRememberMe(event.target.checked)}
          label="Remember me"
        />

        <Link href="/auth/forgot-password" className="auth-link">
          Forgot password?
        </Link>
      </div>

      <Button type="submit" fullWidth loading={loading}>
        Sign in
      </Button>

      <div className="auth-separator">
        <span>New here?</span>
      </div>

      <p className="auth-form__support-copy">
        Sign up creates an employee account. Administrative roles are assigned later by an
        administrator.
      </p>

      <Link href="/auth/signup" className="auth-outline-link">
        Create account
      </Link>
    </form>
  );
}
