import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { STR } from "../../i18n/strings";
import { Campo, estiloInput } from "../garantia/Campo";
import type { EstadoCupon } from "../../logic/beneficios";

// Alta de un cupón, en un popup sobre el checkout.
//
// ⚠️ La validación es de DEMOSTRACIÓN (ver data/beneficios.ts): compara
// contra una lista de códigos de prueba. No hay porcentajes, vigencias ni
// acumulación, y el popup lo dice.
export function ModalCupon({
  abierto,
  estado,
  onCerrar,
  onAplicar,
}: {
  abierto: boolean;
  estado: EstadoCupon;
  onCerrar: () => void;
  onAplicar: (codigo: string) => void;
}) {
  const [codigo, setCodigo] = useState("");
  const campo = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!abierto) return;
    setCodigo("");
    campo.current?.focus();
  }, [abierto]);

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
  const validando = estado === "validando";

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
        aria-labelledby="titulo-cupon"
        className="relative z-10 w-full max-w-lg bg-white rounded-t-[24px] flex flex-col max-h-[90dvh]"
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
            id="titulo-cupon"
            style={{
              fontFamily: "'Bebas Neue', Arial, sans-serif",
              fontSize: "20px",
              letterSpacing: "1px",
              textTransform: "uppercase",
              color: "var(--primary-black)",
              margin: 0,
            }}
          >
            {STR.pago.cuponTitulo}
          </h3>
          <button
            type="button"
            onClick={onCerrar}
            aria-label={STR.pago.cerrar}
            className="flex items-center justify-center rounded-full border-none bg-transparent"
            style={{ width: "36px", height: "36px", cursor: "pointer" }}
          >
            <X size={18} color="var(--gray-60)" aria-hidden="true" />
          </button>
        </div>

        <div className="px-6 py-5 overflow-y-auto flex flex-col" style={{ gap: "12px" }}>
          <Campo
            id="cupon-codigo"
            etiqueta={STR.pago.cuponCodigo}
            obligatorio
            error={estado === "invalido" ? STR.pago.cuponInvalido : null}
          >
            <input
              ref={campo}
              id="cupon-codigo"
              type="text"
              autoComplete="off"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              disabled={validando}
              placeholder="MIPRO0000"
              style={{ ...estiloInput(estado === "invalido"), textTransform: "uppercase" }}
            />
          </Campo>

          {validando && (
            <p style={{ ...meta, fontSize: "12px", lineHeight: "17px", color: "var(--gray-60)", margin: 0 }}>
              {STR.pago.cuponValidando}
            </p>
          )}
          <p style={{ ...meta, fontSize: "12px", lineHeight: "17px", color: "var(--gray-60)", margin: 0 }}>
            {STR.pago.cuponSimulado}
          </p>
        </div>

        <div
          className="p-4 flex items-center justify-end shrink-0"
          style={{ gap: "10px", borderTop: "1px solid var(--gray-8)", backgroundColor: "var(--gray-3)" }}
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
            {STR.pago.cancelar}
          </button>
          <button
            type="button"
            onClick={() => onAplicar(codigo)}
            disabled={validando || !codigo.trim()}
            style={{
              ...meta,
              fontSize: "13px",
              fontWeight: "var(--font-weight-medium)",
              color: codigo.trim() && !validando ? "var(--primary-black)" : "var(--gray-60)",
              backgroundColor: codigo.trim() && !validando ? "var(--primary-yellow)" : "var(--gray-8)",
              border: "none",
              borderRadius: "10px",
              padding: "12px 20px",
              minHeight: "44px",
              cursor: codigo.trim() && !validando ? "pointer" : "default",
            }}
          >
            {STR.pago.cuponAplicar}
          </button>
        </div>
      </div>
    </div>
  );
}
