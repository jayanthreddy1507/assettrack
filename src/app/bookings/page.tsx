import { DashboardShell } from "@/components/dashboard";
import {
  BookingWorkspace,
  getBookingData,
} from "@/components/booking";

export default async function BookingsPage() {
  const data = await getBookingData();

  return (
    <DashboardShell user={data.user}>
      <BookingWorkspace data={data} />
    </DashboardShell>
  );
}
