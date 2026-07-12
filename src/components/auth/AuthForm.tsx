"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { AuthField } from "./AuthField";

type AuthMode = "login" | "signup";

export function AuthForm() {
  const [mode, setMode] = useState<AuthMode>("login");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    console.log(`${mode} submitted`, Object.fromEntries(formData.entries()));
  }

  const isLogin = mode === "login";

  return (
    <section className="auth-card surface-card" aria-labelledby="auth-title">
      <div className="auth-card-header">
        <div className="auth-card-logo">AF</div>
        <div>
          <p className="auth-eyebrow">AssetFlow</p>
          <h2 id="auth-title" className="heading-2">
            {isLogin ? "Sign in" : "Create account"}
          </h2>
        </div>
      </div>

      <p className="paragraph-small auth-description">
        {isLogin
          ? "Enter your employee credentials to continue."
          : "Create an employee account. An administrator can assign roles later."}
      </p>

      <form className="auth-form" onSubmit={handleSubmit}>
        {!isLogin && (
          <AuthField
            id="fullName"
            label="Full name"
            placeholder="Uma Maheswari"
            autoComplete="name"
          />
        )}

        <AuthField
          id="email"
          label="Email"
          type="email"
          placeholder="name@company.com"
          autoComplete="email"
        />

        <AuthField
          id="password"
          label="Password"
          type="password"
          placeholder="Enter your password"
          autoComplete={isLogin ? "current-password" : "new-password"}
        />

        {!isLogin && (
          <AuthField
            id="confirmPassword"
            label="Confirm password"
            type="password"
            placeholder="Re-enter your password"
            autoComplete="new-password"
          />
        )}

        {isLogin && (
          <div className="auth-options">
            <label className="remember-row">
              <input type="checkbox" name="rememberMe" />
              <span>Remember me</span>
            </label>
            <Link className="forgot-link" href="/forgot-password">
              Forgot password?
            </Link>
          </div>
        )}

        <button className="button-primary" type="submit">
          {isLogin ? "Sign in" : "Create account"}
        </button>
      </form>

      <div className="auth-switcher">
        <span>{isLogin ? "New here?" : "Already have an account?"}</span>
        <button
          className="button-link"
          type="button"
          onClick={() => setMode(isLogin ? "signup" : "login")}
        >
          {isLogin ? "Create account" : "Sign in"}
        </button>
      </div>
    </section>
  );
}
