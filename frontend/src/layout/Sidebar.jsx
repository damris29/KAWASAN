import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  MapPinned,
  GitCompareArrows,
  ChartNoAxesCombined,
  Map,
  ChevronRight,
} from "lucide-react";

const navigation = [
  { name: "National Overview", path: "/", icon: LayoutDashboard },
  { name: "District Intelligence", path: "/districts", icon: MapPinned },
  { name: "Compare Districts", path: "/compare", icon: GitCompareArrows },
  { name: "Development Gaps", path: "/gaps", icon: ChartNoAxesCombined },
];

function Sidebar() {
  return (
    <aside className="relative z-30 flex w-full shrink-0 flex-col bg-[#102a38] text-white lg:sticky lg:top-0 lg:h-screen lg:w-[268px]">
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 lg:px-7 lg:py-7">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-400 text-[#102a38] shadow-lg shadow-teal-950/20">
            <Map size={23} strokeWidth={2.4} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-[0.13em]">KAWASAN</h1>
            <p className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.18em] text-slate-400">
              Intelligence platform
            </p>
          </div>
        </div>
        <span className="rounded-lg border border-white/10 px-2 py-1 text-[10px] font-semibold tracking-wide text-slate-300 lg:hidden">
          KRDI 0.1
        </span>
      </div>

      <nav className="flex gap-2 overflow-x-auto px-3 py-3 lg:flex-1 lg:flex-col lg:gap-2 lg:overflow-visible lg:px-4 lg:py-7">
        <p className="hidden px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 lg:block">
          Workspace
        </p>
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                `group flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 lg:px-4 lg:py-3 ${
                  isActive
                    ? "bg-teal-400 text-[#102a38] shadow-lg shadow-teal-950/20"
                    : "text-slate-300 hover:bg-white/[0.07] hover:text-white"
                }`
              }
            >
              <Icon size={18} strokeWidth={2} />
              <span className="whitespace-nowrap">{item.name}</span>
              <ChevronRight
                size={15}
                className="ml-auto hidden opacity-50 transition group-hover:translate-x-0.5 lg:block"
              />
            </NavLink>
          );
        })}
      </nav>

      <div className="hidden border-t border-white/10 p-6 lg:block">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <div className="mb-3 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-teal-400" />
            <span className="text-xs font-semibold text-slate-200">Platform workspace</span>
          </div>
          <p className="text-xs leading-5 text-slate-400">
            Regional development intelligence for Malaysia.
          </p>
        </div>
        <p className="mt-5 text-[10px] font-medium tracking-wide text-slate-500">
          KAWASAN v0.1.0
        </p>
      </div>
    </aside>
  );
}

export default Sidebar;
