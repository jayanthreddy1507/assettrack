import { type NextRequest } from "next/server";
import { z } from "zod";

import { created, ok } from "@/lib/api-response";
import { handleRouteError } from "@/lib/handle-route-error";
import { parseJsonBody } from "@/lib/request";
import { createBooking, getBookingData } from "@/repositories/workflows.repository";
import { requireApiAuth } from "@/server/auth/require-auth";

const bookingSchema = z.object({
  resourceId: z.uuid(),
  title: z.string().trim().min(1).max(200),
  date: z.string().date(),
  startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  endTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  notes: z.string().trim().max(2000).optional(),
});

export async function GET(request: NextRequest) {
  try {
    await requireApiAuth(request);
    return ok(await getBookingData());
  } catch (error) {
    return handleRouteError(error, "[GET /api/bookings]");
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireApiAuth(request);
    const input = await parseJsonBody(request, bookingSchema);
    if (input.startTime >= input.endTime)
      throw new Error("End time must be later than start time.");
    await createBooking(input, user.id);
    return created(await getBookingData(), "Booking created.");
  } catch (error) {
    return handleRouteError(error, "[POST /api/bookings]");
  }
}
