"use client";

import { useState } from "react";
import { Button } from "@/components/ui";
import { apiRequest } from "@/lib/api-client";
import { BookingCalendar } from "./BookingCalendar";
import { BookingFormModal } from "./BookingFormModal";
import { BookingIcon } from "./BookingIcons";
import { BookingLegend } from "./BookingLegend";
import { MiniCalendar } from "./MiniCalendar";
import { ResourceSelector } from "./ResourceSelector";
import type { BookingData, ResourceBooking } from "./booking.types";

export function BookingWorkspace({ data }: { data: BookingData }) {
  const [resourceId, setResourceId] = useState(data.resources[0]?.id ?? "");
  const [selectedDate, setSelectedDate] = useState(data.defaultDate);
  const [bookings, setBookings] = useState(data.bookings);
  const [formOpen, setFormOpen] = useState(false);

  const selectedResource = data.resources.find((resource) => resource.id === resourceId);

  async function saveBooking(booking: ResourceBooking) {
    try {
      const next = await apiRequest<BookingData>("/api/bookings", {
        method: "POST",
        body: JSON.stringify({
          resourceId: booking.resourceId,
          title: booking.title,
          date: booking.date,
          startTime: booking.startTime,
          endTime: booking.endTime,
          notes: booking.notes,
        }),
      });
      setBookings(next.bookings);
      setResourceId(booking.resourceId);
      setSelectedDate(booking.date);
      setFormOpen(false);
    } catch (error) {
      window.alert(
        error instanceof Error ? error.message : "Booking could not be created.",
      );
    }
  }

  return (
    <div className="booking-content">
      <header className="booking-page-header">
        <div>
          <h1>Resource Booking</h1>
          <p>Book shared resources by time slot.</p>
        </div>

        <Button
          leftIcon={<BookingIcon name="plus" size={16} />}
          onClick={() => setFormOpen(true)}
        >
          New Booking
        </Button>
      </header>

      <section className="booking-workspace">
        <aside className="booking-sidebar-panel">
          <ResourceSelector
            resourceId={resourceId}
            resources={data.resources}
            onChange={setResourceId}
          />

          <MiniCalendar selectedDate={selectedDate} onChange={setSelectedDate} />

          {selectedResource && (
            <div className="booking-resource-summary">
              <span>{selectedResource.type}</span>
              <strong>{selectedResource.name}</strong>
              <small>{selectedResource.location || "No location"}</small>
              {selectedResource.capacity && (
                <small>Capacity: {selectedResource.capacity}</small>
              )}
            </div>
          )}
        </aside>

        <div className="booking-main-panel">
          <BookingCalendar
            resource={selectedResource}
            date={selectedDate}
            bookings={bookings}
          />
          <BookingLegend />
        </div>
      </section>

      <BookingFormModal
        open={formOpen}
        resources={data.resources}
        bookings={bookings}
        defaultResourceId={resourceId}
        defaultDate={selectedDate}
        onClose={() => setFormOpen(false)}
        onSave={saveBooking}
      />
    </div>
  );
}
