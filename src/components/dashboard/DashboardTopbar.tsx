"use client";

import { useState } from "react";
import { Avatar, IconButton } from "@/components/ui";
import type { DashboardUser } from "./dashboard.types";
import { DashboardIcon } from "./DashboardIcons";

export interface DashboardTopbarProps {
  user: DashboardUser;
  onOpenMenu?: () => void;
}

export function DashboardTopbar({
  user,
  onOpenMenu,
}: DashboardTopbarProps) {
  const [query, setQuery] = useState("");

  return (
    <header className="dashboard-topbar">
      <div className="dashboard-topbar__mobile">
        <IconButton
          label="Open navigation"
          icon={<DashboardIcon name="menu" />}
          onClick={onOpenMenu}
        />
      </div>

      <label className="dashboard-search">
        <DashboardIcon name="search" size={16} />
        <span className="sr-only">Search</span>
        <input
          type="search"
          placeholder="Search anything..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>

      <div className="dashboard-topbar__actions">
        <button
          type="button"
          className="dashboard-notification-button"
          aria-label="Open notifications"
        >
          <DashboardIcon name="bell" />
          <span aria-hidden="true" />
        </button>

        <button type="button" className="dashboard-profile">
          <Avatar name={user.name} size="sm" />
          <span className="dashboard-profile__copy">
            <strong>{user.name}</strong>
            <small>{user.role}</small>
          </span>
        </button>
      </div>
    </header>
  );
}
