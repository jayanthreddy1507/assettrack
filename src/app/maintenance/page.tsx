import { DashboardShell } from "@/components/dashboard";
import {
  getMaintenanceData,
  MaintenanceWorkspace,
} from "@/components/maintenance";

export default async function MaintenancePage() {
  const data = await getMaintenanceData();

  return (
    <DashboardShell user={data.user}>
      <MaintenanceWorkspace data={data} />
    </DashboardShell>
  );
}
