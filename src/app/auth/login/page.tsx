import { AuthCard, LoginForm } from "@/components/auth";

export default function LoginPage() {
  return (
    <AuthCard title="Welcome Back!" subtitle="Sign in to continue">
      <LoginForm />
    </AuthCard>
  );
}
