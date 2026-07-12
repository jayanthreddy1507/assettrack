import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";
import { randomUUID } from "node:crypto";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required to seed the database.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: databaseUrl }),
});

async function seedDepartments() {
  const departments = [
    {
      name: "Information Technology",
      code: "IT",
      description: "IT infrastructure, software, and internal support.",
      location: "Building A - Floor 2",
    },
    {
      name: "Human Resources",
      code: "HR",
      description: "People operations, hiring, and employee lifecycle.",
      location: "Building A - Floor 1",
    },
    {
      name: "Finance",
      code: "FIN",
      description: "Accounting, payroll, procurement, and budgeting.",
      location: "Building B - Floor 1",
    },
    {
      name: "Operations",
      code: "OPS",
      description: "Business operations and resource coordination.",
      location: "Building C - Floor 1",
    },
    {
      name: "Facilities",
      code: "FAC",
      description: "Workplace, furniture, fixtures, and safety equipment.",
      location: "Building C - Ground Floor",
    },
    {
      name: "Engineering",
      code: "ENG",
      description: "Product development and engineering.",
      location: "Building B - Floor 3",
    },
    {
      name: "Marketing",
      code: "MKT",
      description: "Marketing and communications.",
      location: "Building A - Floor 3",
    },
  ];

  for (const department of departments) {
    await prisma.department.upsert({
      where: { code: department.code },
      update: department,
      create: department,
    });
  }
  return departments.length;
}

async function seedCategories() {
  const categories = [
    {
      name: "Electronics",
      description: "Computers, phones, monitors, and electronic devices.",
      icon: "laptop",
    },
    {
      name: "Furniture",
      description: "Desks, chairs, cabinets, and workplace furniture.",
      icon: "armchair",
    },
    {
      name: "Vehicles",
      description: "Company cars and transport equipment.",
      icon: "car",
    },
    {
      name: "Tools",
      description: "Hand tools, power tools, and service equipment.",
      icon: "wrench",
    },
    {
      name: "Software",
      description: "Software licenses, subscriptions, and entitlements.",
      icon: "code",
    },
    {
      name: "Network",
      description: "Routers, switches, access points, and cabling.",
      icon: "network",
    },
    {
      name: "Safety Equipment",
      description: "PPE, first-aid kits, and emergency safety assets.",
      icon: "shield",
    },
    {
      name: "Meeting Rooms",
      description: "Bookable meeting rooms and conference areas.",
      icon: "door-open",
    },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: category,
      create: category,
    });
  }
  return categories.length;
}

async function seedAdmin() {
  const itDepartment = await prisma.department.findUniqueOrThrow({
    where: { code: "IT" },
  });
  const password = await bcrypt.hash(process.env.SEED_ADMIN_PASSWORD ?? "Admin@1234", 12);
  const user = await prisma.user.upsert({
    where: { email: "admin@assetflow.local" },
    update: { name: "System Admin", password, role: "SUPER_ADMIN", is_active: true },
    create: {
      name: "System Admin",
      email: "admin@assetflow.local",
      password,
      role: "SUPER_ADMIN",
      is_active: true,
    },
  });
  await prisma.employees.upsert({
    where: { employee_code: "EMP-0001" },
    update: {
      first_name: "System",
      last_name: "Admin",
      email: user.email,
      status: "ACTIVE",
      user_id: user.id,
      department_id: itDepartment.id,
    },
    create: {
      employee_code: "EMP-0001",
      first_name: "System",
      last_name: "Admin",
      email: user.email,
      job_title: "Platform Administrator",
      status: "ACTIVE",
      user_id: user.id,
      department_id: itDepartment.id,
      joined_at: new Date(),
    },
  });
  return user;
}

async function seedEmployees() {
  const depts = await prisma.department.findMany();
  const password = await bcrypt.hash("Password@123", 12);
  const employeeData = [
    {
      first: "Alice",
      last: "Smith",
      email: "alice.smith@assetflow.local",
      code: "EMP-0002",
      role: "EMPLOYEE",
      dept: "HR",
    },
    {
      first: "Bob",
      last: "Jones",
      email: "bob.jones@assetflow.local",
      code: "EMP-0003",
      role: "MANAGER",
      dept: "FIN",
    },
    {
      first: "Charlie",
      last: "Brown",
      email: "charlie.brown@assetflow.local",
      code: "EMP-0004",
      role: "EMPLOYEE",
      dept: "ENG",
    },
    {
      first: "Diana",
      last: "Prince",
      email: "diana.prince@assetflow.local",
      code: "EMP-0005",
      role: "TECHNICIAN",
      dept: "IT",
    },
    {
      first: "Ethan",
      last: "Hunt",
      email: "ethan.hunt@assetflow.local",
      code: "EMP-0006",
      role: "AUDITOR",
      dept: "OPS",
    },
    {
      first: "Fiona",
      last: "Gallagher",
      email: "fiona.g@assetflow.local",
      code: "EMP-0007",
      role: "EMPLOYEE",
      dept: "MKT",
    },
    {
      first: "George",
      last: "Costanza",
      email: "george.c@assetflow.local",
      code: "EMP-0008",
      role: "EMPLOYEE",
      dept: "FAC",
    },
  ];

  for (const emp of employeeData) {
    const dept = depts.find((d) => d.code === emp.dept);
    const user = await prisma.user.upsert({
      where: { email: emp.email },
      update: {
        name: `${emp.first} ${emp.last}`,
        password,
        role: emp.role as any,
        is_active: true,
      },
      create: {
        name: `${emp.first} ${emp.last}`,
        email: emp.email,
        password,
        role: emp.role as any,
        is_active: true,
      },
    });
    await prisma.employees.upsert({
      where: { employee_code: emp.code },
      update: {
        first_name: emp.first,
        last_name: emp.last,
        email: user.email,
        status: "ACTIVE",
        user_id: user.id,
        department_id: dept?.id,
      },
      create: {
        employee_code: emp.code,
        first_name: emp.first,
        last_name: emp.last,
        email: user.email,
        job_title: `${emp.dept} Specialist`,
        status: "ACTIVE",
        user_id: user.id,
        department_id: dept?.id,
        joined_at: new Date(),
      },
    });
  }
  return employeeData.length;
}

async function seedAssets() {
  const depts = await prisma.department.findMany();
  const cats = await prisma.category.findMany();

  const getDept = (code: string) => depts.find((d) => d.code === code)!.id;
  const getCat = (name: string) => cats.find((c) => c.name === name)!.id;

  const assets = [
    // Electronics
    {
      assetTag: "AST-0001",
      name: "Dell Latitude 5540",
      description: "Standard issue engineering laptop.",
      serialNumber: "DL5540-001",
      status: "AVAILABLE",
      condition: "GOOD",
      is_bookable: false,
      manufacturer: "Dell",
      vendor: "Dell India",
      location: "IT Store Room",
      categoryId: getCat("Electronics"),
      departmentId: getDept("IT"),
      purchase_cost: "95000.00",
    },
    {
      assetTag: "AST-0002",
      name: "MacBook Pro 14-inch",
      description: "Design and product team laptop.",
      serialNumber: "MBP14-001",
      status: "AVAILABLE",
      condition: "NEW",
      is_bookable: false,
      manufacturer: "Apple",
      vendor: "Apple Business",
      location: "IT Store Room",
      categoryId: getCat("Electronics"),
      departmentId: getDept("IT"),
      purchase_cost: "185000.00",
    },
    {
      assetTag: "AST-0004",
      name: "ThinkPad T14",
      description: "Business laptop.",
      serialNumber: "TP14-001",
      status: "AVAILABLE",
      condition: "GOOD",
      is_bookable: false,
      manufacturer: "Lenovo",
      vendor: "Lenovo Direct",
      location: "Building A",
      categoryId: getCat("Electronics"),
      departmentId: getDept("FIN"),
      purchase_cost: "105000.00",
    },
    {
      assetTag: "AST-0005",
      name: "iPad Pro 11",
      description: "Tablet for field operations.",
      serialNumber: "IPAD-001",
      status: "AVAILABLE",
      condition: "FAIR",
      is_bookable: false,
      manufacturer: "Apple",
      vendor: "Apple Business",
      location: "Building C",
      categoryId: getCat("Electronics"),
      departmentId: getDept("OPS"),
      purchase_cost: "75000.00",
    },
    // Furniture
    {
      assetTag: "AST-0003",
      name: "Standing Desk",
      description: "Height-adjustable workstation desk.",
      serialNumber: null,
      status: "AVAILABLE",
      condition: "GOOD",
      is_bookable: true,
      manufacturer: "Flexispot",
      vendor: "Office Supplies Partner",
      location: "Building A - Floor 2",
      categoryId: getCat("Furniture"),
      departmentId: getDept("FAC"),
      purchase_cost: "32000.00",
    },
    {
      assetTag: "AST-0006",
      name: "Ergonomic Chair",
      description: "Herman Miller Aeron.",
      serialNumber: "HM-001",
      status: "AVAILABLE",
      condition: "GOOD",
      is_bookable: false,
      manufacturer: "Herman Miller",
      vendor: "Office Furniture Co",
      location: "Building B",
      categoryId: getCat("Furniture"),
      departmentId: getDept("FAC"),
      purchase_cost: "85000.00",
    },
    // Bookable
    {
      assetTag: "AST-0007",
      name: "Company Car - Sedan",
      description: "Toyota Camry for client visits.",
      serialNumber: "VIN123456789",
      status: "AVAILABLE",
      condition: "GOOD",
      is_bookable: true,
      manufacturer: "Toyota",
      vendor: "Toyota Motors",
      location: "Basement Parking",
      categoryId: getCat("Vehicles"),
      departmentId: getDept("OPS"),
      purchase_cost: "2500000.00",
    },
    {
      assetTag: "AST-0008",
      name: "Projector X100",
      description: "4K Projector for events.",
      serialNumber: "PRJ-001",
      status: "AVAILABLE",
      condition: "NEW",
      is_bookable: true,
      manufacturer: "Sony",
      vendor: "AV Solutions",
      location: "Building A",
      categoryId: getCat("Electronics"),
      departmentId: getDept("IT"),
      purchase_cost: "120000.00",
    },
    {
      assetTag: "AST-0009",
      name: "Meeting Room Alpha",
      description: "Large conference room.",
      serialNumber: null,
      status: "AVAILABLE",
      condition: "GOOD",
      is_bookable: true,
      manufacturer: null,
      vendor: null,
      location: "Building A - Floor 3",
      categoryId: getCat("Meeting Rooms"),
      departmentId: getDept("FAC"),
      purchase_cost: "0.00",
    },
  ];

  for (const asset of assets) {
    await prisma.asset.upsert({
      where: { assetTag: asset.assetTag },
      update: asset as any,
      create: asset as any,
    });
  }
  return assets.length;
}

async function seedInteractions(admin: any) {
  const employees = await prisma.employees.findMany();
  const assets = await prisma.asset.findMany();

  const emp = (code: string) => employees.find((e) => e.employee_code === code)!;
  const ast = (tag: string) => assets.find((a) => a.assetTag === tag)!;

  // 1. Allocations
  const alloc1 = await prisma.asset_allocations.create({
    data: {
      id: randomUUID(),
      asset_id: ast("AST-0001").id,
      employee_id: emp("EMP-0004").id,
      allocated_by: emp("EMP-0001").id,
      status: "ACTIVE",
      allocated_at: new Date(Date.now() - 10 * 86400000),
      expected_return: new Date(Date.now() + 30 * 86400000),
    },
  });
  await prisma.asset.update({
    where: { id: ast("AST-0001").id },
    data: { status: "ALLOCATED" },
  });

  const alloc2 = await prisma.asset_allocations.create({
    data: {
      id: randomUUID(),
      asset_id: ast("AST-0002").id,
      employee_id: emp("EMP-0007").id,
      allocated_by: emp("EMP-0001").id,
      status: "ACTIVE",
      allocated_at: new Date(Date.now() - 5 * 86400000),
      expected_return: new Date(Date.now() - 1 * 86400000),
    }, // OVERDUE
  });
  await prisma.asset.update({
    where: { id: ast("AST-0002").id },
    data: { status: "ALLOCATED" },
  });

  // 2. Maintenance Requests
  await prisma.maintenance_requests.create({
    data: {
      id: randomUUID(),
      asset_id: ast("AST-0004").id,
      reported_by: emp("EMP-0003").id,
      priority: "HIGH",
      description: "Screen flickering randomly.",
      status: "PENDING",
      created_at: new Date(Date.now() - 2 * 86400000),
      updated_at: new Date(),
    },
  });
  await prisma.asset.update({
    where: { id: ast("AST-0004").id },
    data: { status: "IN_MAINTENANCE" },
  });

  await prisma.maintenance_requests.create({
    data: {
      id: randomUUID(),
      asset_id: ast("AST-0006").id,
      reported_by: emp("EMP-0008").id,
      priority: "MEDIUM",
      description: "Armrest broken.",
      status: "RESOLVED",
      assigned_to: emp("EMP-0005").id,
      resolved_by: emp("EMP-0005").id,
      resolved_at: new Date(),
      resolution_note: "Replaced armrest.",
      created_at: new Date(Date.now() - 7 * 86400000),
      updated_at: new Date(),
    },
  });

  // 3. Bookings
  await prisma.resource_bookings.create({
    data: {
      id: randomUUID(),
      asset_id: ast("AST-0009").id,
      employee_id: emp("EMP-0002").id,
      purpose: "HR Interviews",
      status: "ACTIVE",
      start_time: new Date(Date.now() - 3600000),
      end_time: new Date(Date.now() + 3600000),
      created_at: new Date(),
      updated_at: new Date(),
    },
  });

  await prisma.resource_bookings.create({
    data: {
      id: randomUUID(),
      asset_id: ast("AST-0007").id,
      employee_id: emp("EMP-0003").id,
      purpose: "Client meeting transport",
      status: "APPROVED",
      start_time: new Date(Date.now() + 86400000),
      end_time: new Date(Date.now() + 86400000 + 7200000),
      created_at: new Date(),
      updated_at: new Date(),
    },
  });

  // 4. Audit Cycles
  const audit = await prisma.audit_cycles.create({
    data: {
      id: randomUUID(),
      title: "Q3 IT Assets Audit",
      start_date: new Date(Date.now() - 2 * 86400000),
      end_date: new Date(Date.now() + 10 * 86400000),
      status: "IN_PROGRESS",
      created_by: admin.id,
      updated_at: new Date(),
    },
  });
  await prisma.audit_assignments.create({
    data: { id: randomUUID(), cycle_id: audit.id, auditor_id: emp("EMP-0006").id },
  });
  await prisma.audit_items.create({
    data: {
      id: randomUUID(),
      cycle_id: audit.id,
      asset_id: ast("AST-0001").id,
      expected_location: "IT Store Room",
      result: "FOUND",
      audited_at: new Date(),
    },
  });
  await prisma.audit_items.create({
    data: {
      id: randomUUID(),
      cycle_id: audit.id,
      asset_id: ast("AST-0002").id,
      expected_location: "IT Store Room",
      result: null,
    }, // pending
  });

  // 5. Activity Logs & Notifications
  await prisma.activity_logs.create({
    data: {
      id: randomUUID(),
      user_id: admin.id,
      asset_id: ast("AST-0001").id,
      module: "asset",
      action: "ALLOCATED",
      note: "Allocated to Charlie Brown",
      created_at: new Date(),
    },
  });
  await prisma.notifications.create({
    data: {
      id: randomUUID(),
      employee_id: emp("EMP-0007").id,
      title: "Asset Return Overdue",
      message: "Please return MacBook Pro 14-inch.",
      type: "RETURN_DUE",
      is_read: false,
      created_at: new Date(),
    },
  });
}

async function main() {
  console.log("Seeding AssetFlow database with extensive dummy data...");
  const departmentCount = await seedDepartments();
  const categoryCount = await seedCategories();
  const admin = await seedAdmin();
  const employeeCount = await seedEmployees();
  const assetCount = await seedAssets();

  // Clear old interaction data for fresh seed
  await prisma.asset_allocations.deleteMany();
  await prisma.maintenance_requests.deleteMany();
  await prisma.resource_bookings.deleteMany();
  await prisma.audit_cycles.deleteMany();
  await prisma.activity_logs.deleteMany();
  await prisma.notifications.deleteMany();
  await prisma.transfer_requests.deleteMany();

  await seedInteractions(admin);

  console.log(`Seeded ${departmentCount} departments.`);
  console.log(`Seeded ${categoryCount} categories.`);
  console.log(`Seeded ${employeeCount} additional employees.`);
  console.log(`Seeded ${assetCount} total demo assets.`);
  console.log(`Seeded interactions (allocations, maintenance, bookings, audits).`);
  console.log(
    `Admin login: ${admin.email} / ${process.env.SEED_ADMIN_PASSWORD ?? "Admin@1234"}`,
  );
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
