import { useRef } from "react";
import { CalendarDays, ChevronRight, User } from "lucide-react";
import {
  ReclamoGarantiaCliente,
  citaRelevante,
  estadoGeneralReclamo,
  reclamoRequiereAccion,
} from "../../logic/reclamos";
import { presentarEstadoCasoReclamo } from "../../i18n/estados";
import { formatearFecha, formatearFechaHora } from "../../logic/fechas";
import { getStatusConfig } from "../../utils/statusConfig";
import { STR } from "../../i18n/strings";

// Card de un reclamo de garantía.
//
// Jerarquía pensada para tranquilizar y orientar: estado comprensible,
// producto afectado (completo, sin truncar), qué está ocurriendo y qué
// sigue, la acción del usuario cuando corresponde, y recién después la
// referencia administrativa y la fecha. "Ver detalle" siempre visible:
// no se depende de que la card parezca tocable.
export function TarjetaReclamo({
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
  const cita = citaRelevante(reclamo);
  const iniciado = formatearFecha(reclamo.iniciadoEl);

  const onTap = () => {
    if (procesando.current) return;
    procesando.current = true;
    onVerDetalle();
    setTimeout(() => {
      procesando.current = false;
    }, 600);
  };

  const meta = {
    fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif",
  } as const;

  return (
    <button
      onClick={onTap}
      aria-label={`${reclamo.producto}. ${presentacion.etiqueta}. ${STR.garantia.verDetalle}.`}
      className="w-full text-left border transition-all active:scale-[0.99]"
      style={{
        backgroundColor: "var(--card)",
        borderColor: "var(--gray-8)",
        borderRadius: "16px",
        padding: "16px",
        cursor: "pointer",
      }}
    >
      {/* 1. Estado comprensible */}
      <span
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full"
        style={{ backgroundColor: config.bg }}
      >
        <span
          aria-hidden="true"
          className="inline-block w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: config.color }}
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

      {/* 2. Producto afectado (completo) y 6. referencia administrativa */}
      <h4
        style={{
          fontFamily: "'Bebas Neue', Arial, sans-serif",
          fontSize: "18px",
          fontWeight: "var(--font-weight-normal)",
          color: "var(--foreground)",
          letterSpacing: "1px",
          textTransform: "uppercase",
          lineHeight: "1.2",
          margin: "12px 0 0",
        }}
      >
        {reclamo.producto}
      </h4>
      <p style={{ ...meta, fontSize: "12px", color: "var(--gray-60)", margin: "2px 0 0" }}>
        {STR.garantia.reclamo} {reclamo.numero}
      </p>

      {/* 3 y 4. Qué está ocurriendo y qué sigue */}
      <div
        style={{
          backgroundColor: config.bg,
          borderRadius: "10px",
          padding: "10px 12px",
          margin: "12px 0 0",
        }}
      >
        <div className="flex items-center gap-2">
          <config.icon
            size={16}
            strokeWidth={2.5}
            color={config.color}
            style={{ flexShrink: 0 }}
            aria-hidden="true"
          />
          <span
            style={{
              ...meta,
              fontSize: "14px",
              fontWeight: "var(--font-weight-medium)",
              color: "var(--primary-black)",
            }}
          >
            {presentacion.mensaje}
          </span>
        </div>
        {requiereAccion && reclamo.requiereAccionCliente && (
          <p
            className="inline-flex items-center gap-0.5"
            style={{
              ...meta,
              fontSize: "13px",
              fontWeight: "var(--font-weight-medium)",
              color: "var(--primary-black)",
              margin: "6px 0 0 24px",
            }}
          >
            {reclamo.requiereAccionCliente}
            <ChevronRight size={16} strokeWidth={2.5} aria-hidden="true" />
          </p>
        )}
      </div>

      {/* Cita técnica próxima, cuando existe */}
      {cita?.fecha && (
        <div style={{ margin: "10px 0 0" }}>
          <div className="flex items-center gap-1.5">
            <CalendarDays size={14} color="var(--gray-60)" style={{ flexShrink: 0 }} aria-hidden="true" />
            <span style={{ ...meta, fontSize: "13px", color: "var(--gray-80)" }}>
              {STR.garantia.proximaVisita}: {formatearFechaHora(cita.fecha, "", "")}
            </span>
          </div>
          {cita.tecnico && (
            <div className="flex items-center gap-1.5" style={{ marginTop: "4px" }}>
              <User size={14} color="var(--gray-60)" style={{ flexShrink: 0 }} aria-hidden="true" />
              <span style={{ ...meta, fontSize: "13px", color: "var(--gray-80)" }}>
                {STR.garantia.tecnico}:{" "}
                <span style={{ color: "var(--primary-black)", fontWeight: "var(--font-weight-medium)" }}>
                  {cita.tecnico}
                </span>
              </span>
            </div>
          )}
        </div>
      )}

      {/* 5. Fecha relevante */}
      {iniciado && (
        <p style={{ ...meta, fontSize: "12px", color: "var(--gray-60)", margin: "10px 0 0" }}>
          {STR.garantia.iniciadoEl(iniciado)}
        </p>
      )}

      {/* 7. Acción visible */}
      <div
        className="flex items-center justify-end gap-0.5 pt-3 mt-3"
        style={{ borderTop: "1px solid var(--gray-8)" }}
      >
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
      </div>
    </button>
  );
}
