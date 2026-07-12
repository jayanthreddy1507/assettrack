import { DashboardShell } from "@/components/dashboard";
import {
  getReportsData,
  ReportsWorkspace,
} from "@/components/reports";

export default async function ReportsPage() {
  const data = await getReportsData();

  return (
    <DashboardShell user={data.user}>
      <ReportsWorkspace data={data} />
    </DashboardShell>
  );
}
