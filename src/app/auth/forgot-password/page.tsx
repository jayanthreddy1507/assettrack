import { AuthCard, ForgotPasswordForm } from "@/components/auth";

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      title="Reset your password"
      subtitle="We will send instructions to your email"
    >
      <ForgotPasswordForm />
    </AuthCard>
  );
}
