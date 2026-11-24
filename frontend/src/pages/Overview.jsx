import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  Database,
  MapPinned,
  Layers3,
  Activity,
  CheckCircle2,
  AlertCircle,
  LoaderCircle,
  Compass,
} from "lucide-react";
import { Link } from "react-router-dom";
import api from "../services/api";

function Overview() {
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchDistricts() {
      try {
        const response = await api.get("/api/districts");
        setDistricts(response.data.districts);
      } catch (err) {
        console.error(err);
        setError("Unable to connect to the KAWASAN API.");
      } finally {
        setLoading(false);
      }
    }

    fetchDistricts();
  }, []);

  const stats = [
    {
      label: "Districts in dataset",
      value: loading ? "—" : error ? "—" : districts.length,
      detail: "District records returned by API",
      icon: MapPinned,
      iconStyle: "bg-teal-50 text-teal-700",
    },
    {
      label: "Data source",
      value: error ? "Offline" : loading ? "Checking" : "Connected",
      detail: "KAWASAN FastAPI connection",
      icon: Database,
      iconStyle: "bg-blue-50 text-blue-700",
    },
    {
      label: "Platform",
      value: "KRDI",
      detail: "Regional development index",
      icon: Layers3,
      iconStyle: "bg-violet-50 text-violet-700",
    },
    {
      label: "Reference year",
      value: "2024",
      detail: "Dashboard reference year",
      icon: Activity,
      iconStyle: "bg-amber-50 text-amber-700",
    },
  ];

  return (
    <div className="space-y-7">
      <section className="relative isolate overflow-hidden rounded-[28px] bg-[#123747] px-6 py-8 text-white shadow-xl shadow-slate-900/5 sm:px-9 sm:py-10 lg:px-11">
        <div className="absolute -right-20 -top-28 -z-10 h-80 w-80 rounded-full border-[45px] border-teal-300/10" />
        <div className="absolute -bottom-36 right-1/4 -z-10 h-72 w-72 rounded-full bg-teal-400/10 blur-3xl" />
        <div className="max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-teal-200/20 bg-teal-200/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-teal-200">
            <span className="h-1.5 w-1.5 rounded-full bg-teal-300" />
            Malaysia socioeconomic intelligence
          </div>
          <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-[46px]">
            Understand every <span className="text-teal-300">KAWASAN.</span>
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
            Explore district-level development information, navigate regional
            profiles and bring socioeconomic data into clearer focus.
          </p>
          <Link
            to="/districts"
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-teal-300 px-5 py-3 text-sm font-bold text-[#102a38] shadow-lg shadow-teal-950/20 transition hover:-translate-y-0.5 hover:bg-teal-200"
          >
            Explore districts <ArrowUpRight size={17} />
          </Link>
        </div>
        <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-white/10 pt-5 text-xs text-slate-300">
          <span className="flex items-center gap-2">
            <Compass size={14} className="text-teal-300" />
            District-level perspective
          </span>
          <span className="hidden h-1 w-1 rounded-full bg-slate-500 sm:block" />
          <span>KRDI reference year 2024</span>
        </div>
      </section>

      <section>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-700">
              At a glance
            </p>
            <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900">
              Platform overview
            </h2>
          </div>
          <p className="text-xs text-slate-400">Live connection status</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <article
                key={stat.label}
                className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/[0.02] transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold text-slate-500">{stat.label}</p>
                    <p className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`rounded-xl p-3 ${stat.iconStyle}`}>
                    <Icon size={19} />
                  </div>
                </div>
                <p className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-400">
                  {stat.detail}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.45fr_1fr]">
        <article className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-900/[0.02]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-5 sm:px-6">
            <div>
              <h3 className="font-bold text-slate-900">Malaysia development overview</h3>
              <p className="mt-1 text-xs text-slate-400">
                Regional intelligence workspace
              </p>
            </div>
            <span className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Overview
            </span>
          </div>
          <div className="flex min-h-[260px] flex-col items-center justify-center bg-[radial-gradient(ellipse_at_center,_#e1f4f1,_#f7fafb_66%)] px-6 py-10 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-teal-100 bg-white text-teal-700 shadow-sm">
              <MapPinned size={30} strokeWidth={1.6} />
            </div>
            <h4 className="text-base font-bold text-slate-800">Explore district geography</h4>
            <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
              Open District Intelligence to explore the available district profiles.
            </p>
            <Link
              to="/districts"
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-teal-700 transition hover:text-teal-900"
            >
              Go to District Intelligence <ArrowUpRight size={16} />
            </Link>
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/[0.02] sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900">API connection</h3>
              <p className="mt-1 text-xs text-slate-400">District data service</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3 text-slate-500">
              <Database size={19} />
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-slate-100 bg-slate-50/80 p-4">
            <div className="flex items-center gap-2">
              {loading ? (
                <LoaderCircle size={17} className="animate-spin text-blue-600" />
              ) : error ? (
                <AlertCircle size={17} className="text-rose-600" />
              ) : (
                <CheckCircle2 size={17} className="text-emerald-600" />
              )}
              <span className="text-sm font-semibold text-slate-800">
                {loading ? "Connecting to API" : error ? "Connection unavailable" : "Connected successfully"}
              </span>
            </div>
            <p className="mt-2 pl-6 text-xs leading-5 text-slate-500">
              {loading
                ? "Retrieving district records from the configured backend."
                : error
                  ? error
                  : "The dashboard has received the district list from KAWASAN FastAPI."}
            </p>
          </div>

          <div className="mt-5 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Endpoint</span>
              <span className="font-mono font-medium text-slate-700">/api/districts</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">District records</span>
              <span className="font-semibold text-slate-800">
                {loading || error ? "—" : districts.length}
              </span>
            </div>
          </div>
        </article>
      </section>

      <section>
        <div className="mb-4">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-700">
            Navigate workspace
          </p>
          <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900">
            Explore KAWASAN
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              title: "District Intelligence",
              description: "Open district-level profiles and socioeconomic information.",
              path: "/districts",
              icon: MapPinned,
            },
            {
              title: "Compare Districts",
              description: "Access the district comparison workspace.",
              path: "/compare",
              icon: GitCompareArrows,
            },
            {
              title: "Development Gaps",
              description: "Access the development gap analysis workspace.",
              path: "/gaps",
              icon: ChartNoAxesCombined,
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className="group flex items-start gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/[0.02] transition hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-md"
              >
                <div className="rounded-xl bg-teal-50 p-3 text-teal-700 transition group-hover:bg-teal-100">
                  <Icon size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-slate-900">{item.title}</h3>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    {item.description}
                  </p>
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-teal-700">
                    Open workspace <ArrowUpRight size={14} />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export default Overview;
