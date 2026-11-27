import { lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { Activity, ArrowUpRight, MapPinned } from "lucide-react";
import { DataTable, EmptyState, linkClass, Panel, ResourceState, Stat } from "../components/Dashboard";
import BenchmarkTable, { benchmarkNote } from "../components/BenchmarkTable";
import DimensionCharts from "../components/DimensionCharts";
import DistrictSelector from "../components/DistrictSelector";
import { useDistricts, useSelectedDistrict } from "../hooks/useDistricts";
import useResource from "../hooks/useResource";
import { detailPath, districtLink, geoPath, indicatorLabel, indicatorValue, number, placeName } from "../utils/analytics";

const DistrictMap = lazy(() => import("../components/DistrictMap"));

function DistrictProfile({ profile }) {
  const { krdi, indicators, benchmarking, dimensions, district, state, district_code: code } = profile;
  return (
    <>
      <Panel title={placeName(district)} description={placeName(state) + " · " + profile.reference_year}
        actions={<div className="flex flex-wrap gap-4 text-sm">
          <Link className={linkClass} to={"/compare?a=" + encodeURIComponent(code)}>Compare district</Link>
          <Link className={linkClass} to={districtLink(code, "/gaps")}>Investigate gaps</Link>
        </div>}>
        <p className="text-sm text-slate-600">Provisional KRDI v0.1 district profile</p>
      </Panel>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="KRDI score" value={number(krdi.score)} detail="Composite score out of 100" icon={Activity} />
        <Stat label="National rank" value={number(krdi.rank)} detail="Lower rank numbers indicate stronger performance" icon={MapPinned} />
        <Stat label="Rank stability" value={krdi.stability ?? "N/A"} detail="Sensitivity across tested weighting scenarios" icon={ArrowUpRight} />
        <Stat label="Rank range" value={number(krdi.rank_range)} detail="Difference between the highest and lowest ranks across tested scenarios" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["population", indicators.demographics],
          ["income_median", indicators.economy],
          ["poverty_absolute", indicators.economy],
          ["u_rate", indicators.employment],
        ].map(([key, group]) => <Stat key={key} label={indicatorLabel(key)} value={indicatorValue(key, group[key])} color="text-slate-900" />)}
      </div>
      <DimensionCharts first={{ name: placeName(district), dimensions }} />
      <Panel title="Socioeconomic indicators" description="2024 source units are shown where documented. N/A indicates unavailable data.">
        <div className="grid gap-4 lg:grid-cols-2">
          {Object.entries(indicators).map(([group, values]) => (
            <div key={group} className="min-w-0">
              <h3 className="mb-2 font-semibold capitalize">{group}</h3>
              <DataTable label={group + " indicators"} columns={["Indicator", "District value"]}>
                {Object.entries(values).map(([key, value]) => (
                  <tr key={key}><th scope="row">{indicatorLabel(key)}</th><td>{indicatorValue(key, value)}</td></tr>
                ))}
              </DataTable>
            </div>
          ))}
        </div>
      </Panel>
      <Panel title="National district benchmarking" description={benchmarkNote}><BenchmarkTable benchmarks={benchmarking} /></Panel>
      <Panel title="Ranking sensitivity" description="KRDI rankings depend on indicator weights and normalization. The rank range above summarizes the spread across the four tested weighting scenarios." />
    </>
  );
}

export default function DistrictIntelligence() {
  const list = useDistricts();
  const { district, invalid, select } = useSelectedDistrict(list.districts);
  const profile = useResource(district ? detailPath(district.code, "/full-intelligence") : null);
  const geometry = useResource(district ? geoPath(district.code) : null);

  return (
    <div className="space-y-5">
      <Panel title="Select a district">
        <ResourceState resource={list} label="district options" empty={!list.districts.length && "No districts are available."}>
          <DistrictSelector label="District profile" districts={list.districts} code={district?.code} onChange={select} />
          {invalid && <p role="alert" className="mt-3 text-sm text-rose-800">That district code is unavailable. Choose a district from the list.</p>}
        </ResourceState>
      </Panel>
      {district && (
        <>
          <ResourceState resource={profile} label="district profile">
            {profile.data && <DistrictProfile profile={profile.data} />}
          </ResourceState>
          <Panel title={district.name + " boundary"} description={district.state + " · Hover over the boundary for district information."}>
            <Suspense fallback={<EmptyState>Loading the interactive map…</EmptyState>}>
              <DistrictMap key={district.code} geometry={geometry} />
            </Suspense>
          </Panel>
        </>
      )}
    </div>
  );
}
