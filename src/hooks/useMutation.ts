import { useState, useCallback } from "react";
import { toast } from "sonner";

interface MutationOptions<TData> {
  onSuccess?: (data: TData) => void;
  onError?: (err: Error) => void;
  successMsg?: string;
}

export function useMutation<TData = void>(
  fn: (...args: any[]) => Promise<TData>,
  options?: MutationOptions<TData>
) {
  const [loading, setLoading] = useState(false);

  const mutate = useCallback(
    async (...args: any[]): Promise<void> => {
      setLoading(true);
      try {
        const data = await fn(...args);
        if (options?.successMsg) toast.success(options.successMsg);
        options?.onSuccess?.(data);
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Error inesperado");
        toast.error(error.message);
        options?.onError?.(error);
      } finally {
        setLoading(false);
      }
    },
    [fn, options]
  );

  return { mutate, loading };
}
