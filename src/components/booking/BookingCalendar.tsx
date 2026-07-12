import type {
  BookingResource,
  ResourceBooking,
} from "./booking.types";

const startHour = 9;
const endHour = 17;
const slotHeight = 56;

function timeToMinutes(time: string) {
  const [hour, minute] = time.split(":").map(Number);
  return hour * 60 + minute;
}

function bookingStyle(booking: ResourceBooking) {
  const top =
    ((timeToMinutes(booking.startTime) - startHour * 60) / 60) *
    slotHeight;
  const height =
    ((timeToMinutes(booking.endTime) -
      timeToMinutes(booking.startTime)) /
      60) *
    slotHeight;

  return {
    top: `${top}px`,
    height: `${Math.max(height, 42)}px`,
  };
}

export interface BookingCalendarProps {
  resource?: BookingResource;
  date: string;
  bookings: ResourceBooking[];
}

export function BookingCalendar({
  resource,
  date,
  bookings,
}: BookingCalendarProps) {
  const visibleBookings = bookings.filter(
    (booking) =>
      booking.resourceId === resource?.id &&
      booking.date === date
  );

  const dateLabel = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));

  const hours = Array.from(
    { length: endHour - startHour + 1 },
    (_, index) => startHour + index
  );

  return (
    <section className="booking-calendar-panel">
      <header className="booking-calendar-panel__header">
        <div>
          <strong>{dateLabel}</strong>
          <span>{resource?.name || "Select a resource"}</span>
        </div>

        <div className="booking-calendar-view-switch">
          <button type="button" data-active="true">Day</button>
          <button type="button">Week</button>
          <button type="button">Month</button>
        </div>
      </header>

      <div className="booking-calendar-body">
        <div className="booking-time-column">
          {hours.map((hour) => (
            <span key={hour}>
              {hour > 12 ? hour - 12 : hour}:00 {hour >= 12 ? "PM" : "AM"}
            </span>
          ))}
        </div>

        <div
          className="booking-timeline"
          style={{
            height: `${(endHour - startHour) * slotHeight}px`,
          }}
        >
          {hours.slice(0, -1).map((hour, index) => (
            <div
              key={hour}
              className="booking-hour-line"
              style={{ top: `${index * slotHeight}px` }}
            />
          ))}

          {visibleBookings.map((booking) => (
            <article
              key={booking.id}
              className="booking-event"
              data-status={booking.status}
              style={bookingStyle(booking)}
            >
              <strong>{booking.title}</strong>
              <span>
                {booking.startTime} – {booking.endTime}
              </span>
              <small>{booking.bookedBy}</small>
              {booking.status === "OVERLAPPING" && (
                <em>Overlap</em>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
