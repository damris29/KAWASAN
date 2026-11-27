import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.DEV ? undefined : import.meta.env.VITE_API_BASE_URL,
  timeout: 90000,
});

const shared = new Map();

async function request(path, signal) {
  const { data } = await api.get(path, { signal });
  if (!data || typeof data !== "object") {
    throw new Error("The configured KAWASAN API did not return JSON.");
  }
  return data;
}

export function getResource(path, signal) {
  if (!["/api/districts", "/api/map/districts", "/api/map/geojson"].includes(path)) {
    return request(path, signal);
  }
  if (!shared.has(path)) {
    shared.set(path, request(path)
      .catch((error) => {
        shared.delete(path);
        throw error;
      }));
  }
  return shared.get(path);
}

export default api;
