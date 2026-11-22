
import { useLocation } from "react-router-dom";
import { Bell, CalendarDays } from "lucide-react";

const pageTitles = {
  "/": {
    title: "National Overview",
    description: "Malaysia Regional Development Intelligence",
  },
  "/districts": {
    title: "District Intelligence",
    description: "Explore socioeconomic indicators by district",
  },
  "/compare": {
    title: "Compare Districts",
    description: "Compare development performance across regions",
  },
  "/gaps": {
    title: "Development Gaps",
    description: "Identify regional disparities and development priorities",
  },
};

function Header() {
  const location = useLocation();

  const currentPage = pageTitles[location.pathname] || {
    title: "KAWASAN",
    description: "Regional Development Intelligence Platform",
  };

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-white px-8 py-5">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">
          {currentPage.title}
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          {currentPage.description}
        </p>
      </div>

      <div className="flex items-center gap-5">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <CalendarDays size={18} />
          <span>Data Year: 2024</span>
        </div>

        <span className="rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700">
          KRDI v0.1
        </span>
      </div>
    </header>
  );
}

export default Header;
