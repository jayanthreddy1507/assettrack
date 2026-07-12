"use client";

import { useState } from "react";
import { AllocateAssetPanel } from "./AllocateAssetPanel";
import { AllocationHistoryPanel } from "./AllocationHistoryPanel";
import { AllocationTabs } from "./AllocationTabs";
import { ReturnAssetPanel } from "./ReturnAssetPanel";
import { TransferRequestsPanel } from "./TransferRequestsPanel";
import type {
  AllocationData,
  AllocationHistoryItem,
  AllocationTab,
  ReturnRequest,
  TransferRequest,
  TransferStatus,
} from "./allocation.types";

export function AllocationWorkspace({
  data,
}: {
  data: AllocationData;
}) {
  const [activeTab, setActiveTab] =
    useState<AllocationTab>("allocate");
  const [assets, setAssets] = useState(data.assets);
  const [transfers, setTransfers] = useState(data.transfers);
  const [returns, setReturns] = useState(data.returns);
  const [history, setHistory] = useState(data.history);

  function addTransfer(transfer: TransferRequest) {
    setTransfers((current) => [transfer, ...current]);
  }

  function updateTransferStatus(
    id: string,
    status: TransferStatus
  ) {
    setTransfers((current) =>
      current.map((item) =>
        item.id === id ? { ...item, status } : item
      )
    );
  }

  function allocateAsset(
    assetId: string,
    userId: string,
    expectedReturn?: string
  ) {
    const person = data.people.find((item) => item.id === userId);
    const asset = assets.find((item) => item.id === assetId);

    if (!person || !asset) return;

    setAssets((current) =>
      current.map((item) =>
        item.id === assetId
          ? {
              ...item,
              status: "ASSIGNED",
              currentHolderId: person.id,
              currentHolderName: person.name,
              currentHolderDepartment: person.departmentName,
              allocatedSince: new Date().toLocaleDateString("en-IN"),
              expectedReturn,
            }
          : item
      )
    );

    const nextHistory: AllocationHistoryItem = {
      id: `history-${Date.now()}`,
      assetId,
      assetTag: asset.assetTag,
      assetName: asset.name,
      action: "ALLOCATED",
      description: `Allocated to ${person.name}${person.departmentName ? ` - ${person.departmentName}` : ""}`,
      date: new Date().toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
    };

    setHistory((current) => [nextHistory, ...current]);
  }

  function returnAsset(request: ReturnRequest) {
    setReturns((current) => [request, ...current]);

    setAssets((current) =>
      current.map((item) =>
        item.id === request.assetId
          ? {
              ...item,
              status: "AVAILABLE",
              currentHolderId: undefined,
              currentHolderName: undefined,
              currentHolderDepartment: undefined,
              allocatedSince: undefined,
              expectedReturn: undefined,
            }
          : item
      )
    );

    setHistory((current) => [
      {
        id: `history-${Date.now()}`,
        assetId: request.assetId,
        assetTag: request.assetTag,
        assetName: request.assetName,
        action: "RETURNED",
        description: `Returned by ${request.holderName} - condition: ${request.condition.toLowerCase()}`,
        date: request.returnedOn,
      },
      ...current,
    ]);
  }

  return (
    <div className="allocation-content">
      <header className="allocation-page-header">
        <h1>Asset Allocation &amp; Transfer</h1>
        <p>Allocate assets to employees or departments.</p>
      </header>

      <section className="allocation-workspace">
        <AllocationTabs
          activeTab={activeTab}
          onChange={setActiveTab}
        />

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
            <ReturnAssetPanel
              assets={assets}
              onReturn={returnAsset}
            />
          )}

          {activeTab === "history" && (
            <AllocationHistoryPanel history={history} />
          )}
        </div>
      </section>
    </div>
  );
}
