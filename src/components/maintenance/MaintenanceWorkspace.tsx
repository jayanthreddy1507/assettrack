"use client";

import { useState } from "react";
import { Button } from "@/components/ui";
import { apiRequest } from "@/lib/api-client";
import { MaintenanceIcon } from "./MaintenanceIcons";
import { MaintenanceKanban } from "./MaintenanceKanban";
import { MaintenanceRequestModal } from "./MaintenanceRequestModal";
import { MaintenanceTable } from "./MaintenanceTable";
import type {
  MaintenanceData,
  MaintenanceRequest,
  MaintenanceStatus,
} from "./maintenance.types";

const nextStatus: Partial<Record<MaintenanceStatus, MaintenanceStatus>> = {
  PENDING: "APPROVED",
  APPROVED: "TECHNICIAN_ASSIGNED",
  TECHNICIAN_ASSIGNED: "IN_PROGRESS",
  IN_PROGRESS: "RESOLVED",
};

export function MaintenanceWorkspace({ data }: { data: MaintenanceData }) {
  const [requests, setRequests] = useState(data.requests);
  const [view, setView] = useState<"table" | "kanban">("kanban");
  const [modalOpen, setModalOpen] = useState(false);

  async function mutate(body: unknown) {
    try {
      const next = await apiRequest<MaintenanceData>("/api/maintenance", {
        method: "POST",
        body: JSON.stringify(body),
      });
      setRequests(next.requests);
      setModalOpen(false);
    } catch (error) {
      window.alert(
        error instanceof Error ? error.message : "Maintenance could not be updated.",
      );
    }
  }

  function addRequest(request: MaintenanceRequest) {
    return mutate({
      action: "create",
      assetId: request.assetId,
      issue: request.issue,
      description: request.description,
      priority: request.priority,
    });
  }

  function advanceRequest(id: string) {
    const request = requests.find((item) => item.id === id);
    if (request && nextStatus[request.status]) void mutate({ action: "advance", id });
  }

  return (
    <div className="maintenance-content">
      <header className="maintenance-page-header">
        <div>
          <h1>Maintenance Requests</h1>
          <p>Raise and track maintenance requests.</p>
        </div>

        <div className="maintenance-page-actions">
          <div className="maintenance-view-toggle">
            <button
              type="button"
              data-active={view === "kanban"}
              onClick={() => setView("kanban")}
            >
              Kanban
            </button>
            <button
              type="button"
              data-active={view === "table"}
              onClick={() => setView("table")}
            >
              Table
            </button>
          </div>

          <Button
            leftIcon={<MaintenanceIcon name="plus" size={16} />}
            onClick={() => setModalOpen(true)}
          >
            Raise Request
          </Button>
        </div>
      </header>

      <section className="maintenance-workspace">
        {view === "kanban" ? (
          <MaintenanceKanban
            requests={requests}
            technicians={data.technicians}
            onAdvance={advanceRequest}
          />
        ) : (
          <MaintenanceTable requests={requests} />
        )}

        <div className="maintenance-workflow-note">
          Approving a request moves the asset to under maintenance. Resolving it returns
          the asset to available.
        </div>
      </section>

      <MaintenanceRequestModal
        open={modalOpen}
        assets={data.assets}
        onClose={() => setModalOpen(false)}
        onSave={addRequest}
      />
    </div>
  );
}
