import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

function DashboardLayout() {
  return (
    <div className="min-h-screen bg-[#f4f7f8] text-[#172b3a] lg:flex">
      <Sidebar />

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <Header />

        <main className="mx-auto w-full max-w-[1600px] flex-1 px-4 py-6 sm:px-6 lg:px-9 lg:py-8">
          <Outlet />
        </main>

        <footer className="border-t border-slate-200/80 px-6 py-5 text-center text-xs text-slate-400">
          KAWASAN · Regional Development Intelligence Platform
        </footer>
      </div>
    </div>
  );
}

export default DashboardLayout;
