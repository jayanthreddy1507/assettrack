"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Avatar, IconButton } from "@/components/ui";
import type { DashboardUser } from "./dashboard.types";
import { DashboardIcon } from "./DashboardIcons";

export interface DashboardTopbarProps {
  user: DashboardUser;
  onOpenMenu?: () => void;
}

export function DashboardTopbar({ user, onOpenMenu }: DashboardTopbarProps) {
  const [query, setQuery] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    router.push("/auth/login");
  };

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

      <div
        className="dashboard-topbar__actions"
        ref={dropdownRef}
        style={{ position: "relative" }}
      >
        <button
          type="button"
          className="dashboard-profile"
          onClick={() => setProfileOpen(!profileOpen)}
        >
          <Avatar name={user.name} size="sm" />
          <span className="dashboard-profile__copy">
            <strong>{user.name}</strong>
            <small>{user.role}</small>
          </span>
        </button>

        {profileOpen && (
          <div
            className="ui-card"
            style={{
              position: "absolute",
              top: "calc(100% + 8px)",
              right: 0,
              width: "180px",
              padding: "8px",
              zIndex: 50,
            }}
          >
            <button
              onClick={handleLogout}
              className="ui-button ui-button--ghost ui-button--full"
              style={{
                justifyContent: "flex-start",
                color: "var(--danger)",
                gap: "12px",
              }}
            >
              <DashboardIcon name="logout" size={16} />
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
