import type { AllocationHistoryItem } from "./allocation.types";
import { AllocationIcon } from "./AllocationIcons";

export function AllocationHistoryPanel({
  history,
}: {
  history: AllocationHistoryItem[];
}) {
  return (
    <div className="allocation-history-list">
      {history.map((item) => (
        <article key={item.id}>
          <span className="allocation-history-icon">
            <AllocationIcon
              name={
                item.action === "ALLOCATED"
                  ? "user"
                  : item.action === "TRANSFERRED"
                  ? "transfer"
                  : "return"
              }
              size={16}
            />
          </span>

          <div>
            <strong>{item.assetTag} – {item.assetName}</strong>
            <p>{item.description}</p>
          </div>

          <time>{item.date}</time>
        </article>
      ))}
    </div>
  );
}
