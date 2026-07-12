import {
  DashboardContent,
  DashboardShell,
  getDashboardData,
} from "@/components/dashboard";

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <DashboardShell user={data.user}>
      <DashboardContent data={data} />
    </DashboardShell>
  );
}
