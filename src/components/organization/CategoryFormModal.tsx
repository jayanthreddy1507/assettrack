"use client";

import { useEffect, useState } from "react";
import {
  Button,
  Input,
  Modal,
  Select,
  Textarea,
} from "@/components/ui";
import type {
  CategoryRecord,
  RecordStatus,
} from "./organization.types";

export interface CategoryFormModalProps {
  open: boolean;
  category?: CategoryRecord;
  categories: CategoryRecord[];
  onClose: () => void;
  onSave: (category: CategoryRecord) => void;
}

export function CategoryFormModal({
  open,
  category,
  categories,
  onClose,
  onSave,
}: CategoryFormModalProps) {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("");
  const [description, setDescription] = useState("");
  const [parentCategoryId, setParentCategoryId] =
    useState("");
  const [status, setStatus] =
    useState<RecordStatus>("Active");
  const [error, setError] = useState("");

  useEffect(() => {
    setName(category?.name ?? "");
    setIcon(category?.icon ?? "");
    setDescription(category?.description ?? "");
    setParentCategoryId(category?.parentCategoryId ?? "");
    setStatus(category?.status ?? "Active");
    setError("");
  }, [category, open]);

  function handleSave() {
    if (!name.trim()) {
      setError("Category name is required.");
      return;
    }

    const parent = categories.find(
      (item) => item.id === parentCategoryId
    );

    onSave({
      id: category?.id ?? `category-${Date.now()}`,
      name: name.trim(),
      icon: icon.trim() || undefined,
      description: description.trim() || undefined,
      parentCategoryId: parentCategoryId || undefined,
      parentCategoryName: parent?.name,
      status,
      assetCount: category?.assetCount ?? 0,
    });
  }

  return (
    <Modal
      open={open}
      title={
        category ? "Edit Asset Category" : "Add Asset Category"
      }
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            {category ? "Save Changes" : "Add Category"}
          </Button>
        </>
      }
    >
      <div className="organization-form-grid">
        <Input
          id="category-name"
          label="Category name"
          placeholder="Electronics"
          value={name}
          error={error || undefined}
          required
          onChange={(event) => {
            setName(event.target.value);
            setError("");
          }}
        />

        <Input
          id="category-icon"
          label="Icon"
          placeholder="💻"
          helperText="Optional emoji or icon name."
          value={icon}
          onChange={(event) => setIcon(event.target.value)}
        />

        <Select
          id="category-parent"
          label="Parent category"
          placeholder="No parent category"
          value={parentCategoryId}
          options={categories
            .filter((item) => item.id !== category?.id)
            .map((item) => ({
              label: item.name,
              value: item.id,
            }))}
          onChange={(event) =>
            setParentCategoryId(event.target.value)
          }
        />

        <Select
          id="category-status"
          label="Status"
          value={status}
          options={[
            { label: "Active", value: "Active" },
            { label: "Inactive", value: "Inactive" },
          ]}
          onChange={(event) =>
            setStatus(event.target.value as RecordStatus)
          }
        />

        <Textarea
          id="category-description"
          className="organization-form-grid__wide"
          label="Description"
          placeholder="Describe the assets included in this category..."
          value={description}
          onChange={(event) =>
            setDescription(event.target.value)
          }
        />
      </div>
    </Modal>
  );
}
