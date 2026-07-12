"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Alert, Button, Input, PasswordInput } from "@/components/ui";
import { validateEmail, validatePassword } from "@/lib/auth-validation";
import { getRedirectPath, registerUser } from "@/services/auth-api";
import { PasswordRules } from "./PasswordRules";

interface SignupValues {
  name: string;
  email: string;
  employeeId: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

type SignupErrors = Partial<Record<keyof SignupValues | "form", string>>;

const initialValues: SignupValues = {
  name: "",
  email: "",
  employeeId: "",
  phone: "",
  password: "",
  confirmPassword: "",
};

export function SignupForm() {
  const router = useRouter();
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<SignupErrors>({});
  const [loading, setLoading] = useState(false);

  function updateField(field: keyof SignupValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    if (errors[field]) {
      setErrors((current) => ({ ...current, [field]: "" }));
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors: SignupErrors = {
      name: values.name.trim().length < 2 ? "Enter your full name." : "",
      email: validateEmail(values.email),
      password: validatePassword(values.password),
      confirmPassword:
        values.confirmPassword !== values.password ? "Passwords do not match." : "",
    };

    if (
      nextErrors.name ||
      nextErrors.email ||
      nextErrors.password ||
      nextErrors.confirmPassword
    ) {
      setErrors(nextErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const response = await registerUser({
        name: values.name.trim(),
        email: values.email.trim().toLowerCase(),
        password: values.password,
        employeeId: values.employeeId.trim() || undefined,
        phone: values.phone.trim() || undefined,
      });

      router.replace(getRedirectPath(response, "/dashboard"));
      router.refresh();
    } catch (error) {
      setErrors({
        form:
          error instanceof Error
            ? error.message
            : "Unable to create the account. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      {errors.form && <Alert tone="danger">{errors.form}</Alert>}

      <Input
        id="signup-name"
        label="Full name"
        placeholder="Priya Sharma"
        autoComplete="name"
        value={values.name}
        error={errors.name}
        required
        onChange={(event) => updateField("name", event.target.value)}
      />

      <Input
        id="signup-email"
        type="email"
        label="Email address"
        placeholder="name@company.com"
        autoComplete="email"
        value={values.email}
        error={errors.email}
        required
        onChange={(event) => updateField("email", event.target.value)}
      />

      <div className="auth-form__two-columns">
        <Input
          id="signup-employee-id"
          label="Employee ID"
          placeholder="EMP-001"
          value={values.employeeId}
          onChange={(event) => updateField("employeeId", event.target.value)}
        />
        <Input
          id="signup-phone"
          type="tel"
          label="Phone number"
          placeholder="+91 98765 43210"
          autoComplete="tel"
          value={values.phone}
          onChange={(event) => updateField("phone", event.target.value)}
        />
      </div>

      <PasswordInput
        id="signup-password"
        label="Password"
        placeholder="Create a strong password"
        autoComplete="new-password"
        value={values.password}
        error={errors.password}
        required
        onChange={(event) => updateField("password", event.target.value)}
      />

      <PasswordRules password={values.password} />

      <PasswordInput
        id="signup-confirm-password"
        label="Confirm password"
        placeholder="Re-enter your password"
        autoComplete="new-password"
        value={values.confirmPassword}
        error={errors.confirmPassword}
        required
        onChange={(event) => updateField("confirmPassword", event.target.value)}
      />

      <Button type="submit" fullWidth loading={loading}>
        Create employee account
      </Button>

      <p className="auth-form__footer">
        Already have an account?{" "}
        <Link href="/auth/login" className="auth-link">
          Sign in
        </Link>
      </p>
    </form>
  );
}
