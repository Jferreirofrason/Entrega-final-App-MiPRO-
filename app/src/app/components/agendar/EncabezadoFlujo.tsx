import { ArrowLeft } from "lucide-react";
import { Progress } from "../ui/progress";
import { STR } from "../../i18n/strings";
import { ETAPAS, progresoDeEtapa } from "../../logic/solicitudServicio";

// Encabezado compartido de las etapas del agendamiento: volver, nombre del
// servicio y los pasos como círculos numerados 1-4 (mismo lenguaje que el
// flujo de garantía: activo en amarillo, completados en negro, pendientes
// en gris). El botón de volver navega a la etapa anterior; el borrador
// persiste, así que no se pierde nada.
export function EncabezadoFlujo({
  titulo,
  etapa,
  onVolver,
}: {
  titulo: string;
  etapa: 1 | 2 | 3 | 4;
  onVolver: () => void;
}) {
  const meta = { fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif" } as const;
  const progreso = progresoDeEtapa(etapa);

  return (
    <header
      className="px-6 pt-[20px] pb-3 bg-white sticky top-0 z-20"
      style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}
    >
      <div className="flex items-center gap-3">
        <button
          onClick={onVolver}
          aria-label={STR.agendar.volver}
          className="w-11 h-11 rounded-[10px] flex items-center justify-center transition-opacity hover:opacity-80 border flex-shrink-0"
          style={{
            backgroundColor: "var(--primary-white)",
            borderColor: "var(--gray-20)",
            cursor: "pointer",
          }}
        >
          <ArrowLeft size={20} strokeWidth={2} color="var(--primary-black)" aria-hidden="true" />
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
            {titulo}
          </h1>
        </div>
      </div>
      {/* El paso en palabras y una barra fina: sin círculos duplicando */}
      <div
        role="status"
        aria-label={`${progreso.texto}: ${ETAPAS[etapa - 1]}`}
        style={{ marginTop: "12px" }}
      >
        <span className="block truncate" style={{ ...meta, fontSize: "13px", color: "var(--primary-black)" }}>
          <span style={{ fontSize: "14px", fontWeight: "var(--font-weight-medium)" }}>{progreso.texto}</span>
          <span style={{ color: "var(--gray-60)" }}> · {ETAPAS[etapa - 1]}</span>
        </span>
        <div aria-hidden="true" style={{ marginTop: "8px" }}>
          <Progress value={progreso.porcentaje} />
        </div>
      </div>
    </header>
  );
}
