import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { medicinesService } from "@/api/services/medicines.service";
import { catalogService } from "@/api/services/catalog.service";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/EmptyState";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDebounce } from "@/hooks/useDebounce";
import { Search, Pill, ShieldCheck, Truck, Clock, Eye } from "lucide-react";
import type { Medicine, Category } from "@/types";

export function StorefrontPage() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const debouncedSearch = useDebounce(search, 400);
  const prevSearchRef = useRef(debouncedSearch);

  useEffect(() => {
    catalogService.categorias().then((r) => setCategories(r.data ?? [])).catch(console.error);
  }, []);

  useEffect(() => {
    if (prevSearchRef.current !== debouncedSearch) {
      prevSearchRef.current = debouncedSearch;
    }
    const load = async () => {
      setLoading(true);
      try {
        const res = await medicinesService.list({
          search: debouncedSearch || undefined,
          limit: 50,
        });
        setMedicines(res.data ?? []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [debouncedSearch]);

  const filtered =
    categoryFilter === "all"
      ? medicines.filter((m) => m.activo !== false)
      : medicines.filter((m) => m.activo !== false && m.categoria_id === categoryFilter);

  return (
    <div className="bg-background dark:bg-zinc-950">
      <section className="border-b dark:border-zinc-800 bg-gradient-to-br from-primary/5 dark:from-emerald-500/5 to-transparent">
        <div className="max-w-7xl mx-auto px-4 py-12 md:py-16">
          <div className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 dark:bg-emerald-500/10 text-primary dark:text-emerald-400 text-sm font-medium mb-4">
              <Pill className="h-4 w-4" /> Farmacia virtual
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground dark:text-zinc-100">
              Tu salud, a un clic de distancia
            </h1>
            <p className="mt-3 text-muted-foreground dark:text-zinc-400 text-lg">
              Medicamentos de calidad con envío a domicilio en Pereira. Sin salir de casa.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar medicamento..."
                  className="pl-11 h-12 rounded-xl text-base"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-[180px] h-12 rounded-xl">
                  <SelectValue placeholder="Categorías" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {[
            { icon: Truck, title: "Envío a domicilio", desc: "Entregamos en Pereira y alrededores" },
            { icon: ShieldCheck, title: "Productos garantizados", desc: "Registro INVIMA verificado" },
            { icon: Clock, title: "Entrega rápida", desc: "Pedidos antes de las 2pm, mismo día" },
          ].map((f, i) => (
            <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-card dark:bg-zinc-900 border dark:border-zinc-800">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 dark:bg-emerald-500/10 shrink-0">
                <f.icon className="h-5 w-5 text-primary dark:text-emerald-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">{f.title}</h3>
                <p className="text-xs text-muted-foreground dark:text-zinc-400 mt-0.5">{f.desc}</p>
              </div>
            </div>
          ))}
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
                to={`/products/${medicine.id}`}
                className="group rounded-xl border dark:border-zinc-800 bg-card dark:bg-zinc-900 overflow-hidden hover:shadow-lg dark:hover:shadow-black/30 hover:border-primary/30 dark:hover:border-emerald-700/30 transition-all duration-300 flex flex-col"
              >
                <div className="block">
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
                      {!medicine.activo && (
                        <Badge variant="destructive" className="text-[10px]">Inactivo</Badge>
                      )}
                    </div>
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
      </section>
    </div>
  );
}
