import { ReactNode } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Calendar, CreditCard, Hash, MapPin, Receipt, Wrench } from "lucide-react";
import { STR } from "../i18n/strings";
import { pagoDelHistorial } from "../data/historialPagos";
import { formatearFechaHora } from "../logic/fechas";
import { ESTADOS_DEL_PAGO } from "./HistorialPagos";

// El detalle de un pago del historial.
//
// Los mismos datos que el comprobante del final del checkout, pero
// consultados después: estado, monto, servicio, medio enmascarado,
// autorización, reserva, fecha y dirección.
//
// ⚠️ No hay comprobante fiscal ni descarga: esa funcionalidad todavía no
// existe, así que la pantalla no la insinúa. Ver PENDIENTE_DEL_HISTORIAL.
export function DetallePago() {
  const navigate = useNavigate();
  const { id } = useParams();
  const pago = id ? pagoDelHistorial(id) : null;

  const meta = { fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif" } as const;

  const dato = (icono: ReactNode, etiqueta: string, valor: string) => (
    <div className="flex items-start" style={{ gap: "12px", padding: "12px 0" }}>
      <span className="flex shrink-0 items-center justify-center" style={{ width: "20px", height: "20px" }}>
        {icono}
      </span>
      <span className="min-w-0 flex-1">
        <span
          className="block"
          style={{ ...meta, fontSize: "12px", lineHeight: "17px", color: "var(--gray-60)" }}
        >
          {etiqueta}
        </span>
        <span
          className="block"
          style={{ ...meta, fontSize: "14px", lineHeight: "20px", color: "var(--primary-black)" }}
        >
          {valor}
        </span>
      </span>
    </div>
  );

  const cabecera = (
    <header
      className="flex items-center gap-3 px-6 pt-[20px] pb-4 bg-white sticky top-0 z-20"
      style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}
    >
      <button
        aria-label={STR.metodosPago.volver}
        onClick={() => navigate("/perfil/historial-pagos")}
        className="w-11 h-11 rounded-[10px] flex items-center justify-center transition-all hover:scale-105 active:scale-95 border flex-shrink-0"
        style={{
          backgroundColor: "var(--primary-white)",
          borderColor: "var(--gray-20)",
          cursor: "pointer",
        }}
      >
        <ArrowLeft size={20} strokeWidth={2.1} color="var(--primary-black)" />
      </button>
      <div className="flex-1 min-w-0">
        <h1
          className="truncate"
          style={{
            fontFamily: "'Bebas Neue', Arial, sans-serif",
            fontSize: "20px",
            fontWeight: "var(--font-weight-normal)",
            letterSpacing: "1px",
            color: "var(--primary-black)",
            margin: 0,
            textTransform: "uppercase",
          }}
        >
          {STR.historial.detalleTitulo}
        </h1>
      </div>
    </header>
  );

  if (!pago) {
    return (
      <div className="flex flex-col h-full" style={{ backgroundColor: "var(--primary-white)" }}>
        {cabecera}
        <div className="flex-1 overflow-y-auto px-6 pt-5">
          <p style={{ ...meta, fontSize: "14px", lineHeight: "20px", color: "var(--gray-60)", margin: 0 }}>
            {STR.historial.detalleNoEncontrado}
          </p>
        </div>
      </div>
    );
  }

  const estado = ESTADOS_DEL_PAGO[pago.estado];
  const monto = `$${pago.monto.toFixed(2)}`;
  const medio = pago.detalleMedio ? `${pago.medio} · ${pago.detalleMedio}` : pago.medio;

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: "var(--primary-white)" }}>
      {cabecera}

      <div className="flex-1 overflow-y-auto px-6 pt-6 pb-8">
        {/* Arriba, lo que se contesta primero: cuánto y cómo salió. */}
        <div className="flex flex-col items-center text-center" style={{ marginBottom: "20px" }}>
          <span
            style={{ ...meta, fontSize: "12px", lineHeight: "17px", letterSpacing: "0.6px", color: "var(--gray-60)", textTransform: "uppercase" }}
          >
            {STR.historial.detalleMonto}
          </span>
          <span
            style={{
              fontFamily: "'Bebas Neue', Arial, sans-serif",
              fontSize: "40px",
              lineHeight: "1.05",
              letterSpacing: "1px",
              color: "var(--primary-black)",
              margin: "4px 0 6px",
            }}
          >
            {monto}
          </span>
          <span
            style={{
              ...meta,
              fontSize: "14px",
              lineHeight: "20px",
              fontWeight: "var(--font-weight-medium)",
              color: estado.color,
            }}
          >
            {estado.texto}
          </span>
        </div>

        <div
          style={{
            padding: "4px 16px",
            borderRadius: "16px",
            border: "1px solid var(--gray-8)",
          }}
        >
          {dato(
            <Wrench size={20} strokeWidth={2} color="var(--gray-60)" aria-hidden="true" />,
            STR.historial.detalleServicio,
            pago.servicio,
          )}
          {dato(
            <CreditCard size={20} strokeWidth={2} color="var(--gray-60)" aria-hidden="true" />,
            STR.historial.detalleMedio,
            medio,
          )}
          {/* La autorización solo si el pago llegó a tenerla: un pago
              pendiente todavía no tiene número. */}
          {pago.autorizacion &&
            dato(
              <Receipt size={20} strokeWidth={2} color="var(--gray-60)" aria-hidden="true" />,
              STR.historial.detalleAutorizacion,
              pago.autorizacion,
            )}
          {dato(
            <Hash size={20} strokeWidth={2} color="var(--gray-60)" aria-hidden="true" />,
            STR.historial.detalleReserva,
            pago.numeroReserva,
          )}
          {dato(
            <Calendar size={20} strokeWidth={2} color="var(--gray-60)" aria-hidden="true" />,
            STR.historial.detalleFecha,
            formatearFechaHora(pago.pagadoEl, "", ""),
          )}
          {pago.direccion &&
            dato(
              <MapPin size={20} strokeWidth={2} color="var(--gray-60)" aria-hidden="true" />,
              STR.historial.detalleDireccion,
              pago.direccion,
            )}
        </div>
      </div>
    </div>
  );
}
