import { ok } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

export async function GET() {
  await prisma.$queryRaw`SELECT 1`;

  return ok({
    status: "ok",
    service: "assetflow-api",
    timestamp: new Date().toISOString(),
  });
}
