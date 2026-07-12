"use client";

import { useState } from "react";
import { Button } from "@/components/ui";
import { apiRequest } from "@/lib/api-client";
import { AuditCycleModal } from "./AuditCycleModal";
import { AuditCycleTable } from "./AuditCycleTable";
import { AuditDetails } from "./AuditDetails";
import type { AuditCycle, AuditData, VerificationStatus } from "./audit.types";

export function AuditWorkspace({ data }: { data: AuditData }) {
  const [cycles, setCycles] = useState(data.cycles);
  const [selectedCycleId, setSelectedCycleId] = useState(data.cycles[0]?.id ?? "");
  const [modalOpen, setModalOpen] = useState(false);

  const selectedCycle = cycles.find((cycle) => cycle.id === selectedCycleId);

  async function mutate(body: unknown) {
    try {
      const next = await apiRequest<AuditData>("/api/audits", {
        method: "POST",
        body: JSON.stringify(body),
      });
      setCycles(next.cycles);
      setSelectedCycleId((current) =>
        next.cycles.some((cycle) => cycle.id === current)
          ? current
          : (next.cycles[0]?.id ?? ""),
      );
      setModalOpen(false);
    } catch (error) {
      window.alert(
        error instanceof Error ? error.message : "Audit could not be updated.",
      );
    }
  }

  function saveCycle(cycle: AuditCycle) {
    return mutate({
      action: "create",
      name: cycle.name,
      scope: cycle.scope,
      auditorName: cycle.auditors[0],
      startDate: cycle.startDate,
      endDate: cycle.endDate,
    });
  }

  function updateVerification(itemId: string, status: VerificationStatus) {
    void mutate({ action: "verify", itemId, verification: status });
  }

  function closeCycle() {
    void mutate({ action: "close", cycleId: selectedCycleId });
  }

  return (
    <div className="audit-content">
      <header className="audit-page-header">
        <div>
          <h1>Audit Cycles</h1>
          <p>Manage scheduled audits and track discrepancies.</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>+ New Audit Cycle</Button>
      </header>

      <section className="audit-workspace">
        <AuditCycleTable
          cycles={cycles}
          onOpen={(cycle) => setSelectedCycleId(cycle.id)}
        />

        {selectedCycle && (
          <AuditDetails
            cycle={selectedCycle}
            onUpdateVerification={updateVerification}
            onCloseCycle={closeCycle}
          />
        )}
      </section>

      <AuditCycleModal
        open={modalOpen}
        auditors={data.auditorOptions}
        onClose={() => setModalOpen(false)}
        onSave={saveCycle}
      />
    </div>
  );
}
