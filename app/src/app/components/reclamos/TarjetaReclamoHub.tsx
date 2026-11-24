import { useRef } from "react";
import { ChevronRight, ShieldCheck } from "lucide-react";
import {
  ReclamoGarantiaCliente,
  citaRelevante,
  estadoGeneralReclamo,
  reclamoRequiereAccion,
} from "../../logic/reclamos";
import { presentarEstadoCasoReclamo } from "../../i18n/estados";
import { formatearFecha } from "../../logic/fechas";
import { getStatusConfig } from "../../utils/statusConfig";
import { STR } from "../../i18n/strings";

// Card de reclamo del hub de Garantía, con forma de EXPEDIENTE:
// cabecera de ficha con el sello de la casa, el número de caso y el estado;
// cuerpo con el producto y qué está pasando; pie con la acción (botón
// amarillo solo cuando el usuario debe actuar). Filas fijas: todas las
// cards del listado miden lo mismo.
export function TarjetaReclamoHub({
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
  // La cita mostrada es la más próxima entre las coordinadas.
  const cita = citaRelevante(reclamo)?.fecha ?? null;
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

  // En el listado alcanza el mensaje corto; el próximo paso vive en el
  // detalle del reclamo.
  const mensaje = presentacion.mensaje;

  return (
    <button
      onClick={onTap}
      aria-label={`${reclamo.producto}. ${presentacion.etiqueta}. ${
        requiereAccion && reclamo.requiereAccionCliente ? reclamo.requiereAccionCliente : STR.garantia.verDetalle
      }.`}
      className="w-full text-left border overflow-hidden transition-all active:scale-[0.99]"
      style={{
        backgroundColor: "var(--card)",
        borderColor: "var(--gray-8)",
        borderRadius: "16px",
        padding: 0,
        boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
        cursor: "pointer",
      }}
    >
      {/* Cabecera de expediente: sello, número de caso y estado */}
      <div
        className="flex items-center justify-between gap-2"
        style={{
          backgroundColor: "var(--gray-3)",
          borderBottom: "1px solid var(--gray-8)",
          padding: "8px 12px",
          height: "36px",
        }}
      >
        <span className="flex items-center gap-2 flex-shrink-0">
          <span
            className="flex items-center justify-center flex-shrink-0"
            style={{ width: "24px", height: "24px", borderRadius: "7px", backgroundColor: "var(--primary-black)" }}
          >
            <ShieldCheck size={14} strokeWidth={2.2} color="var(--primary-yellow)" aria-hidden="true" />
          </span>
          {/* El número es la identidad de la card: nunca se corta */}
          <span
            style={{
              ...meta,
              fontSize: "12px",
              fontWeight: "var(--font-weight-medium)",
              letterSpacing: "0.5px",
              color: "var(--gray-80)",
            }}
          >
            {reclamo.numero}
          </span>
        </span>
        <span className="inline-flex items-center gap-1.5 min-w-0">
          <span
            aria-hidden="true"
            className="inline-block flex-shrink-0"
            style={{ width: "7px", height: "7px", borderRadius: "2px", backgroundColor: config.color }}
          />
          <span
            className="truncate"
            style={{
              ...meta,
              fontSize: "10.5px",
              fontWeight: "var(--font-weight-medium)",
              color: config.color,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            {presentacion.etiqueta}
          </span>
        </span>
      </div>

      {/* Cuerpo: producto y qué está pasando (filas fijas) */}
      <div style={{ padding: "12px 16px" }}>
        <p
          className="truncate"
          style={{
            fontFamily: "'Bebas Neue', Arial, sans-serif",
            fontSize: "18px",
            letterSpacing: "1px",
            textTransform: "uppercase",
            color: "var(--primary-black)",
            lineHeight: "22px",
            minHeight: "22px",
            margin: 0,
          }}
        >
          {reclamo.producto}
        </p>
        <p
          className="truncate"
          style={{ ...meta, fontSize: "13px", lineHeight: "19px", minHeight: "19px", color: "var(--gray-80)", margin: "2px 0 0" }}
        >
          {mensaje || " "}
        </p>
        <div className="flex items-center gap-4" style={{ marginTop: "6px", minHeight: "16px" }}>
          {iniciado && (
            <span style={{ ...meta, fontSize: "11.5px", color: "var(--gray-60)" }}>
              {STR.garantia.iniciadoEl(iniciado)}
            </span>
          )}
          {cita && (
            <span style={{ ...meta, fontSize: "11.5px", color: "var(--gray-60)" }}>
              {STR.garantia.citaEl(formatearFecha(cita) ?? "")}
            </span>
          )}
        </div>

        {/* Acción, con la misma altura en ambas variantes */}
        {requiereAccion && reclamo.requiereAccionCliente ? (
          <span
            className="flex items-center justify-center gap-0.5 w-full"
            style={{
              marginTop: "8px",
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
            className="flex items-center justify-end gap-0.5"
            style={{ marginTop: "8px", height: "36px", borderTop: "1px solid var(--gray-8)" }}
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
        )}
      </div>
    </button>
  );
}
