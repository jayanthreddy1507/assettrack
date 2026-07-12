/**
 * assettrack Database Seed
 *
 * Populates the database with default departments, categories, and an admin user.
 * Run with: npx prisma db seed
 *
 * Uses upsert — safe to run multiple times without creating duplicates.
 */

require("dotenv/config");
const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...\n");

  // ─── DEPARTMENTS ───────────────────────────────────────────────────────────
  const departments = [
    { name: "Information Technology", code: "IT",  description: "IT infrastructure, software, and support" },
    { name: "Human Resources",        code: "HR",  description: "People operations and recruitment" },
    { name: "Finance",                code: "FIN", description: "Accounting, budgets, and payroll" },
    { name: "Operations",             code: "OPS", description: "Day-to-day business operations" },
    { name: "Facilities",             code: "FAC", description: "Building and equipment management" },
  ];

  for (const dept of departments) {
    await prisma.department.upsert({
      where:  { code: dept.code },
      update: {},
      create: dept,
    });
  }
  console.log(`✅ ${departments.length} departments seeded`);

  // ─── CATEGORIES ────────────────────────────────────────────────────────────
  const categories = [
    { name: "Electronics",      description: "Computers, phones, and electronic devices", icon: "laptop" },
    { name: "Furniture",        description: "Desks, chairs, and office furniture",       icon: "armchair" },
    { name: "Vehicles",         description: "Company cars and transport equipment",      icon: "car" },
    { name: "Tools",            description: "Hand tools and power tools",                icon: "wrench" },
    { name: "Office Supplies",  description: "Stationery and consumables",                icon: "paperclip" },
    { name: "Software",         description: "Software licenses and subscriptions",       icon: "code" },
    { name: "Network",          description: "Routers, switches, and cabling",            icon: "network" },
    { name: "Safety Equipment", description: "PPE and safety gear",                      icon: "shield" },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where:  { name: cat.name },
      update: {},
      create: cat,
    });
  }
  console.log(`✅ ${categories.length} categories seeded`);

  // ─── ADMIN USER ────────────────────────────────────────────────────────────
  const itDept = await prisma.department.findUnique({ where: { code: "IT" } });

  const adminUser = await prisma.user.upsert({
    where:  { email: "admin@assettrack.com" },
    update: {},
    create: {
      name:         "System Admin",
      email:        "admin@assettrack.com",
      password:     await bcrypt.hash("Admin@1234", 10),
      role:         "SUPER_ADMIN",
      status:       "ACTIVE",
      employeeId:   "EMP-0001",
      departmentId: itDept?.id ?? null,
    },
  });
  console.log(`✅ Admin user seeded: ${adminUser.email}`);

  // ─── DEMO ASSETS ───────────────────────────────────────────────────────────
  const electronics = await prisma.category.findUnique({ where: { name: "Electronics" } });
  const furniture   = await prisma.category.findUnique({ where: { name: "Furniture" } });

  const demoAssets = [
    {
      name:         "Dell Latitude 5540",
      assetTag:     "AST-0001",
      serialNumber: "DL5540-001",
      status:       "AVAILABLE",
      categoryId:   electronics.id,
      departmentId: itDept.id,
      metadata:     { brand: "Dell", model: "Latitude 5540", ram: "16GB", storage: "512GB SSD" },
      location:     "IT Store Room",
    },
    {
      name:         "MacBook Pro 14-inch",
      assetTag:     "AST-0002",
      serialNumber: "MBP14-001",
      status:       "AVAILABLE",
      categoryId:   electronics.id,
      departmentId: itDept.id,
      metadata:     { brand: "Apple", model: "MacBook Pro M3", ram: "16GB", storage: "512GB SSD" },
      location:     "IT Store Room",
    },
    {
      name:         "Standing Desk",
      assetTag:     "AST-0003",
      serialNumber: null,
      status:       "ACTIVE",
      categoryId:   furniture.id,
      departmentId: itDept.id,
      metadata:     { brand: "Flexispot", color: "Black" },
      location:     "Floor 2 - Open Plan",
    },
  ];

  for (const asset of demoAssets) {
    await prisma.asset.upsert({
      where:  { assetTag: asset.assetTag },
      update: {},
      create: asset,
    });
  }
  console.log(`✅ ${demoAssets.length} demo assets seeded`);

  console.log("\n🎉 Seed complete!");
  console.log("   Login → admin@assettrack.com / Admin@1234\n");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
