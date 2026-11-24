import { useEffect } from "react";
import { X } from "lucide-react";
import { STR } from "../../i18n/strings";

const meta = { fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif" } as const;

// Confirmación para vaciar la bandeja.
//
// Una notificación suelta se borra de un toque porque se puede deshacer.
// Borrarlas todas no se puede deshacer, así que acá sí hay confirmación, y
// el texto dice exactamente qué pasa: no es un "¿estás seguro?".
//
// Misma anatomía que el resto de las confirmaciones de la app (el agarre,
// la pregunta como encabezado, el pie con la acción destructiva a la
// derecha). Se cierra con Cancelar, con la X o tocando afuera.
export function ModalBorrarNotificaciones({
  abierto,
  onCerrar,
  onBorrar,
}: {
  abierto: boolean;
  onCerrar: () => void;
  onBorrar: () => void;
}) {
  useEffect(() => {
    if (!abierto) return;
    const alSoltar = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCerrar();
    };
    window.addEventListener("keydown", alSoltar);
    return () => window.removeEventListener("keydown", alSoltar);
  }, [abierto, onCerrar]);

  if (!abierto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div
        className="absolute inset-0"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.45)" }}
        onClick={onCerrar}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-borrar-notificaciones"
        className="relative z-10 w-full max-w-lg bg-white rounded-t-[24px] flex flex-col max-h-[90dvh]"
        style={{ boxShadow: "0 -8px 30px rgba(0, 0, 0, 0.15)" }}
      >
        <div className="flex justify-center py-2 shrink-0">
          <div className="w-12 h-1.5 rounded-full" style={{ backgroundColor: "var(--gray-20)" }} />
        </div>

        <div
          className="px-6 pb-1 pt-1 flex items-start justify-between shrink-0"
          style={{ gap: "12px" }}
        >
          <h3
            id="titulo-borrar-notificaciones"
            style={{
              ...meta,
              fontSize: "17px",
              lineHeight: "23px",
              fontWeight: "var(--font-weight-semibold)",
              color: "var(--primary-black)",
              margin: "6px 0 0",
            }}
          >
            {STR.notificaciones.borrarTodasTitulo}
          </h3>
          <button
            type="button"
            onClick={onCerrar}
            aria-label={STR.notificaciones.borrarTodasCancelar}
            className="flex shrink-0 items-center justify-center rounded-full border-none bg-transparent"
            style={{ width: "36px", height: "36px", cursor: "pointer" }}
          >
            <X size={18} color="var(--gray-60)" aria-hidden="true" />
          </button>
        </div>

        <div className="px-6 pb-5 pt-1">
          <p style={{ ...meta, fontSize: "13px", lineHeight: "19px", color: "var(--gray-80)", margin: 0 }}>
            {STR.notificaciones.borrarTodasTexto}
          </p>
        </div>

        <div
          className="p-4 flex items-center justify-end shrink-0"
          style={{
            gap: "10px",
            borderTop: "1px solid var(--gray-8)",
            backgroundColor: "var(--gray-3)",
          }}
        >
          <button
            type="button"
            onClick={onCerrar}
            style={{
              ...meta,
              fontSize: "13px",
              fontWeight: "var(--font-weight-medium)",
              color: "var(--primary-black)",
              backgroundColor: "var(--primary-white)",
              border: "1px solid var(--gray-20)",
              borderRadius: "10px",
              padding: "12px 18px",
              minHeight: "44px",
              cursor: "pointer",
            }}
          >
            {STR.notificaciones.borrarTodasCancelar}
          </button>
          <button
            type="button"
            onClick={onBorrar}
            style={{
              ...meta,
              fontSize: "13px",
              fontWeight: "var(--font-weight-medium)",
              color: "var(--primary-white)",
              backgroundColor: "var(--error-red)",
              border: "none",
              borderRadius: "10px",
              padding: "12px 18px",
              minHeight: "44px",
              cursor: "pointer",
            }}
          >
            {STR.notificaciones.borrarTodasConfirmar}
          </button>
        </div>
      </div>
    </div>
  );
}
