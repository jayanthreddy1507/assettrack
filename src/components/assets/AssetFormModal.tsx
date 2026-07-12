"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Checkbox,
  Input,
  Modal,
  Select,
  Textarea,
} from "@/components/ui";
import type {
  AssetCategoryOption,
  AssetCondition,
  AssetRecord,
  AssetStatus,
  DepartmentOption,
  EmployeeOption,
} from "./asset.types";

export interface AssetFormModalProps {
  open: boolean;
  asset?: AssetRecord;
  categories: AssetCategoryOption[];
  departments: DepartmentOption[];
  employees: EmployeeOption[];
  onClose: () => void;
  onSave: (asset: AssetRecord) => void;
}

const statusOptions: Array<{ label: string; value: AssetStatus }> = [
  { label: "Active", value: "ACTIVE" },
  { label: "Available", value: "AVAILABLE" },
  { label: "Allocated", value: "ASSIGNED" },
  { label: "Reserved", value: "RESERVED" },
  { label: "Under Maintenance", value: "IN_MAINTENANCE" },
  { label: "Decommissioned", value: "DECOMMISSIONED" },
  { label: "Lost", value: "LOST" },
  { label: "Stolen", value: "STOLEN" },
];

const conditionOptions: Array<{
  label: string;
  value: AssetCondition;
}> = [
  { label: "New", value: "NEW" },
  { label: "Good", value: "GOOD" },
  { label: "Fair", value: "FAIR" },
  { label: "Poor", value: "POOR" },
  { label: "Damaged", value: "DAMAGED" },
];

export function AssetFormModal({
  open,
  asset,
  categories,
  departments,
  employees,
  onClose,
  onSave,
}: AssetFormModalProps) {
  const generatedAssetTag = useMemo(
    () => `AF-${String(Date.now()).slice(-4)}`,
    [open]
  );

  const [assetTag, setAssetTag] = useState("");
  const [name, setName] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [status, setStatus] = useState<AssetStatus>("AVAILABLE");
  const [condition, setCondition] = useState<AssetCondition>("GOOD");
  const [location, setLocation] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [assignedToId, setAssignedToId] = useState("");
  const [acquisitionDate, setAcquisitionDate] = useState("");
  const [acquisitionCost, setAcquisitionCost] = useState("");
  const [manufacturer, setManufacturer] = useState("");
  const [model, setModel] = useState("");
  const [warrantyExpiry, setWarrantyExpiry] = useState("");
  const [isBookable, setIsBookable] = useState(false);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setAssetTag(asset?.assetTag ?? generatedAssetTag);
    setName(asset?.name ?? "");
    setSerialNumber(asset?.serialNumber ?? "");
    setDescription(asset?.description ?? "");
    setCategoryId(asset?.categoryId ?? "");
    setStatus(asset?.status ?? "AVAILABLE");
    setCondition(asset?.condition ?? "GOOD");
    setLocation(asset?.location ?? "");
    setDepartmentId(asset?.departmentId ?? "");
    setAssignedToId(asset?.assignedToId ?? "");
    setAcquisitionDate(asset?.acquisitionDate ?? "");
    setAcquisitionCost(
      asset?.acquisitionCost !== undefined
        ? String(asset.acquisitionCost)
        : ""
    );
    setManufacturer(asset?.manufacturer ?? "");
    setModel(asset?.model ?? "");
    setWarrantyExpiry(asset?.warrantyExpiry ?? "");
    setIsBookable(asset?.isBookable ?? false);
    setNotes(asset?.notes ?? "");
    setError("");
  }, [asset, generatedAssetTag, open]);

  function handleSave() {
    if (!name.trim()) {
      setError("Asset name is required.");
      return;
    }

    if (!assetTag.trim()) {
      setError("Asset tag is required.");
      return;
    }

    const category = categories.find((item) => item.id === categoryId);
    const department = departments.find((item) => item.id === departmentId);
    const employee = employees.find((item) => item.id === assignedToId);

    onSave({
      id: asset?.id ?? `asset-${Date.now()}`,
      assetTag: assetTag.trim().toUpperCase(),
      name: name.trim(),
      serialNumber: serialNumber.trim() || undefined,
      description: description.trim() || undefined,
      categoryId: categoryId || undefined,
      categoryName: category?.name,
      status,
      condition,
      location: location.trim() || undefined,
      departmentId: departmentId || undefined,
      departmentName: department?.name,
      assignedToId: assignedToId || undefined,
      assignedToName: employee?.name,
      acquisitionDate: acquisitionDate || undefined,
      acquisitionCost: acquisitionCost
        ? Number(acquisitionCost)
        : undefined,
      manufacturer: manufacturer.trim() || undefined,
      model: model.trim() || undefined,
      warrantyExpiry: warrantyExpiry || undefined,
      isBookable,
      notes: notes.trim() || undefined,
    });
  }

  return (
    <Modal
      open={open}
      title={asset ? "Edit Asset" : "Register Asset"}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            {asset ? "Save Changes" : "Register Asset"}
          </Button>
        </>
      }
    >
      <div className="asset-form-grid">
        <Input
          id="asset-tag"
          label="Asset Tag"
          value={assetTag}
          error={error && !assetTag.trim() ? error : undefined}
          required
          onChange={(event) => {
            setAssetTag(event.target.value);
            setError("");
          }}
        />

        <Input
          id="asset-name"
          label="Asset Name"
          placeholder="Laptop Dell XPS 13"
          value={name}
          error={error && !name.trim() ? error : undefined}
          required
          onChange={(event) => {
            setName(event.target.value);
            setError("");
          }}
        />

        <Input
          id="asset-serial"
          label="Serial Number"
          placeholder="DX13-2025-1008"
          value={serialNumber}
          onChange={(event) => setSerialNumber(event.target.value)}
        />

        <Select
          id="asset-category"
          label="Category"
          placeholder="Select category"
          value={categoryId}
          options={categories.map((category) => ({
            label: category.name,
            value: category.id,
          }))}
          onChange={(event) => setCategoryId(event.target.value)}
        />

        <Select
          id="asset-status"
          label="Status"
          value={status}
          options={statusOptions}
          onChange={(event) =>
            setStatus(event.target.value as AssetStatus)
          }
        />

        <Select
          id="asset-condition"
          label="Condition"
          value={condition}
          options={conditionOptions}
          onChange={(event) =>
            setCondition(event.target.value as AssetCondition)
          }
        />

        <Input
          id="asset-location"
          label="Location"
          placeholder="5th Floor - IT"
          value={location}
          onChange={(event) => setLocation(event.target.value)}
        />

        <Select
          id="asset-department"
          label="Department"
          placeholder="Select department"
          value={departmentId}
          options={departments.map((department) => ({
            label: department.name,
            value: department.id,
          }))}
          onChange={(event) => setDepartmentId(event.target.value)}
        />

        <Select
          id="asset-assigned-to"
          label="Allocated To"
          placeholder="Not allocated"
          value={assignedToId}
          options={employees.map((employee) => ({
            label: employee.name,
            value: employee.id,
          }))}
          onChange={(event) => setAssignedToId(event.target.value)}
        />

        <Input
          id="asset-acquisition-date"
          type="date"
          label="Acquisition Date"
          value={acquisitionDate}
          onChange={(event) => setAcquisitionDate(event.target.value)}
        />

        <Input
          id="asset-acquisition-cost"
          type="number"
          min="0"
          label="Acquisition Cost"
          placeholder="0"
          value={acquisitionCost}
          onChange={(event) => setAcquisitionCost(event.target.value)}
        />

        <Input
          id="asset-manufacturer"
          label="Manufacturer"
          placeholder="Dell"
          value={manufacturer}
          onChange={(event) => setManufacturer(event.target.value)}
        />

        <Input
          id="asset-model"
          label="Model"
          placeholder="XPS 13"
          value={model}
          onChange={(event) => setModel(event.target.value)}
        />

        <Input
          id="asset-warranty-expiry"
          type="date"
          label="Warranty Expiry"
          value={warrantyExpiry}
          onChange={(event) => setWarrantyExpiry(event.target.value)}
        />

        <div className="asset-form-grid__wide asset-bookable-field">
          <Checkbox
            checked={isBookable}
            onChange={(event) => setIsBookable(event.target.checked)}
            label="This asset is shared and can be booked"
          />
        </div>

        <Textarea
          id="asset-description"
          className="asset-form-grid__wide"
          label="Description"
          placeholder="Describe this asset..."
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />

        <Textarea
          id="asset-notes"
          className="asset-form-grid__wide"
          label="Notes"
          placeholder="Additional notes..."
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
        />
      </div>
    </Modal>
  );
}
