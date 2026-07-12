import type { DashboardUser } from "@/components/dashboard";

export type BookingStatus =
  | "UPCOMING"
  | "ONGOING"
  | "COMPLETED"
  | "CANCELLED"
  | "PENDING"
  | "OVERLAPPING";

export interface BookingResource {
  id: string;
  name: string;
  type: "ROOM" | "VEHICLE" | "EQUIPMENT";
  location?: string;
  capacity?: number;
  colorTone: "mint" | "sky" | "cream" | "peach" | "sage";
}

export interface ResourceBooking {
  id: string;
  resourceId: string;
  resourceName: string;
  title: string;
  bookedBy: string;
  date: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  notes?: string;
}

export interface BookingData {
  user: DashboardUser;
  resources: BookingResource[];
  bookings: ResourceBooking[];
}
