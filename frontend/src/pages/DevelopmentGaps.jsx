import { Link } from "react-router-dom";
import { Bar, BarChart, CartesianGrid, Cell, Legend, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { DataTable, EmptyState, linkClass, Panel, ResourceState, Stat } from "../components/Dashboard";
import { benchmarkNote } from "../components/BenchmarkTable";
import DistrictSelector from "../components/DistrictSelector";
import { useDistricts, useSelectedDistrict } from "../hooks/useDistricts";
import useResource from "../hooks/useResource";
import { detailPath, districtLink, indicatorLabel, indicatorValue, number, valid } from "../utils/analytics";

const categories = {
  relative_strengths: { label: "Relative strength", color: "#0f766e" },
  middle_range: { label: "Middle range", color: "#a4540b" },
  potential_gaps: { label: "Potential gap", color: "#a23d4e" },
};
const unavailable = { label: "N/A", color: "#94a3b8" };
const investigation = {
  income_median: "Review household income levels and the local distribution of earnings.",
  poverty_absolute: "Review income distribution and household economic conditions.",
  poverty_relative: "Review income disparities and household living conditions.",
  gini: "Review how household income is distributed across the district.",
  p_rate: "Investigate barriers to labour force participation.",
  u_rate: "Review local employment opportunities and barriers to finding work.",
  piped_water: "Review household water accessibility and infrastructure coverage.",
  sanitation: "Review sanitation infrastructure coverage.",
  electricity: "Review electricity connection and service coverage.",
};

function PositionTooltip({ active, payload }) {
  const row = payload?.[0]?.payload;
  if (!active || !row) return null;
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 text-sm shadow-sm">
      <strong>{row.label}</strong>
      <p>{row.category.label} · Position {number(row.position)} / 100</p>
    </div>
  );
}

function Infrastructure({ rows }) {
  const available = rows.filter(({ value }) => value);
  return (
    <Panel title="Infrastructure access shortfalls" description="Each bar shows reported access and the remaining gap to 100% access. Shortfalls are measured in percentage points (pp).">
      {available.length ? (
        <ResponsiveContainer width="100%" minWidth={0} height={210}>
          <BarChart data={available} layout="vertical" margin={{ right: 15 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" domain={[0, 100]} />
            <YAxis type="category" dataKey="label" width={96} tick={{ fontSize: 11 }} />
            <Tooltip formatter={(value, name) => [number(value) + (name === "Access" ? "%" : " pp"), name]} />
            <Legend />
            <Bar dataKey="value.access_percent" stackId="access" name="Access" fill="#0f766e" isAnimationActive={false} />
            <Bar dataKey="value.shortfall_percentage_points" stackId="access" name="Shortfall" fill="#b35c40" isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      ) : <EmptyState>No infrastructure access measurements are available.</EmptyState>}
      <DataTable label="Infrastructure shortfall details" columns={["Indicator", "Access", "Shortfall", "Classification"]}>
        {rows.map(({ key, label, value }) => (
          <tr key={key}><th scope="row">{label}</th><td>{indicatorValue(key, value?.access_percent)}</td>
            <td>{valid(value?.shortfall_percentage_points) ? number(value.shortfall_percentage_points) + " pp" : "N/A"}</td>
            <td>{value?.classification ?? "N/A"}</td></tr>
        ))}
      </DataTable>
    </Panel>
  );
}

function GapAnalysis({ profile }) {
  const { benchmarking, development_analysis: development, infrastructure_analysis: infrastructure } = profile;
  const infrastructureRows = Object.entries(infrastructure.access).map(([key, value]) => ({ key, label: indicatorLabel(key), value }));
  const byIndicator = Object.fromEntries(Object.entries(categories).flatMap(([group, category]) =>
    development[group].map(({ indicator }) => [indicator, category]),
  ));
  const rows = Object.entries(benchmarking).map(([key, value]) => ({
    key, value, label: indicatorLabel(key), position: value?.rank_position ?? null,
    category: byIndicator[key] ?? unavailable,
    substantial: infrastructure.summary.substantial_gap_indicators.includes(key),
  })).sort((a, b) => (a.position ?? Infinity) - (b.position ?? Infinity));
  const priorities = [...rows].sort((a, b) => Number(b.substantial) - Number(a.substantial));

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Relative strengths" value={number(development.summary.relative_strengths)} detail="Rank position 75 and above" />
        <Stat label="Middle range" value={number(development.summary.middle_range)} detail="Rank position 25 to below 75" color="text-amber-800" />
        <Stat label="Potential gaps" value={number(development.summary.potential_gaps)} detail="Rank position below 25" color="text-rose-800" />
        <Stat label="Substantial infrastructure shortfalls" value={number(infrastructure.summary.substantial_gap_count)} detail="Shortfall above 15 percentage points" color="text-rose-800" />
      </div>
      <Panel title="National benchmark position" description={benchmarkNote}>
        <ul className="mb-3 flex flex-wrap gap-4 text-xs text-slate-700">
          {[...Object.values(categories), unavailable].map(({ label, color }) => (
            <li key={label} className="flex items-center gap-2"><span className="size-3 rounded-sm" aria-hidden="true" style={{ backgroundColor: color }} />{label}</li>
          ))}
        </ul>
        <ResponsiveContainer width="100%" minWidth={0} height={Math.max(260, rows.length * 36 + 40)}>
          <BarChart data={rows} layout="vertical" margin={{ right: 15 }} barSize={17}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} />
            <YAxis type="category" dataKey="label" width={125} tick={{ fontSize: 10 }} />
            <ReferenceLine x={25} stroke="#64748b" strokeDasharray="4 4" />
            <ReferenceLine x={75} stroke="#64748b" strokeDasharray="4 4" />
            <Tooltip content={<PositionTooltip />} />
            <Bar dataKey="position" isAnimationActive={false}>
              {rows.map(({ key, category }) => <Cell key={key} fill={category.color} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        {rows.some(({ position }) => !valid(position)) && <p className="text-xs text-slate-600">Rows without a bar may have a zero or unavailable rank position. See exact values in the table below.</p>}
      </Panel>
      <Infrastructure rows={infrastructureRows} />
      <Panel title="Areas for further investigation" description="Substantial infrastructure shortfalls appear first, followed by the lowest benchmark positions. Suggestions identify questions to investigate using additional evidence.">
        <DataTable label="Development priorities" columns={["Indicator", "District value", "District median", "National rank", "Rank position", "Classification", "Investigation area"]}>
          {priorities.map(({ key, label, category, position, substantial, value }) => (
            <tr key={key}>
              <th scope="row">{label}</th><td>{indicatorValue(key, value?.value)}</td><td>{indicatorValue(key, value?.national_median)}</td>
              <td>{value ? value.rank + " / " + value.out_of : "N/A"}</td><td>{number(position)}</td>
              <td>{category.label}{substantial && <span className="block font-semibold text-rose-800">Substantial shortfall</span>}</td>
              <td>{substantial || category === categories.potential_gaps ? investigation[key] : "—"}</td>
            </tr>
          ))}
        </DataTable>
      </Panel>
    </>
  );
}

export default function DevelopmentGaps() {
  const list = useDistricts();
  const { district, invalid, select } = useSelectedDistrict(list.districts);
  const profile = useResource(district ? detailPath(district.code, "/full-intelligence") : null);

  return (
    <div className="space-y-5">
      <Panel title="Choose a district to investigate" actions={district && <Link className={linkClass + " text-sm"} to={districtLink(district.code)}>Open district profile</Link>}>
        <ResourceState resource={list} label="district options" empty={!list.districts.length && "No districts are available."}>
          <DistrictSelector label="Development gaps" districts={list.districts} code={district?.code} onChange={select} />
          {invalid && <p role="alert" className="mt-3 text-sm text-rose-800">That district code is unavailable. Choose a district from the list.</p>}
        </ResourceState>
      </Panel>
      {district && <ResourceState resource={profile} label="development gap analysis">
        {profile.data && <GapAnalysis profile={profile.data} />}
      </ResourceState>}
    </div>
  );
}
