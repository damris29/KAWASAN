
import { useEffect, useState } from "react";
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

  if (loading) {
    return <p>Loading KAWASAN district data...</p>;
  }

  if (error) {
    return <p className="text-red-600">{error}</p>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">
        KAWASAN National Overview
      </h1>

      <div className="mt-6 rounded-xl bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-500">
          Total Districts
        </p>

        <h2 className="mt-2 text-4xl font-bold text-indigo-600">
          {districts.length}
        </h2>

        <p className="mt-4 text-sm text-green-600">
          Connected to KAWASAN FastAPI
        </p>
      </div>
    </div>
  );
}

export default Overview;
