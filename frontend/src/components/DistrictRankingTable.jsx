import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { bands, districtLink, noBand, number, statesFor } from "../utils/analytics";
import { buttonClass, DataTable, EmptyState, fieldClass, linkClass, Panel } from "./Dashboard";

const pageSize = 15;
const defaults = { query: "", state: "", category: "", sort: "rank" };

export default function DistrictRankingTable({ districts }) {
  const [filters, setFilters] = useState(defaults);
  const [page, setPage] = useState(0);
  const filtered = useMemo(() => districts.filter((district) =>
    district.name.toLowerCase().includes(filters.query.trim().toLowerCase()) &&
    (!filters.state || district.state === filters.state) &&
    (!filters.category || district.category === filters.category),
  ).sort((a, b) => {
    const rankOrder = (a.rank ?? Infinity) - (b.rank ?? Infinity);
    const scoreOrder = (b.score ?? -Infinity) - (a.score ?? -Infinity);
    return (filters.sort === "score" && scoreOrder) || rankOrder || a.name.localeCompare(b.name);
  }), [districts, filters]);
  const visible = filtered.slice(page * pageSize, (page + 1) * pageSize);

  function update(key, value) {
    setFilters((current) => ({ ...current, [key]: value }));
    setPage(0);
  }

  return (
    <Panel title="National district rankings" description="Score bands are exploratory. Tied ranks are displayed as reported by the API.">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <label className="text-sm">Search district<input type="search" className={fieldClass} value={filters.query} onChange={(e) => update("query", e.target.value)} /></label>
        <label className="text-sm">State or territory
          <select className={fieldClass} value={filters.state} onChange={(e) => update("state", e.target.value)}>
            <option value="">All states</option>
            {statesFor(districts).map((name) => <option key={name}>{name}</option>)}
          </select>
        </label>
        <label className="text-sm">KRDI band
          <select className={fieldClass} value={filters.category} onChange={(e) => update("category", e.target.value)}>
            <option value="">All bands</option>
            {[...bands, noBand].map(({ label }) => <option key={label}>{label}</option>)}
          </select>
        </label>
        <label className="text-sm">Sort by
          <select className={fieldClass} value={filters.sort} onChange={(e) => update("sort", e.target.value)}>
            <option value="rank">National rank</option>
            <option value="score">Highest KRDI score</option>
          </select>
        </label>
      </div>
      <div className="my-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-600" role="status">{filtered.length} matching districts</p>
        <button type="button" className={buttonClass} onClick={() => { setFilters(defaults); setPage(0); }}>Reset filters</button>
      </div>
      {visible.length ? (
        <>
          <DataTable label="District rankings" columns={["Rank", "District", "State", "KRDI", "Band", "Rank stability", "Profile"]}>
            {visible.map((district) => (
              <tr key={district.code}>
                <td>{number(district.rank)}</td><th scope="row">{district.name}</th><td>{district.state}</td>
                <td>{number(district.score)}</td><td>{district.category}</td><td>{district.stability ?? "N/A"}</td>
                <td><Link to={districtLink(district.code)} className={linkClass} aria-label={"View " + district.name}>View district</Link></td>
              </tr>
            ))}
          </DataTable>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm">
            <p>{page * pageSize + 1}–{page * pageSize + visible.length} of {filtered.length}</p>
            <div className="flex gap-2 [&_button:disabled]:opacity-40">
              <button type="button" className={buttonClass} disabled={page === 0} onClick={() => setPage(page - 1)}>Previous</button>
              <button type="button" className={buttonClass} disabled={(page + 1) * pageSize >= filtered.length} onClick={() => setPage(page + 1)}>Next</button>
            </div>
          </div>
        </>
      ) : <EmptyState>No districts match these filters.</EmptyState>}
    </Panel>
  );
}
