import type { SVGProps } from "react";

export type AllocationIconName =
  | "user"
  | "arrow"
  | "return"
  | "history"
  | "calendar"
  | "check"
  | "alert"
  | "transfer";

export interface AllocationIconProps
  extends SVGProps<SVGSVGElement> {
  name: AllocationIconName;
  size?: number;
}

export function AllocationIcon({
  name,
  size = 17,
  ...props
}: AllocationIconProps) {
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

  const paths: Record<AllocationIconName, React.ReactNode> = {
    user: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4.5 21c.8-4.3 3.3-6.5 7.5-6.5s6.7 2.2 7.5 6.5" />
      </>
    ),
    arrow: <path d="M5 12h14M14 7l5 5-5 5" />,
    return: <path d="M9 8 4 12l5 4M4 12h11a5 5 0 0 1 5 5v1" />,
    history: (
      <>
        <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
        <path d="M3 3v5h5M12 7v5l3 2" />
      </>
    ),
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M8 3v4M16 3v4M3 10h18" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    alert: (
      <>
        <path d="M12 3 2.8 20h18.4L12 3Z" />
        <path d="M12 9v5M12 17h.01" />
      </>
    ),
    transfer: (
      <>
        <path d="M7 7h12l-3-3M17 17H5l3 3" />
      </>
    ),
  };

  return (
    <svg {...shared} {...props}>
      {paths[name]}
    </svg>
  );
}
