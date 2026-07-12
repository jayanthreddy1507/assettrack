"use client";

export interface MiniCalendarProps {
  selectedDate: string;
  onChange: (date: string) => void;
}

function toIsoDate(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function MiniCalendar({
  selectedDate,
  onChange,
}: MiniCalendarProps) {
  const selected = new Date(`${selectedDate}T00:00:00`);
  const year = selected.getFullYear();
  const month = selected.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthLabel = new Intl.DateTimeFormat("en", {
    month: "long",
    year: "numeric",
  }).format(selected);

  const cells = Array.from(
    { length: 42 },
    (_, index) => index - firstDay + 1
  );

  return (
    <div className="booking-mini-calendar">
      <div className="booking-mini-calendar__header">
        <button
          type="button"
          onClick={() =>
            onChange(toIsoDate(year, month - 1, 1))
          }
        >
          ‹
        </button>
        <strong>{monthLabel}</strong>
        <button
          type="button"
          onClick={() =>
            onChange(toIsoDate(year, month + 1, 1))
          }
        >
          ›
        </button>
      </div>

      <div className="booking-mini-calendar__weekdays">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>

      <div className="booking-mini-calendar__grid">
        {cells.map((day, index) => {
          const valid = day >= 1 && day <= daysInMonth;
          const value = valid ? toIsoDate(year, month, day) : "";
          const active = value === selectedDate;

          return (
            <button
              key={index}
              type="button"
              disabled={!valid}
              data-active={active}
              onClick={() => valid && onChange(value)}
            >
              {valid ? day : ""}
            </button>
          );
        })}
      </div>
    </div>
  );
}
