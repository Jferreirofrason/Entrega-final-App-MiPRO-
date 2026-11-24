import { ReactNode } from "react";
import { X } from "lucide-react";

// Sheet de ayuda contextual (mismo patrón visual que LegalSheet.tsx):
// explica en pocas líneas dónde encontrar un dato, con un espacio
// preparado para el asset oficial (foto de la etiqueta o de la factura)
// cuando negocio lo entregue. No genera contenido gráfico nuevo.
export function AyudaSheet({
  abierto,
  onCerrar,
  titulo,
  children,
  imagen,
}: {
  abierto: boolean;
  onCerrar: () => void;
  titulo: string;
  children: ReactNode;
  /** Diagrama o imagen de referencia (ej. DiagramaRecibo). Sin imagen, la
   * ayuda es solo texto: NO se muestra ningún recuadro de "pendiente". La
   * app no le cuenta al cliente qué contenido le falta al negocio. */
  imagen?: ReactNode;
}) {
  if (!abierto) return null;

  const meta = { fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif" } as const;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCerrar} />
      <div
        className="relative z-10 w-full max-w-lg bg-white rounded-t-[24px] flex flex-col max-h-[80vh]"
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
            onClick={onCerrar}
            aria-label="Cerrar"
            className="flex items-center justify-center rounded-full border-none bg-transparent"
            style={{ width: "36px", height: "36px", cursor: "pointer" }}
          >
            <X size={18} color="var(--gray-60)" aria-hidden="true" />
          </button>
        </div>
        <div className="px-6 py-5 overflow-y-auto flex-1">
          {imagen && (
            <div
              className="flex items-center justify-center mb-4"
              style={{
                padding: "16px",
                borderRadius: "10px",
                backgroundColor: "var(--gray-3)",
              }}
            >
              {imagen}
            </div>
          )}
          <div style={{ ...meta, fontSize: "13px", lineHeight: "19px", color: "var(--gray-80)" }}>
            {children}
          </div>
        </div>
        <div className="p-4 flex justify-end shrink-0" style={{ borderTop: "1px solid var(--gray-8)", backgroundColor: "var(--gray-3)" }}>
          <button
            onClick={onCerrar}
            style={{
              ...meta,
              fontSize: "13px",
              fontWeight: "var(--font-weight-medium)",
              color: "var(--primary-black)",
              backgroundColor: "var(--primary-yellow)",
              borderRadius: "10px",
              border: "none",
              padding: "10px 20px",
              cursor: "pointer",
            }}
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}
