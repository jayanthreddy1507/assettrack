"use client";

import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Input,
  Modal,
  Select,
  Textarea,
} from "@/components/ui";
import type {
  BookingResource,
  ResourceBooking,
} from "./booking.types";

function overlaps(
  existing: ResourceBooking,
  startTime: string,
  endTime: string
) {
  return startTime < existing.endTime && endTime > existing.startTime;
}

export interface BookingFormModalProps {
  open: boolean;
  resources: BookingResource[];
  bookings: ResourceBooking[];
  defaultResourceId: string;
  defaultDate: string;
  onClose: () => void;
  onSave: (booking: ResourceBooking) => void;
}

export function BookingFormModal({
  open,
  resources,
  bookings,
  defaultResourceId,
  defaultDate,
  onClose,
  onSave,
}: BookingFormModalProps) {
  const [resourceId, setResourceId] = useState(defaultResourceId);
  const [title, setTitle] = useState("");
  const [bookedBy, setBookedBy] = useState("");
  const [date, setDate] = useState(defaultDate);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setResourceId(defaultResourceId);
    setDate(defaultDate);
    setTitle("");
    setBookedBy("");
    setStartTime("09:00");
    setEndTime("10:00");
    setNotes("");
    setError("");
  }, [defaultDate, defaultResourceId, open]);

  function handleSave() {
    if (!title.trim()) {
      setError("Booking title is required.");
      return;
    }

    if (!bookedBy.trim()) {
      setError("Booked by is required.");
      return;
    }

    if (startTime >= endTime) {
      setError("End time must be later than start time.");
      return;
    }

    const conflicting = bookings.find(
      (booking) =>
        booking.resourceId === resourceId &&
        booking.date === date &&
        booking.status !== "CANCELLED" &&
        overlaps(booking, startTime, endTime)
    );

    if (conflicting) {
      setError(
        `${conflicting.resourceName} is already booked from ${conflicting.startTime} to ${conflicting.endTime}.`
      );
      return;
    }

    const resource = resources.find(
      (item) => item.id === resourceId
    );

    if (!resource) {
      setError("Select a valid resource.");
      return;
    }

    onSave({
      id: `booking-${Date.now()}`,
      resourceId,
      resourceName: resource.name,
      title: title.trim(),
      bookedBy: bookedBy.trim(),
      date,
      startTime,
      endTime,
      status: "UPCOMING",
      notes: notes.trim() || undefined,
    });
  }

  return (
    <Modal
      open={open}
      title="New Resource Booking"
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Book Resource</Button>
        </>
      }
    >
      <div className="booking-form-grid">
        {error && (
          <div className="booking-form-grid__wide">
            <Alert tone="danger">{error}</Alert>
          </div>
        )}

        <Select
          id="booking-form-resource"
          label="Resource"
          value={resourceId}
          options={resources.map((resource) => ({
            label: resource.name,
            value: resource.id,
          }))}
          onChange={(event) => {
            setResourceId(event.target.value);
            setError("");
          }}
        />

        <Input
          id="booking-title"
          label="Booking Title"
          placeholder="Team Standup"
          value={title}
          required
          onChange={(event) => {
            setTitle(event.target.value);
            setError("");
          }}
        />

        <Input
          id="booking-by"
          label="Booked By"
          placeholder="Priya Sharma"
          value={bookedBy}
          required
          onChange={(event) => {
            setBookedBy(event.target.value);
            setError("");
          }}
        />

        <Input
          id="booking-date"
          type="date"
          label="Date"
          value={date}
          onChange={(event) => {
            setDate(event.target.value);
            setError("");
          }}
        />

        <Input
          id="booking-start"
          type="time"
          label="Start Time"
          value={startTime}
          onChange={(event) => {
            setStartTime(event.target.value);
            setError("");
          }}
        />

        <Input
          id="booking-end"
          type="time"
          label="End Time"
          value={endTime}
          onChange={(event) => {
            setEndTime(event.target.value);
            setError("");
          }}
        />

        <Textarea
          id="booking-notes"
          className="booking-form-grid__wide"
          label="Notes"
          placeholder="Optional booking notes..."
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
        />
      </div>
    </Modal>
  );
}
