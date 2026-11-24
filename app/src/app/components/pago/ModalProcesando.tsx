import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { STR } from "../../i18n/strings";

// Modal bloqueante mientras el pago procesa.
//
// Bloquea de verdad: mientras está abierto se come el botón de atrás del
// navegador y la tecla Escape, y la pantalla de abajo no recibe toques
// porque el overlay los intercepta. El que confirma no puede tocar dos
// veces ni volverse a mitad de camino.
//
// El loader es el ícono de la app girando, no un GIF ni una animación
// decorativa. Con movimiento reducido activo, `styles/index.css` apaga el
// giro en toda la app y queda el ícono quieto con su texto.
export function ModalProcesando({
  abierto,
  texto,
}: {
  abierto: boolean;
  /** El texto cambia según el medio: lo decide logic/pago.ts. */
  texto: string;
}) {
  // Mientras procesa, atrás no sale de la pantalla: se vuelve a empujar el
  // estado. Es la única forma de frenar el gesto de volver del navegador.
  useEffect(() => {
    if (!abierto) return;

    const frenarAtras = () => {
      history.pushState(null, "", location.href);
    };
    history.pushState(null, "", location.href);
    window.addEventListener("popstate", frenarAtras);

    const frenarEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") e.preventDefault();
    };
    window.addEventListener("keydown", frenarEscape);

    return () => {
      window.removeEventListener("popstate", frenarAtras);
      window.removeEventListener("keydown", frenarEscape);
    };
  }, [abierto]);

  if (!abierto) return null;

  const meta = { fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif" } as const;

  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center px-6"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.72)" }}
      // El overlay se queda con todos los toques: nada de abajo responde.
      onClick={(e) => e.stopPropagation()}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-live="assertive"
        aria-label={texto}
        className="w-full flex flex-col items-center"
        style={{
          maxWidth: "320px",
          backgroundColor: "var(--primary-white)",
          borderRadius: "16px",
          padding: "28px 24px",
        }}
      >
        <Loader2
          size={32}
          strokeWidth={2.5}
          color="var(--primary-black)"
          className="animate-spin"
          aria-hidden="true"
        />
        <p
          style={{
            ...meta,
            fontSize: "15px",
            fontWeight: "var(--font-weight-medium)",
            color: "var(--primary-black)",
            margin: "16px 0 0",
            textAlign: "center",
          }}
        >
          {texto}
        </p>
        <p
          style={{
            ...meta,
            fontSize: "13px",
            lineHeight: "19px",
            color: "var(--gray-60)",
            margin: "4px 0 0",
            textAlign: "center",
          }}
        >
          {STR.pago.procesandoEspera}
        </p>
      </div>
    </div>
  );
}
