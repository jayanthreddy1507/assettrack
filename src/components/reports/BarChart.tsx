import type { ChartPoint } from "./reports.types";

export function BarChart({ data }: { data: ChartPoint[] }) {
  const max = Math.max(...data.map((item) => item.value), 1);

  return (
    <div className="reports-bar-chart">
      {data.map((item) => (
        <div key={item.label}>
          <span
            style={{
              height: `${(item.value / max) * 100}%`,
            }}
          />
          <small>{item.label}</small>
        </div>
      ))}
    </div>
  );
}
