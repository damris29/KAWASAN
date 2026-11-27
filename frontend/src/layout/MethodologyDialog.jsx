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
          <h2 id="methodology-title" className="text-xl font-bold">Methodology and sources</h2>
          <form method="dialog">
            <button type="submit" aria-label="Close methodology" className="rounded-lg border border-slate-200 p-2 hover:bg-slate-50"><X size={18} aria-hidden="true" /></button>
          </form>
        </div>
        <div className="space-y-4 text-sm leading-6">
          <p>KAWASAN brings together Malaysian district socioeconomic data for the 2024 reference year. The provisional KAWASAN Regional Development Index (KRDI v0.1) is a project-defined composite for comparing district development. KRDI has no official government classification status.</p>
          <p>KRDI uses direction-aware min–max normalization for median household income, absolute and relative poverty, Gini, piped water, and electricity. The resulting 0–100 dimension scores have these weights.</p>
          <ul className="list-disc pl-5">{dimensions.map(([key, label, weight]) => <li key={key}>{label} · {weight}%</li>)}</ul>
          <p><strong>Benchmarks and gaps.</strong> National medians give each district with valid data equal weight. Rank position runs from 0 to 100, with shared ranks for ties. Positions of 75 or above indicate relative strengths, 25 to below 75 indicate the middle range, and below 25 indicate potential gaps.</p>
          <p><strong>Infrastructure.</strong> The shortfall measures the percentage-point distance from 100% access. The bands are near-universal (up to 1 pp), minor (over 1 to 5 pp), moderate (over 5 to 15 pp), and substantial (over 15 pp).</p>
          <p><strong>Sensitivity and missing data.</strong> Rank range describes the spread across four tested weighting scenarios. Rankings also depend on the normalization method. Missing observations appear as N/A and are excluded from relevant aggregations. Benchmarks and gap classifications support further investigation alongside local evidence.</p>
          <p><strong>Sources.</strong> KAWASAN uses its Unified District Dataset, KRDI results and district GeoJSON. Population, labour force, and household indicators draw on Department of Statistics Malaysia datasets. District school indicators draw on Ministry of Education datasets in the public data catalogue.</p>
        </div>
      </dialog>
    </>
  );
}
