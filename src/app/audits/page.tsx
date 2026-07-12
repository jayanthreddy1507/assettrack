import { DashboardShell } from "@/components/dashboard";
import {
  AuditWorkspace,
  getAuditData,
} from "@/components/audit";

export default async function AuditsPage() {
  const data = await getAuditData();

  return (
    <DashboardShell user={data.user}>
      <AuditWorkspace data={data} />
    </DashboardShell>
  );
}
