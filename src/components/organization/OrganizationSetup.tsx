"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui";
import { apiRequest } from "@/lib/api-client";
import { CategoriesTable } from "./CategoriesTable";
import { CategoryFormModal } from "./CategoryFormModal";
import { DepartmentFormModal } from "./DepartmentFormModal";
import { DepartmentsTable } from "./DepartmentsTable";
import { EmployeeFormModal } from "./EmployeeFormModal";
import { EmployeesTable } from "./EmployeesTable";
import { OrganizationIcon } from "./OrganizationIcons";
import { OrganizationSummary } from "./OrganizationSummary";
import { OrganizationTabs } from "./OrganizationTabs";
import type {
  CategoryRecord,
  DepartmentRecord,
  EmployeeRecord,
  OrganizationData,
  OrganizationTab,
} from "./organization.types";

export interface OrganizationSetupProps {
  data: OrganizationData;
}

type ModalState =
  | { kind: "department"; record?: DepartmentRecord }
  | { kind: "category"; record?: CategoryRecord }
  | { kind: "employee"; record?: EmployeeRecord }
  | null;

const tabActionLabels: Record<OrganizationTab, string> = {
  departments: "Add Department",
  categories: "Add Category",
  employees: "Add Employee",
};

export function OrganizationSetup({ data }: OrganizationSetupProps) {
  const [activeTab, setActiveTab] = useState<OrganizationTab>("departments");
  const [departments, setDepartments] = useState(data.departments);
  const [categories, setCategories] = useState(data.categories);
  const [employees, setEmployees] = useState(data.employees);
  const [modal, setModal] = useState<ModalState>(null);

  const recordCount = useMemo(() => {
    if (activeTab === "departments") return departments.length;
    if (activeTab === "categories") return categories.length;
    return employees.length;
  }, [activeTab, categories.length, departments.length, employees.length]);

  function openCreateModal() {
    if (activeTab === "departments") {
      setModal({ kind: "department" });
    } else if (activeTab === "categories") {
      setModal({ kind: "category" });
    } else {
      setModal({ kind: "employee" });
    }
  }

  function applyData(next: OrganizationData) {
    setDepartments(next.departments);
    setCategories(next.categories);
    setEmployees(next.employees);
  }

  async function persist(body: unknown) {
    try {
      applyData(
        await apiRequest<OrganizationData>("/api/organization", {
          method: "POST",
          body: JSON.stringify(body),
        }),
      );
      setModal(null);
    } catch (error) {
      window.alert(
        error instanceof Error ? error.message : "Organization could not be updated.",
      );
    }
  }

  function saveDepartment(record: DepartmentRecord) {
    return persist({ kind: "department", ...record });
  }

  function saveCategory(record: CategoryRecord) {
    return persist({ kind: "category", ...record });
  }

  function saveEmployee(record: EmployeeRecord) {
    return persist({
      kind: "employee",
      ...record,
      employeeId: record.employeeId ?? record.id,
    });
  }

  function toggleDepartmentStatus(id: string) {
    const record = departments.find((item) => item.id === id);
    if (record)
      void persist({ kind: "departmentStatus", id, active: record.status !== "Active" });
  }

  function toggleCategoryStatus(id: string) {
    const record = categories.find((item) => item.id === id);
    if (record)
      void persist({
        kind: "categoryStatus",
        id,
        active: record.status !== "Active",
      });
  }

  function toggleEmployeeStatus(id: string) {
    const record = employees.find((item) => item.id === id);
    if (record)
      void persist({ kind: "employeeStatus", id, active: record.status !== "ACTIVE" });
  }

  return (
    <div className="organization-content">
      <header className="organization-page-header">
        <div>
          <h1>Organization Setup</h1>
          <p>Manage master data that powers the system.</p>
        </div>
      </header>

      <OrganizationSummary
        departments={departments}
        categories={categories}
        employees={employees}
      />

      <section className="organization-workspace">
        <OrganizationTabs activeTab={activeTab} onChange={setActiveTab} />

        <div className="organization-toolbar">
          <div>
            <strong>{recordCount} records</strong>
            <span>Changes made here update options used across AssetFlow.</span>
          </div>

          <Button
            leftIcon={<OrganizationIcon name="plus" size={16} />}
            onClick={openCreateModal}
          >
            {tabActionLabels[activeTab]}
          </Button>
        </div>

        <div className="organization-tab-panel" role="tabpanel">
          {activeTab === "departments" && (
            <DepartmentsTable
              departments={departments}
              onEdit={(record) => setModal({ kind: "department", record })}
              onToggleStatus={toggleDepartmentStatus}
            />
          )}

          {activeTab === "categories" && (
            <CategoriesTable
              categories={categories}
              onEdit={(record) => setModal({ kind: "category", record })}
              onToggleStatus={toggleCategoryStatus}
            />
          )}

          {activeTab === "employees" && (
            <EmployeesTable
              employees={employees}
              onEdit={(record) => setModal({ kind: "employee", record })}
              onToggleStatus={toggleEmployeeStatus}
            />
          )}
        </div>
      </section>

      <DepartmentFormModal
        open={modal?.kind === "department"}
        department={modal?.kind === "department" ? modal.record : undefined}
        departments={departments}
        employees={employees}
        onClose={() => setModal(null)}
        onSave={saveDepartment}
      />

      <CategoryFormModal
        open={modal?.kind === "category"}
        category={modal?.kind === "category" ? modal.record : undefined}
        categories={categories}
        onClose={() => setModal(null)}
        onSave={saveCategory}
      />

      <EmployeeFormModal
        open={modal?.kind === "employee"}
        employee={modal?.kind === "employee" ? modal.record : undefined}
        departments={departments}
        onClose={() => setModal(null)}
        onSave={saveEmployee}
      />
    </div>
  );
}
