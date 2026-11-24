import { ReactNode } from "react";
import { X } from "lucide-react";

// Hoja de acciones: el menú de los tres puntos.
//
// Misma estructura que el sheet de la app (grip, título con X, contenido),
// sin pie: un menú no se confirma, se elige una acción o se cierra. Cierra
// con la X y tocando afuera.
export function HojaAcciones({
  abierto,
  onCerrar,
  titulo,
  children,
}: {
  abierto: boolean;
  onCerrar: () => void;
  /** Identifica sobre qué se va a actuar. */
  titulo: string;
  children: ReactNode;
}) {
  if (!abierto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0" style={{ backgroundColor: "rgba(0, 0, 0, 0.45)" }} onClick={onCerrar} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        className="relative z-10 w-full max-w-lg bg-white rounded-t-[24px] flex flex-col max-h-[80dvh]"
        style={{ boxShadow: "0 -8px 30px rgba(0, 0, 0, 0.15)" }}
      >
        <div className="flex justify-center py-2 shrink-0">
          <div className="w-12 h-1.5 rounded-full" style={{ backgroundColor: "var(--gray-20)" }} />
        </div>
        <div
          className="px-6 pb-4 pt-2 flex items-center justify-between shrink-0"
          style={{ borderBottom: "1px solid var(--gray-8)" }}
        >
          <h3
            style={{
              fontFamily: "'Bebas Neue', Arial, sans-serif",
              fontSize: "20px",
              letterSpacing: "1px",
              textTransform: "uppercase",
              color: "var(--primary-black)",
              margin: 0,
            }}
          >
            {titulo}
          </h3>
          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar"
            className="flex items-center justify-center rounded-full border-none bg-transparent"
            style={{ width: "36px", height: "36px", cursor: "pointer" }}
          >
            <X size={18} color="var(--gray-60)" aria-hidden="true" />
          </button>
        </div>
        <div className="overflow-y-auto flex-1" style={{ padding: "6px 0 10px" }}>
          {children}
        </div>
      </div>
    </div>
  );
}

/** Una acción de la hoja: ícono a la izquierda y su texto. */
export function AccionHoja({
  icono,
  texto,
  detalle,
  tono = "normal",
  onAccion,
}: {
  icono: ReactNode;
  texto: string;
  /** Segunda línea, para explicar un estado. */
  detalle?: string;
  tono?: "normal" | "destructivo" | "estado";
  onAccion?: () => void;
}) {
  const meta = { fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif" } as const;
  const color =
    tono === "destructivo"
      ? "var(--error-red)"
      : tono === "estado"
        ? "var(--gray-60)"
        : "var(--primary-black)";

  const cuerpo = (
    <>
      <span className="shrink-0 flex items-center justify-center" style={{ width: "24px" }}>
        {icono}
      </span>
      <span className="min-w-0 flex-1 text-left">
        <span
          className="block"
          style={{ ...meta, fontSize: "15px", lineHeight: "20px", fontWeight: "var(--font-weight-medium)", color }}
        >
          {texto}
        </span>
        {detalle && (
          <span
            className="block"
            style={{ ...meta, fontSize: "13px", lineHeight: "18px", color: "var(--gray-60)" }}
          >
            {detalle}
          </span>
        )}
      </span>
    </>
  );

  const estilo = { minHeight: "52px", padding: "8px 24px", gap: "14px", width: "100%" } as const;

  // Un estado no es un control: no se toca.
  if (!onAccion) {
    return (
      <div className="flex items-center" style={estilo}>
        {cuerpo}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onAccion}
      className="flex items-center border-none bg-transparent"
      style={{ ...estilo, cursor: "pointer" }}
    >
      {cuerpo}
    </button>
  );
}
