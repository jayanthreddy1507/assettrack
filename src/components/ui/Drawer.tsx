"use client";

import type { ReactNode } from "react";

export interface DrawerProps {
  open: boolean;
  children: ReactNode;
  onClose: () => void;
}

export function Drawer({ open, children, onClose }: DrawerProps) {
  if (!open) return null;

  return (
    <>
      <div className="ui-overlay" onClick={onClose} />
      <aside className="ui-drawer" role="dialog" aria-modal="true">
        {children}
      </aside>
    </>
  );
}
