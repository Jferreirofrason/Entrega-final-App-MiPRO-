import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, X } from "lucide-react";
import { STR } from "../i18n/strings";
import {
  confirmacionValida,
  PALABRA_DE_CONFIRMACION,
  sePuedeEliminar,
  type PendientesDeLaCuenta,
} from "../logic/cuenta";
import { solicitudesDeLaSesion } from "../data/solicitudes";

// Dar de baja la cuenta.
//
// Dos pasos a propósito: la pantalla explica qué se pierde, y recién
// después un modal pide escribir ELIMINAR. Una acción que no se puede
// deshacer no se dispara con un toque.
//
// Con algo abierto (una solicitud, una garantía, un reclamo o un pago en
// curso) no se ofrece la baja: la salida es soporte, porque del otro lado
// hay alguien trabajando. Esa regla vive en logic/cuenta.ts, probada.
//
// ⚠️ LA BAJA ES SIMULADA: no se borra nada. Al confirmar se cierra la
// sesión y se vuelve al ingreso, y el texto no afirma que los datos se
// hayan eliminado. Lo que falta definir está en PENDIENTE_DE_LA_BAJA.
export function EliminarCuenta() {
  const navigate = useNavigate();
  const [confirmando, setConfirmando] = useState(false);
  const [escrito, setEscrito] = useState("");
  const [eliminando, setEliminando] = useState(false);
  const [listo, setListo] = useState(false);

  const meta = { fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif" } as const;

  // Lo abierto se mira en los datos de la sesión. Con integración, esto lo
  // informa el backend junto con la baja.
  const pendientes: PendientesDeLaCuenta = {
    servicios: solicitudesDeLaSesion().length,
    garantias: 0,
    reclamos: 0,
    pagosEnCurso: 0,
  };
  const sePuede = sePuedeEliminar(pendientes);
  const habilitado = confirmacionValida(escrito);

  const confirmarBaja = () => {
    setEliminando(true);
    // La espera simula el pedido de baja. Con integración, acá va su
    // llamada y el manejo de su respuesta.
    window.setTimeout(() => {
      setEliminando(false);
      setConfirmando(false);
      setListo(true);
    }, 1200);
  };

  const botonPrincipal = (texto: string, onAccion: () => void, destructivo = false) => (
    <button
      type="button"
      onClick={onAccion}
      className="w-full border-none"
      style={{
        ...meta,
        height: "48px",
        borderRadius: "12px",
        backgroundColor: destructivo ? "var(--error-red)" : "var(--primary-yellow)",
        fontSize: "15px",
        fontWeight: "var(--font-weight-medium)",
        color: destructivo ? "var(--primary-white)" : "var(--primary-black)",
        cursor: "pointer",
      }}
    >
      {texto}
    </button>
  );

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
            {STR.baja.titulo}
          </h1>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-6 pt-5 pb-8">
        {/* Hecho el pedido: la sesión se cierra y se vuelve al ingreso. No
            se dice que los datos se borraron, porque no se borraron. */}
        {listo ? (
          <div className="flex flex-col" style={{ gap: "10px" }}>
            <h2
              style={{
                fontFamily: "'Bebas Neue', Arial, sans-serif",
                fontSize: "22px",
                letterSpacing: "1px",
                textTransform: "uppercase",
                color: "var(--primary-black)",
                margin: 0,
              }}
            >
              {STR.baja.listoTitulo}
            </h2>
            <p style={{ ...meta, fontSize: "14px", lineHeight: "21px", color: "var(--gray-60)", margin: 0 }}>
              {STR.baja.listoTexto}
            </p>
            <p style={{ ...meta, fontSize: "12px", lineHeight: "17px", color: "var(--gray-60)", margin: 0 }}>
              {STR.baja.simulado}
            </p>
            <div style={{ marginTop: "10px" }}>
              {botonPrincipal(STR.baja.listoAccion, () => navigate("/welcome"))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col" style={{ gap: "12px" }}>
            <p style={{ ...meta, fontSize: "14px", lineHeight: "21px", color: "var(--primary-black)", margin: 0 }}>
              {STR.baja.explicacion}
            </p>

            {/* Con cosas abiertas, no hay botón de baja: hay un camino. */}
            {!sePuede && (
              <div
                className="flex flex-col"
                style={{
                  gap: "10px",
                  padding: "16px",
                  borderRadius: "16px",
                  backgroundColor: "var(--gray-3)",
                }}
              >
                <p
                  style={{ ...meta, fontSize: "14px", lineHeight: "20px", color: "var(--primary-black)", margin: 0 }}
                >
                  {STR.baja.conPendientes}
                </p>
                <button
                  type="button"
                  onClick={() => navigate("/soporte")}
                  className="self-start border-none bg-transparent px-0"
                  style={{
                    ...meta,
                    fontSize: "14px",
                    fontWeight: "var(--font-weight-medium)",
                    color: "var(--info-blue)",
                    minHeight: "44px",
                    cursor: "pointer",
                  }}
                >
                  {STR.baja.contactar}
                </button>
              </div>
            )}

            {sePuede && (
              <div style={{ marginTop: "4px" }}>
                {botonPrincipal(STR.baja.continuar, () => setConfirmando(true), true)}
              </div>
            )}

            <p style={{ ...meta, fontSize: "12px", lineHeight: "17px", color: "var(--gray-60)", margin: 0 }}>
              {STR.baja.simulado}
            </p>
          </div>
        )}
      </div>

      {/* La confirmación final, con la palabra escrita a mano. */}
      {confirmando && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div
            className="absolute inset-0"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.45)" }}
            onClick={() => !eliminando && setConfirmando(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label={STR.baja.confirmarTitulo}
            className="relative z-10 w-full max-w-lg bg-white rounded-t-[24px]"
            style={{ padding: "20px 24px 28px", boxShadow: "0 -8px 30px rgba(0, 0, 0, 0.15)" }}
          >
            <button
              type="button"
              aria-label={STR.baja.cancelar}
              onClick={() => !eliminando && setConfirmando(false)}
              className="absolute flex items-center justify-center border-none"
              style={{
                top: "16px",
                right: "16px",
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                backgroundColor: "var(--gray-8)",
                cursor: eliminando ? "default" : "pointer",
              }}
            >
              <X size={16} strokeWidth={2} color="var(--primary-black)" aria-hidden="true" />
            </button>

            <h2
              style={{
                fontFamily: "'Bebas Neue', Arial, sans-serif",
                fontSize: "22px",
                letterSpacing: "1px",
                textTransform: "uppercase",
                color: "var(--primary-black)",
                margin: "0 40px 8px 0",
              }}
            >
              {STR.baja.confirmarTitulo}
            </h2>
            <p style={{ ...meta, fontSize: "14px", lineHeight: "20px", color: "var(--gray-60)", margin: "0 0 16px" }}>
              {STR.baja.confirmarTexto}
            </p>

            <label
              className="block"
              style={{ ...meta, fontSize: "13px", lineHeight: "18px", color: "var(--primary-black)" }}
            >
              {STR.baja.confirmarEtiqueta}
              <input
                type="text"
                value={escrito}
                onChange={(e) => setEscrito(e.target.value)}
                disabled={eliminando}
                autoComplete="off"
                autoCapitalize="characters"
                placeholder={PALABRA_DE_CONFIRMACION}
                className="w-full"
                style={{
                  ...meta,
                  marginTop: "6px",
                  height: "48px",
                  padding: "0 14px",
                  borderRadius: "12px",
                  border: "1px solid var(--gray-20)",
                  backgroundColor: "var(--primary-white)",
                  fontSize: "15px",
                  letterSpacing: "1px",
                  color: "var(--primary-black)",
                }}
              />
            </label>

            <div className="flex flex-col" style={{ gap: "8px", marginTop: "18px" }}>
              <button
                type="button"
                onClick={() => !eliminando && setConfirmando(false)}
                className="w-full"
                style={{
                  ...meta,
                  height: "48px",
                  borderRadius: "12px",
                  backgroundColor: "var(--primary-white)",
                  border: "1px solid var(--gray-20)",
                  fontSize: "15px",
                  fontWeight: "var(--font-weight-medium)",
                  color: "var(--primary-black)",
                  cursor: eliminando ? "default" : "pointer",
                }}
              >
                {STR.baja.cancelar}
              </button>
              {/* Solo se habilita con la palabra exacta. */}
              <button
                type="button"
                disabled={!habilitado || eliminando}
                onClick={confirmarBaja}
                className="w-full border-none"
                style={{
                  ...meta,
                  height: "48px",
                  borderRadius: "12px",
                  backgroundColor: habilitado ? "var(--error-red)" : "var(--gray-8)",
                  fontSize: "15px",
                  fontWeight: "var(--font-weight-medium)",
                  color: habilitado ? "var(--primary-white)" : "var(--gray-60)",
                  cursor: habilitado && !eliminando ? "pointer" : "default",
                }}
              >
                {eliminando ? STR.baja.eliminando : STR.baja.confirmarAccion}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
