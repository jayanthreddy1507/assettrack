export const COLORS = {
  background: "#DAEBE3",
  surface: "#FDEBD3",
  surfaceSoft: "#CFD6C4",
  accent: "#99CDD8",
  accentSoft: "#F3C3B2",
  primary: "#657166",
  primaryHover: "#566158",
  text: "#26302A",
  textMuted: "#657166",
  white: "#FFFFFF",
  border: "rgba(101, 113, 102, 0.28)",
  shadow: "rgba(61, 73, 64, 0.18)",
  danger: "#B85C5C",
} as const;

export const FONTS = {
  primary: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  heading: 'Poppins, Inter, ui-sans-serif, system-ui, sans-serif',
} as const;

export const FONT_SIZES = {
  xs: "0.75rem",
  sm: "0.875rem",
  base: "1rem",
  lg: "1.125rem",
  xl: "1.25rem",
  xxl: "1.75rem",
  hero: "2.25rem",
} as const;

export const SPACING = {
  xs: "0.375rem",
  sm: "0.625rem",
  md: "1rem",
  lg: "1.5rem",
  xl: "2rem",
  xxl: "3rem",
} as const;

export const RADIUS = {
  sm: "10px",
  md: "16px",
  lg: "24px",
  xl: "32px",
  pill: "999px",
} as const;

export const SHADOWS = {
  card: "0 24px 60px rgba(61, 73, 64, 0.18)",
  input: "0 8px 20px rgba(61, 73, 64, 0.08)",
  button: "0 12px 24px rgba(101, 113, 102, 0.24)",
} as const;

export const LAYOUT = {
  maxPageWidth: "1200px",
  authCardWidth: "460px",
  inputHeight: "52px",
  buttonHeight: "52px",
} as const;

export const APP_ROUTES = {
  auth: "/auth",
  dashboard: "/dashboard",
  forgotPassword: "/forgot-password",
} as const;
