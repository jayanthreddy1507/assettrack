import { dummyBookingData } from "./booking.data";
import type { BookingData } from "./booking.types";

export async function getBookingData(): Promise<BookingData> {
  return structuredClone(dummyBookingData);
}

/*
Prisma-ready example:

export async function getBookingData(): Promise<BookingData> {
  const [resources, bookings] = await Promise.all([
    prisma.asset.findMany({
      where: {
        deletedAt: null,
        isBookable: true,
      },
      select: {
        id: true,
        name: true,
        location: true,
        category: {
          select: { name: true },
        },
      },
      orderBy: { name: "asc" },
    }),

    prisma.resourceBooking.findMany({
      include: {
        resource: true,
        bookedBy: true,
      },
      orderBy: [
        { bookingDate: "asc" },
        { startTime: "asc" },
      ],
    }),
  ]);

  return {
    user: {
      name: "Department Head",
      role: "Department Head",
    },
    resources: resources.map(...),
    bookings: bookings.map(...),
  };
}

Your current Prisma schema may not yet include a ResourceBooking model.
Until it is added, continue using the dummy repository.
*/
