"use client";

import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Input,
  Modal,
  Select,
  Textarea,
} from "@/components/ui";
import type {
  MaintenanceAsset,
  MaintenancePriority,
  MaintenanceRequest,
} from "./maintenance.types";

export interface MaintenanceRequestModalProps {
  open: boolean;
  assets: MaintenanceAsset[];
  onClose: () => void;
  onSave: (request: MaintenanceRequest) => void;
}

export function MaintenanceRequestModal({
  open,
  assets,
  onClose,
  onSave,
}: MaintenanceRequestModalProps) {
  const [assetId, setAssetId] = useState(assets[0]?.id ?? "");
  const [issue, setIssue] = useState("");
  const [description, setDescription] = useState("");
  const [requestedBy, setRequestedBy] = useState("");
  const [priority, setPriority] =
    useState<MaintenancePriority>("MEDIUM");
  const [error, setError] = useState("");

  useEffect(() => {
    setAssetId(assets[0]?.id ?? "");
    setIssue("");
    setDescription("");
    setRequestedBy("");
    setPriority("MEDIUM");
    setError("");
  }, [assets, open]);

  function handleSave() {
    if (!issue.trim()) {
      setError("Issue title is required.");
      return;
    }

    if (!requestedBy.trim()) {
      setError("Requester name is required.");
      return;
    }

    const asset = assets.find((item) => item.id === assetId);
    if (!asset) {
      setError("Select a valid asset.");
      return;
    }

    onSave({
      id: `maintenance-${Date.now()}`,
      requestId: `MR-${String(Date.now()).slice(-5)}`,
      assetId: asset.id,
      assetTag: asset.assetTag,
      assetName: asset.name,
      issue: issue.trim(),
      description: description.trim() || undefined,
      requestedBy: requestedBy.trim(),
      requestedOn: new Date().toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      priority,
      status: "PENDING",
    });
  }

  return (
    <Modal
      open={open}
      title="Raise Maintenance Request"
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Raise Request</Button>
        </>
      }
    >
      <div className="maintenance-form-grid">
        {error && (
          <div className="maintenance-form-grid__wide">
            <Alert tone="danger">{error}</Alert>
          </div>
        )}

        <Select
          id="maintenance-asset"
          label="Asset"
          value={assetId}
          options={assets.map((asset) => ({
            label: `${asset.assetTag} – ${asset.name}`,
            value: asset.id,
          }))}
          onChange={(event) => setAssetId(event.target.value)}
        />

        <Select
          id="maintenance-priority"
          label="Priority"
          value={priority}
          options={[
            { label: "Low", value: "LOW" },
            { label: "Medium", value: "MEDIUM" },
            { label: "High", value: "HIGH" },
            { label: "Critical", value: "CRITICAL" },
          ]}
          onChange={(event) =>
            setPriority(event.target.value as MaintenancePriority)
          }
        />

        <Input
          id="maintenance-requested-by"
          label="Requested By"
          placeholder="Priya Sharma"
          value={requestedBy}
          onChange={(event) => {
            setRequestedBy(event.target.value);
            setError("");
          }}
        />

        <Input
          id="maintenance-issue"
          label="Issue"
          placeholder="Battery not charging"
          value={issue}
          onChange={(event) => {
            setIssue(event.target.value);
            setError("");
          }}
        />

        <Textarea
          id="maintenance-description"
          className="maintenance-form-grid__wide"
          label="Description"
          placeholder="Describe the problem in detail..."
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </div>
    </Modal>
  );
}
