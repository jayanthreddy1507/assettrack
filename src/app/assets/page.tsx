import { DashboardShell } from "@/components/dashboard";
import {
  AssetRegistry,
  getAssetRegistryData,
} from "@/components/assets";

export default async function AssetsPage() {
  const data = await getAssetRegistryData();

  return (
    <DashboardShell user={data.user}>
      <AssetRegistry data={data} />
    </DashboardShell>
  );
}
