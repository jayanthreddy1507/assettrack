import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

import { PrismaClient } from "../src/generated/prisma/client";

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
    update: {
      name: "System Admin",
      password,
      role: "SUPER_ADMIN",
      is_active: true,
    },
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

async function seedAssets() {
  const itDepartment = await prisma.department.findUniqueOrThrow({
    where: { code: "IT" },
  });
  const facilitiesDepartment = await prisma.department.findUniqueOrThrow({
    where: { code: "FAC" },
  });
  const electronics = await prisma.category.findUniqueOrThrow({
    where: { name: "Electronics" },
  });
  const furniture = await prisma.category.findUniqueOrThrow({
    where: { name: "Furniture" },
  });

  const assets = [
    {
      assetTag: "AST-0001",
      name: "Dell Latitude 5540",
      description: "Standard issue engineering laptop.",
      serialNumber: "DL5540-001",
      status: "AVAILABLE" as const,
      condition: "GOOD" as const,
      is_bookable: false,
      manufacturer: "Dell",
      vendor: "Dell India",
      location: "IT Store Room",
      categoryId: electronics.id,
      departmentId: itDepartment.id,
      purchase_cost: "95000.00",
    },
    {
      assetTag: "AST-0002",
      name: "MacBook Pro 14-inch",
      description: "Design and product team laptop.",
      serialNumber: "MBP14-001",
      status: "AVAILABLE" as const,
      condition: "NEW" as const,
      is_bookable: false,
      manufacturer: "Apple",
      vendor: "Apple Business",
      location: "IT Store Room",
      categoryId: electronics.id,
      departmentId: itDepartment.id,
      purchase_cost: "185000.00",
    },
    {
      assetTag: "AST-0003",
      name: "Standing Desk",
      description: "Height-adjustable workstation desk.",
      serialNumber: null,
      status: "AVAILABLE" as const,
      condition: "GOOD" as const,
      is_bookable: true,
      manufacturer: "Flexispot",
      vendor: "Office Supplies Partner",
      location: "Building A - Floor 2",
      categoryId: furniture.id,
      departmentId: facilitiesDepartment.id,
      purchase_cost: "32000.00",
    },
  ];

  for (const asset of assets) {
    await prisma.asset.upsert({
      where: { assetTag: asset.assetTag },
      update: asset,
      create: asset,
    });
  }

  return assets.length;
}

async function main() {
  console.log("Seeding AssetFlow database...");

  const departmentCount = await seedDepartments();
  const categoryCount = await seedCategories();
  const admin = await seedAdmin();
  const assetCount = await seedAssets();

  console.log(`Seeded ${departmentCount} departments.`);
  console.log(`Seeded ${categoryCount} categories.`);
  console.log(`Seeded ${assetCount} demo assets.`);
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
