import { useEffect, useState } from "react";
import { getResource } from "../services/api";

export default function useResource(path) {
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!path) return;
    const controller = new AbortController();
    getResource(path, controller.signal).then(
      (data) => {
        if (!controller.signal.aborted) setResult({ path, attempt, data });
      },
      (error) => {
        if (!controller.signal.aborted) setResult({ path, attempt, error });
      },
    );
    return () => controller.abort();
  }, [path, attempt]);

  const current = result?.path === path && result.attempt === attempt ? result : null;
  return {
    data: current?.data,
    error: current?.error,
    loading: Boolean(path && !current),
    retry: () => setAttempt((value) => value + 1),
  };
}
