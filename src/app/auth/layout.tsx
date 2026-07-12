import type { ReactNode } from "react";
import { AuthShell } from "@/components/auth";

export default function AuthLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return <AuthShell>{children}</AuthShell>;
}
