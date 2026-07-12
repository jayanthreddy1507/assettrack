import { DashboardContent } from "@/components/dashboard/DashboardContent";
import { getDashboardData } from "@/components/dashboard/dashboard.repository";

export default async function DashboardPage() {
  const data = await getDashboardData();

  return <DashboardContent data={data} />;
}
