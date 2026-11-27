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

function DistrictMetrics({ profile }) {
  const { krdi, indicators } = profile;
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Stat prominent label="KRDI score" value={number(krdi.score)} icon={Activity} />
      <Stat prominent label="National rank" value={number(krdi.rank)} icon={MapPinned} />
      <Stat prominent label="Rank stability" value={krdi.stability ?? "N/A"} icon={ArrowUpRight} />
      <Stat prominent label="Rank range" value={number(krdi.rank_range)} />
      {[
        ["population", indicators.demographics],
        ["income_median", indicators.economy],
        ["poverty_absolute", indicators.economy],
        ["u_rate", indicators.employment],
      ].map(([key, group]) => <Stat key={key} label={indicatorLabel(key)} value={indicatorValue(key, group[key])} color="text-slate-900" />)}
    </div>
  );
}

function DistrictIndicators({ profile }) {
  const { indicators, benchmarking } = profile;
  return (
    <>
      <Panel title="Socioeconomic Indicators" description="N/A means data is unavailable.">
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
      <Panel title="National District Benchmarking" description={benchmarkNote}><BenchmarkTable benchmarks={benchmarking} /></Panel>
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
      <div className={district ? "grid gap-5 lg:grid-cols-[minmax(0,3fr)_minmax(0,1fr)]" : undefined}>
        <Panel title="Select a District">
          <ResourceState resource={list} label="district options" empty={!list.districts.length && "No districts are available."}>
            <DistrictSelector label="District profile" districts={list.districts} code={district?.code} onChange={select} />
            {invalid && <p role="alert" className="mt-3 text-sm text-rose-800">That district code is unavailable. Choose a district from the list.</p>}
          </ResourceState>
        </Panel>
        {district && (
          <Panel title={district.name} description={profile.data ? district.state + " · " + profile.data.reference_year : district.state}>
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
              <Link className={linkClass} to={"/compare?a=" + encodeURIComponent(district.code)}>Compare district</Link>
              <Link className={linkClass} to={districtLink(district.code, "/gaps")}>Investigate gaps</Link>
            </div>
          </Panel>
        )}
      </div>
      {district && (
        <>
          <ResourceState resource={profile} label="district profile">
            {profile.data && <DistrictMetrics profile={profile.data} />}
          </ResourceState>
          <div className={profile.data ? "grid gap-5 lg:grid-cols-2" : undefined}>
            {profile.data && <DimensionCharts first={{ name: placeName(profile.data.district), dimensions: profile.data.dimensions }} />}
            <Panel title={district.name + " Boundary"} description="Hover over the boundary for district information.">
              <Suspense fallback={<EmptyState>Loading the interactive map…</EmptyState>}>
                <DistrictMap key={district.code} geometry={geometry} />
              </Suspense>
            </Panel>
          </div>
          {profile.data && <DistrictIndicators profile={profile.data} />}
        </>
      )}
    </div>
  );
}
