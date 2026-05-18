import { useState } from "react";
import { formulasService } from "@/api/services/formulas.service";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Check, X, FileText, Stethoscope, Calendar, Clock, Eye } from "lucide-react";
import { useAuth } from "@/auth/AuthContext";
import type { Formula, FormulaState } from "@/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useFetchList } from "@/hooks/useFetchList";
import { useMutation } from "@/hooks/useMutation";
import { FormulaForm } from "./FormulaForm";
import { PageHeader } from "@/components/PageHeader";
import type { FormulaFormData } from "@/schemas/formulas.schema";

const statusVariant = (estado: FormulaState): "default" | "secondary" | "destructive" | "outline" | "success" | "warning" => {
  const map: Record<FormulaState, "default" | "secondary" | "destructive" | "outline" | "success" | "warning"> = {
    pendiente: "warning", aprobada: "success", rechazada: "destructive", vencida: "secondary", usada: "default",
  };
  return map[estado] ?? "outline";
};

const statusLabel = (estado: FormulaState): string => {
  const map: Record<FormulaState, string> = {
    pendiente: "Pendiente",
    aprobada: "Aprobada",
    rechazada: "Rechazada",
    vencida: "Vencida",
    usada: "Usada",
  };
  return map[estado] ?? estado;
};

const statusBorderColor = (estado: FormulaState): string => {
  const map: Record<FormulaState, string> = {
    pendiente: "border-l-amber-400 dark:border-l-amber-600",
    aprobada: "border-l-emerald-500",
    rechazada: "border-l-red-400",
    vencida: "border-l-slate-300 dark:border-l-zinc-600",
    usada: "border-l-blue-400",
  };
  return map[estado] ?? "border-l-slate-200 dark:border-l-zinc-700";
};

export function FormulasPage() {
  const { user } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [previewFormula, setPreviewFormula] = useState<Formula | null>(null);

  const { data: formulas, loading, refresh } = useFetchList<Formula>(
    () => {
      const params = user?.role?.nombre === "cliente" ? { user_id: user.id } : undefined;
      return formulasService.list(params);
    },
    [user]
  );

  const { mutate: createFormula, loading: saving } = useMutation(
    async (data: FormulaFormData) => {
      return formulasService.create({ ...data, usuario_id: user!.id });
    },
    {
      successMsg: "Fórmula enviada correctamente",
      onSuccess: () => {
        setDialogOpen(false);
        refresh();
      },
    }
  );

  const { mutate: updateFormulaStatus } = useMutation(
    async (id: string, estado: FormulaState) => {
      return formulasService.updateStatus(id, estado, estado === "rechazada" ? "Fórmula rechazada" : undefined);
    },
    {
      successMsg: "Estado actualizado",
      onSuccess: () => refresh(),
    }
  );

  const canManage = user?.role?.nombre === "administrador" || user?.role?.nombre === "farmaceuta";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fórmulas Médicas"
        description="Gestión de fórmulas y recetas médicas"
        icon={<FileText className="h-5 w-5" />}
      >
        {user?.role?.nombre === "cliente" && (
          <Button onClick={() => setDialogOpen(true)} className="bg-green-600 hover:bg-green-700">
            <Plus className="mr-1.5 h-4 w-4" /> Subir Fórmula
          </Button>
        )}
      </PageHeader>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-4">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Paciente</TableHead>
                  <TableHead>Médico</TableHead>
                  <TableHead>Registro</TableHead>
                  <TableHead>Emisión</TableHead>
                  <TableHead>Vencimiento</TableHead>
                  <TableHead>Estado</TableHead>
                  {canManage && <TableHead className="text-right w-[110px]">Gestión</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {formulas.map((f) => (
                  <TableRow key={f.id} className={`${statusBorderColor(f.estado)} border-l-4`}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-emerald-900/50 flex items-center justify-center">
                          <FileText className="h-3.5 w-3.5 text-green-600" />
                        </div>
                        <span className="font-medium">{f.usuario?.nombre} {f.usuario?.apellido}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{f.medico_nombre}</span>
                        <span className="text-xs text-muted-foreground dark:text-zinc-400">{f.medico_especialidad || "—"}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1 text-sm bg-slate-50 dark:bg-zinc-800 px-2 py-0.5 rounded border border-slate-100 dark:border-zinc-700">
                        <Stethoscope className="h-3 w-3 text-slate-400 dark:text-zinc-500" />
                        {f.medico_registro}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1 text-sm text-muted-foreground dark:text-zinc-400">
                        <Calendar className="h-3 w-3" />
                        {f.fecha_emision ?? "—"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1 text-sm text-muted-foreground dark:text-zinc-400">
                        <Clock className="h-3 w-3" />
                        {f.fecha_vencimiento ?? "—"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(f.estado)} className="px-2 py-0.5 text-xs font-medium">
                        {statusLabel(f.estado)}
                      </Badge>
                    </TableCell>
                    {canManage && (
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setPreviewFormula(f)}
                            title="Ver fórmula"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {f.estado === "pendiente" && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 border-emerald-200 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 hover:text-emerald-800 dark:hover:text-emerald-200 hover:border-emerald-300 px-2"
                                onClick={() => updateFormulaStatus(f.id, "aprobada")}
                              >
                                <Check className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 border-red-200 bg-red-50 dark:bg-red-950 text-red-600 hover:bg-red-100 hover:text-red-700 hover:border-red-300 px-2"
                                onClick={() => updateFormulaStatus(f.id, "rechazada")}
                              >
                                <X className="h-3.5 w-3.5" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Subir Fórmula Médica</DialogTitle>
          </DialogHeader>
          <FormulaForm saving={saving} onSave={createFormula} onCancel={() => setDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={!!previewFormula} onOpenChange={() => setPreviewFormula(null)}>
        <DialogContent className="sm:max-w-[640px]">
          <DialogHeader>
            <DialogTitle>
              Fórmula de {previewFormula?.usuario?.nombre} {previewFormula?.usuario?.apellido}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {previewFormula?.medico_nombre} · {previewFormula?.medico_registro}
              {previewFormula?.medico_especialidad ? ` · ${previewFormula.medico_especialidad}` : ""}
            </p>
            {previewFormula?.imagen_url && (
              <div className="rounded-xl overflow-hidden border dark:border-zinc-800 bg-muted">
                <img
                  src={previewFormula.imagen_url}
                  alt="Fórmula médica"
                  className="w-full object-contain max-h-[500px]"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = ""; }}
                />
              </div>
            )}
            {previewFormula?.imagen_url_2 && (
              <div className="rounded-xl overflow-hidden border dark:border-zinc-800 bg-muted">
                <img
                  src={previewFormula.imagen_url_2}
                  alt="Fórmula médica 2"
                  className="w-full object-contain max-h-[500px]"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = ""; }}
                />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
