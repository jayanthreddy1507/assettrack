import { DashboardShell } from "@/components/dashboard";
import {
  getOrganizationData,
  OrganizationSetup,
} from "@/components/organization";

export default async function OrganizationPage() {
  const data = await getOrganizationData();

  return (
    <DashboardShell user={data.user}>
      <OrganizationSetup data={data} />
    </DashboardShell>
  );
}
