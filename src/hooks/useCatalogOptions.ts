import { useState, useEffect, useRef } from "react";
import { catalogService } from "@/api/services/catalog.service";
import type { Category, Laboratory, Provider } from "@/types";

interface CatalogOptions {
  categories: Category[];
  laboratories: Laboratory[];
  providers: Provider[];
  loading: boolean;
}

export function useCatalogOptions(): CatalogOptions {
  const [categories, setCategories] = useState<Category[]>([]);
  const [laboratories, setLaboratories] = useState<Laboratory[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    const load = async () => {
      setLoading(true);
      try {
        const catRes = await catalogService.categorias();
        if (!mounted.current) return;
        setCategories(catRes.data ?? []);

        const labRes = await catalogService.laboratorios();
        if (!mounted.current) return;
        setLaboratories(labRes.data ?? []);

        const provRes = await catalogService.proveedores();
        if (!mounted.current) return;
        setProviders(provRes.data ?? []);
      } catch (err) {
        console.error("Error loading catalog options:", err);
      } finally {
        if (mounted.current) setLoading(false);
      }
    };
    load();
    return () => { mounted.current = false; };
  }, []);

  return { categories, laboratories, providers, loading };
}
