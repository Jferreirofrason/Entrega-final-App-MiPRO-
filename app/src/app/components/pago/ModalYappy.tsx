import { useEffect } from "react";
import { Timer, X } from "lucide-react";
import { STR } from "../../i18n/strings";
import yappyLogoUrl from "../../../imports/yappy-logo.png";
import { formatearCuenta, type EstadoYappy } from "../../logic/yappy";

// La solicitud de pago por Yappy, mientras se espera la autorización.
//
// ⚠️ SIMULADA. No hay integración: el modal no puede saber si alguien
// autorizó, así que la aprobación y el rechazo llegan por los dos controles
// de demostración del pie, que se van cuando exista la integración.
//
// La regla que manda: el pago NO se da por aprobado porque se terminó la
// cuenta regresiva ni porque la persona volvió de la app del banco. Solo
// con la aprobación.
//
// Cerrar NO cancela nada: la solicitud sigue viva y la pantalla deja a mano
// cómo volver a consultarla.
export function ModalYappy({
  estado,
  segundos,
  onCerrar,
  onReintentar,
  onOtroMetodo,
  onDemoAprobar,
  onDemoRechazar,
}: {
  estado: EstadoYappy;
  /** Segundos que quedan de la ventana de autorización. */
  segundos: number;
  onCerrar: () => void;
  onReintentar: () => void;
  onOtroMetodo: () => void;
  onDemoAprobar: () => void;
  onDemoRechazar: () => void;
}) {
  const abierto = estado === "esperando" || estado === "vencida" || estado === "rechazada";

  useEffect(() => {
    if (!abierto) return;
    const alSoltar = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCerrar();
    };
    window.addEventListener("keydown", alSoltar);
    return () => window.removeEventListener("keydown", alSoltar);
  }, [abierto, onCerrar]);

  if (!abierto) return null;

  const meta = { fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif" } as const;
  const esperando = estado === "esperando";

  const titulo = esperando
    ? STR.pago.yappyTitulo
    : estado === "vencida"
      ? STR.pago.yappyVencida
      : STR.pago.yappyRechazada;

  const ayuda = esperando
    ? STR.pago.yappyInstruccion
    : estado === "vencida"
      ? STR.pago.yappyVencidaAyuda
      : STR.pago.yappyRechazadaAyuda;

  const boton = (texto: string, principal: boolean, onAccion: () => void) => (
    <button
      type="button"
      onClick={onAccion}
      className="w-full border-none"
      style={{
        ...meta,
        height: "48px",
        borderRadius: "12px",
        backgroundColor: principal ? "var(--primary-yellow)" : "var(--primary-white)",
        border: principal ? "none" : "1px solid var(--gray-20)",
        fontSize: "15px",
        fontWeight: "var(--font-weight-medium)",
        color: "var(--primary-black)",
        cursor: "pointer",
      }}
    >
      {texto}
    </button>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.55)" }}
        onClick={onCerrar}
      />
      {/* Tarjeta centrada, no hoja: es el popup que aparece sobre la
          pantalla mientras se espera la autorización. */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-yappy"
        className="relative z-10 w-full flex flex-col max-h-[88dvh]"
        style={{
          maxWidth: "340px",
          backgroundColor: "var(--primary-white)",
          borderRadius: "20px",
          boxShadow: "0 12px 40px rgba(0, 0, 0, 0.22)",
        }}
      >
        {/* Cerrar no cancela la solicitud. */}
        <div className="flex items-center justify-end shrink-0" style={{ padding: "8px 8px 0" }}>
          <button
            type="button"
            onClick={onCerrar}
            aria-label={STR.pago.cerrar}
            className="flex items-center justify-center rounded-full border-none bg-transparent"
            style={{ width: "34px", height: "34px", cursor: "pointer" }}
          >
            <X size={18} color="var(--gray-60)" aria-hidden="true" />
          </button>
        </div>

        <div
          className="overflow-y-auto flex flex-col items-center text-center"
          style={{ padding: "0 24px 24px" }}
        >
          <img
            src={yappyLogoUrl}
            alt="Yappy"
            style={{ width: "92px", height: "auto", display: "block" }}
          />

          <h3
            id="titulo-yappy"
            style={{
              ...meta,
              fontSize: "18px",
              lineHeight: "24px",
              fontWeight: "var(--font-weight-semibold)",
              color: "var(--primary-black)",
              margin: "16px 0 0",
            }}
          >
            {titulo}
          </h3>

          <p
            style={{
              ...meta,
              fontSize: "14px",
              lineHeight: "20px",
              color: "var(--gray-80)",
              margin: "8px 0 0",
            }}
          >
            {ayuda}
          </p>

          {esperando && (
            <>
              <div
                className="flex items-center justify-center"
                style={{ gap: "8px", marginTop: "22px" }}
              >
                <Timer size={22} strokeWidth={2.2} color="var(--success-green)" aria-hidden="true" />
                <span
                  aria-live="off"
                  style={{
                    ...meta,
                    fontSize: "32px",
                    lineHeight: "1",
                    fontWeight: 700,
                    letterSpacing: "0.5px",
                    color: "var(--success-green)",
                  }}
                >
                  {formatearCuenta(segundos)}
                </span>
              </div>
              <p
                style={{ ...meta, fontSize: "13px", lineHeight: "19px", color: "var(--gray-60)", margin: "8px 0 0" }}
              >
                {STR.pago.yappyAyuda}
              </p>
              <p
                role="status"
                style={{
                  ...meta,
                  fontSize: "14px",
                  lineHeight: "20px",
                  fontWeight: "var(--font-weight-medium)",
                  color: "var(--primary-black)",
                  margin: "16px 0 0",
                }}
              >
                {STR.pago.yappyEsperando}
              </p>
            </>
          )}

          {!esperando && (
            <div className="w-full flex flex-col" style={{ gap: "10px", marginTop: "22px" }}>
              {estado === "vencida" && boton(STR.pago.yappyReintentar, true, onReintentar)}
              {boton(STR.pago.yappyOtroMetodo, estado === "rechazada", onOtroMetodo)}
            </div>
          )}

          <p
            style={{ ...meta, fontSize: "12px", lineHeight: "17px", color: "var(--gray-60)", margin: "18px 0 0" }}
          >
            {STR.pago.yappySimulado}
          </p>

          {/* ⚠️ Solo demostración: sin integración, la aprobación y el
              rechazo no pueden llegar de ningún lado. Se van con ella.

              Van como botones y no como un enlace al pie: son la ÚNICA
              forma de terminar un pago con Yappy mientras no haya
              integración, así que tienen que poder usarse. El rótulo dice
              qué son, y arriba ya está dicho que la operación es simulada. */}
          {esperando && (
            <div className="w-full" style={{ marginTop: "16px" }}>
              <p
                style={{
                  ...meta,
                  fontSize: "12px",
                  lineHeight: "17px",
                  color: "var(--gray-60)",
                  margin: "0 0 8px",
                }}
              >
                {STR.pago.yappyDemo}
              </p>
              <div className="flex flex-col" style={{ gap: "8px" }}>
                {boton(STR.pago.yappyDemoAprobar, true, onDemoAprobar)}
                {boton(STR.pago.yappyDemoRechazar, false, onDemoRechazar)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
