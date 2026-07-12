import { dummyReportsData } from "./reports.data";
import type { ReportsData } from "./reports.types";

export async function getReportsData(): Promise<ReportsData> {
  return structuredClone(dummyReportsData);
}

/*
Replace with Prisma aggregate/groupBy queries when analytics models exist.
*/
