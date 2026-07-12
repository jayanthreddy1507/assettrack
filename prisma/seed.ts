/**
 * AssetTrack — Database Seed
 *
 * Creates: departments, categories, admin user + employee record, demo assets.
 * Run with: npx prisma db seed
 * Safe to re-run: uses upsert throughout.
 */

import "dotenv/config";
import { PrismaPg }   from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.js";
import bcrypt          from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma  = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding AssetTrack...\n");

  // ─── DEPARTMENTS ─────────────────────────────────────────────────────────────
  const deptData = [
    { name: "Information Technology", code: "IT",  description: "IT infrastructure and software" },
    { name: "Human Resources",        code: "HR",  description: "People operations" },
    { name: "Finance",                code: "FIN", description: "Accounting and payroll" },
    { name: "Operations",             code: "OPS", description: "Day-to-day operations" },
    { name: "Facilities",             code: "FAC", description: "Building and equipment management" },
  ];

  for (const d of deptData) {
    await prisma.department.upsert({
      where: { code: d.code }, update: {}, create: d,
    });
  }
  console.log(`✅ ${deptData.length} departments`);

  // ─── CATEGORIES ──────────────────────────────────────────────────────────────
  const catData = [
    { name: "Electronics",      description: "Computers, phones, and devices",       icon: "laptop"     },
    { name: "Furniture",        description: "Desks, chairs, and office furniture",  icon: "armchair"   },
    { name: "Vehicles",         description: "Company cars and transport",            icon: "car"        },
    { name: "Tools",            description: "Hand tools and power tools",            icon: "wrench"     },
    { name: "Office Supplies",  description: "Stationery and consumables",            icon: "paperclip"  },
    { name: "Software",         description: "Licenses and subscriptions",            icon: "code"       },
    { name: "Network",          description: "Routers, switches, and cabling",        icon: "network"    },
    { name: "Safety Equipment", description: "PPE and safety gear",                  icon: "shield"     },
  ];

  for (const c of catData) {
    await prisma.category.upsert({
      where: { name: c.name }, update: {}, create: c,
    });
  }
  console.log(`✅ ${catData.length} categories`);

  // ─── ADMIN USER + EMPLOYEE ────────────────────────────────────────────────────
  const itDept = await prisma.department.findUnique({ where: { code: "IT" } });

  const adminUser = await prisma.user.upsert({
    where:  { email: "admin@assettrack.com" },
    update: {},
    create: {
      email:    "admin@assettrack.com",
      password: await bcrypt.hash("Admin@1234", 10),
      role:     "SUPER_ADMIN",
      isActive: true,
    },
  });

  await prisma.employee.upsert({
    where:  { email: "admin@assettrack.com" },
    update: {},
    create: {
      employeeCode: "EMP-0001",
      firstName:    "System",
      lastName:     "Admin",
      email:        "admin@assettrack.com",
      jobTitle:     "System Administrator",
      status:       "ACTIVE",
      userId:       adminUser.id,
      departmentId: itDept?.id ?? null,
      joinedAt:     new Date(),
    },
  });
  console.log(`✅ Admin user + employee (admin@assettrack.com / Admin@1234)`);

  // ─── DEMO ASSETS ─────────────────────────────────────────────────────────────
  const electronics = await prisma.category.findUnique({ where: { name: "Electronics" } });
  const furniture   = await prisma.category.findUnique({ where: { name: "Furniture" } });

  const assetData = [
    {
      name: "Dell Latitude 5540",  assetTag: "AST-0001", serialNumber: "DL5540-001",
      status: "AVAILABLE" as const, condition: "GOOD" as const,
      categoryId: electronics!.id, departmentId: itDept!.id,
      location: "IT Store Room",   isBookable: false,
      manufacturer: "Dell",        purchaseCost: 1200.00,
    },
    {
      name: "MacBook Pro 14-inch", assetTag: "AST-0002", serialNumber: "MBP14-001",
      status: "AVAILABLE" as const, condition: "NEW" as const,
      categoryId: electronics!.id, departmentId: itDept!.id,
      location: "IT Store Room",   isBookable: false,
      manufacturer: "Apple",       purchaseCost: 2400.00,
    },
    {
      name: "Standing Desk",       assetTag: "AST-0003",
      status: "AVAILABLE" as const, condition: "GOOD" as const,
      categoryId: furniture!.id,   departmentId: itDept!.id,
      location: "Floor 2",         isBookable: false,
      manufacturer: "Flexispot",   purchaseCost: 650.00,
    },
    {
      name: "Conference Room A",   assetTag: "AST-0004",
      status: "AVAILABLE" as const, condition: "GOOD" as const,
      categoryId: furniture!.id,   departmentId: itDept!.id,
      location: "Floor 1",         isBookable: true,
    },
  ];

  for (const a of assetData) {
    await prisma.asset.upsert({
      where: { assetTag: a.assetTag }, update: {}, create: a,
    });
  }
  console.log(`✅ ${assetData.length} demo assets`);

  console.log("\n🎉 Seed complete!");
  console.log("   Login → admin@assettrack.com / Admin@1234\n");
}

main()
  .catch((e) => { console.error("❌ Seed failed:", e); process.exit(1); })
  .finally(() => prisma.$disconnect());
