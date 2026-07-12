"use client";

import { Button } from "@/components/ui";
import { BarChart } from "./BarChart";
import { BookingHeatmap } from "./BookingHeatmap";
import { LineChart } from "./LineChart";
import type { ReportsData } from "./reports.types";

export function ReportsWorkspace({
  data,
}: {
  data: ReportsData;
}) {
  function exportReport() {
    const blob = new Blob(
      [
        JSON.stringify(
          {
            utilizationByDepartment:
              data.utilizationByDepartment,
            maintenanceFrequency:
              data.maintenanceFrequency,
            mostUsedAssets: data.mostUsedAssets,
            idleAssets: data.idleAssets,
            dueMaintenance: data.dueMaintenance,
          },
          null,
          2
        ),
      ],
      { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "assetflow-report.json";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="reports-content">
      <header className="reports-page-header">
        <div>
          <h1>Reports &amp; Analytics</h1>
          <p>Operational insights across assets and resources.</p>
        </div>
        <Button onClick={exportReport}>Export Report</Button>
      </header>

      <section className="reports-grid">
        <article className="reports-card">
          <h2>Utilization by Department</h2>
          <BarChart data={data.utilizationByDepartment} />
        </article>

        <article className="reports-card">
          <h2>Maintenance Frequency</h2>
          <LineChart data={data.maintenanceFrequency} />
        </article>

        <article className="reports-card reports-list-card">
          <h2>Most Used Assets</h2>
          <ul>
            {data.mostUsedAssets.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>

        <article className="reports-card reports-list-card">
          <h2>Idle Assets</h2>
          <ul>
            {data.idleAssets.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>

        <article className="reports-card reports-list-card reports-card--wide">
          <h2>Assets Due for Maintenance / Nearing Retirement</h2>
          <ul>
            {data.dueMaintenance.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>

        <article className="reports-card reports-card--wide">
          <h2>Resource Booking Heatmap</h2>
          <BookingHeatmap values={data.bookingHeatmap} />
        </article>
      </section>
    </div>
  );
}
