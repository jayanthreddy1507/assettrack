"use client";

import { useEffect, useState } from "react";
import { Button, Input, Modal, Select } from "@/components/ui";
import type { AuditCycle } from "./audit.types";

export function AuditCycleModal({
  open,
  auditors,
  onClose,
  onSave,
}: {
  open: boolean;
  auditors: string[];
  onClose: () => void;
  onSave: (cycle: AuditCycle) => void;
}) {
  const [name, setName] = useState("");
  const [scope, setScope] = useState("");
  const [auditor, setAuditor] = useState(auditors[0] ?? "");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    setName("");
    setScope("");
    setAuditor(auditors[0] ?? "");
    setStartDate("");
    setEndDate("");
  }, [auditors, open]);

  function save() {
    if (!name.trim() || !scope.trim() || !startDate || !endDate) return;

    onSave({
      id: `audit-${Date.now()}`,
      name: name.trim(),
      scope: scope.trim(),
      auditors: [auditor],
      startDate,
      endDate,
      status: "SCHEDULED",
      items: [],
    });
  }

  return (
    <Modal
      open={open}
      title="New Audit Cycle"
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save}>Create Audit Cycle</Button>
        </>
      }
    >
      <div className="audit-form-grid">
        <Input
          id="audit-name"
          label="Audit Name"
          placeholder="Q3 Audit - Engineering"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <Input
          id="audit-scope"
          label="Scope"
          placeholder="Engineering Department"
          value={scope}
          onChange={(event) => setScope(event.target.value)}
        />
        <Select
          id="audit-auditor"
          label="Auditor"
          value={auditor}
          options={auditors.map((item) => ({
            label: item,
            value: item,
          }))}
          onChange={(event) => setAuditor(event.target.value)}
        />
        <Input
          id="audit-start"
          type="date"
          label="Start Date"
          value={startDate}
          onChange={(event) => setStartDate(event.target.value)}
        />
        <Input
          id="audit-end"
          type="date"
          label="End Date"
          value={endDate}
          onChange={(event) => setEndDate(event.target.value)}
        />
      </div>
    </Modal>
  );
}
