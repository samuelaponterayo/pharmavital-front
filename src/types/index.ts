export type RoleName = "administrador" | "farmaceuta" | "domiciliario" | "cliente";
export type UserState = "activo" | "inactivo" | "suspendido";
export type OrderState =
  | "pendiente"
  | "confirmado"
  | "en_preparacion"
  | "listo_despacho"
  | "en_domicilio"
  | "entregado"
  | "cancelado"
  | "devuelto";
export type PaymentState = "pendiente" | "procesando" | "aprobado" | "rechazado" | "reembolsado";
export type FormulaState = "pendiente" | "aprobada" | "rechazada" | "vencida" | "usada";
export type DocType = "CC" | "CE" | "TI" | "PAS" | "NIT";
export type PaymentMethod =
  | "efectivo_contraentrega"
  | "tarjeta_credito"
  | "tarjeta_debito"
  | "nequi"
  | "daviplata"
  | "pse"
  | "bancolombia_qr";
export type MovementType = "entrada" | "salida" | "ajuste" | "devolucion" | "baja";
export type DeliveryState = "pendiente" | "asignado" | "recogido" | "en_camino" | "entregado" | "fallido";
export type VehicleType = "moto" | "bicicleta" | "pie";

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  meta?: { page: number; limit: number };
}

export interface PaginatedList<T> {
  data: T[];
  meta: { page: number; limit: number };
}

export interface Role {
  id: string;
  nombre: string;
  descripcion?: string;
  permisos: string[];
  activo: boolean;
}

export interface User {
  id: string;
  rol_id: string;
  role?: Role;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  tipo_documento: DocType;
  numero_documento: string;
  fecha_nacimiento?: string;
  foto_url?: string;
  estado: UserState;
  email_verificado: boolean;
  ultimo_acceso?: string;
  permissions?: string[];
  direcciones?: Address[];
  mensajero?: Mensajero;
  created_at?: string;
  updated_at?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface Address {
  id: string;
  usuario_id: string;
  barrio_id: string;
  direccion: string;
  complemento?: string;
  referencia?: string;
  latitud?: number;
  longitud?: number;
  es_principal: boolean;
  alias?: string;
  activo: boolean;
  barrio?: Barrio;
  usuario?: User;
  created_at?: string;
}

export interface Barrio {
  id: string;
  nombre: string;
  comuna?: string;
  zona: "urbana" | "rural";
  activo: boolean;
}

export interface Category {
  id: string;
  padre_id?: string;
  nombre: string;
  descripcion?: string;
  icono_url?: string;
  orden: number;
  activo: boolean;
}

export interface Provider {
  id: string;
  nombre: string;
  nit: string;
  representante?: string;
  email?: string;
  telefono?: string;
  celular?: string;
  ciudad: string;
  departamento: string;
  direccion?: string;
  condiciones_pago?: string;
  dias_entrega: number;
  activo: boolean;
}

export interface Laboratory {
  id: string;
  nombre: string;
  pais: string;
  sitio_web?: string;
  activo: boolean;
}

export interface Medicine {
  id: string;
  categoria_id: string;
  proveedor_id: string;
  laboratorio_id: string;
  nombre_comercial: string;
  nombre_generico: string;
  registro_invima: string;
  concentracion?: string;
  presentacion?: string;
  contenido_por_unidad?: string;
  via_administracion?: string;
  condiciones_almacen?: string;
  requiere_formula: boolean;
  requiere_refrigeracion: boolean;
  es_controlado: boolean;
  descripcion?: string;
  indicaciones?: string;
  contraindicaciones?: string;
  imagen_url?: string;
  slug: string;
  activo: boolean;
  categoria?: Category;
  proveedor?: Provider;
  laboratorio?: Laboratory;
  inventarios?: Inventory[];
  created_at?: string;
  updated_at?: string;
}

export interface Inventory {
  id: string;
  medicamento_id: string;
  proveedor_id: string;
  lote: string;
  fecha_fabricacion?: string;
  fecha_vencimiento: string;
  stock_disponible: number;
  stock_reservado: number;
  stock_minimo: number;
  ubicacion_bodega?: string;
  precio_compra: number;
  precio_venta: number;
  porcentaje_iva: number;
  fecha_entrada: string;
  medicamento?: Medicine;
  proveedor?: Provider;
  movimientos?: InventoryMovement[];
  created_at?: string;
  updated_at?: string;
}

export interface InventoryMovement {
  id: string;
  inventario_id: string;
  usuario_id: string;
  tipo: MovementType;
  cantidad: number;
  cantidad_antes: number;
  cantidad_despues: number;
  motivo?: string;
  referencia_id?: string;
  usuario?: User;
  created_at?: string;
}

export interface Formula {
  id: string;
  usuario_id: string;
  medico_nombre: string;
  medico_registro: string;
  medico_especialidad?: string;
  ips_nombre?: string;
  fecha_emision: string;
  fecha_vencimiento: string;
  imagen_url: string;
  imagen_url_2?: string;
  estado: FormulaState;
  verificado_por?: string;
  notas_verificacion?: string;
  fecha_verificacion?: string;
  usuario?: User;
  verificador?: User;
  created_at?: string;
  updated_at?: string;
}

export interface Coupon {
  id: string;
  codigo: string;
  descripcion?: string;
  tipo_descuento: "porcentaje" | "valor_fijo" | "envio_gratis";
  valor_descuento: number;
  valor_minimo_pedido: number;
  max_usos_total?: number;
  max_usos_usuario: number;
  usos_actuales: number;
  fecha_inicio: string;
  fecha_fin: string;
  activo: boolean;
}

export interface OrderDetail {
  id: string;
  pedido_id: string;
  inventario_id: string;
  medicamento_id: string;
  cantidad: number;
  precio_unitario: number;
  porcentaje_iva: number;
  descuento_item: number;
  subtotal: number;
  medicamento?: Medicine;
  inventario?: Inventory;
}

export interface OrderHistory {
  id: string;
  pedido_id: string;
  usuario_id: string;
  estado_ant?: string;
  estado_nvo: string;
  comentario?: string;
  usuario?: User;
  created_at?: string;
}

export interface Order {
  id: string;
  usuario_id: string;
  formula_id?: string;
  direccion_id: string;
  cupon_id?: string;
  numero_pedido: string;
  estado: OrderState;
  subtotal: number;
  descuento_cupon: number;
  descuento_directo: number;
  costo_domicilio: number;
  impuestos: number;
  total: number;
  metodo_pago: PaymentMethod;
  estado_pago: PaymentState;
  referencia_pago?: string;
  notas_cliente?: string;
  notas_internas?: string;
  ip_cliente?: string;
  requiere_formula: boolean;
  usuario?: User;
  direccion?: Address;
  formula?: Formula;
  cupon?: Coupon;
  detalles?: OrderDetail[];
  historialEstados?: OrderHistory[];
  domicilio?: Delivery;
  created_at?: string;
  updated_at?: string;
}

export interface Mensajero {
  id: string;
  usuario_id: string;
  tipo_vehiculo: VehicleType;
  placa?: string;
  numero_licencia?: string;
  disponible: boolean;
  lat_actual?: number;
  lng_actual?: number;
  activo: boolean;
  usuario?: User;
  created_at?: string;
}

export interface Delivery {
  id: string;
  pedido_id: string;
  mensajero_id?: string;
  estado: DeliveryState;
  direccion_texto: string;
  barrio_entrega?: string;
  lat_entrega?: number;
  lng_entrega?: number;
  instrucciones?: string;
  distancia_km?: number;
  tiempo_estimado_min?: number;
  hora_asignacion?: string;
  hora_recogida?: string;
  hora_entrega?: string;
  firma_receptor?: string;
  nombre_receptor?: string;
  calificacion_entrega?: number;
  comentario_entrega?: string;
  mensajero?: Mensajero;
  pedido?: Order;
  created_at?: string;
  updated_at?: string;
}
