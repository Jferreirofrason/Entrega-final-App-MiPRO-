import { useEffect, useState } from "react";
import { STR } from "../../i18n/strings";

/** Cuánto dura la pantalla verde antes de pasar al comprobante. */
export const DURACION_EXITO_MS = 1700;

// La transición de éxito del pago: verde a pantalla completa con el check.
//
// Aparece SOLO cuando el pago está aprobado y la reserva confirmada. No se
// dispara porque terminó un temporizador ni porque alguien volvió de Yappy
// o de CMF: eso lo decide quien la monta.
//
// Corre una sola vez por operación: el comprobante recuerda cuál ya mostró
// (ver `exitoYaVisto` en data/solicitudes.ts), así que volver no la repite.
//
// El círculo aparece, el check se traza y el texto entra detrás, con las
// animaciones de styles/index.css. Con movimiento reducido no se mueve
// nada: se ve el check dibujado y el texto, quietos, el mismo rato.
export function TransicionExito({ onTerminar }: { onTerminar: () => void }) {
  const [saliendo, setSaliendo] = useState(false);

  useEffect(() => {
    const irse = window.setTimeout(() => setSaliendo(true), DURACION_EXITO_MS - 280);
    const listo = window.setTimeout(onTerminar, DURACION_EXITO_MS);
    return () => {
      window.clearTimeout(irse);
      window.clearTimeout(listo);
    };
  }, [onTerminar]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center px-8${
        saliendo ? " mipro-exito-saliendo" : ""
      }`}
      style={{ backgroundColor: "var(--success-green)" }}
      role="status"
      aria-live="polite"
    >
      <span className="mipro-exito-circulo flex items-center justify-center">
        <svg width="108" height="108" viewBox="0 0 108 108" aria-hidden="true">
          <circle cx="54" cy="54" r="52" fill="rgba(255, 255, 255, 0.16)" />
          <circle cx="54" cy="54" r="40" fill="rgba(255, 255, 255, 0.22)" />
          <path
            className="mipro-exito-trazo"
            d="M36 55 L49 68 L73 42"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="48"
          />
        </svg>
      </span>

      <p
        className="mipro-exito-texto"
        style={{
          fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif",
          fontSize: "22px",
          lineHeight: "28px",
          fontWeight: "var(--font-weight-semibold)",
          color: "var(--primary-white)",
          margin: "24px 0 0",
          textAlign: "center",
        }}
      >
        {STR.pago.exitoTitulo}
      </p>
    </div>
  );
}
