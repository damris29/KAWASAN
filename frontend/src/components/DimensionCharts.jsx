import {
  Bar, BarChart, CartesianGrid, Legend, PolarAngleAxis, PolarGrid, PolarRadiusAxis,
  Radar, RadarChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { comparisonColors, dimensions, number } from "../utils/analytics";
import { Panel } from "./Dashboard";

export default function DimensionCharts({ first, second }) {
  const series = second ? [first, second] : [first];
  const data = dimensions.map(([key, label]) => ({
    label,
    a: first.dimensions[key],
    b: second?.dimensions[key],
  }));
  return (
    <div className={second ? "grid gap-5 xl:grid-cols-2" : "min-w-0"}>
      {second && (
        <Panel title="Dimension scores" description="All three dimensions use the same 0–100 scale.">
          <ResponsiveContainer width="100%" height={285} minWidth={0}>
            <BarChart data={data} layout="vertical" margin={{ right: 18 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} />
              <YAxis type="category" dataKey="label" width={115} tick={{ fontSize: 11 }} />
              <Tooltip formatter={number} />
              <Legend />
              {series.map((item, i) => <Bar key={i} dataKey={i ? "b" : "a"} name={(i ? "B · " : "A · ") + item.name} fill={comparisonColors[i]} isAnimationActive={false} />)}
            </BarChart>
          </ResponsiveContainer>
        </Panel>
      )}
      <Panel title="Development profile" description="Scores range from 0 to 100. The weights beneath the chart determine each dimension’s contribution to KRDI.">
        <ResponsiveContainer width="100%" height={290} minWidth={0}>
          <RadarChart data={data} outerRadius="56%">
            <PolarGrid />
            <PolarAngleAxis dataKey="label" tick={{ fontSize: 10, fill: "#334155" }} />
            <PolarRadiusAxis domain={[0, 100]} tickCount={5} tick={{ fontSize: 10 }} />
            <Tooltip formatter={number} />
            {second && <Legend />}
            {series.map((item, i) => (
              <Radar key={i} dataKey={i ? "b" : "a"} name={second ? (i ? "B · " : "A · ") + item.name : item.name}
                stroke={comparisonColors[i]} strokeWidth={2} strokeDasharray={i ? "5 3" : undefined}
                fill={comparisonColors[i]} fillOpacity={0.16} isAnimationActive={false} />
            ))}
          </RadarChart>
        </ResponsiveContainer>
        <ul className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-slate-600">
          {dimensions.map(([key, name, weight]) => <li key={key}>{name} {weight}%</li>)}
        </ul>
      </Panel>
    </div>
  );
}
