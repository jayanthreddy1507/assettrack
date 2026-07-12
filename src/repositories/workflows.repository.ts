import "server-only";

import { randomUUID } from "node:crypto";

import { auth } from "@/auth";
import type { AllocationData } from "@/components/allocation";
import type { AssetRegistryData, AssetStatus } from "@/components/assets";
import type { AuditData, AuditStatus, VerificationStatus } from "@/components/audit";
import type { BookingData, BookingStatus } from "@/components/booking";
import type {
  DashboardData,
  DashboardUser,
  RecentActivity,
} from "@/components/dashboard";
import type { MaintenanceData, MaintenanceStatus } from "@/components/maintenance";
import type { NotificationsData, NotificationCategory } from "@/components/notifications";
import type { OrganizationData } from "@/components/organization";
import type { ReportsData } from "@/components/reports";
import { prisma } from "@/lib/prisma";

function formatDate(value: Date | null | undefined) {
  return value?.toISOString().slice(0, 10);
}

function displayDate(value: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(value);
}

function employeeName(employee: { first_name: string; last_name: string }) {
  return `${employee.first_name} ${employee.last_name}`.trim();
}

function assetStatus(status: string): AssetStatus {
  if (status === "ALLOCATED") return "ASSIGNED";
  if (status === "RETIRED") return "DECOMMISSIONED";
  return status as AssetStatus;
}

function maintenanceStatus(status: string): MaintenanceStatus {
  return status === "ASSIGNED" ? "TECHNICIAN_ASSIGNED" : (status as MaintenanceStatus);
}

function auditStatus(status: string): AuditStatus {
  if (status === "PLANNED") return "SCHEDULED";
  if (status === "CANCELLED") return "CLOSED";
  return status as AuditStatus;
}

function verificationStatus(result: string | null): VerificationStatus {
  if (!result) return "PENDING";
  if (result === "FOUND" || result === "MISPLACED") return "VERIFIED";
  return result as VerificationStatus;
}

function bookingStatus(status: string, start: Date, end: Date): BookingStatus {
  if (status === "APPROVED" || status === "ACTIVE") {
    const now = new Date();
    if (start <= now && end >= now) return "ONGOING";
    if (end < now) return "COMPLETED";
    return "UPCOMING";
  }
  return status as BookingStatus;
}

async function viewer(): Promise<DashboardUser> {
  const session = await auth().catch(() => null);
  return {
    name: session?.user?.name ?? session?.user?.email ?? "AssetFlow User",
    role: session?.user?.role ?? "EMPLOYEE",
    avatar: session?.user?.image ?? undefined,
  };
}

async function employeeForUser(userId: string) {
  return prisma.employees.findUnique({ where: { user_id: userId } });
}

export async function getAssetRegistryData(): Promise<AssetRegistryData> {
  const [user, assets, categories, departments, employees] = await Promise.all([
    viewer(),
    prisma.asset.findMany({
      where: { deletedAt: null },
      include: {
        category: true,
        department: true,
        asset_allocations: {
          where: { status: "ACTIVE" },
          include: {
            employees_asset_allocations_employee_idToemployees: true,
          },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.department.findMany({ orderBy: { name: "asc" } }),
    prisma.employees.findMany({
      where: { status: "ACTIVE" },
      orderBy: [{ first_name: "asc" }, { last_name: "asc" }],
    }),
  ]);

  return {
    user,
    categories: categories.map(({ id, name }) => ({ id, name })),
    departments: departments.map(({ id, name }) => ({ id, name })),
    employees: employees.map((employee) => ({
      id: employee.id,
      name: employeeName(employee),
    })),
    assets: assets.map((asset) => {
      const allocation = asset.asset_allocations[0];
      const holder = allocation?.employees_asset_allocations_employee_idToemployees;
      return {
        id: asset.id,
        assetTag: asset.assetTag,
        name: asset.name,
        serialNumber: asset.serialNumber ?? undefined,
        description: asset.description ?? undefined,
        categoryId: asset.categoryId,
        categoryName: asset.category.name,
        status: assetStatus(asset.status),
        condition: asset.condition,
        location: asset.location ?? undefined,
        departmentId: asset.departmentId ?? undefined,
        departmentName: asset.department?.name,
        assignedToId: holder?.id,
        assignedToName: holder ? employeeName(holder) : undefined,
        acquisitionDate: formatDate(asset.purchaseDate),
        acquisitionCost: asset.purchase_cost ? Number(asset.purchase_cost) : undefined,
        manufacturer: asset.manufacturer ?? undefined,
        model: asset.vendor ?? undefined,
        warrantyExpiry: formatDate(asset.warrantyExpiry),
        isBookable: asset.is_bookable,
      };
    }),
  };
}

export async function getOrganizationData(): Promise<OrganizationData> {
  const [user, departments, categories, employees] = await Promise.all([
    viewer(),
    prisma.department.findMany({
      include: {
        parent: true,
        employees_departments_head_idToemployees: true,
        _count: {
          select: { assets: true, employees_employees_department_idTodepartments: true },
        },
      },
      orderBy: { name: "asc" },
    }),
    prisma.category.findMany({
      include: { parent: true, _count: { select: { assets: true } } },
      orderBy: { name: "asc" },
    }),
    prisma.employees.findMany({
      include: { departments_employees_department_idTodepartments: true, users: true },
      orderBy: [{ first_name: "asc" }, { last_name: "asc" }],
    }),
  ]);

  return {
    user,
    departments: departments.map((department) => ({
      id: department.id,
      name: department.name,
      code: department.code,
      description: department.description ?? undefined,
      parentDepartmentId: department.parentId ?? undefined,
      parentDepartmentName: department.parent?.name,
      managerId: department.head_id ?? undefined,
      managerName: department.employees_departments_head_idToemployees
        ? employeeName(department.employees_departments_head_idToemployees)
        : undefined,
      status: department.status === "ACTIVE" ? "Active" : "Inactive",
      employeeCount: department._count.employees_employees_department_idTodepartments,
      assetCount: department._count.assets,
    })),
    categories: categories.map((category) => ({
      id: category.id,
      name: category.name,
      description: category.description ?? undefined,
      icon: category.icon ?? undefined,
      parentCategoryId: category.parentId ?? undefined,
      parentCategoryName: category.parent?.name,
      status: category.status === "ACTIVE" ? "Active" : "Inactive",
      assetCount: category._count.assets,
    })),
    employees: employees.map((employee) => ({
      id: employee.id,
      name: employeeName(employee),
      email: employee.email,
      employeeId: employee.employee_code,
      phone: employee.phone ?? undefined,
      departmentId: employee.department_id ?? undefined,
      departmentName: employee.departments_employees_department_idTodepartments?.name,
      role: employee.users?.role ?? "EMPLOYEE",
      status: employee.status,
      avatar: employee.users?.avatar ?? employee.users?.image ?? undefined,
    })),
  };
}

export async function getAllocationData(): Promise<AllocationData> {
  const [user, assets, people, transfers, returned] = await Promise.all([
    viewer(),
    prisma.asset.findMany({
      where: { deletedAt: null },
      include: {
        category: true,
        asset_allocations: {
          where: { status: "ACTIVE" },
          include: {
            employees_asset_allocations_employee_idToemployees: {
              include: { departments_employees_department_idTodepartments: true },
            },
          },
          take: 1,
        },
      },
      orderBy: { name: "asc" },
    }),
    prisma.employees.findMany({
      where: { status: "ACTIVE" },
      include: { departments_employees_department_idTodepartments: true },
      orderBy: [{ first_name: "asc" }, { last_name: "asc" }],
    }),
    prisma.transfer_requests.findMany({
      include: {
        assets: true,
        employees_transfer_requests_from_employee_idToemployees: true,
        employees_transfer_requests_to_employee_idToemployees: true,
      },
      orderBy: { requested_at: "desc" },
    }),
    prisma.asset_allocations.findMany({
      where: { status: "RETURNED" },
      include: { assets: true, employees_asset_allocations_employee_idToemployees: true },
      orderBy: { returned_at: "desc" },
      take: 100,
    }),
  ]);

  const allocationHistory = assets.flatMap((asset) =>
    asset.asset_allocations.map((allocation) => ({
      id: allocation.id,
      assetId: asset.id,
      assetTag: asset.assetTag,
      assetName: asset.name,
      action: "ALLOCATED" as const,
      description: `Allocated to ${employeeName(allocation.employees_asset_allocations_employee_idToemployees)}`,
      date: displayDate(allocation.allocated_at),
    })),
  );

  return {
    user,
    assets: assets.map((asset) => {
      const allocation = asset.asset_allocations[0];
      const holder = allocation?.employees_asset_allocations_employee_idToemployees;
      return {
        id: asset.id,
        assetTag: asset.assetTag,
        name: asset.name,
        categoryName: asset.category.name,
        status: assetStatus(asset.status),
        currentHolderId: holder?.id,
        currentHolderName: holder ? employeeName(holder) : undefined,
        currentHolderDepartment:
          holder?.departments_employees_department_idTodepartments?.name,
        allocatedSince: allocation ? displayDate(allocation.allocated_at) : undefined,
        expectedReturn: formatDate(allocation?.expected_return),
      };
    }),
    people: people.map((person) => ({
      id: person.id,
      name: employeeName(person),
      departmentName: person.departments_employees_department_idTodepartments?.name,
      role: person.job_title ?? undefined,
    })),
    transfers: transfers.map((transfer) => ({
      id: transfer.id,
      assetId: transfer.asset_id,
      assetTag: transfer.assets.assetTag,
      assetName: transfer.assets.name,
      fromUserId: transfer.from_employee_id,
      fromUserName: employeeName(
        transfer.employees_transfer_requests_from_employee_idToemployees,
      ),
      toUserId: transfer.to_employee_id,
      toUserName: employeeName(
        transfer.employees_transfer_requests_to_employee_idToemployees,
      ),
      reason: transfer.reason ?? "",
      requestedOn: displayDate(transfer.requested_at),
      status: transfer.status === "PENDING" ? "REQUESTED" : transfer.status,
    })),
    returns: returned.map((allocation) => ({
      id: allocation.id,
      assetId: allocation.asset_id,
      assetTag: allocation.assets.assetTag,
      assetName: allocation.assets.name,
      holderName: employeeName(
        allocation.employees_asset_allocations_employee_idToemployees,
      ),
      returnedOn: displayDate(allocation.returned_at ?? allocation.allocated_at),
      condition: allocation.return_condition ?? "GOOD",
      notes: allocation.return_notes ?? undefined,
    })),
    history: [
      ...returned.map((allocation) => ({
        id: `return-${allocation.id}`,
        assetId: allocation.asset_id,
        assetTag: allocation.assets.assetTag,
        assetName: allocation.assets.name,
        action: "RETURNED" as const,
        description: `Returned by ${employeeName(allocation.employees_asset_allocations_employee_idToemployees)}`,
        date: displayDate(allocation.returned_at ?? allocation.allocated_at),
      })),
      ...allocationHistory,
    ],
  };
}

export async function getBookingData(): Promise<BookingData> {
  const [user, resources, bookings] = await Promise.all([
    viewer(),
    prisma.asset.findMany({
      where: { deletedAt: null, is_bookable: true },
      include: { category: true },
      orderBy: { name: "asc" },
    }),
    prisma.resource_bookings.findMany({
      include: { assets: true, employees: true },
      orderBy: { start_time: "desc" },
    }),
  ]);
  return {
    user,
    defaultDate: new Date().toISOString().slice(0, 10),
    resources: resources.map((resource, index) => ({
      id: resource.id,
      name: resource.name,
      type: resource.category.name.toLowerCase().includes("vehicle")
        ? "VEHICLE"
        : "EQUIPMENT",
      location: resource.location ?? undefined,
      colorTone: (["mint", "sky", "cream", "peach", "sage"] as const)[index % 5],
    })),
    bookings: bookings.map((booking) => ({
      id: booking.id,
      resourceId: booking.asset_id,
      resourceName: booking.assets.name,
      title: booking.purpose ?? "Resource booking",
      bookedBy: employeeName(booking.employees),
      date: formatDate(booking.start_time)!,
      startTime: booking.start_time.toISOString().slice(11, 16),
      endTime: booking.end_time.toISOString().slice(11, 16),
      status: bookingStatus(booking.status, booking.start_time, booking.end_time),
      notes: booking.notes ?? undefined,
    })),
  };
}

export async function getMaintenanceData(): Promise<MaintenanceData> {
  const [user, assets, technicians, requests] = await Promise.all([
    viewer(),
    prisma.asset.findMany({
      where: { deletedAt: null },
      select: { id: true, assetTag: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.employees.findMany({
      where: { status: "ACTIVE", users: { role: "TECHNICIAN" } },
      orderBy: [{ first_name: "asc" }, { last_name: "asc" }],
    }),
    prisma.maintenance_requests.findMany({
      include: {
        assets: true,
        employees_maintenance_requests_reported_byToemployees: true,
        employees_maintenance_requests_approved_byToemployees: true,
        employees_maintenance_requests_assigned_toToemployees: true,
      },
      orderBy: { created_at: "desc" },
    }),
  ]);
  return {
    user,
    assets,
    technicians: technicians.map((person) => ({
      id: person.id,
      name: employeeName(person),
    })),
    requests: requests.map((request) => ({
      id: request.id,
      requestId: `MR-${request.id.slice(0, 8).toUpperCase()}`,
      assetId: request.asset_id,
      assetTag: request.assets.assetTag,
      assetName: request.assets.name,
      issue: request.description.split("\n")[0],
      description: request.description,
      requestedBy: employeeName(
        request.employees_maintenance_requests_reported_byToemployees,
      ),
      requestedOn: displayDate(request.created_at),
      priority: request.priority,
      status: maintenanceStatus(request.status),
      approvedBy: request.employees_maintenance_requests_approved_byToemployees
        ? employeeName(request.employees_maintenance_requests_approved_byToemployees)
        : undefined,
      technicianId: request.assigned_to ?? undefined,
      technicianName: request.employees_maintenance_requests_assigned_toToemployees
        ? employeeName(request.employees_maintenance_requests_assigned_toToemployees)
        : undefined,
      resolvedOn: request.resolved_at ? displayDate(request.resolved_at) : undefined,
    })),
  };
}

export async function getAuditData(): Promise<AuditData> {
  const [user, cycles, auditors] = await Promise.all([
    viewer(),
    prisma.audit_cycles.findMany({
      include: {
        audit_assignments: { include: { employees: true } },
        audit_items: { include: { assets: true } },
      },
      orderBy: { start_date: "desc" },
    }),
    prisma.employees.findMany({
      where: { status: "ACTIVE", users: { role: "AUDITOR" } },
      orderBy: [{ first_name: "asc" }, { last_name: "asc" }],
    }),
  ]);
  return {
    user,
    auditorOptions: auditors.map(employeeName),
    cycles: cycles.map((cycle) => ({
      id: cycle.id,
      name: cycle.title,
      scope: cycle.department_id ?? "All assets",
      auditors: cycle.audit_assignments.map((assignment) =>
        employeeName(assignment.employees),
      ),
      startDate: formatDate(cycle.start_date)!,
      endDate: formatDate(cycle.end_date)!,
      status: auditStatus(cycle.status),
      items: cycle.audit_items.map((item) => ({
        id: item.id,
        assetId: item.asset_id,
        assetTag: item.assets.assetTag,
        assetName: item.assets.name,
        expectedLocation:
          item.expected_location ?? item.assets.location ?? "Not specified",
        verification: verificationStatus(item.result),
        notes: item.remarks ?? undefined,
      })),
    })),
  };
}

function notificationCategory(type: string): NotificationCategory {
  if (type === "AUDIT") return "AUDIT";
  if (type === "BOOKING") return "BOOKING";
  if (type === "SYSTEM" || type === "RETURN_DUE") return "ALERT";
  if (type === "MAINTENANCE" || type === "TRANSFER") return "APPROVAL";
  return "ASSET";
}

export async function getNotificationsData(): Promise<NotificationsData> {
  const session = await auth().catch(() => null);
  const employee = session?.user?.id ? await employeeForUser(session.user.id) : null;
  const [user, notifications] = await Promise.all([
    viewer(),
    employee
      ? prisma.notifications.findMany({
          where: { employee_id: employee.id },
          orderBy: { created_at: "desc" },
        })
      : Promise.resolve([]),
  ]);
  return {
    user,
    notifications: notifications.map((notification) => ({
      id: notification.id,
      category: notificationCategory(notification.type),
      title: notification.title,
      description: notification.message,
      timestamp: displayDate(notification.created_at),
      read: notification.is_read,
    })),
  };
}

export async function getDashboardData(): Promise<DashboardData> {
  const now = new Date();
  const [user, available, allocated, maintenance, overdue, logs] = await Promise.all([
    viewer(),
    prisma.asset.count({ where: { deletedAt: null, status: "AVAILABLE" } }),
    prisma.asset.count({ where: { deletedAt: null, status: "ALLOCATED" } }),
    prisma.maintenance_requests.count({
      where: { status: { in: ["PENDING", "APPROVED", "ASSIGNED", "IN_PROGRESS"] } },
    }),
    prisma.asset_allocations.findMany({
      where: { status: { in: ["ACTIVE", "OVERDUE"] }, expected_return: { lt: now } },
      include: { assets: true, employees_asset_allocations_employee_idToemployees: true },
      orderBy: { expected_return: "asc" },
      take: 10,
    }),
    prisma.activity_logs.findMany({ orderBy: { created_at: "desc" }, take: 8 }),
  ]);
  return {
    user,
    stats: [
      {
        id: "available",
        label: "Assets Available",
        value: available,
        meta: "Ready to allocate",
        direction: "neutral",
        tone: "mint",
      },
      {
        id: "allocated",
        label: "Assets Allocated",
        value: allocated,
        meta: "Currently assigned",
        direction: "neutral",
        tone: "sky",
      },
      {
        id: "maintenance",
        label: "Open Maintenance",
        value: maintenance,
        meta: "Requires attention",
        direction: "neutral",
        tone: "cream",
      },
    ],
    overdueReturns: overdue.map((allocation) => ({
      id: allocation.id,
      assetTag: allocation.assets.assetTag,
      assetName: allocation.assets.name,
      heldBy: employeeName(allocation.employees_asset_allocations_employee_idToemployees),
      expectedReturn: displayDate(allocation.expected_return!),
      daysOverdue: Math.max(
        1,
        Math.floor((now.getTime() - allocation.expected_return!.getTime()) / 86_400_000),
      ),
    })),
    recentActivity: logs.map((log) => ({
      id: log.id,
      title: log.action.replaceAll("_", " "),
      description: log.note ?? `${log.module} activity`,
      timestamp: displayDate(log.created_at),
      type: (["asset", "booking", "maintenance", "transfer", "audit", "return"].includes(
        log.module.toLowerCase(),
      )
        ? log.module.toLowerCase()
        : "asset") as RecentActivity["type"],
    })),
  };
}

export async function getReportsData(): Promise<ReportsData> {
  const [user, departments, maintenance, assets, bookings] = await Promise.all([
    viewer(),
    prisma.department.findMany({
      include: { _count: { select: { assets: true } } },
      orderBy: { name: "asc" },
    }),
    prisma.maintenance_requests.groupBy({
      by: ["asset_id"],
      _count: { _all: true },
      orderBy: { _count: { asset_id: "desc" } },
      take: 8,
    }),
    prisma.asset.findMany({
      where: { deletedAt: null },
      include: { _count: { select: { resource_bookings: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.resource_bookings.findMany({ select: { start_time: true } }),
  ]);
  const assetNames = new Map(assets.map((asset) => [asset.id, asset.name]));
  const heatmap = Array.from({ length: 7 }, () => Array.from({ length: 8 }, () => 0));
  for (const booking of bookings) {
    const day = booking.start_time.getUTCDay();
    const slot = Math.min(
      7,
      Math.max(0, Math.floor((booking.start_time.getUTCHours() - 8) / 2)),
    );
    heatmap[day][slot] += 1;
  }
  return {
    user,
    utilizationByDepartment: departments.map((department) => ({
      label: department.name,
      value: department._count.assets,
    })),
    maintenanceFrequency: maintenance.map((item) => ({
      label: assetNames.get(item.asset_id) ?? item.asset_id,
      value: item._count._all,
    })),
    mostUsedAssets: assets
      .filter((asset) => asset._count.resource_bookings > 0)
      .sort((a, b) => b._count.resource_bookings - a._count.resource_bookings)
      .slice(0, 5)
      .map((asset) => asset.name),
    idleAssets: assets
      .filter(
        (asset) => asset._count.resource_bookings === 0 && asset.status === "AVAILABLE",
      )
      .slice(0, 5)
      .map((asset) => asset.name),
    dueMaintenance: assets
      .filter((asset) => asset.warrantyExpiry && asset.warrantyExpiry < new Date())
      .slice(0, 5)
      .map((asset) => asset.name),
    bookingHeatmap: heatmap,
  };
}

export async function allocateAsset(
  assetId: string,
  employeeId: string,
  expectedReturn: string | undefined,
  userId: string,
) {
  const allocator = await employeeForUser(userId);
  await prisma.$transaction(async (tx) => {
    await tx.asset_allocations.updateMany({
      where: { asset_id: assetId, status: "ACTIVE" },
      data: { status: "RETURNED", returned_at: new Date() },
    });
    await tx.asset_allocations.create({
      data: {
        id: randomUUID(),
        asset_id: assetId,
        employee_id: employeeId,
        allocated_by: allocator?.id,
        expected_return: expectedReturn
          ? new Date(`${expectedReturn}T00:00:00.000Z`)
          : null,
      },
    });
    await tx.asset.update({
      where: { id: assetId },
      data: { status: "ALLOCATED", updated_by: userId },
    });
    await tx.activity_logs.create({
      data: {
        id: randomUUID(),
        user_id: userId,
        asset_id: assetId,
        module: "asset",
        action: "ALLOCATED",
        note: "Asset allocated",
      },
    });
  });
}

export async function returnAsset(
  assetId: string,
  condition: "NEW" | "GOOD" | "FAIR" | "POOR" | "DAMAGED",
  notes: string | undefined,
  userId: string,
) {
  await prisma.$transaction(async (tx) => {
    const allocation = await tx.asset_allocations.findFirst({
      where: { asset_id: assetId, status: "ACTIVE" },
      orderBy: { allocated_at: "desc" },
    });
    if (!allocation) throw new Error("This asset has no active allocation.");
    await tx.asset_allocations.update({
      where: { id: allocation.id },
      data: {
        status: "RETURNED",
        returned_at: new Date(),
        return_condition: condition,
        return_notes: notes,
      },
    });
    await tx.asset.update({
      where: { id: assetId },
      data: { status: "AVAILABLE", condition, updated_by: userId },
    });
    await tx.activity_logs.create({
      data: {
        id: randomUUID(),
        user_id: userId,
        asset_id: assetId,
        module: "return",
        action: "RETURNED",
        note: notes ?? "Asset returned",
      },
    });
  });
}

export async function createTransfer(
  assetId: string,
  toEmployeeId: string,
  reason: string,
) {
  const allocation = await prisma.asset_allocations.findFirst({
    where: { asset_id: assetId, status: "ACTIVE" },
  });
  if (!allocation) throw new Error("Only allocated assets can be transferred.");
  await prisma.transfer_requests.create({
    data: {
      id: randomUUID(),
      asset_id: assetId,
      from_employee_id: allocation.employee_id,
      to_employee_id: toEmployeeId,
      reason,
    },
  });
}

export async function setTransferStatus(
  id: string,
  status: "APPROVED" | "REJECTED" | "COMPLETED" | "CANCELLED",
  userId: string,
) {
  const approver = await employeeForUser(userId);
  await prisma.$transaction(async (tx) => {
    const transfer = await tx.transfer_requests.update({
      where: { id },
      data: {
        status,
        approved_by: approver?.id,
        approved_at: status !== "CANCELLED" ? new Date() : null,
        completed_at: status === "COMPLETED" ? new Date() : null,
      },
    });
    if (status === "COMPLETED") {
      await tx.asset_allocations.updateMany({
        where: { asset_id: transfer.asset_id, status: "ACTIVE" },
        data: { status: "RETURNED", returned_at: new Date() },
      });
      await tx.asset_allocations.create({
        data: {
          id: randomUUID(),
          asset_id: transfer.asset_id,
          employee_id: transfer.to_employee_id,
          allocated_by: approver?.id,
        },
      });
    }
  });
}

export async function createBooking(
  input: {
    resourceId: string;
    title: string;
    date: string;
    startTime: string;
    endTime: string;
    notes?: string;
  },
  userId: string,
) {
  const employee = await employeeForUser(userId);
  if (!employee)
    throw new Error("Your user account is not linked to an employee record.");
  const start = new Date(`${input.date}T${input.startTime}:00.000Z`);
  const end = new Date(`${input.date}T${input.endTime}:00.000Z`);
  const conflict = await prisma.resource_bookings.findFirst({
    where: {
      asset_id: input.resourceId,
      status: { notIn: ["CANCELLED", "REJECTED"] },
      start_time: { lt: end },
      end_time: { gt: start },
    },
  });
  if (conflict) throw new Error("This resource is already booked for the selected time.");
  await prisma.resource_bookings.create({
    data: {
      id: randomUUID(),
      asset_id: input.resourceId,
      employee_id: employee.id,
      purpose: input.title,
      start_time: start,
      end_time: end,
      notes: input.notes,
      updated_at: new Date(),
    },
  });
}

export async function createMaintenance(
  input: {
    assetId: string;
    issue: string;
    description?: string;
    priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  },
  userId: string,
) {
  const employee = await employeeForUser(userId);
  if (!employee)
    throw new Error("Your user account is not linked to an employee record.");
  await prisma.maintenance_requests.create({
    data: {
      id: randomUUID(),
      asset_id: input.assetId,
      reported_by: employee.id,
      description: [input.issue, input.description].filter(Boolean).join("\n"),
      priority: input.priority,
      updated_at: new Date(),
    },
  });
}

export async function advanceMaintenance(id: string, userId: string) {
  const actor = await employeeForUser(userId);
  if (!actor) throw new Error("Your user account is not linked to an employee record.");
  await prisma.$transaction(async (tx) => {
    const request = await tx.maintenance_requests.findUniqueOrThrow({ where: { id } });
    const statuses = {
      PENDING: "APPROVED",
      APPROVED: "ASSIGNED",
      ASSIGNED: "IN_PROGRESS",
      IN_PROGRESS: "RESOLVED",
    } as const;
    const status = statuses[request.status as keyof typeof statuses];
    if (!status) return;
    const technician =
      status === "ASSIGNED"
        ? await tx.employees.findFirst({
            where: { status: "ACTIVE", users: { role: "TECHNICIAN" } },
          })
        : null;
    await tx.maintenance_requests.update({
      where: { id },
      data: {
        status,
        approved_by: status === "APPROVED" ? actor.id : request.approved_by,
        assigned_to: technician?.id ?? request.assigned_to,
        resolved_by: status === "RESOLVED" ? actor.id : request.resolved_by,
        resolved_at: status === "RESOLVED" ? new Date() : request.resolved_at,
        updated_at: new Date(),
      },
    });
    await tx.asset.update({
      where: { id: request.asset_id },
      data: { status: status === "RESOLVED" ? "AVAILABLE" : "IN_MAINTENANCE" },
    });
  });
}

export async function createAudit(
  input: {
    name: string;
    scope: string;
    auditorName: string;
    startDate: string;
    endDate: string;
  },
  userId: string,
) {
  const auditorCandidates = await prisma.employees.findMany({
    where: { status: "ACTIVE" },
  });
  const auditor = auditorCandidates.find(
    (candidate) => employeeName(candidate) === input.auditorName,
  );
  const assets = await prisma.asset.findMany({
    where: { deletedAt: null },
    select: { id: true, location: true },
  });
  await prisma.audit_cycles.create({
    data: {
      id: randomUUID(),
      title: input.name,
      department_id: input.scope || null,
      start_date: new Date(`${input.startDate}T00:00:00.000Z`),
      end_date: new Date(`${input.endDate}T00:00:00.000Z`),
      created_by: userId,
      updated_at: new Date(),
      audit_assignments: auditor
        ? { create: { id: randomUUID(), auditor_id: auditor.id } }
        : undefined,
      audit_items: {
        create: assets.map((asset) => ({
          id: randomUUID(),
          asset_id: asset.id,
          expected_location: asset.location,
        })),
      },
    },
  });
}

export async function updateAuditItem(id: string, verification: VerificationStatus) {
  const result =
    verification === "VERIFIED"
      ? "FOUND"
      : verification === "PENDING"
        ? null
        : verification;
  await prisma.audit_items.update({
    where: { id },
    data: { result, audited_at: result ? new Date() : null },
  });
}

export async function closeAudit(id: string) {
  await prisma.audit_cycles.update({
    where: { id },
    data: { status: "COMPLETED", updated_at: new Date() },
  });
}

export async function updateNotification(id: string, read: boolean, userId: string) {
  const employee = await employeeForUser(userId);
  if (!employee)
    throw new Error("Your user account is not linked to an employee record.");
  await prisma.notifications.updateMany({
    where: { id, employee_id: employee.id },
    data: { is_read: read },
  });
}

export async function markAllNotificationsRead(userId: string) {
  const employee = await employeeForUser(userId);
  if (!employee)
    throw new Error("Your user account is not linked to an employee record.");
  await prisma.notifications.updateMany({
    where: { employee_id: employee.id, is_read: false },
    data: { is_read: true },
  });
}
