import type { SVGProps } from "react";

export type BookingIconName =
  | "plus"
  | "calendar"
  | "clock"
  | "room"
  | "vehicle"
  | "equipment"
  | "left"
  | "right"
  | "close";

export interface BookingIconProps extends SVGProps<SVGSVGElement> {
  name: BookingIconName;
  size?: number;
}

export function BookingIcon({
  name,
  size = 17,
  ...props
}: BookingIconProps) {
  const shared = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  const paths: Record<BookingIconName, React.ReactNode> = {
    plus: <path d="M12 5v14M5 12h14" />,
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M8 3v4M16 3v4M3 10h18" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    room: (
      <>
        <path d="M4 21V5h16v16M8 9h8M8 13h8M8 17h4" />
      </>
    ),
    vehicle: (
      <>
        <path d="M5 17h14l-1-7H6l-1 7Z" />
        <path d="M7 10l1-4h8l1 4M7 17v2M17 17v2" />
        <circle cx="8" cy="15" r="1" />
        <circle cx="16" cy="15" r="1" />
      </>
    ),
    equipment: (
      <>
        <rect x="4" y="5" width="16" height="11" rx="2" />
        <path d="M9 20h6M12 16v4" />
      </>
    ),
    left: <path d="m15 18-6-6 6-6" />,
    right: <path d="m9 18 6-6-6-6" />,
    close: <path d="m6 6 12 12M18 6 6 18" />,
  };

  return (
    <svg {...shared} {...props}>
      {paths[name]}
    </svg>
  );
}
