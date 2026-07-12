import type { ReactNode } from "react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { getDashboardData } from "@/components/dashboard/dashboard.repository";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const data = await getDashboardData();

  return <DashboardShell user={data.user}>{children}</DashboardShell>;
}
