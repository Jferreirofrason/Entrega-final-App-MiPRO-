import { useRef } from "react";
import { ChevronRight } from "lucide-react";
import {
  ReclamoGarantiaCliente,
  estadoGeneralReclamo,
  reclamoRequiereAccion,
} from "../../logic/reclamos";
import { formatearFecha } from "../../logic/fechas";
import { presentarEstadoCasoReclamo } from "../../i18n/estados";
import { getStatusConfig } from "../../utils/statusConfig";
import { STR } from "../../i18n/strings";

// Card mínima del reclamo reciente en el Home, espejo de la card de
// "Mis servicios": estado, producto, una línea de situación, y la fila
// final con la referencia a la izquierda y la acción a la derecha (botón
// amarillo solo cuando el usuario debe actuar). El detalle completo vive
// en el hub de Garantía.
export function TarjetaReclamoCompacta({
  reclamo,
  onVerDetalle,
}: {
  reclamo: ReclamoGarantiaCliente;
  onVerDetalle: () => void;
}) {
  const procesando = useRef(false);
  const presentacion = presentarEstadoCasoReclamo(estadoGeneralReclamo(reclamo));
  const config = getStatusConfig(presentacion.claveVisual);
  const requiereAccion = reclamoRequiereAccion(reclamo);
  const iniciado = formatearFecha(reclamo.iniciadoEl);

  const meta = { fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif" } as const;

  const onTap = () => {
    if (procesando.current) return;
    procesando.current = true;
    onVerDetalle();
    setTimeout(() => {
      procesando.current = false;
    }, 600);
  };

  return (
    <button
      onClick={onTap}
      aria-label={`${reclamo.producto}. ${presentacion.etiqueta}. ${
        requiereAccion && reclamo.requiereAccionCliente ? reclamo.requiereAccionCliente : STR.garantia.verDetalle
      }.`}
      className="w-full text-left border transition-all active:scale-[0.99]"
      style={{
        backgroundColor: "var(--card)",
        borderColor: "var(--gray-8)",
        borderRadius: "14px",
        padding: "16px",
        cursor: "pointer",
      }}
    >
      {/* Estado */}
      <span className="inline-flex items-center gap-1.5">
        <span
          aria-hidden="true"
          className="inline-block"
          style={{ width: "7px", height: "7px", borderRadius: "2px", backgroundColor: config.color }}
        />
        <span
          style={{
            ...meta,
            fontSize: "11px",
            fontWeight: "var(--font-weight-medium)",
            color: config.color,
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          {presentacion.etiqueta}
        </span>
      </span>

      {/* Producto y qué está pasando */}
      <p
        className="truncate"
        style={{
          fontFamily: "'Bebas Neue', Arial, sans-serif",
          fontSize: "17px",
          letterSpacing: "1px",
          textTransform: "uppercase",
          color: "var(--primary-black)",
          lineHeight: "21px",
          margin: "6px 0 0",
        }}
      >
        {reclamo.producto}
      </p>
      <p
        className="truncate"
        style={{ ...meta, fontSize: "13px", lineHeight: "19px", color: "var(--gray-80)", margin: "2px 0 0" }}
      >
        {presentacion.mensaje}
      </p>

      {/* Referencia y acción comparten fila; con acción pendiente, botón */}
      {requiereAccion && reclamo.requiereAccionCliente ? (
        <span
          className="flex items-center justify-center gap-0.5 w-full"
          style={{
            marginTop: "10px",
            height: "36px",
            backgroundColor: "var(--primary-yellow)",
            borderRadius: "10px",
            ...meta,
            fontSize: "14px",
            fontWeight: "var(--font-weight-medium)",
            color: "var(--primary-black)",
          }}
        >
          {STR.garantia.completarInformacion}
          <ChevronRight size={15} strokeWidth={2.5} aria-hidden="true" />
        </span>
      ) : (
        <div
          className="flex items-center justify-between gap-3"
          style={{ marginTop: "8px", minHeight: "20px" }}
        >
          <span className="truncate" style={{ ...meta, fontSize: "11.5px", color: "var(--gray-60)" }}>
            {reclamo.numero}
            {iniciado ? ` · ${STR.garantia.iniciadoEl(iniciado)}` : ""}
          </span>
          <span className="flex items-center gap-0.5 flex-shrink-0">
            <span
              style={{
                ...meta,
                fontSize: "13px",
                fontWeight: "var(--font-weight-medium)",
                color: "var(--primary-black)",
              }}
            >
              {STR.garantia.verDetalle}
            </span>
            <ChevronRight size={16} strokeWidth={2.5} color="var(--primary-black)" aria-hidden="true" />
          </span>
        </div>
      )}
    </button>
  );
}
