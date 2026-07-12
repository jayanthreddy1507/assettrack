"use client";

import { useEffect, useState } from "react";
import {
  Button,
  Input,
  Modal,
  Select,
} from "@/components/ui";
import { validateEmail } from "@/lib/auth-validation";
import type {
  DepartmentRecord,
  EmployeeRecord,
  EmployeeStatus,
  UserRole,
} from "./organization.types";

export interface EmployeeFormModalProps {
  open: boolean;
  employee?: EmployeeRecord;
  departments: DepartmentRecord[];
  onClose: () => void;
  onSave: (employee: EmployeeRecord) => void;
}

export function EmployeeFormModal({
  open,
  employee,
  departments,
  onClose,
  onSave,
}: EmployeeFormModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [phone, setPhone] = useState("");
  const [departmentId, setDepartmentId] =
    useState("");
  const [role, setRole] =
    useState<UserRole>("EMPLOYEE");
  const [status, setStatus] =
    useState<EmployeeStatus>("ACTIVE");
  const [error, setError] = useState("");

  useEffect(() => {
    setName(employee?.name ?? "");
    setEmail(employee?.email ?? "");
    setEmployeeId(employee?.employeeId ?? "");
    setPhone(employee?.phone ?? "");
    setDepartmentId(employee?.departmentId ?? "");
    setRole(employee?.role ?? "EMPLOYEE");
    setStatus(employee?.status ?? "ACTIVE");
    setError("");
  }, [employee, open]);

  function handleSave() {
    if (name.trim().length < 2) {
      setError("Enter the employee's full name.");
      return;
    }

    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      return;
    }

    const department = departments.find(
      (item) => item.id === departmentId
    );

    onSave({
      id: employee?.id ?? `employee-${Date.now()}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      employeeId: employeeId.trim() || undefined,
      phone: phone.trim() || undefined,
      departmentId: departmentId || undefined,
      departmentName: department?.name,
      role,
      status,
      avatar: employee?.avatar,
    });
  }

  return (
    <Modal
      open={open}
      title={employee ? "Edit Employee" : "Add Employee"}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            {employee ? "Save Changes" : "Add Employee"}
          </Button>
        </>
      }
    >
      <div className="organization-form-grid">
        <Input
          id="employee-name"
          label="Full name"
          placeholder="Priya Sharma"
          value={name}
          error={
            error && name.trim().length < 2
              ? error
              : undefined
          }
          required
          onChange={(event) => {
            setName(event.target.value);
            setError("");
          }}
        />

        <Input
          id="employee-email"
          type="email"
          label="Email address"
          placeholder="name@company.com"
          value={email}
          error={
            error && Boolean(validateEmail(email))
              ? error
              : undefined
          }
          required
          onChange={(event) => {
            setEmail(event.target.value);
            setError("");
          }}
        />

        <Input
          id="employee-id"
          label="Employee ID"
          placeholder="EMP-001"
          value={employeeId}
          onChange={(event) =>
            setEmployeeId(event.target.value)
          }
        />

        <Input
          id="employee-phone"
          type="tel"
          label="Phone number"
          placeholder="+91 98765 43210"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
        />

        <Select
          id="employee-department"
          label="Department"
          placeholder="Unassigned"
          value={departmentId}
          options={departments
            .filter((department) => department.status === "Active")
            .map((department) => ({
              label: department.name,
              value: department.id,
            }))}
          onChange={(event) =>
            setDepartmentId(event.target.value)
          }
        />

        <Select
          id="employee-role"
          label="Role"
          value={role}
          options={[
            { label: "Super Admin", value: "SUPER_ADMIN" },
            { label: "Admin", value: "ADMIN" },
            { label: "Manager", value: "MANAGER" },
            { label: "Technician", value: "TECHNICIAN" },
            { label: "Employee", value: "EMPLOYEE" },
            { label: "Auditor", value: "AUDITOR" },
          ]}
          onChange={(event) =>
            setRole(event.target.value as UserRole)
          }
        />

        <Select
          id="employee-status"
          label="Status"
          value={status}
          options={[
            { label: "Active", value: "ACTIVE" },
            { label: "Inactive", value: "INACTIVE" },
            { label: "On Leave", value: "ON_LEAVE" },
            { label: "Terminated", value: "TERMINATED" },
            { label: "Suspended", value: "SUSPENDED" },
          ]}
          onChange={(event) =>
            setStatus(event.target.value as EmployeeStatus)
          }
        />
      </div>
    </Modal>
  );
}
