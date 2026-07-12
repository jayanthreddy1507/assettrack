export const colors = {
  palette: {
    sky: "#99CDD8",
    mint: "#DAEBE3",
    cream: "#FDE8D3",
    peach: "#F3C3B2",
    sage: "#CFD6C4",
    forest: "#657166",
  },

  background: {
    page: "#F7FAF8",
    soft: "#EFF6F2",
    sidebar: "#EAF3EE",
    overlay: "rgba(24, 33, 28, 0.44)",
  },

  surface: {
    default: "#FFFFFF",
    muted: "#F8FAF9",
    elevated: "#FFFFFF",
  },

  text: {
    primary: "#1F2923",
    secondary: "#657166",
    muted: "#8A958D",
    inverse: "#FFFFFF",
  },

  border: {
    default: "#DFE6E1",
    subtle: "#E9EFEB",
    strong: "#C9D3CC",
  },

  semantic: {
    success: "#5F8D76",
    successSoft: "#E5F2EB",
    warning: "#B88043",
    warningSoft: "#FDE8D3",
    danger: "#C86F63",
    dangerSoft: "#FCE6E1",
    info: "#5797A5",
    infoSoft: "#E3F2F5",
  },
} as const;

export const typography = {
  fontFamily: {
    sans: '"Inter", "Aptos", "Segoe UI", Arial, sans-serif',
    mono: '"JetBrains Mono", "SFMono-Regular", Consolas, monospace',
  },
  fontSize: {
    xs: "0.75rem",
    sm: "0.8125rem",
    md: "0.875rem",
    base: "1rem",
    lg: "1.125rem",
    xl: "1.375rem",
    "2xl": "1.75rem",
    "3xl": "2.25rem",
  },
  fontWeight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.7,
  },
} as const;

export const spacing = {
  0: "0",
  1: "0.25rem",
  2: "0.5rem",
  3: "0.75rem",
  4: "1rem",
  5: "1.25rem",
  6: "1.5rem",
  8: "2rem",
  10: "2.5rem",
  12: "3rem",
  16: "4rem",
} as const;

export const radii = {
  xs: "6px",
  sm: "8px",
  md: "12px",
  lg: "16px",
  xl: "20px",
  "2xl": "24px",
  pill: "999px",
} as const;

export const shadows = {
  xs: "0 1px 2px rgba(31, 41, 35, 0.04)",
  sm: "0 4px 14px rgba(31, 41, 35, 0.06)",
  md: "0 10px 30px rgba(31, 41, 35, 0.09)",
  lg: "0 20px 50px rgba(31, 41, 35, 0.13)",
} as const;

export const layout = {
  contentMaxWidth: "1440px",
  sidebarWidth: "232px",
  sidebarCollapsedWidth: "76px",
  topbarHeight: "68px",
  mobileBreakpoint: "768px",
  tabletBreakpoint: "1024px",
} as const;

export const motion = {
  fast: "140ms",
  normal: "220ms",
  slow: "320ms",
  easing: "cubic-bezier(0.22, 1, 0.36, 1)",
} as const;

export const zIndex = {
  dropdown: 20,
  sticky: 30,
  overlay: 40,
  modal: 50,
  toast: 60,
} as const;

export const theme = {
  colors,
  typography,
  spacing,
  radii,
  shadows,
  layout,
  motion,
  zIndex,
} as const;

export type Theme = typeof theme;
