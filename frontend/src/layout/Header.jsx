import { useLocation } from "react-router-dom";
import { CalendarDays, ChevronRight } from "lucide-react";
import MethodologyDialog from "./MethodologyDialog";

const pageTitles = {
  "/": {
    title: "National Overview",
    description: "A national snapshot of Malaysia's district development landscape.",
  },
  "/districts": {
    title: "District Intelligence",
    description: "Explore socioeconomic indicators and district-level profiles.",
  },
  "/compare": {
    title: "Compare Districts",
    description: "Review district performance side by side.",
  },
  "/gaps": {
    title: "Development Gaps",
    description: "Understand disparities and areas that may need closer attention.",
  },
};

function Header() {
  const location = useLocation();
  const currentPage = pageTitles[location.pathname] || {
    title: "KAWASAN",
    description: "Regional Development Intelligence Platform",
  };

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 px-4 py-4 backdrop-blur-xl sm:px-6 lg:px-9">
      <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="hidden h-9 w-1 rounded-full bg-teal-500 sm:block" />
          <div className="min-w-0">
            <div className="mb-1 flex items-center gap-2 text-xs font-medium text-slate-400">
              <span>Workspace</span>
              <ChevronRight size={12} />
              <span className="truncate text-teal-700">{currentPage.title}</span>
            </div>
            <h2 className="truncate text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
              {currentPage.title}
            </h2>
            <p className="mt-1 hidden text-sm text-slate-500 sm:block">
              {currentPage.description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600 sm:flex">
            <CalendarDays size={16} className="text-teal-700" />
            <span>Data year</span>
            <span className="font-semibold text-slate-900">2024</span>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-teal-50 px-3 py-2 text-xs font-semibold text-teal-800 ring-1 ring-inset ring-teal-100">
            <span className="h-2 w-2 rounded-full bg-teal-500" />
            KRDI v0.1
          </div>
          <MethodologyDialog />
        </div>
      </div>
    </header>
  );
}

export default Header;
