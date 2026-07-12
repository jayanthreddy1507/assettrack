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
  DepartmentRecord,
  EmployeeRecord,
  RecordStatus,
} from "./organization.types";

export interface DepartmentFormModalProps {
  open: boolean;
  department?: DepartmentRecord;
  departments: DepartmentRecord[];
  employees: EmployeeRecord[];
  onClose: () => void;
  onSave: (department: DepartmentRecord) => void;
}

export function DepartmentFormModal({
  open,
  department,
  departments,
  employees,
  onClose,
  onSave,
}: DepartmentFormModalProps) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [parentDepartmentId, setParentDepartmentId] =
    useState("");
  const [managerId, setManagerId] = useState("");
  const [status, setStatus] =
    useState<RecordStatus>("Active");
  const [error, setError] = useState("");

  useEffect(() => {
    setName(department?.name ?? "");
    setCode(department?.code ?? "");
    setDescription(department?.description ?? "");
    setParentDepartmentId(
      department?.parentDepartmentId ?? ""
    );
    setManagerId(department?.managerId ?? "");
    setStatus(department?.status ?? "Active");
    setError("");
  }, [department, open]);

  function handleSave() {
    if (!name.trim()) {
      setError("Department name is required.");
      return;
    }

    if (!code.trim()) {
      setError("Department code is required.");
      return;
    }

    const parent = departments.find(
      (item) => item.id === parentDepartmentId
    );
    const manager = employees.find(
      (item) => item.id === managerId
    );

    onSave({
      id: department?.id ?? `dept-${Date.now()}`,
      name: name.trim(),
      code: code.trim().toUpperCase(),
      description: description.trim() || undefined,
      parentDepartmentId:
        parentDepartmentId || undefined,
      parentDepartmentName: parent?.name,
      managerId: managerId || undefined,
      managerName: manager?.name,
      status,
      employeeCount: department?.employeeCount ?? 0,
      assetCount: department?.assetCount ?? 0,
    });
  }

  return (
    <Modal
      open={open}
      title={
        department ? "Edit Department" : "Add Department"
      }
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            {department ? "Save Changes" : "Add Department"}
          </Button>
        </>
      }
    >
      <div className="organization-form-grid">
        <Input
          id="department-name"
          label="Department name"
          placeholder="Information Technology"
          value={name}
          error={error && !name.trim() ? error : undefined}
          required
          onChange={(event) => {
            setName(event.target.value);
            setError("");
          }}
        />

        <Input
          id="department-code"
          label="Department code"
          placeholder="IT"
          value={code}
          error={error && !code.trim() ? error : undefined}
          required
          onChange={(event) => {
            setCode(event.target.value);
            setError("");
          }}
        />

        <Select
          id="department-parent"
          label="Parent department"
          placeholder="No parent department"
          value={parentDepartmentId}
          options={departments
            .filter((item) => item.id !== department?.id)
            .map((item) => ({
              label: item.name,
              value: item.id,
            }))}
          onChange={(event) =>
            setParentDepartmentId(event.target.value)
          }
        />

        <Select
          id="department-manager"
          label="Department head"
          placeholder="Unassigned"
          value={managerId}
          options={employees
            .filter((employee) =>
              ["SUPER_ADMIN", "ADMIN", "MANAGER"].includes(
                employee.role
              )
            )
            .map((employee) => ({
              label: employee.name,
              value: employee.id,
            }))}
          onChange={(event) =>
            setManagerId(event.target.value)
          }
        />

        <Select
          id="department-status"
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
          id="department-description"
          className="organization-form-grid__wide"
          label="Description"
          placeholder="Briefly describe this department..."
          value={description}
          onChange={(event) =>
            setDescription(event.target.value)
          }
        />
      </div>
    </Modal>
  );
}
