import type { SVGProps } from "react";

export type AssetIconName =
  | "plus"
  | "search"
  | "eye"
  | "edit"
  | "close"
  | "asset"
  | "filter";

export interface AssetIconProps extends SVGProps<SVGSVGElement> {
  name: AssetIconName;
  size?: number;
}

export function AssetIcon({
  name,
  size = 17,
  ...props
}: AssetIconProps) {
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

  const paths: Record<AssetIconName, React.ReactNode> = {
    plus: <path d="M12 5v14M5 12h14" />,
    search: (
      <>
        <circle cx="11" cy="11" r="6.5" />
        <path d="m16 16 4 4" />
      </>
    ),
    eye: (
      <>
        <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6S2.5 12 2.5 12Z" />
        <circle cx="12" cy="12" r="2.5" />
      </>
    ),
    edit: (
      <>
        <path d="m4 20 4.2-1 10.9-10.9a2 2 0 0 0-2.8-2.8L5.4 16.2 4 20Z" />
        <path d="m14.8 6.8 2.4 2.4" />
      </>
    ),
    close: <path d="m6 6 12 12M18 6 6 18" />,
    asset: (
      <>
        <path d="M4 7.5 12 3l8 4.5v9L12 21l-8-4.5v-9Z" />
        <path d="m4 7.5 8 4.5 8-4.5M12 12v9" />
      </>
    ),
    filter: (
      <>
        <path d="M4 6h16M7 12h10M10 18h4" />
      </>
    ),
  };

  return (
    <svg {...shared} {...props}>
      {paths[name]}
    </svg>
  );
}
