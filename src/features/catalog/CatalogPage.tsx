import { useState } from "react";
import { Link } from "react-router-dom";
import { medicinesService } from "@/api/services/medicines.service";
import { catalogService } from "@/api/services/catalog.service";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { useSearchList } from "@/hooks/useSearchList";
import { useFetchList } from "@/hooks/useFetchList";
import { Search, Pill, Eye } from "lucide-react";
import type { Medicine, Category } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function CatalogPage() {
  const [categoryFilter, setCategoryFilter] = useState("all");

  const { data: categories } = useFetchList<Category>(
    async () => {
      const res = await catalogService.categorias();
      return res.data ?? [];
    },
  );

  const { data: medicines, loading, search, setSearch } = useSearchList<Medicine>(
    async (search) => {
      const res = await medicinesService.list({ search: search || undefined, limit: 50 });
      return res.data ?? [];
    },
  );

  const filtered =
    categoryFilter === "all"
      ? medicines
      : medicines.filter((m) => m.categoria_id === categoryFilter);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Catálogo de Medicamentos"
        description="Explora todos los productos"
        icon={<Pill className="h-5 w-5" />}
      />

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar medicamento..."
            className="pl-10 h-11 rounded-xl"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-[200px] h-11 rounded-xl">
            <SelectValue placeholder="Todas las categorías" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las categorías</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>{cat.nombre}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-80 rounded-xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon="search" title="Sin resultados" description="Intenta con otro término de búsqueda" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((medicine) => (
            <Link
              key={medicine.id}
              to={`/app/catalog/${medicine.id}`}
              className="group rounded-xl border dark:border-zinc-800 bg-card dark:bg-zinc-900 overflow-hidden hover:shadow-lg dark:hover:shadow-black/30 hover:border-primary/30 dark:hover:border-emerald-700/30 transition-all duration-300 flex flex-col"
            >
              <div className="aspect-[4/3] bg-gradient-to-br from-primary/5 dark:from-emerald-500/5 to-muted dark:to-zinc-800 flex items-center justify-center relative overflow-hidden">
                {medicine.imagen_url ? (
                  <img
                    src={medicine.imagen_url}
                    alt={medicine.nombre_comercial}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                  />
                ) : (
                  <Pill className="h-12 w-12 text-primary/30 dark:text-emerald-400/30 group-hover:scale-110 transition-transform duration-500" />
                )}
                <div className="absolute top-3 left-3 flex gap-1.5">
                  {medicine.requiere_formula && <Badge variant="rx" className="text-[10px] shadow">Rx</Badge>}
                  {!medicine.activo && <Badge variant="destructive" className="text-[10px] shadow">Inactivo</Badge>}
                </div>
                {medicine.categoria && (
                  <div className="absolute top-3 right-3">
                    <Badge variant="otc" className="text-[10px] shadow">{medicine.categoria.nombre}</Badge>
                  </div>
                )}
              </div>

              <div className="p-4 flex-1 flex flex-col">
                <h3 className="font-semibold text-sm leading-snug line-clamp-2 group-hover:text-primary dark:group-hover:text-emerald-400 transition-colors">
                  {medicine.nombre_comercial}
                </h3>
                <p className="text-xs text-muted-foreground dark:text-zinc-400 mt-1">
                  {medicine.nombre_generico}{medicine.concentracion ? ` · ${medicine.concentracion}` : ""}
                </p>

                <div className="mt-auto pt-3 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground dark:text-zinc-500">
                    {medicine.laboratorio?.nombre}
                  </span>
                </div>
              </div>

              <div className="px-4 pb-4 mt-auto">
                <div className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-input bg-background dark:bg-zinc-800 px-4 py-2 text-sm font-medium hover:bg-accent dark:hover:bg-zinc-700 hover:text-accent-foreground dark:hover:text-zinc-100 transition-colors">
                  <Eye className="h-4 w-4" /> Ver detalle
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
