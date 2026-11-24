import { STR } from "../../i18n/strings";
import { PRECIO_BASE_REFERENCIAL_USD, ServicioCatalogo, formatearMonto } from "../../logic/catalogo";
import {
  PRECIO_INSPECCION_USD,
  totalEstimado,
  totalConAdicionales,
} from "../../logic/solicitudServicio";

// Desglose del costo, compartido entre la configuración y el resumen.
//
// Dos conceptos SEPARADOS para que la cuenta nunca parezca un error: el
// costo estimado del servicio (base por cantidad más adicionales con
// precio real, como la desinstalación) cierra con su propio monto
// destacado; la visita de evaluación va aparte, con su explicación, porque
// no se suma: se paga antes y se descuenta de la cotización si se acepta.
export function DesgloseCosto({
  servicio,
  cantidad,
  condiciones,
  incluyeDesinstalacion,
  precioDesinstalacion,
}: {
  servicio: ServicioCatalogo;
  cantidad: number;
  condiciones?: "estandar" | "inspeccion";
  incluyeDesinstalacion?: boolean;
  precioDesinstalacion?: number;
}) {
  const meta = { fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif" } as const;

  const base = totalEstimado(servicio.precioDesde, cantidad);
  const total = totalConAdicionales(
    servicio.precioDesde,
    cantidad,
    incluyeDesinstalacion ? precioDesinstalacion : undefined,
  );
  const conInspeccion = condiciones === "inspeccion";
  const conAdicional = Boolean(incluyeDesinstalacion);
  const abierto =
    conInspeccion ||
    servicio.requiereInspeccion ||
    servicio.inspeccionObligatoria ||
    servicio.precioCotizable;

  const fila = (etiqueta: string, valor: string) => (
    <div className="flex items-baseline justify-between gap-3" style={{ marginTop: "6px" }}>
      <span style={{ ...meta, fontSize: "14px", lineHeight: "20px", color: "var(--gray-80)" }}>
        {etiqueta}
      </span>
      <span
        className="flex-shrink-0"
        style={{ ...meta, fontSize: "14px", fontWeight: "var(--font-weight-medium)", color: "var(--primary-black)" }}
      >
        {valor}
      </span>
    </div>
  );

  return (
    <div>
      {/* ── Costo estimado del servicio ── */}
      {(cantidad > 1 || conAdicional) &&
        fila(
          cantidad > 1 && servicio.precioDesde !== undefined
            ? `${servicio.nombre} ($${formatearMonto(servicio.precioDesde)} × ${cantidad})`
            : servicio.nombre,
          `$${formatearMonto(base ?? PRECIO_BASE_REFERENCIAL_USD)}`,
        )}
      {conAdicional &&
        fila(
          STR.agendar.desgloseDesinstalacion,
          `$${precioDesinstalacion ?? PRECIO_BASE_REFERENCIAL_USD}`,
        )}
      <div
        className="flex items-baseline justify-between gap-3"
        style={
          cantidad > 1 || conAdicional
            ? { marginTop: "10px", paddingTop: "10px", borderTop: "1px solid var(--gray-8)" }
            : { marginTop: "6px" }
        }
      >
        <span style={{ ...meta, fontSize: "14px", color: "var(--gray-80)" }}>
          {STR.agendar.costoEstimadoServicio}
        </span>
        <span style={{ ...meta, fontSize: "20px", fontWeight: "var(--font-weight-bold, 700)", color: "var(--primary-black)" }}>
          ${formatearMonto(total ?? PRECIO_BASE_REFERENCIAL_USD)}
        </span>
      </div>
      {abierto && (
        <p style={{ ...meta, fontSize: "13px", lineHeight: "19px", color: "var(--gray-60)", margin: "6px 0 0" }}>
          {STR.agendar.desgloseNotaInsumos}
        </p>
      )}
      <p style={{ ...meta, fontSize: "12px", lineHeight: "18px", color: "var(--gray-60)", margin: "4px 0 0" }}>
        {STR.agendar.itbms}
      </p>

      {/* ── Visita de evaluación: concepto aparte, nunca sumado ── */}
      {conInspeccion && (
        <div style={{ marginTop: "14px", paddingTop: "14px", borderTop: "1px solid var(--gray-8)" }}>
          <div className="flex items-baseline justify-between gap-3">
            <span style={{ ...meta, fontSize: "14px", fontWeight: "var(--font-weight-medium)", color: "var(--primary-black)" }}>
              {STR.agendar.desgloseInspeccion}
            </span>
            <span
              className="flex-shrink-0"
              style={{ ...meta, fontSize: "14px", fontWeight: "var(--font-weight-medium)", color: "var(--primary-black)" }}
            >
              {/* El costo definido para este servicio; sin monto por SKU,
                  aplica el general. */}
              ${servicio.costoEvaluacion ?? PRECIO_INSPECCION_USD}
            </span>
          </div>
          <p style={{ ...meta, fontSize: "13px", lineHeight: "19px", color: "var(--gray-60)", margin: "4px 0 0" }}>
            {STR.agendar.desgloseInspeccionNota}
          </p>
        </div>
      )}
    </div>
  );
}
