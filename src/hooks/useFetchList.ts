import { useState, useEffect, useCallback, useRef, type DependencyList } from "react";

interface UseFetchListResult<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useFetchList<T>(
  fetcher: () => Promise<{ data?: T[] } | T[]>,
  deps: DependencyList = []
): UseFetchListResult<T> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetcher();
      if (!isMounted.current) return;
      const list = Array.isArray(res) ? res : (res.data ?? []);
      setData(list);
    } catch (err) {
      if (!isMounted.current) return;
      const msg = err instanceof Error ? err.message : "Error al cargar datos";
      setError(msg);
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, deps);

  useEffect(() => {
    isMounted.current = true;
    fetch();
    return () => { isMounted.current = false; };
  }, [fetch]);

  return { data, loading, error, refresh: fetch };
}
