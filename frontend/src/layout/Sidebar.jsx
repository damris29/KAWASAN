
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  MapPinned,
  GitCompareArrows,
  ChartNoAxesCombined,
  Map,
} from "lucide-react";

const navigation = [
  {
    name: "National Overview",
    path: "/",
    icon: LayoutDashboard,
  },
  {
    name: "District Intelligence",
    path: "/districts",
    icon: MapPinned,
  },
  {
    name: "Compare Districts",
    path: "/compare",
    icon: GitCompareArrows,
  },
  {
    name: "Development Gaps",
    path: "/gaps",
    icon: ChartNoAxesCombined,
  },
];

function Sidebar() {
  return (
    <aside className="flex min-h-screen w-64 flex-col bg-slate-950 text-white">
      {/* Logo */}
      <div className="flex items-center gap-3 border-b border-slate-800 px-6 py-7">
        <div className="rounded-xl bg-indigo-600 p-2">
          <Map size={24} />
        </div>

        <div>
          <h1 className="text-xl font-bold tracking-wide">
            KAWASAN
          </h1>
          <p className="text-xs text-slate-400">
            Intelligence Platform
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 px-4 py-6">
        <p className="mb-4 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
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
                `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-indigo-600 text-white"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`
              }
            >
              <Icon size={19} />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-800 p-6">
        <p className="text-xs text-slate-400">
          KAWASAN v0.1.0
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Regional Development Intelligence
        </p>
      </div>
    </aside>
  );
}

export default Sidebar;
