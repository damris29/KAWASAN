import { lazy, Suspense } from "react";
import { BrowserRouter, Link, Routes, Route } from "react-router-dom";
import { EmptyState, linkClass } from "./components/Dashboard";
import DashboardLayout from "./layout/DashboardLayout";

const Overview = lazy(() => import("./pages/Overview"));
const DistrictIntelligence = lazy(() => import("./pages/DistrictIntelligence"));
const CompareDistricts = lazy(() => import("./pages/CompareDistricts"));
const DevelopmentGaps = lazy(() => import("./pages/DevelopmentGaps"));

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<Suspense fallback={<EmptyState>Loading workspace…</EmptyState>}><Overview /></Suspense>} />
          <Route path="/districts" element={<Suspense fallback={<EmptyState>Loading workspace…</EmptyState>}><DistrictIntelligence /></Suspense>} />
          <Route path="/compare" element={<Suspense fallback={<EmptyState>Loading workspace…</EmptyState>}><CompareDistricts /></Suspense>} />
          <Route path="/gaps" element={<Suspense fallback={<EmptyState>Loading workspace…</EmptyState>}><DevelopmentGaps /></Suspense>} />
          <Route path="*" element={<EmptyState>Page unavailable. <Link to="/" className={linkClass}>Open National Overview</Link></EmptyState>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
