import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useNavigate } from "react-router-dom";
import { districtLink, number, valid } from "../utils/analytics";
import { EmptyState, Panel } from "./Dashboard";

function RankingTooltip({ active, payload }) {
  const district = payload?.[0]?.payload;
  if (!active || !district) return null;
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 text-sm shadow-sm">
      <strong>{district.name} · {district.state}</strong>
      <div>KRDI {number(district.score)} · Rank {number(district.rank)}</div>
    </div>
  );
}

function RankingChart({ title, districts, color }) {
  const navigate = useNavigate();
  return (
    <Panel title={title} description="National rank · Click a bar to open its district profile.">
      {districts.length ? (
        <ResponsiveContainer width="100%" minWidth={0} height={205}>
          <BarChart data={districts} layout="vertical" margin={{ right: 12, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" domain={[0, 100]} label={{ value: "KRDI score", position: "bottom", fontSize: 11 }} />
            <YAxis type="category" dataKey="name" width={106} tick={{ fontSize: 11 }} />
            <Tooltip content={<RankingTooltip />} />
            <Bar dataKey="score" fill={color} cursor="pointer" radius={[0, 4, 4, 0]} isAnimationActive={false}
              onClick={(entry) => { if (entry.payload?.code) navigate(districtLink(entry.payload.code)); }} />
          </BarChart>
        </ResponsiveContainer>
      ) : <EmptyState>No ranked scores are available.</EmptyState>}
    </Panel>
  );
}

export function NationalRankingCharts({ ranked }) {
  return (
    <div className="grid min-w-0 gap-5">
      <RankingChart title="Five highest-ranked districts" districts={ranked.slice(0, 5)} color="#0f766e" />
      <RankingChart title="Five lowest-ranked districts" districts={ranked.slice(-5).reverse()} color="#466c89" />
    </div>
  );
}

export default function NationalCharts({ districts }) {
  const { bins, observations, stateMeans } = useMemo(() => {
    const totals = new Map();
    let observations = 0;
    const bins = Array.from({ length: 10 }, (_, i) => ({ range: (i * 10) + (i === 9 ? "–100" : "–<" + ((i + 1) * 10)), count: 0 }));
    for (const { state, score } of districts) {
      if (!valid(score)) continue;
      bins[Math.min(9, Math.floor(score / 10))].count += 1;
      observations += 1;
      const total = totals.get(state) ?? { sum: 0, count: 0 };
      total.sum += score;
      total.count += 1;
      totals.set(state, total);
    }
    const stateMeans = Array.from(totals, ([state, { sum, count }]) => ({
      state, mean: sum / count, count,
    })).sort((a, b) => b.mean - a.mean || a.state.localeCompare(b.state));
    return { bins, observations, stateMeans };
  }, [districts]);

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Panel title="Distribution of district KRDI scores" description={observations + " districts with valid scores · 10-point bins"}>
        <ResponsiveContainer width="100%" minWidth={0} height={Math.max(265, 32 + stateMeans.length * 25)}>
          <BarChart data={bins} margin={{ left: 8, right: 8, bottom: 12 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="range" interval="preserveStartEnd" tick={{ fontSize: 10 }} label={{ value: "KRDI score range", position: "bottom", fontSize: 11 }} />
            <YAxis allowDecimals={false} width={36} label={{ value: "Districts", angle: -90, position: "insideLeft", fontSize: 11 }} />
            <Tooltip />
            <Bar name="Districts" dataKey="count" fill="#0f766e" radius={[4, 4, 0, 0]} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </Panel>
      {stateMeans.length > 0 && (
        <Panel title="Mean district KRDI by state or territory" description="Unweighted mean of valid district scores within each state or territory. KRDI is calculated at district level.">
          <ResponsiveContainer width="100%" minWidth={0} height={32 + stateMeans.length * 25}>
            <BarChart data={stateMeans} layout="vertical" margin={{ right: 16 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} />
              <YAxis type="category" dataKey="state" width={120} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(value, _name, entry) => [number(value), "Mean KRDI · " + entry.payload.count + " districts"]} />
              <Bar name="Mean district KRDI" dataKey="mean" fill="#0f766e" radius={[0, 4, 4, 0]} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>
      )}
    </div>
  );
}
