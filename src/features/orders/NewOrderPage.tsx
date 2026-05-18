import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";
import { useCartStore, useCartCount, useCartTotal } from "@/store/cartStore";
import { ordersService } from "@/api/services/orders.service";
import { addressesService } from "@/api/services/addresses.service";
import { formulasService } from "@/api/services/formulas.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { useMutation } from "@/hooks/useMutation";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ShoppingCart,
  ArrowLeft,
  MapPin,
  CreditCard,
  Truck,
  Loader2,
  AlertCircle,
  FileText,
} from "lucide-react";
import type { Address, Formula } from "@/types";

const PAYMENT_METHODS = [
  { value: "efectivo_contraentrega", label: "Efectivo contra entrega" },
  { value: "nequi", label: "Nequi" },
  { value: "daviplata", label: "Daviplata" },
  { value: "pse", label: "PSE" },
  { value: "bancolombia_qr", label: "Bancolombia QR" },
  { value: "tarjeta_credito", label: "Tarjeta de crédito" },
  { value: "tarjeta_debito", label: "Tarjeta de débito" },
];

export function NewOrderPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  const count = useCartCount();
  const subtotal = useCartTotal();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [notes, setNotes] = useState("");
  const [formulas, setFormulas] = useState<Formula[]>([]);
  const [selectedFormula, setSelectedFormula] = useState("");
  const [deliveryFee] = useState(6000);

  const hasPrescription = items.some((i) => i.requiresPrescription);

  useEffect(() => {
    addressesService
      .list({ user_id: user?.id })
      .then((res) => setAddresses(res.data ?? []))
      .catch(console.error)
      .finally(() => setLoadingAddresses(false));
  }, [user]);

  useEffect(() => {
    if (!user || !hasPrescription) return;
    formulasService
      .list({ user_id: user.id })
      .then((res) => {
        const approved = (res.data ?? []).filter(
          (f) => f.estado === "aprobada"
        );
        setFormulas(approved);
      })
      .catch(console.error);
  }, [user, hasPrescription]);

  const total = subtotal + deliveryFee;
  const hasOutOfStock = items.some((i) => (i.stockAvailable ?? 0) <= 0);
  const invalidItems = items.filter((i) => (i.stockAvailable ?? 0) <= 0);

  const { mutate: submitOrder, loading } = useMutation(
    async () => {
      if (!user || !selectedAddress || !paymentMethod) return;

      if (items.length === 0) {
        toast.error("Tu carrito está vacío");
        navigate("/");
        return;
      }

      const order = await ordersService.create({
        usuario_id: user.id,
        direccion_id: selectedAddress,
        metodo_pago: paymentMethod,
        items: items.map((i) => ({
          inventario_id: i.inventoryId,
          cantidad: i.quantity,
        })),
        costo_domicilio: deliveryFee,
        notas_cliente: notes || undefined,
        formula_id: selectedFormula || undefined,
      });
      return order;
    },
    {
      successMsg: "Pedido creado correctamente",
      onError: (err) => {
        if (err.message.toLowerCase().includes("inventario no encontrado")) {
          toast.error("Uno de los productos ya no está disponible. Vuelve al carrito para actualizarlo.");
        }
      },
      onSuccess: (data) => {
        clearCart();
        const orderId = (data as any)?.data?.id;
        if (orderId) {
          navigate(`/app/orders/${orderId}`);
        } else {
          navigate("/app/orders");
        }
      },
    }
  );

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto py-12">
        <EmptyState
          icon="box"
          title="Tu carrito está vacío"
          description="Agrega productos desde la tienda antes de crear un pedido"
          action={{ label: "Ir a la tienda", onClick: () => navigate("/") }}
        />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground dark:text-zinc-400 hover:text-foreground dark:hover:text-zinc-100 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Volver
      </button>

      <PageHeader
        title="Nuevo pedido"
        description="Revisa tu carrito y confirma el pedido"
        icon={<ShoppingCart className="h-5 w-5" />}
      />

      {invalidItems.length > 0 && (
        <div className="p-4 rounded-xl border border-destructive/30 dark:border-red-500/30 bg-destructive/5 dark:bg-red-500/5 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-destructive dark:text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-destructive dark:text-red-400">
              Productos no disponibles
            </p>
            <p className="text-xs text-muted-foreground dark:text-zinc-400 mt-0.5">
              {invalidItems.map((i) => i.medicineName).join(", ")} ya no están en stock.
              <button
                onClick={() => {
                  invalidItems.forEach((i) => useCartStore.getState().removeItem(i.inventoryId));
                  toast.info("Productos removidos del carrito");
                }}
                className="ml-2 text-primary dark:text-emerald-400 hover:underline font-medium"
              >
                Remover del carrito
              </button>
            </p>
          </div>
        </div>
      )}

      <Card className="dark:border-zinc-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Productos ({count})</CardTitle>
        </CardHeader>
        <CardContent className="divide-y dark:divide-zinc-800">
          {items.map((item) => (
            <div key={item.inventoryId} className="flex justify-between items-center py-3 first:pt-0 last:pb-0">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{item.medicineName}</p>
                <p className="text-xs text-muted-foreground dark:text-zinc-400">
                  {item.concentration} {item.presentation}
                </p>
                {item.requiresPrescription && (
                  <Badge variant="rx" className="text-[10px] mt-0.5">Rx</Badge>
                )}
              </div>
              <div className="text-right shrink-0 ml-4">
                <p className="text-sm font-semibold">{formatCurrency(item.price * item.quantity)}</p>
                <p className="text-xs text-muted-foreground dark:text-zinc-400">
                  {formatCurrency(item.price)} x {item.quantity}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="dark:border-zinc-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <MapPin className="h-4 w-4" /> Dirección de entrega
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingAddresses ? (
            <p className="text-sm text-muted-foreground">Cargando direcciones...</p>
          ) : addresses.length === 0 ? (
            <div className="text-center py-3">
              <p className="text-sm text-muted-foreground dark:text-zinc-400 mb-3">
                No tienes direcciones registradas
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/app/addresses")}
              >
                Gestionar direcciones
              </Button>
            </div>
          ) : (
            <Select value={selectedAddress} onValueChange={setSelectedAddress}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una dirección" />
              </SelectTrigger>
              <SelectContent>
                {addresses.map((addr) => (
                  <SelectItem key={addr.id} value={addr.id}>
                    {addr.direccion}
                    {addr.alias ? ` (${addr.alias})` : ""}
                    {addr.es_principal ? " ★" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </CardContent>
      </Card>

      <Card className="dark:border-zinc-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <CreditCard className="h-4 w-4" /> Método de pago
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={paymentMethod} onValueChange={setPaymentMethod}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un método de pago" />
            </SelectTrigger>
            <SelectContent>
              {PAYMENT_METHODS.map((pm) => (
                <SelectItem key={pm.value} value={pm.value}>
                  {pm.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {hasPrescription && (
        <Card className="dark:border-zinc-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4" /> Fórmula médica
            </CardTitle>
          </CardHeader>
          <CardContent>
            {formulas.length === 0 ? (
              <div className="text-sm text-muted-foreground dark:text-zinc-400">
                <p>No tienes fórmulas médicas aprobadas.</p>
                <p className="text-xs mt-1">
                  Algunos productos requieren receta.{" "}
                  <button
                    type="button"
                    onClick={() => navigate("/app/formulas")}
                    className="text-primary dark:text-emerald-400 hover:underline font-medium"
                  >
                    Sube tu fórmula aquí
                  </button>
                </p>
              </div>
            ) : (
              <Select value={selectedFormula} onValueChange={setSelectedFormula}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una fórmula médica aprobada" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin fórmula</SelectItem>
                  {formulas.map((f) => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.medico_nombre} · {f.medico_registro} · {formatDate(f.fecha_emision)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </CardContent>
        </Card>
      )}

      <Card className="dark:border-zinc-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Notas adicionales</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Instrucciones para la entrega, notas para el farmaceuta..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
          />
        </CardContent>
      </Card>

      <Card className="dark:border-zinc-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Truck className="h-4 w-4" /> Resumen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground dark:text-zinc-400">Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground dark:text-zinc-400">Domicilio</span>
            <span>{formatCurrency(deliveryFee)}</span>
          </div>
          <div className="flex justify-between text-sm font-semibold border-t dark:border-zinc-800 pt-2">
            <span>Total</span>
            <span className="text-primary dark:text-emerald-400 text-lg">
              {formatCurrency(total)}
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3 justify-end">
        <Button variant="outline" onClick={() => navigate(-1)}>
          Cancelar
        </Button>
        <Button
          onClick={() => submitOrder()}
          disabled={!selectedAddress || !paymentMethod || loading || hasOutOfStock || (hasPrescription && (!selectedFormula || selectedFormula === "none"))}
          className="gap-2"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {hasOutOfStock
            ? "Retira productos agotados para continuar"
            : hasPrescription && (!selectedFormula || selectedFormula === "none")
            ? "Selecciona una fórmula médica"
            : "Confirmar pedido"}
        </Button>
      </div>
    </div>
  );
}
