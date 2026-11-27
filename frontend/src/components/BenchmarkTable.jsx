import { DataTable } from "./Dashboard";
import { indicatorLabel, indicatorValue, number } from "../utils/analytics";

export const benchmarkNote = "National medians are unweighted across districts with valid data. Rank position uses 100 × (valid districts − rank) ÷ (valid districts − 1). Ties share a rank, and the best rank has position 100.";

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
          <td>{item?.direction ?? "N/A"}</td>
        </tr>
      ))}
    </DataTable>
  );
}
