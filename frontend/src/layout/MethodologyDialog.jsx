import { CircleHelp, X } from "lucide-react";
import { useRef } from "react";
import { dimensions } from "../utils/analytics";

export default function MethodologyDialog() {
  const dialog = useRef(null);
  return (
    <>
      <button type="button" aria-label="Methodology and sources" title="Methodology and sources"
        onClick={() => dialog.current.showModal()}
        className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-teal-50 hover:text-teal-800">
        <CircleHelp size={18} aria-hidden="true" />
      </button>
      <dialog ref={dialog} aria-labelledby="methodology-title" className="fixed inset-0 m-auto max-h-[85dvh] w-[calc(100%-2rem)] max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 text-slate-800 shadow-xl backdrop:bg-slate-950/55">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 id="methodology-title" className="text-xl font-bold">Methodology and Sources</h2>
          <form method="dialog">
            <button type="submit" aria-label="Close methodology" className="rounded-lg border border-slate-200 p-2 hover:bg-slate-50"><X size={18} aria-hidden="true" /></button>
          </form>
        </div>
        <div className="space-y-4 text-sm leading-6">
          <p>The KAWASAN Regional Development Index (KRDI v0.1) compares district development using 2024 data. The index is provisional and has no official classification status.</p>
          <p><strong>Geographic coverage.</strong> KRDI v0.1 covers 155 eligible districts across 12 Malaysian states. National statistics and rankings describe those districts. Socioeconomic data were collected for Perlis, Kuala Lumpur, Putrajaya, and Labuan. The available data for these areas do not have sufficient alignment with the 2024 reference year and indicator coverage to calculate comparable scores. These areas are unscored and unranked. Future KRDI versions may include them when suitable data become available.</p>
          <p>KRDI puts six measures on a common scale so they can be combined. They cover median household income, absolute and relative poverty, income inequality, piped water, and electricity. Each measure is scored relative to the lowest and highest values across districts, with more favorable results earning higher scores.</p>
          <ul className="list-disc pl-5">{dimensions.map(([key, label, weight]) => <li key={key}>{label} · {weight}%</li>)}</ul>
          <p><strong>Benchmarks and gaps.</strong> National medians give each district with valid data equal weight. Ties share a rank. With at least two districts reporting data, rank position is 100 × (districts with data − rank) ÷ (districts with data − 1). Positions of 75 or above indicate relative strengths, 25 to below 75 indicate the middle range, and below 25 indicate potential gaps.</p>
          <p><strong>Infrastructure.</strong> The shortfall measures the percentage-point distance from 100% access. The bands are near-universal (up to 1 pp), minor (over 1 to 5 pp), moderate (over 5 to 15 pp), and substantial (over 15 pp).</p>
          <p><strong>Sensitivity and missing data.</strong> Rank range is the difference between the best and worst rank across four sets of weights. Rankings also depend on how scores are put on a common scale. N/A marks missing values, which are left out of calculations. Use these results alongside local evidence.</p>
          <p><strong>Sources.</strong> KAWASAN uses its Unified District Dataset, KRDI results and district GeoJSON. Population, labour force, and household indicators draw on Department of Statistics Malaysia datasets. District school indicators draw on Ministry of Education datasets in the public data catalogue.</p>
        </div>
      </dialog>
    </>
  );
}
