"use client";

import { useEffect, useState } from "react";
import { Alert, Button, Input, Select, Textarea } from "@/components/ui";
import type {
  AllocationAsset,
  AllocationPerson,
  TransferRequest,
} from "./allocation.types";
import { AllocationIcon } from "./AllocationIcons";
import { AllocationStatusCard } from "./AllocationStatusCard";

export interface AllocateAssetPanelProps {
  assets: AllocationAsset[];
  people: AllocationPerson[];
  onAddTransfer: (transfer: TransferRequest) => void;
  onAllocate: (assetId: string, userId: string, expectedReturn?: string) => void;
}

export function AllocateAssetPanel({
  assets,
  people,
  onAddTransfer,
  onAllocate,
}: AllocateAssetPanelProps) {
  const [assetId, setAssetId] = useState(assets[0]?.id ?? "");
  const [personId, setPersonId] = useState("");
  const [expectedReturn, setExpectedReturn] = useState("");
  const [notes, setNotes] = useState("");
  const [transferMode, setTransferMode] = useState(false);
  const [message, setMessage] = useState("");

  const selectedAsset = assets.find((asset) => asset.id === assetId);
  const selectedPerson = people.find((person) => person.id === personId);

  useEffect(() => {
    setTransferMode(false);
    setPersonId("");
    setNotes("");
    setMessage("");
  }, [assetId]);

  function handleSubmit() {
    if (!selectedAsset) {
      setMessage("Select an asset.");
      return;
    }

    if (!selectedPerson) {
      setMessage("Select an employee or department recipient.");
      return;
    }

    if (selectedAsset.currentHolderId && !transferMode) {
      setMessage("This asset is already allocated. Submit a transfer request instead.");
      return;
    }

    if (transferMode) {
      onAddTransfer({
        id: `transfer-${Date.now()}`,
        assetId: selectedAsset.id,
        assetTag: selectedAsset.assetTag,
        assetName: selectedAsset.name,
        fromUserId: selectedAsset.currentHolderId,
        fromUserName: selectedAsset.currentHolderName,
        toUserId: selectedPerson.id,
        toUserName: selectedPerson.name,
        reason: notes.trim() || "No reason provided.",
        requestedOn: new Date().toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
        status: "REQUESTED",
      });
      setMessage("Transfer request submitted successfully.");
      return;
    }

    onAllocate(selectedAsset.id, selectedPerson.id, expectedReturn || undefined);
    setMessage("Asset allocated successfully.");
  }

  return (
    <div className="allocation-main-grid">
      <section className="allocation-form-panel">
        <h3>{transferMode ? "Transfer Request" : "Allocate Asset"}</h3>

        {message && (
          <Alert
            tone={
              message.includes("successfully")
                ? "success"
                : "danger"
            }
          >
            {message}
          </Alert>
        )}

        <Select
          id="allocation-asset"
          label="Asset"
          value={assetId}
          options={assets.map((asset) => ({
            label: `${asset.assetTag} – ${asset.name} (${asset.categoryName || "Uncategorized"})`,
            value: asset.id,
          }))}
          onChange={(event) => setAssetId(event.target.value)}
        />

        {transferMode && selectedAsset?.currentHolderName && (
          <Input
            id="transfer-from"
            label="From"
            value={selectedAsset.currentHolderName}
            readOnly
          />
        )}

        <Select
          id="allocation-person"
          label={transferMode ? "Transfer To" : "Allocate To"}
          placeholder="Select employee..."
          value={personId}
          options={people
            .filter((person) => person.id !== selectedAsset?.currentHolderId)
            .map((person) => ({
              label: `${person.name}${person.departmentName ? ` – ${person.departmentName}` : ""}`,
              value: person.id,
            }))}
          onChange={(event) => setPersonId(event.target.value)}
        />

        {!transferMode && (
          <Input
            id="expected-return"
            type="date"
            label="Expected Return Date"
            value={expectedReturn}
            onChange={(event) => setExpectedReturn(event.target.value)}
          />
        )}

        <Textarea
          id="allocation-notes"
          label={transferMode ? "Reason" : "Notes"}
          placeholder={
            transferMode
              ? "Explain why the transfer is required..."
              : "Enter optional allocation notes..."
          }
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
        />

        <Button
          fullWidth
          leftIcon={
            <AllocationIcon
              name={transferMode ? "transfer" : "check"}
              size={15}
            />
          }
          onClick={handleSubmit}
        >
          {transferMode ? "Submit Transfer Request" : "Check & Allocate"}
        </Button>
      </section>

      <AllocationStatusCard
        asset={selectedAsset}
        onRequestTransfer={() => {
          setTransferMode(true);
          setMessage("");
        }}
      />
    </div>
  );
}
