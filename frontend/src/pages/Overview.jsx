import { lazy, Suspense, useMemo } from "react";
import { Activity, ArrowDownRight, ArrowUpRight, MapPinned } from "lucide-react";
import { Link } from "react-router-dom";
import { EmptyState, Panel, ResourceState, Stat, linkClass } from "../components/Dashboard";
import NationalCharts, { NationalRankingCharts } from "../components/NationalCharts";
import DistrictRankingTable from "../components/DistrictRankingTable";
import { useDistricts } from "../hooks/useDistricts";
import useResource from "../hooks/useResource";
import { districtLink, number, valid } from "../utils/analytics";

const DistrictMap = lazy(() => import("../components/DistrictMap"));

export default function Overview() {
  const list = useDistricts();
  const { districts } = list;
  const hasRankings = !list.loading && !list.error && districts.length > 0;
  const geometry = useResource("/api/map/geojson");
  const mapScores = useResource("/api/map/districts");
  const ranked = useMemo(() => districts
    .filter(({ score, rank }) => valid(score) && valid(rank))
    .sort((a, b) => a.rank - b.rank || b.score - a.score), [districts]);
  const scores = districts.map(({ score }) => score).filter(valid);
  const average = scores.length ? scores.reduce((sum, score) => sum + score, 0) / scores.length : null;
  const extremes = [
    { label: "Highest-ranked district", district: ranked[0], icon: ArrowUpRight },
    { label: "Lowest-ranked district", district: ranked.at(-1), icon: ArrowDownRight },
  ];

  return (
    <div className="space-y-7">
      <section className="relative isolate overflow-hidden rounded-[28px] bg-[#123747] px-6 py-8 text-white shadow-xl shadow-slate-900/5 sm:px-9 sm:py-10 lg:px-11">
        <div className="absolute -right-20 -top-28 -z-10 h-80 w-80 rounded-full border-[45px] border-teal-300/10" />
        <div className="absolute -bottom-36 right-1/4 -z-10 h-72 w-72 rounded-full bg-teal-400/10 blur-3xl" />
        <div className="max-w-3xl">
          <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-[46px]">
            District Development Across Malaysia
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
            KRDI v0.1 covers 155 eligible districts across 12 Malaysian states. National statistics and rankings reflect this group. Data were collected for Perlis and the three federal territories, but alignment with the 2024 reference year and indicator coverage are insufficient for comparable scores.
          </p>
          <Link
            to="/districts"
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-teal-300 px-5 py-3 text-sm font-bold text-[#102a38] shadow-lg shadow-teal-950/20 transition hover:-translate-y-0.5 hover:bg-teal-200"
          >
            Explore districts <ArrowUpRight size={17} />
          </Link>
        </div>
      </section>
      <ResourceState resource={list} label="district rankings">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Stat compact label="Total districts" value={<span className="block text-4xl">{number(districts.length)}</span>} icon={MapPinned} />
          <Stat compact label="Average district KRDI" value={number(average)} detail="District scores weighted equally" icon={Activity} />
          {extremes.map(({ label, district, icon }) => (
            <Stat compact key={label} label={label} icon={icon}
              value={district ? <Link className={linkClass} to={districtLink(district.code)}>{district.name}</Link> : "N/A"}
              detail={district && district.state + " · Rank #" + district.rank + " · KRDI " + number(district.score)} />
          ))}
        </div>
      </ResourceState>

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="Malaysia District Development Map" description="Scroll to zoom. Select a district to open its profile."
          actions={hasRankings && <a href="#district-rankings" className={linkClass + " text-sm"}>Choose a district from the rankings</a>}>
          <Suspense fallback={<EmptyState>Loading the interactive map…</EmptyState>}>
            <DistrictMap geometry={geometry} scores={mapScores} national />
          </Suspense>
        </Panel>
        {hasRankings && <NationalRankingCharts ranked={ranked} />}
      </div>

      {hasRankings && (
        <>
          <NationalCharts districts={districts} />
          <div id="district-rankings" tabIndex={-1} className="scroll-mt-32">
            <DistrictRankingTable districts={districts} />
          </div>
        </>
      )}
    </div>
  );
}
