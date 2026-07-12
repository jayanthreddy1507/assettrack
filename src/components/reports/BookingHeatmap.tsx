export function BookingHeatmap({
  values,
}: {
  values: number[][];
}) {
  const max = Math.max(...values.flat(), 1);

  return (
    <div className="reports-heatmap">
      {values.flatMap((row, rowIndex) =>
        row.map((value, columnIndex) => (
          <span
            key={`${rowIndex}-${columnIndex}`}
            title={`Usage score ${value}`}
            style={{
              opacity: 0.2 + (value / max) * 0.8,
            }}
          />
        ))
      )}
    </div>
  );
}
