"use client";

import { useState } from "react";
import { Alert, Button, Select, Textarea } from "@/components/ui";
import type {
  AllocationAsset,
  ReturnRequest,
} from "./allocation.types";
import { AllocationIcon } from "./AllocationIcons";

export interface ReturnAssetPanelProps {
  assets: AllocationAsset[];
  onReturn: (request: ReturnRequest) => void;
}

export function ReturnAssetPanel({
  assets,
  onReturn,
}: ReturnAssetPanelProps) {
  const allocatedAssets = assets.filter((asset) => asset.currentHolderId);
  const [assetId, setAssetId] = useState(allocatedAssets[0]?.id ?? "");
  const [condition, setCondition] = useState("GOOD");
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState("");

  const selectedAsset = allocatedAssets.find((asset) => asset.id === assetId);

  function handleReturn() {
    if (!selectedAsset) {
      setMessage("Select an allocated asset.");
      return;
    }

    onReturn({
      id: `return-${Date.now()}`,
      assetId: selectedAsset.id,
      assetTag: selectedAsset.assetTag,
      assetName: selectedAsset.name,
      holderName: selectedAsset.currentHolderName || "Unknown",
      returnedOn: new Date().toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      condition,
      notes: notes.trim() || undefined,
    });

    setMessage("Asset return recorded successfully.");
  }

  return (
    <section className="allocation-return-panel">
      <h3>Return Asset</h3>

      {message && (
        <Alert tone="success">{message}</Alert>
      )}

      <Select
        id="return-asset"
        label="Allocated Asset"
        value={assetId}
        options={allocatedAssets.map((asset) => ({
          label: `${asset.assetTag} – ${asset.name} – ${asset.currentHolderName}`,
          value: asset.id,
        }))}
        onChange={(event) => setAssetId(event.target.value)}
      />

      <Select
        id="return-condition"
        label="Check-in Condition"
        value={condition}
        options={[
          { label: "New", value: "NEW" },
          { label: "Good", value: "GOOD" },
          { label: "Fair", value: "FAIR" },
          { label: "Poor", value: "POOR" },
          { label: "Damaged", value: "DAMAGED" },
        ]}
        onChange={(event) => setCondition(event.target.value)}
      />

      <Textarea
        id="return-notes"
        label="Return Notes"
        placeholder="Add condition notes or missing accessory details..."
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
      />

      <Button
        leftIcon={<AllocationIcon name="return" size={15} />}
        onClick={handleReturn}
      >
        Mark as Returned
      </Button>
    </section>
  );
}
