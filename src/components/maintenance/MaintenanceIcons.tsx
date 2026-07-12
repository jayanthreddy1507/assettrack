import type { SVGProps } from "react";

export type MaintenanceIconName =
  | "plus"
  | "pending"
  | "approved"
  | "technician"
  | "progress"
  | "resolved"
  | "close"
  | "edit";

export interface MaintenanceIconProps extends SVGProps<SVGSVGElement> {
  name: MaintenanceIconName;
  size?: number;
}

export function MaintenanceIcon({
  name,
  size = 17,
  ...props
}: MaintenanceIconProps) {
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

  const paths: Record<MaintenanceIconName, React.ReactNode> = {
    plus: <path d="M12 5v14M5 12h14" />,
    pending: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    approved: <path d="m5 12 4 4L19 6" />,
    technician: (
      <>
        <circle cx="9" cy="8" r="3" />
        <path d="M3 20c.5-3.7 2.5-5.5 6-5.5 1.5 0 2.7.3 3.7 1" />
        <path d="m14 18 2 2 5-5" />
      </>
    ),
    progress: (
      <>
        <path d="M12 3a9 9 0 1 1-6.4 2.7" />
        <path d="M3 3v5h5" />
      </>
    ),
    resolved: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="m8 12 3 3 5-6" />
      </>
    ),
    close: <path d="m6 6 12 12M18 6 6 18" />,
    edit: (
      <>
        <path d="m4 20 4.2-1 10.9-10.9a2 2 0 0 0-2.8-2.8L5.4 16.2 4 20Z" />
        <path d="m14.8 6.8 2.4 2.4" />
      </>
    ),
  };

  return (
    <svg {...shared} {...props}>
      {paths[name]}
    </svg>
  );
}
