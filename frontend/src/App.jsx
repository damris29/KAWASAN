
import { BrowserRouter, Routes, Route } from "react-router-dom";

import DashboardLayout from "./layout/DashboardLayout";
import Overview from "./pages/Overview";
import DistrictIntelligence from "./pages/DistrictIntelligence";
import CompareDistricts from "./pages/CompareDistricts";
import DevelopmentGaps from "./pages/DevelopmentGaps";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<Overview />} />
          <Route path="/districts" element={<DistrictIntelligence />} />
          <Route path="/compare" element={<CompareDistricts />} />
          <Route path="/gaps" element={<DevelopmentGaps />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
