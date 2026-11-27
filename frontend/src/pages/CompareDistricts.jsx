import { ArrowLeftRight } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { buttonClass, DataTable, EmptyState, Panel, ResourceState, Stat } from "../components/Dashboard";
import DimensionCharts from "../components/DimensionCharts";
import DistrictSelector from "../components/DistrictSelector";
import { useDistricts } from "../hooks/useDistricts";
import useResource from "../hooks/useResource";
import { detailPath, dimensions, indicatorDirection, indicatorLabel, indicatorValue, number, placeName, valid } from "../utils/analytics";

function delta(a, b) {
  return valid(a) && valid(b) ? a - b : null;
}

function preferred(key, difference) {
  if (!valid(difference)) return "N/A";
  if (difference === 0) return "Tie";
  return (difference > 0) === (indicatorDirection(key) === "higher") ? "District A" : "District B";
}

function Results({ comparison, detailA, detailB }) {
  const { district_a: a, district_b: b, indicator_comparison: indicators } = comparison;
  const scoreDifference = delta(a.krdi.score, b.krdi.score);
  const rankDifference = delta(a.krdi.rank, b.krdi.rank);
  const districtNames = [placeName(a.name), placeName(b.name)];
  const profiles = [detailA.data, detailB.data].map((item, i) => item && ({ name: districtNames[i], dimensions: item.dimensions }));
  const dimensionGaps = profiles.every(Boolean) ? dimensions
    .map(([key, label]) => ({ label, difference: delta(profiles[0].dimensions[key], profiles[1].dimensions[key]) }))
    .filter(({ difference }) => valid(difference))
    .sort((first, second) => Math.abs(second.difference) - Math.abs(first.difference)) : [];
  const largest = dimensionGaps[0];

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[a, b].map((district, i) => (
          <Stat key={district.code} label={(i ? "B · " : "A · ") + districtNames[i]} value={number(district.krdi.score)}
            color={i ? "text-amber-800" : "text-teal-800"}
            detail={placeName(district.state) + " · Rank " + number(district.krdi.rank) + " · " + (district.krdi.stability ?? "N/A")} />
        ))}
        <Stat label="KRDI score difference" value={valid(scoreDifference) ? number(Math.abs(scoreDifference)) : "N/A"} detail="Absolute difference in KRDI points" />
        <Stat label="National rank difference" value={valid(rankDifference) ? number(Math.abs(rankDifference)) : "N/A"} detail="Lower rank numbers indicate stronger performance" />
      </div>
      <ResourceState resource={detailA} label="District A dimensions">
        <ResourceState resource={detailB} label="District B dimensions">
          {profiles.every(Boolean) && <DimensionCharts first={profiles[0]} second={profiles[1]} />}
        </ResourceState>
      </ResourceState>
      <Panel title="Socioeconomic comparison" description="Differences use A minus B. Rate differences use percentage points. Relative performance follows the indicator’s benchmark direction.">
        <DataTable label="Socioeconomic comparison" columns={["Indicator", "A · " + districtNames[0], "B · " + districtNames[1], "Difference (A − B)", "More favorable value"]}>
          {Object.entries(indicators).map(([key, values]) => {
            const difference = delta(values.district_a, values.district_b);
            return (
              <tr key={key}>
                <th scope="row">{indicatorLabel(key)}</th>
                <td>{indicatorValue(key, values.district_a)}</td><td>{indicatorValue(key, values.district_b)}</td>
                <td>{indicatorValue(key, difference, true)}</td><td>{preferred(key, difference)}</td>
              </tr>
            );
          })}
        </DataTable>
      </Panel>
      <Panel title="Comparison insights">
        <ul className="list-disc space-y-2 pl-5 text-sm leading-6">
          {valid(scoreDifference) && <li>{scoreDifference === 0 ? "The districts have equal KRDI scores." : districtNames[scoreDifference > 0 ? 0 : 1] + " has the higher KRDI score by " + number(Math.abs(scoreDifference)) + " points."}</li>}
          {largest && <li>{largest.difference === 0 ? "The available dimension scores are equal." :
            dimensionGaps.filter(({ difference }) => Math.abs(difference) === Math.abs(largest.difference)).map(({ label }) => label).join(" and ") + " shows the largest dimension difference at " + number(Math.abs(largest.difference)) + " points."}</li>}
          {["poverty_absolute", "piped_water", "sanitation", "electricity"].map((key) => {
            const values = indicators[key];
            const difference = delta(values?.district_a, values?.district_b);
            if (!valid(difference)) return null;
            const direction = preferred(key, difference);
            if (direction === "Tie") return <li key={key}>Both districts report {indicatorValue(key, values.district_a)} for {indicatorLabel(key).toLowerCase()}.</li>;
            return <li key={key}>{districtNames[direction === "District A" ? 0 : 1]} reports {indicatorDirection(key)} {indicatorLabel(key).toLowerCase()} by {number(Math.abs(difference))} percentage points.</li>;
          })}
        </ul>
      </Panel>
    </>
  );
}

export default function CompareDistricts() {
  const list = useDistricts();
  const [params, setParams] = useSearchParams();
  const { districts } = list;
  const requestedA = params.get("a");
  const requestedB = params.get("b");
  const a = requestedA === null ? districts[0] : districts.find(({ code }) => code === requestedA);
  const b = requestedB === null ? districts.find(({ code }) => code !== a?.code) : districts.find(({ code }) => code === requestedB);
  const same = a && b && a.code === b.code;
  const pair = a && b && !same;
  const comparison = useResource(pair ? "/api/compare?" + new URLSearchParams({ district_a: a.code, district_b: b.code }) : null);
  const detailA = useResource(pair ? detailPath(a.code) : null);
  const detailB = useResource(pair ? detailPath(b.code) : null);

  function select(key, code) {
    const next = new URLSearchParams();
    if (a) next.set("a", a.code);
    if (b) next.set("b", b.code);
    next.set(key, code);
    setParams(next);
  }

  return (
    <div className="space-y-5">
      <Panel title="Choose districts to compare" actions={
        <button className={buttonClass + " disabled:opacity-40"} type="button" disabled={!pair} onClick={() => setParams({ a: b.code, b: a.code })}>
          <ArrowLeftRight size={16} /> Swap districts
        </button>
      }>
        <ResourceState resource={list} label="district options" empty={!districts.length && "No districts are available."}>
          <div className="grid gap-5 xl:grid-cols-2">
            <DistrictSelector label="District A" districts={districts} code={a?.code} excluded={same ? undefined : b?.code} onChange={(code) => select("a", code)} />
            <DistrictSelector label="District B" districts={districts} code={b?.code} excluded={same ? undefined : a?.code} onChange={(code) => select("b", code)} />
          </div>
          {!pair && <div className="mt-3"><EmptyState>{same ? "Choose two different districts to compare." : "Choose two available districts to compare."}</EmptyState></div>}
        </ResourceState>
      </Panel>
      {pair && <ResourceState resource={comparison} label="district comparison">
        {comparison.data && <Results comparison={comparison.data} detailA={detailA} detailB={detailB} />}
      </ResourceState>}
    </div>
  );
}
