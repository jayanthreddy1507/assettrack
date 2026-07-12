"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui";
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

export function OrganizationSetup({
  data,
}: OrganizationSetupProps) {
  const [activeTab, setActiveTab] =
    useState<OrganizationTab>("departments");
  const [departments, setDepartments] = useState(
    data.departments
  );
  const [categories, setCategories] = useState(
    data.categories
  );
  const [employees, setEmployees] = useState(
    data.employees
  );
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

  function saveDepartment(record: DepartmentRecord) {
    setDepartments((current) => {
      const exists = current.some((item) => item.id === record.id);
      return exists
        ? current.map((item) =>
            item.id === record.id ? record : item
          )
        : [record, ...current];
    });
    setModal(null);
  }

  function saveCategory(record: CategoryRecord) {
    setCategories((current) => {
      const exists = current.some((item) => item.id === record.id);
      return exists
        ? current.map((item) =>
            item.id === record.id ? record : item
          )
        : [record, ...current];
    });
    setModal(null);
  }

  function saveEmployee(record: EmployeeRecord) {
    setEmployees((current) => {
      const exists = current.some((item) => item.id === record.id);
      return exists
        ? current.map((item) =>
            item.id === record.id ? record : item
          )
        : [record, ...current];
    });
    setModal(null);
  }

  function toggleDepartmentStatus(id: string) {
    setDepartments((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              status:
                item.status === "Active"
                  ? "Inactive"
                  : "Active",
            }
          : item
      )
    );
  }

  function toggleCategoryStatus(id: string) {
    setCategories((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              status:
                item.status === "Active"
                  ? "Inactive"
                  : "Active",
            }
          : item
      )
    );
  }

  function toggleEmployeeStatus(id: string) {
    setEmployees((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              status:
                item.status === "INACTIVE"
                  ? "ACTIVE"
                  : "INACTIVE",
            }
          : item
      )
    );
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
        <OrganizationTabs
          activeTab={activeTab}
          onChange={setActiveTab}
        />

        <div className="organization-toolbar">
          <div>
            <strong>{recordCount} records</strong>
            <span>
              Changes made here update options used across AssetFlow.
            </span>
          </div>

          <Button
            leftIcon={<OrganizationIcon name="plus" size={16} />}
            onClick={openCreateModal}
          >
            {tabActionLabels[activeTab]}
          </Button>
        </div>

        <div
          className="organization-tab-panel"
          role="tabpanel"
        >
          {activeTab === "departments" && (
            <DepartmentsTable
              departments={departments}
              onEdit={(record) =>
                setModal({ kind: "department", record })
              }
              onToggleStatus={toggleDepartmentStatus}
            />
          )}

          {activeTab === "categories" && (
            <CategoriesTable
              categories={categories}
              onEdit={(record) =>
                setModal({ kind: "category", record })
              }
              onToggleStatus={toggleCategoryStatus}
            />
          )}

          {activeTab === "employees" && (
            <EmployeesTable
              employees={employees}
              onEdit={(record) =>
                setModal({ kind: "employee", record })
              }
              onToggleStatus={toggleEmployeeStatus}
            />
          )}
        </div>
      </section>

      <DepartmentFormModal
        open={modal?.kind === "department"}
        department={
          modal?.kind === "department"
            ? modal.record
            : undefined
        }
        departments={departments}
        employees={employees}
        onClose={() => setModal(null)}
        onSave={saveDepartment}
      />

      <CategoryFormModal
        open={modal?.kind === "category"}
        category={
          modal?.kind === "category"
            ? modal.record
            : undefined
        }
        categories={categories}
        onClose={() => setModal(null)}
        onSave={saveCategory}
      />

      <EmployeeFormModal
        open={modal?.kind === "employee"}
        employee={
          modal?.kind === "employee"
            ? modal.record
            : undefined
        }
        departments={departments}
        onClose={() => setModal(null)}
        onSave={saveEmployee}
      />
    </div>
  );
}
