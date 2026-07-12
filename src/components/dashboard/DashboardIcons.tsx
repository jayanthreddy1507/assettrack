import type { SVGProps } from "react";

export type DashboardIconName =
  | "dashboard"
  | "assets"
  | "allocation"
  | "bookings"
  | "maintenance"
  | "audits"
  | "reports"
  | "organization"
  | "notifications"
  | "settings"
  | "search"
  | "bell"
  | "plus"
  | "calendar"
  | "tool"
  | "arrowUp"
  | "arrowDown"
  | "menu"
  | "logout";

export interface DashboardIconProps extends SVGProps<SVGSVGElement> {
  name: DashboardIconName;
  size?: number;
}

export function DashboardIcon({ name, size = 18, ...props }: DashboardIconProps) {
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

  const paths: Record<DashboardIconName, React.ReactNode> = {
    dashboard: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </>
    ),
    assets: (
      <>
        <path d="M4 7.5 12 3l8 4.5v9L12 21l-8-4.5v-9Z" />
        <path d="m4 7.5 8 4.5 8-4.5M12 12v9" />
      </>
    ),
    allocation: (
      <>
        <circle cx="8" cy="7" r="3" />
        <circle cx="17" cy="8" r="2.5" />
        <path d="M3 19c.5-3.3 2.3-5 5-5s4.5 1.7 5 5" />
        <path d="M14 18c.4-2.4 1.7-3.7 4-3.7 1.5 0 2.6.6 3.2 1.7" />
      </>
    ),
    bookings: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M8 3v4M16 3v4M3 10h18" />
      </>
    ),
    maintenance: (
      <>
        <path d="m14.7 6.3 3-3a4 4 0 0 1-5.2 5.2L5 16l3 3 7.5-7.5a4 4 0 0 1 5.2-5.2l-3 3" />
      </>
    ),
    audits: (
      <>
        <rect x="5" y="3" width="14" height="18" rx="2" />
        <path d="M9 3.5h6V7H9zM8 12h8M8 16h5" />
      </>
    ),
    reports: (
      <>
        <path d="M6 2h9l4 4v16H6z" />
        <path d="M14 2v5h5M9 17v-4M13 17V9M17 17v-7" />
      </>
    ),
    organization: (
      <>
        <path d="M4 21V8h16v13M8 8V4h8v4" />
        <path d="M8 12h2M14 12h2M8 16h2M14 16h2M11 21v-3h2v3" />
      </>
    ),
    notifications: (
      <>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
        <path d="M10 21h4" />
      </>
    ),
    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21h-4v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3v-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.5V3h4v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.5 1h.1v4h-.1a1.7 1.7 0 0 0-1.5 1Z" />
      </>
    ),
    search: (
      <>
        <circle cx="11" cy="11" r="6.5" />
        <path d="m16 16 4 4" />
      </>
    ),
    bell: (
      <>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
        <path d="M10 21h4" />
      </>
    ),
    plus: <path d="M12 5v14M5 12h14" />,
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M8 3v4M16 3v4M3 10h18" />
      </>
    ),
    tool: (
      <>
        <path d="m14.7 6.3 3-3a4 4 0 0 1-5.2 5.2L5 16l3 3 7.5-7.5a4 4 0 0 1 5.2-5.2l-3 3" />
      </>
    ),
    arrowUp: <path d="m18 15-6-6-6 6" />,
    arrowDown: <path d="m6 9 6 6 6-6" />,
    menu: (
      <>
        <path d="M4 7h16M4 12h16M4 17h16" />
      </>
    ),
    logout: (
      <>
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
      </>
    ),
  };

  return (
    <svg {...shared} {...props}>
      {paths[name]}
    </svg>
  );
}
