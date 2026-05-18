import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { medicinesService } from "@/api/services/medicines.service";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/EmptyState";
import { AddToCartButton } from "@/components/AddToCartButton";
import { formatCurrency } from "@/utils/formatters";
import {
  ArrowLeft,
  Pill,
  ShieldCheck,
  ThermometerSnowflake,
  AlertTriangle,
  Package,
  Truck,
  RotateCcw,
} from "lucide-react";
import type { Medicine, Inventory } from "@/types";
import type { CartItem } from "@/store/cartStore";

export function MedicineDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [medicine, setMedicine] = useState<Medicine | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedInventory, setSelectedInventory] = useState<Inventory | null>(null);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        const res = await medicinesService.getById(id);
        const med = res.data ?? null;
        setMedicine(med);
        if (med?.inventarios?.length) {
          const available = med.inventarios.filter(
            (i) => (Number(i.stock_disponible) || 0) > 0
          );
          setSelectedInventory(available[0] ?? null);
        } else {
          setSelectedInventory(null);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  useEffect(() => {
    if (medicine && medicine.activo === false) {
      setSelectedInventory(null);
    }
  }, [medicine]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Skeleton className="h-8 w-28 mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <Skeleton className="lg:col-span-5 h-96 rounded-2xl" />
          <Skeleton className="lg:col-span-7 h-96 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!medicine) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <EmptyState
          icon="error"
          title="Producto no encontrado"
          description="El medicamento que buscas no existe o fue removido"
          action={{ label: "Volver a la tienda", onClick: () => navigate("/") }}
        />
      </div>
    );
  }

  const inventory = medicine.inventarios ?? [];
  const availableInventory = inventory.filter(
    (i) => (Number(i.stock_disponible) || 0) > 0
  );
  const isInactive = medicine.activo === false;

  const hasLowStock =
    selectedInventory &&
    Number(selectedInventory.stock_disponible) <= Number(selectedInventory.stock_minimo);

  const toCartItem = (inv: Inventory): CartItem => ({
    inventoryId: inv.id,
    medicineId: medicine.id,
    medicineName: medicine.nombre_comercial,
    genericName: medicine.nombre_generico,
    concentration: medicine.concentracion,
    presentation: medicine.presentacion,
    price: Number(inv.precio_venta),
    quantity: 1,
    stockAvailable: Number(inv.stock_disponible) || 0,
    imageUrl: medicine.imagen_url,
    requiresPrescription: medicine.requiere_formula,
  });

  return (
    <div className="bg-background dark:bg-zinc-950 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground dark:text-zinc-400 hover:text-foreground dark:hover:text-zinc-100 transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 lg:items-start gap-8">
          <div className="lg:col-span-5">
            <div className="sticky top-20 space-y-4 max-w-sm">
              <div className="aspect-[3/4] rounded-2xl bg-gradient-to-br from-primary/5 dark:from-emerald-500/5 via-muted dark:via-zinc-800 to-muted/50 dark:to-zinc-900 flex items-center justify-center overflow-hidden border dark:border-zinc-800 relative">
                {medicine.imagen_url ? (
                  <img
                    src={medicine.imagen_url}
                    alt={medicine.nombre_comercial}
                    className="w-full h-full object-contain p-4"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = "none";
                    }}
                  />
                ) : (
                  <Pill className="h-16 w-16 text-primary/20 dark:text-emerald-400/20" />
                )}

                <div className="absolute top-3 left-3 flex gap-1.5">
                  {medicine.requiere_formula && (
                    <Badge variant="rx" className="text-[10px] shadow-lg">
                      Rx
                    </Badge>
                  )}
                </div>
              </div>

              <div className="hidden lg:grid grid-cols-3 gap-2 text-center">
                {[
                  { icon: Truck, label: "Envío a domicilio" },
                  { icon: RotateCcw, label: "Producto verificado" },
                  { icon: ShieldCheck, label: "Registro INVIMA" },
                ].map((f, i) => (
                  <div
                    key={i}
                    className="rounded-xl border dark:border-zinc-800 bg-card dark:bg-zinc-900 p-2.5"
                  >
                    <f.icon className="h-4 w-4 text-primary dark:text-emerald-400 mx-auto mb-0.5" />
                    <span className="text-[10px] text-muted-foreground dark:text-zinc-500 leading-tight">{f.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="flex flex-wrap gap-2 mb-3">
              {medicine.categoria && (
                <Badge variant="otc" className="text-xs">
                  {medicine.categoria.nombre}
                </Badge>
              )}
              {medicine.laboratorio && (
                <Badge variant="secondary" className="text-xs">
                  {medicine.laboratorio.nombre}
                </Badge>
              )}
              {medicine.requiere_refrigeracion && (
                <Badge className="text-xs bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-800">
                  <ThermometerSnowflake className="h-3 w-3 mr-1" /> Refrigeración
                </Badge>
              )}
              {medicine.es_controlado && (
                <Badge variant="destructive" className="text-xs">
                  <AlertTriangle className="h-3 w-3 mr-1" /> Controlado
                </Badge>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-foreground dark:text-zinc-100 leading-tight">
              {medicine.nombre_comercial}
            </h1>
            <p className="text-sm text-muted-foreground dark:text-zinc-400 mt-1.5">
              {medicine.nombre_generico}
              {medicine.concentracion ? ` · ${medicine.concentracion}` : ""}
              {medicine.presentacion ? ` · ${medicine.presentacion}` : ""}
            </p>

            <div className="mt-6 p-5 rounded-xl border dark:border-zinc-800 bg-card dark:bg-zinc-900">
              {selectedInventory ? (
                <>
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-bold text-primary dark:text-emerald-400">
                      {formatCurrency(Number(selectedInventory.precio_venta))}
                    </span>
                    {hasLowStock && (
                      <Badge variant="stock-low" className="mb-1">
                        Solo quedan {String(selectedInventory.stock_disponible)}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground dark:text-zinc-500 mt-1">
                    Lote: {selectedInventory.lote} · Vence: {selectedInventory.fecha_vencimiento}
                  </p>

                  {availableInventory.length > 1 && (
                    <div className="mt-4">
                      <label className="text-xs font-medium text-foreground dark:text-zinc-300 mb-2 block">
                        Otras presentaciones
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {availableInventory.map((inv) => (
                          <button
                            key={inv.id}
                            onClick={() => setSelectedInventory(inv)}
                            className={`text-left px-3 py-2 rounded-lg border text-sm transition-all ${
                              selectedInventory.id === inv.id
                                ? "border-primary dark:border-emerald-600 bg-primary/5 dark:bg-emerald-500/5 ring-1 ring-primary/20 dark:ring-emerald-600/20"
                                : "border dark:border-zinc-800 hover:border-primary/30 dark:hover:border-emerald-700/30 bg-card dark:bg-zinc-900"
                            }`}
                          >
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-medium">
                                {inv.ubicacion_bodega ?? `Lote ${inv.lote}`}
                              </span>
                              <span className="text-sm font-bold text-primary dark:text-emerald-400">
                                {formatCurrency(Number(inv.precio_venta))}
                              </span>
                            </div>
                            <span className="text-[10px] text-muted-foreground dark:text-zinc-500">
                              {String(inv.stock_disponible)} disponibles
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-5">
                    <AddToCartButton
                      item={toCartItem(selectedInventory)}
                      size="lg"
                      variant="default"
                    />
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-3 text-muted-foreground dark:text-zinc-400">
                  <Package className="h-5 w-5" />
                  <span className="text-sm">
                    {isInactive
                      ? "Producto no disponible"
                      : "Producto agotado temporalmente"}
                  </span>
                </div>
              )}
            </div>

            <div className="mt-8 space-y-6">
              <div>
                <h2 className="text-sm font-semibold text-foreground dark:text-zinc-200 mb-3">
                  Ficha técnica
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
                  <Detail label="Registro INVIMA" value={medicine.registro_invima} />
                  <Detail label="Categoría" value={medicine.categoria?.nombre ?? "—"} />
                  <Detail label="Laboratorio" value={medicine.laboratorio?.nombre ?? "—"} />
                  <Detail label="País" value={medicine.laboratorio?.pais ?? "—"} />
                  <Detail label="Proveedor" value={medicine.proveedor?.nombre ?? "—"} />
                  <Detail label="Vía administración" value={medicine.via_administracion ?? "—"} />
                  <Detail label="Contenido por unidad" value={medicine.contenido_por_unidad ?? "—"} />
                  <Detail label="Condiciones almacén" value={medicine.condiciones_almacen ?? "—"} />
                </div>
              </div>

              {medicine.descripcion && (
                <div>
                  <h2 className="text-sm font-semibold text-foreground dark:text-zinc-200 mb-2">
                    Descripción
                  </h2>
                  <p className="text-sm text-muted-foreground dark:text-zinc-400 leading-relaxed">
                    {medicine.descripcion}
                  </p>
                </div>
              )}

              {medicine.indicaciones && (
                <div>
                  <h2 className="text-sm font-semibold text-foreground dark:text-zinc-200 mb-2">
                    Indicaciones
                  </h2>
                  <p className="text-sm text-muted-foreground dark:text-zinc-400 leading-relaxed">
                    {medicine.indicaciones}
                  </p>
                </div>
              )}

              {medicine.contraindicaciones && (
                <div>
                  <h2 className="text-sm font-semibold text-destructive dark:text-red-400 mb-2">
                    Contraindicaciones
                  </h2>
                  <p className="text-sm text-muted-foreground dark:text-zinc-400 leading-relaxed">
                    {medicine.contraindicaciones}
                  </p>
                </div>
              )}

              {inventory.length > 1 && (
                <div>
                  <h2 className="text-sm font-semibold text-foreground dark:text-zinc-200 mb-3">
                    Todos los lotes
                  </h2>
                  <div className="rounded-xl border dark:border-zinc-800 overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-muted/50 dark:bg-zinc-800 text-left">
                          <th className="py-2.5 px-4 font-medium text-muted-foreground dark:text-zinc-400 text-xs">
                            Lote
                          </th>
                          <th className="py-2.5 px-4 font-medium text-muted-foreground dark:text-zinc-400 text-xs">
                            Vence
                          </th>
                          <th className="py-2.5 px-4 font-medium text-muted-foreground dark:text-zinc-400 text-xs">
                            Stock
                          </th>
                          <th className="py-2.5 px-4 font-medium text-muted-foreground dark:text-zinc-400 text-xs text-right">
                            Precio
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {inventory.map((inv) => {
                          const isSelected = selectedInventory?.id === inv.id;
                          const low =
                            Number(inv.stock_disponible) <= Number(inv.stock_minimo);
                          return (
                            <tr
                              key={inv.id}
                              onClick={() =>
                                Number(inv.stock_disponible) > 0 &&
                                setSelectedInventory(inv)
                              }
                              className={`border-t dark:border-zinc-800 transition-colors ${
                                Number(inv.stock_disponible) > 0
                                  ? "cursor-pointer hover:bg-muted/50 dark:hover:bg-zinc-800/50"
                                  : "opacity-50"
                              } ${isSelected ? "bg-primary/5 dark:bg-emerald-500/5" : ""}`}
                            >
                              <td className="py-2.5 px-4 font-medium">{inv.lote}</td>
                              <td className="py-2.5 px-4 text-muted-foreground dark:text-zinc-400">
                                {inv.fecha_vencimiento}
                              </td>
                              <td className="py-2.5 px-4">
                                <span
                                  className={
                                    low
                                      ? "text-amber-500 dark:text-amber-400 font-semibold"
                                      : ""
                                  }
                                >
                                  {String(inv.stock_disponible)}
                                </span>
                              </td>
                              <td className="py-2.5 px-4 text-right font-medium">
                                {formatCurrency(Number(inv.precio_venta))}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between sm:grid sm:grid-cols-[140px,1fr] gap-2 py-1.5 border-b dark:border-zinc-800 last:border-0">
      <span className="text-xs text-muted-foreground dark:text-zinc-500">{label}</span>
      <span className="text-xs font-medium text-foreground dark:text-zinc-200 text-right sm:text-left">
        {value}
      </span>
    </div>
  );
}
