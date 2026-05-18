import { useState } from "react";
import { useDebounce } from "./useDebounce";
import { useFetchList } from "./useFetchList";
import type { PaginatedList } from "@/types";

export function useSearchList<T>(
  fetcher: (search: string) => Promise<PaginatedList<T> | T[]>,
  initialSearch: string = ""
) {
  const [search, setSearch] = useState(initialSearch);
  const debouncedSearch = useDebounce(search, 400);

  const {
    data,
    loading,
    error,
    refresh,
  } = useFetchList<T>(
    () => fetcher(debouncedSearch),
    [debouncedSearch]
  );

  return { data, loading, error, search, setSearch, refresh };
}
