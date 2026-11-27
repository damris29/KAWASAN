import { useEffect, useMemo } from "react";
import { GeoJSON, MapContainer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useNavigate } from "react-router-dom";
import { bandFor, bands, districtLink, normalizeDistrict, noBand, number } from "../utils/analytics";
import { buttonClass, EmptyState, ResourceState } from "./Dashboard";

function FitControls({ bounds }) {
  const map = useMap();
  useEffect(() => {
    if (!bounds.isValid()) return;
    const fit = () => map.fitBounds(bounds, { padding: [15, 15], maxZoom: 10, animate: false });
    fit();
    const observer = new ResizeObserver(() => {
      map.invalidateSize({ animate: false });
      fit();
    });
    observer.observe(map.getContainer());
    return () => observer.disconnect();
  }, [bounds, map]);

  return (
    <button type="button" className={buttonClass + " absolute right-3 top-3 z-[500]"} onClick={() => {
      map.fitBounds(bounds, { padding: [15, 15], maxZoom: 10, animate: false });
    }}>
      Reset map view
    </button>
  );
}

export default function DistrictMap({ geometry, scores, national = false }) {
  const navigate = useNavigate();
  const districts = useMemo(() => new Map(
    (scores?.data?.districts ?? []).map((item) => {
      const district = normalizeDistrict(item);
      return [district.code, district];
    }),
  ), [scores?.data]);

  const bounds = useMemo(() => {
    const extent = L.latLngBounds([]);
    function visit(coordinates) {
      if (typeof coordinates[0] === "number") extent.extend([coordinates[1], coordinates[0]]);
      else coordinates.forEach(visit);
    }
    geometry.data?.features.forEach(({ geometry: shape }) => {
      if (shape?.coordinates) visit(shape.coordinates);
    });
    return extent;
  }, [geometry.data]);

  function style(feature) {
    const district = districts.get(String(feature.properties.code_state_district)) ?? normalizeDistrict(feature.properties);
    return { color: "#335960", weight: 1, fillOpacity: 0.9, fillColor: bandFor(district.score).color };
  }

  function bindDistrict(feature, polygon) {
    const district = districts.get(String(feature.properties.code_state_district)) ?? normalizeDistrict(feature.properties);
    const tooltip = document.createElement("div");
    const title = document.createElement("strong");
    title.textContent = district.name + " · " + district.state;
    const details = document.createElement("div");
    details.textContent = "KRDI " + number(district.score) + " · Rank " + number(district.rank) + " · " + (district.stability ?? "N/A");
    tooltip.append(title, details);
    polygon.bindTooltip(tooltip, { sticky: true });
    polygon.on({
      mouseover: () => polygon.setStyle({ weight: 2.5, color: "#102a38" }),
      mouseout: () => polygon.setStyle(style(feature)),
      ...(national && { click: () => navigate(districtLink(district.code)) }),
    });
  }

  return (
    <ResourceState resource={geometry} label="district boundaries">
      {scores && scores.error && <div className="mb-3"><ResourceState resource={scores} label="map scores" /></div>}
      {bounds.isValid() ? (
        <MapContainer
          center={[4, 109]} zoom={5} minZoom={3} maxZoom={14} scrollWheelZoom={national} zoomAnimation={false}
          className={"isolate z-0 rounded-xl bg-[#edf5f7] " + (national ? "h-[340px] sm:h-[460px] lg:h-[520px]" : "h-[320px]")}
        >
          <GeoJSON key={scores?.data ? "map-scores" : "geometry"} data={geometry.data} style={style} onEachFeature={bindDistrict} />
          <FitControls bounds={bounds} />
        </MapContainer>
      ) : <EmptyState>District geometry is unavailable.</EmptyState>}
      {national && <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-700" aria-label="KRDI score bands">
        {[...bands, noBand].map(({ label, range, color }) => (
          <li key={label} className="flex items-center gap-2">
            <span aria-hidden="true" className="size-3 rounded-sm border border-slate-500" style={{ background: color }} />
            {label} · {range}
          </li>
        ))}
      </ul>}
    </ResourceState>
  );
}
