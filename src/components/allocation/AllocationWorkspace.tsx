"use client";

import { useState } from "react";
import { apiRequest } from "@/lib/api-client";
import { AllocateAssetPanel } from "./AllocateAssetPanel";
import { AllocationHistoryPanel } from "./AllocationHistoryPanel";
import { AllocationTabs } from "./AllocationTabs";
import { ReturnAssetPanel } from "./ReturnAssetPanel";
import { TransferRequestsPanel } from "./TransferRequestsPanel";
import type {
  AllocationData,
  AllocationTab,
  ReturnRequest,
  TransferRequest,
  TransferStatus,
} from "./allocation.types";

export function AllocationWorkspace({ data }: { data: AllocationData }) {
  const [activeTab, setActiveTab] = useState<AllocationTab>("allocate");
  const [assets, setAssets] = useState(data.assets);
  const [transfers, setTransfers] = useState(data.transfers);
  const [returns, setReturns] = useState(data.returns);
  const [history, setHistory] = useState(data.history);

  function applyData(next: AllocationData) {
    setAssets(next.assets);
    setTransfers(next.transfers);
    setReturns(next.returns);
    setHistory(next.history);
  }

  async function mutate(body: unknown) {
    try {
      applyData(
        await apiRequest<AllocationData>("/api/allocations", {
          method: "POST",
          body: JSON.stringify(body),
        }),
      );
    } catch (error) {
      window.alert(
        error instanceof Error ? error.message : "Allocation could not be updated.",
      );
    }
  }

  function addTransfer(transfer: TransferRequest) {
    return mutate({
      action: "createTransfer",
      assetId: transfer.assetId,
      toEmployeeId: transfer.toUserId,
      reason: transfer.reason,
    });
  }

  function updateTransferStatus(id: string, status: TransferStatus) {
    if (status !== "REQUESTED") void mutate({ action: "setTransferStatus", id, status });
  }

  function allocateAsset(assetId: string, userId: string, expectedReturn?: string) {
    void mutate({ action: "allocate", assetId, employeeId: userId, expectedReturn });
  }

  function returnAsset(request: ReturnRequest) {
    void mutate({
      action: "return",
      assetId: request.assetId,
      condition: request.condition,
      notes: request.notes,
    });
  }

  return (
    <div className="allocation-content">
      <header className="allocation-page-header">
        <h1>Asset Allocation &amp; Transfer</h1>
        <p>Allocate assets to employees or departments.</p>
      </header>

      <section className="allocation-workspace">
        <AllocationTabs activeTab={activeTab} onChange={setActiveTab} />

        <div className="allocation-tab-panel">
          {activeTab === "allocate" && (
            <AllocateAssetPanel
              assets={assets}
              people={data.people}
              onAddTransfer={addTransfer}
              onAllocate={allocateAsset}
            />
          )}

          {activeTab === "transfers" && (
            <TransferRequestsPanel
              transfers={transfers}
              onUpdateStatus={updateTransferStatus}
            />
          )}

          {activeTab === "return" && (
            <ReturnAssetPanel assets={assets} onReturn={returnAsset} />
          )}

          {activeTab === "history" && <AllocationHistoryPanel history={history} />}
        </div>
      </section>
    </div>
  );
}
