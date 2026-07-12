import { DashboardShell } from "@/components/dashboard";
import {
  AllocationWorkspace,
  getAllocationData,
} from "@/components/allocation";

export default async function AllocationPage() {
  const data = await getAllocationData();

  return (
    <DashboardShell user={data.user}>
      <AllocationWorkspace data={data} />
    </DashboardShell>
  );
}
