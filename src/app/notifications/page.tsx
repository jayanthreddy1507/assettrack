import { DashboardShell } from "@/components/dashboard";
import {
  getNotificationsData,
  NotificationsWorkspace,
} from "@/components/notifications";

export default async function NotificationsPage() {
  const data = await getNotificationsData();

  return (
    <DashboardShell user={data.user}>
      <NotificationsWorkspace data={data} />
    </DashboardShell>
  );
}
