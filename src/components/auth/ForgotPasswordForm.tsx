"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { Alert, Button, Input } from "@/components/ui";
import { validateEmail } from "@/lib/auth-validation";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationError = validateEmail(email);

    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const baseUrl = (
        process.env.NEXT_PUBLIC_API_BASE_URL ??
        "http://localhost:4000/api"
      ).replace(/\/$/, "");

      const endpoint =
        process.env.NEXT_PUBLIC_FORGOT_PASSWORD_ENDPOINT ??
        "/auth/forgot-password";

      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Unable to send reset instructions.");
      }

      setMessage(
        data.message ||
          "Password reset instructions have been sent to your email."
      );
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to send reset instructions."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      {message && <Alert tone="success">{message}</Alert>}
      {error && !validateEmail(email) && <Alert tone="danger">{error}</Alert>}

      <Input
        id="forgot-email"
        type="email"
        label="Email address"
        placeholder="name@company.com"
        autoComplete="email"
        value={email}
        error={validateEmail(email) && error ? error : undefined}
        required
        onChange={(event) => {
          setEmail(event.target.value);
          setError("");
        }}
      />

      <Button type="submit" fullWidth loading={loading}>
        Send reset instructions
      </Button>

      <p className="auth-form__footer">
        <Link href="/auth/login" className="auth-link">
          Back to sign in
        </Link>
      </p>
    </form>
  );
}
