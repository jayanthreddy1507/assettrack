"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui";
import { AssetDetailsDrawer } from "./AssetDetailsDrawer";
import { AssetFilters } from "./AssetFilters";
import { AssetFormModal } from "./AssetFormModal";
import { AssetIcon } from "./AssetIcons";
import { AssetPagination } from "./AssetPagination";
import { AssetTable } from "./AssetTable";
import type {
  AssetRecord,
  AssetRegistryData,
} from "./asset.types";

export interface AssetRegistryProps {
  data: AssetRegistryData;
}

const PAGE_SIZE = 6;

export function AssetRegistry({ data }: AssetRegistryProps) {
  const [assets, setAssets] = useState(data.assets);
  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [status, setStatus] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [page, setPage] = useState(1);
  const [selectedAsset, setSelectedAsset] =
    useState<AssetRecord>();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [formAsset, setFormAsset] =
    useState<AssetRecord>();
  const [formOpen, setFormOpen] = useState(false);

  const filteredAssets = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return assets.filter((asset) => {
      const matchesQuery =
        !normalizedQuery ||
        asset.assetTag.toLowerCase().includes(normalizedQuery) ||
        asset.name.toLowerCase().includes(normalizedQuery) ||
        asset.serialNumber?.toLowerCase().includes(normalizedQuery);

      const matchesCategory =
        !categoryId || asset.categoryId === categoryId;

      const matchesStatus =
        !status || asset.status === status;

      const matchesDepartment =
        !departmentId || asset.departmentId === departmentId;

      return (
        matchesQuery &&
        matchesCategory &&
        matchesStatus &&
        matchesDepartment
      );
    });
  }, [assets, categoryId, departmentId, query, status]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredAssets.length / PAGE_SIZE)
  );

  const paginatedAssets = filteredAssets.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  function saveAsset(asset: AssetRecord) {
    setAssets((current) => {
      const exists = current.some((item) => item.id === asset.id);

      return exists
        ? current.map((item) =>
            item.id === asset.id ? asset : item
          )
        : [asset, ...current];
    });

    setFormOpen(false);
    setFormAsset(undefined);
    setSelectedAsset(asset);
  }

  function openNewAsset() {
    setFormAsset(undefined);
    setFormOpen(true);
  }

  function openEditAsset(asset: AssetRecord) {
    setFormAsset(asset);
    setFormOpen(true);
    setDrawerOpen(false);
  }

  function openAssetDetails(asset: AssetRecord) {
    setSelectedAsset(asset);
    setDrawerOpen(true);
  }

  function resetPage() {
    setPage(1);
  }

  return (
    <div className="asset-registry-content">
      <header className="asset-registry-header">
        <div>
          <h1>Asset Registry</h1>
          <p>Register, search and track all assets.</p>
        </div>
      </header>

      <section className="asset-registry-workspace">
        <div className="asset-registry-toolbar">
          <AssetFilters
            query={query}
            categoryId={categoryId}
            status={status}
            departmentId={departmentId}
            categories={data.categories}
            departments={data.departments}
            onQueryChange={(value) => {
              setQuery(value);
              resetPage();
            }}
            onCategoryChange={(value) => {
              setCategoryId(value);
              resetPage();
            }}
            onStatusChange={(value) => {
              setStatus(value);
              resetPage();
            }}
            onDepartmentChange={(value) => {
              setDepartmentId(value);
              resetPage();
            }}
          />

          <Button
            leftIcon={<AssetIcon name="plus" size={16} />}
            onClick={openNewAsset}
          >
            Register Asset
          </Button>
        </div>

        <div className="asset-registry-meta">
          <span>
            Showing {filteredAssets.length} of {assets.length} assets
          </span>
        </div>

        <AssetTable
          assets={paginatedAssets}
          onView={openAssetDetails}
          onEdit={openEditAsset}
        />

        <AssetPagination
          page={Math.min(page, totalPages)}
          totalPages={totalPages}
          onChange={setPage}
        />
      </section>

      <AssetDetailsDrawer
        asset={selectedAsset}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onEdit={openEditAsset}
      />

      <AssetFormModal
        open={formOpen}
        asset={formAsset}
        categories={data.categories}
        departments={data.departments}
        employees={data.employees}
        onClose={() => {
          setFormOpen(false);
          setFormAsset(undefined);
        }}
        onSave={saveAsset}
      />
    </div>
  );
}
