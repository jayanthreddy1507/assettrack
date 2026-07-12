import { dummyAuditData } from "./audit.data";
import type { AuditData } from "./audit.types";

export async function getAuditData(): Promise<AuditData> {
  return structuredClone(dummyAuditData);
}

/*
Replace with Prisma when audit models are available:

const cycles = await prisma.auditCycle.findMany({
  include: {
    auditors: { include: { user: true } },
    items: { include: { asset: true } },
  },
  orderBy: { startDate: "desc" },
});
*/
