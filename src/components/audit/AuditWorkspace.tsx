"use client";

import { useState } from "react";
import { Button } from "@/components/ui";
import { AuditCycleModal } from "./AuditCycleModal";
import { AuditCycleTable } from "./AuditCycleTable";
import { AuditDetails } from "./AuditDetails";
import type {
  AuditCycle,
  AuditData,
  VerificationStatus,
} from "./audit.types";

export function AuditWorkspace({ data }: { data: AuditData }) {
  const [cycles, setCycles] = useState(data.cycles);
  const [selectedCycleId, setSelectedCycleId] = useState(
    data.cycles[0]?.id ?? ""
  );
  const [modalOpen, setModalOpen] = useState(false);

  const selectedCycle = cycles.find(
    (cycle) => cycle.id === selectedCycleId
  );

  function saveCycle(cycle: AuditCycle) {
    setCycles((current) => [cycle, ...current]);
    setSelectedCycleId(cycle.id);
    setModalOpen(false);
  }

  function updateVerification(
    itemId: string,
    status: VerificationStatus
  ) {
    setCycles((current) =>
      current.map((cycle) =>
        cycle.id === selectedCycleId
          ? {
              ...cycle,
              items: cycle.items.map((item) =>
                item.id === itemId
                  ? { ...item, verification: status }
                  : item
              ),
            }
          : cycle
      )
    );
  }

  function closeCycle() {
    setCycles((current) =>
      current.map((cycle) =>
        cycle.id === selectedCycleId
          ? { ...cycle, status: "CLOSED" }
          : cycle
      )
    );
  }

  return (
    <div className="audit-content">
      <header className="audit-page-header">
        <div>
          <h1>Audit Cycles</h1>
          <p>Manage scheduled audits and track discrepancies.</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          + New Audit Cycle
        </Button>
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
