import { DataTable } from "./Dashboard";
import { indicatorLabel, indicatorValue, number } from "../utils/analytics";

export const benchmarkNote = "The national median is the middle value across districts with data. Rank position uses a 0–100 scale, where 100 represents the highest rank.";

const directionLabels = { higher: "Higher", lower: "Lower" };

export default function BenchmarkTable({ benchmarks }) {
  return (
    <DataTable label="National district benchmarks" columns={["Indicator", "District value", "District median", "Rank", "Valid districts", "Rank position", "Preferred direction"]}>
      {Object.entries(benchmarks).map(([key, item]) => (
        <tr key={key}>
          <th scope="row">{indicatorLabel(key)}</th>
          <td>{indicatorValue(key, item?.value)}</td>
          <td>{indicatorValue(key, item?.national_median)}</td>
          <td>{number(item?.rank)}</td>
          <td>{number(item?.out_of)}</td>
          <td>{number(item?.rank_position)}</td>
          <td>{directionLabels[item?.direction] ?? "N/A"}</td>
        </tr>
      ))}
    </DataTable>
  );
}
