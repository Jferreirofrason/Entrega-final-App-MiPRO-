import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { STR } from "../i18n/strings";
import { DEMORA_HISTORIAL_MS, pagosDelHistorial } from "../data/historialPagos";
import {
  agruparPorMes,
  type EstadoPagoHistorial,
  type GrupoDePagos,
} from "../logic/historialPagos";
import { formatearFecha } from "../logic/fechas";

/** El nombre visible y el color de cada estado. El mismo en las dos pantallas. */
export const ESTADOS_DEL_PAGO: Record<
  EstadoPagoHistorial,
  { texto: string; color: string }
> = {
  aprobado: { texto: STR.historial.estadoAprobado, color: "var(--success-green)" },
  pendiente: { texto: STR.historial.estadoPendiente, color: "var(--gray-60)" },
  reembolsado: { texto: STR.historial.estadoReembolsado, color: "var(--info-blue)" },
  cancelado: { texto: STR.historial.estadoCancelado, color: "var(--error-red)" },
};

// El historial de pagos, desde Perfil.
//
// Lista agrupada por mes, con una fila por pago: el servicio, cuándo se
// pagó, su reserva, el monto a la derecha y el estado. No hay una tarjeta
// grande por transacción: son datos para comparar de un vistazo.
//
// ⚠️ Los tres pagos más viejos son de demostración (data/historialPagos.ts).
// A ellos se suman los pagos hechos en la sesión, que aparecen primero.
export function HistorialPagos() {
  const navigate = useNavigate();
  const [cargando, setCargando] = useState(true);
  const [grupos, setGrupos] = useState<GrupoDePagos[]>([]);

  const meta = { fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif" } as const;

  // Con integración, acá va la llamada al endpoint del historial.
  useEffect(() => {
    const id = window.setTimeout(() => {
      setGrupos(agruparPorMes(pagosDelHistorial()));
      setCargando(false);
    }, DEMORA_HISTORIAL_MS);
    return () => window.clearTimeout(id);
  }, []);

  const formatearMonto = (valor: number) => `$${valor.toFixed(2)}`;

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: "var(--primary-white)" }}>
      <header
        className="flex items-center gap-3 px-6 pt-[20px] pb-4 bg-white sticky top-0 z-20"
        style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}
      >
        <button
          aria-label={STR.metodosPago.volver}
          onClick={() => navigate("/perfil")}
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
            {STR.historial.titulo}
          </h1>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-6 pt-5 pb-8">
        {cargando && (
          <p style={{ ...meta, fontSize: "14px", lineHeight: "20px", color: "var(--gray-60)", margin: 0 }}>
            {STR.historial.cargando}
          </p>
        )}

        {!cargando && grupos.length === 0 && (
          <div
            className="flex flex-col"
            style={{
              gap: "6px",
              padding: "20px 18px",
              borderRadius: "16px",
              backgroundColor: "var(--gray-3)",
            }}
          >
            <p
              style={{
                ...meta,
                fontSize: "15px",
                lineHeight: "21px",
                fontWeight: "var(--font-weight-medium)",
                color: "var(--primary-black)",
                margin: 0,
              }}
            >
              {STR.historial.vacioTitulo}
            </p>
            <p style={{ ...meta, fontSize: "14px", lineHeight: "20px", color: "var(--gray-60)", margin: 0 }}>
              {STR.historial.vacioTexto}
            </p>
          </div>
        )}

        {!cargando &&
          grupos.map((grupo) => (
            <section key={grupo.clave} style={{ marginBottom: "20px" }}>
              <h2
                style={{
                  fontFamily: "'Bebas Neue', Arial, sans-serif",
                  fontSize: "18px",
                  fontWeight: "var(--font-weight-normal)",
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                  color: "var(--primary-black)",
                  margin: "0 0 8px",
                }}
              >
                {grupo.titulo}
              </h2>
              <div
                className="overflow-hidden"
                style={{ borderRadius: "16px", border: "1px solid var(--gray-8)" }}
              >
                {grupo.pagos.map((pago, i) => {
                  const estado = ESTADOS_DEL_PAGO[pago.estado];
                  return (
                    <button
                      key={pago.id}
                      type="button"
                      onClick={() => navigate(`/perfil/historial-pagos/${pago.id}`)}
                      aria-label={STR.historial.verDetalle(pago.servicio)}
                      className="w-full flex items-center text-left"
                      style={{
                        gap: "12px",
                        minHeight: "56px",
                        padding: "12px 14px",
                        borderTop: i === 0 ? "none" : "1px solid var(--gray-8)",
                        backgroundColor: "transparent",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      <span className="min-w-0 flex-1">
                        <span
                          className="block"
                          style={{
                            ...meta,
                            fontSize: "15px",
                            lineHeight: "20px",
                            fontWeight: "var(--font-weight-medium)",
                            color: "var(--primary-black)",
                          }}
                        >
                          {pago.servicio}
                        </span>
                        <span
                          className="block"
                          style={{ ...meta, fontSize: "13px", lineHeight: "18px", color: "var(--gray-60)" }}
                        >
                          {formatearFecha(pago.pagadoEl)}
                        </span>
                        <span
                          className="block"
                          style={{ ...meta, fontSize: "13px", lineHeight: "18px", color: "var(--gray-60)" }}
                        >
                          {STR.historial.reserva(pago.numeroReserva)}
                        </span>
                      </span>

                      {/* El monto a la derecha, con su estado debajo: así
                          la columna de importes se lee en vertical. */}
                      <span className="flex shrink-0 flex-col items-end" style={{ gap: "2px" }}>
                        <span
                          style={{
                            ...meta,
                            fontSize: "15px",
                            lineHeight: "20px",
                            fontWeight: "var(--font-weight-medium)",
                            color: "var(--primary-black)",
                          }}
                        >
                          {formatearMonto(pago.monto)}
                        </span>
                        <span
                          style={{
                            ...meta,
                            fontSize: "12px",
                            lineHeight: "17px",
                            fontWeight: "var(--font-weight-medium)",
                            color: estado.color,
                          }}
                        >
                          {estado.texto}
                        </span>
                      </span>

                      <ChevronRight
                        size={18}
                        strokeWidth={2}
                        color="var(--gray-40)"
                        aria-hidden="true"
                        style={{ flexShrink: 0 }}
                      />
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
      </div>
    </div>
  );
}
