import { useId, useState } from "react";
import { statesFor } from "../utils/analytics";
import { fieldClass } from "./Dashboard";

export default function DistrictSelector({ label, districts, code, onChange, excluded }) {
  const [state, setState] = useState("");
  const [query, setQuery] = useState("");
  const id = useId();
  const normalized = query.trim().toLowerCase();
  const options = districts.filter((item) =>
    item.code !== excluded &&
    (!state || state === item.state) && item.name.toLowerCase().includes(normalized),
  ).sort((a, b) => a.name.localeCompare(b.name) || a.state.localeCompare(b.state));

  const selected = options.some((item) => item.code === code) ? null : districts.find((item) => item.code === code);

  return (
    <fieldset className="min-w-0">
      <legend className="mb-2 font-semibold">{label}</legend>
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="text-sm text-slate-700">
          State or territory
          <select className={fieldClass} value={state} onChange={(event) => setState(event.target.value)}>
            <option value="">All states</option>
            {statesFor(districts).map((name) => <option key={name}>{name}</option>)}
          </select>
        </label>
        <label className="text-sm text-slate-700">
          Search district
          <input className={fieldClass} type="search" value={query} onChange={(event) => setQuery(event.target.value)} />
        </label>
        <label className="text-sm text-slate-700">
          District
          <select className={fieldClass} value={code ?? ""} onChange={(event) => onChange(event.target.value)} aria-describedby={id}>
            <option value="" disabled>Choose a district</option>
            {selected && <option value={selected.code}>{selected.name} · {selected.state} (current selection)</option>}
            {options.map(({ code: value, name, state: region }) => <option value={value} key={value}>{name} · {region}</option>)}
          </select>
        </label>
      </div>
      <p id={id} className="mt-2 text-xs text-slate-600">{options.length ? options.length + " available" : "No matching districts. Change the search or state filter."}</p>
    </fieldset>
  );
}
