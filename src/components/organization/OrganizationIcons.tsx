import type { SVGProps } from "react";

export type OrganizationIconName =
  | "plus"
  | "edit"
  | "deactivate"
  | "building"
  | "category"
  | "employee"
  | "users"
  | "assets";

export interface OrganizationIconProps
  extends SVGProps<SVGSVGElement> {
  name: OrganizationIconName;
  size?: number;
}

export function OrganizationIcon({
  name,
  size = 17,
  ...props
}: OrganizationIconProps) {
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

  const paths: Record<OrganizationIconName, React.ReactNode> = {
    plus: <path d="M12 5v14M5 12h14" />,
    edit: (
      <>
        <path d="m4 20 4.2-1 10.9-10.9a2 2 0 0 0-2.8-2.8L5.4 16.2 4 20Z" />
        <path d="m14.8 6.8 2.4 2.4" />
      </>
    ),
    deactivate: (
      <>
        <path d="M4 7h16M9 7V4h6v3M7 7l1 13h8l1-13" />
        <path d="M10 11v5M14 11v5" />
      </>
    ),
    building: (
      <>
        <path d="M4 21V8h16v13M8 8V4h8v4" />
        <path d="M8 12h2M14 12h2M8 16h2M14 16h2M11 21v-3h2v3" />
      </>
    ),
    category: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </>
    ),
    employee: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4.5 21c.8-4.3 3.3-6.5 7.5-6.5s6.7 2.2 7.5 6.5" />
      </>
    ),
    users: (
      <>
        <circle cx="8" cy="8" r="3" />
        <circle cx="17" cy="9" r="2.5" />
        <path d="M2.8 20c.5-3.8 2.3-5.7 5.2-5.7s4.7 1.9 5.2 5.7M14 19c.4-2.7 1.8-4.1 4.2-4.1 1.5 0 2.6.6 3.2 1.8" />
      </>
    ),
    assets: (
      <>
        <path d="M4 7.5 12 3l8 4.5v9L12 21l-8-4.5v-9Z" />
        <path d="m4 7.5 8 4.5 8-4.5M12 12v9" />
      </>
    ),
  };

  return (
    <svg {...shared} {...props}>
      {paths[name]}
    </svg>
  );
}
