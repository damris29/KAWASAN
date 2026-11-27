import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { normalizeDistrict } from "../utils/analytics";
import useResource from "./useResource";

export function useDistricts() {
  const resource = useResource("/api/districts");
  const districts = useMemo(() => (resource.data?.districts ?? []).map(normalizeDistrict), [resource.data]);
  return { ...resource, districts };
}

export function useSelectedDistrict(districts) {
  const [params, setParams] = useSearchParams();
  const requested = params.get("district");
  const district = requested === null ? districts[0] : districts.find(({ code }) => code === requested);
  return {
    district,
    invalid: requested !== null && !district,
    select: (code) => setParams(code ? { district: code } : {}),
  };
}
