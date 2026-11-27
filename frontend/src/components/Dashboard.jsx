import { AlertCircle } from "lucide-react";

export const fieldClass = "min-w-0 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800";
export const buttonClass = "inline-flex items-center justify-center gap-2 rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 text-sm font-semibold text-teal-800 hover:bg-teal-100";
export const linkClass = "font-semibold text-teal-800 underline decoration-teal-300 underline-offset-4 hover:decoration-current";

export function Panel({ title, description, actions, children }) {
  return (
    <section className="min-w-0 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-slate-900">{title}</h2>
          {description && <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>}
        </div>
        {actions}
      </div>
      {children}
    </section>
  );
}

export function Stat({ label, value, detail, icon: Icon, color = "text-teal-700", compact = false, prominent = false }) {
  return (
    <article className={"min-w-0 rounded-2xl border border-slate-200/80 bg-white shadow-sm " + (prominent ? "p-4" : "p-5")}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-600">{label}</p>
          <p className={"mt-2 break-words font-bold tracking-tight " + (prominent ? "text-3xl leading-tight " : "text-2xl ") + color}>{value}</p>
        </div>
        {Icon && <div className={"shrink-0 rounded-xl bg-teal-50 text-teal-700 " + (prominent ? "p-2" : "p-3")}><Icon size={19} aria-hidden="true" /></div>}
      </div>
      {detail && (
        <p className={compact ? "mt-2 text-xs leading-5 text-slate-500" : "mt-3 border-t border-slate-100 pt-3 text-sm text-slate-600"}>
          {detail}
        </p>
      )}
    </article>
  );
}

export function ResourceState({ resource, label, empty, children }) {
  if (resource.loading) {
    return (
      <div role="status" className="rounded-xl bg-slate-50 p-5 text-sm text-slate-600">
        Loading {label}…
        <div aria-hidden="true" className="mt-4 h-4 rounded bg-slate-200 motion-safe:animate-pulse" />
        <div aria-hidden="true" className="mt-2 h-4 w-3/4 rounded bg-slate-200 motion-safe:animate-pulse" />
      </div>
    );
  }
  if (resource.error) {
    return (
      <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
        <p className="mb-3 flex items-center gap-2"><AlertCircle size={17} /> Could not load {label}.</p>
        <button type="button" onClick={resource.retry} className={buttonClass}>Retry {label}</button>
      </div>
    );
  }
  return empty ? <EmptyState>{empty}</EmptyState> : children;
}

export function EmptyState({ children }) {
  return <p className="rounded-xl bg-slate-50 p-5 text-sm text-slate-600">{children}</p>;
}

export function DataTable({ columns, children, label }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200" tabIndex={0} role="region" aria-label={label}>
      <table className="w-full border-collapse text-left text-sm">
        <thead className="bg-slate-50 text-slate-700">
          <tr>{columns.map((name) => <th key={name} scope="col" className="px-4 py-3 font-semibold">{name}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-slate-700 [&_td]:px-4 [&_td]:py-3 [&_th]:px-4 [&_th]:py-3 [&_th]:font-semibold [&_tr:hover]:bg-slate-50">
          {children}
        </tbody>
      </table>
    </div>
  );
}
