import { useState } from "react";
import { STR } from "../../i18n/strings";
import { LegalSheet } from "../LegalSheet";

// La aceptación de condiciones del checkout.
//
// Es UNA sola y vale para todos los medios: tarjeta, Yappy, Crédito CMF y
// tarjeta de regalo. Arranca desmarcada y sin ella no se confirma el pago.
//
// ⚠️ El enlace abre los Términos y Condiciones que ya tiene la app, los del
// registro. El texto aprobado de las CONDICIONES GENERALES DE VENTA es una
// dependencia pendiente: cuando llegue, se cambia acá y nada más. Se abre
// como hoja sobre la pantalla, así no se pierde nada de lo cargado.
export function BloqueCondiciones({
  aceptadas,
  onCambiar,
  mostrarFalta,
}: {
  aceptadas: boolean;
  onCambiar: (aceptadas: boolean) => void;
  /** true = se intentó confirmar sin aceptar. */
  mostrarFalta: boolean;
}) {
  const [legalAbierto, setLegalAbierto] = useState(false);
  const meta = { fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif" } as const;

  // El texto exacto lleva el enlace adentro, así que se parte en dos por el
  // tramo que es el enlace. Si algún día el texto cambia y el tramo deja de
  // estar, se muestra la frase entera y el enlace al final: nunca se pierde
  // ni el texto ni el acceso.
  const partes = STR.pago.condicionesAcepto.split(STR.pago.condicionesEnlace);
  const antes = partes[0];
  const despues = partes.length > 1 ? partes[1] : "";

  return (
    <>
      <div
        style={{
          padding: "14px",
          borderRadius: "16px",
          backgroundColor: mostrarFalta && !aceptadas ? "rgba(224, 82, 99, 0.08)" : "var(--gray-3)",
        }}
      >
        <label
          className="flex items-start"
          style={{ gap: "12px", cursor: "pointer", minHeight: "44px" }}
        >
          <input
            type="checkbox"
            checked={aceptadas}
            onChange={(e) => onCambiar(e.target.checked)}
            style={{
              width: "22px",
              height: "22px",
              marginTop: "1px",
              accentColor: "var(--primary-black)",
              flexShrink: 0,
            }}
          />
          <span
            style={{
              ...meta,
              fontSize: "13px",
              lineHeight: "19px",
              color: "var(--primary-black)",
            }}
          >
            {antes}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setLegalAbierto(true);
              }}
              className="border-none bg-transparent p-0"
              style={{
                ...meta,
                fontSize: "13px",
                lineHeight: "19px",
                fontWeight: "var(--font-weight-medium)",
                color: "var(--info-blue)",
                textDecoration: "underline",
                cursor: "pointer",
              }}
            >
              {STR.pago.condicionesEnlace}
            </button>
            {despues}
          </span>
        </label>

        {mostrarFalta && !aceptadas && (
          <p
            role="alert"
            style={{
              ...meta,
              fontSize: "12px",
              lineHeight: "17px",
              color: "var(--error-red)",
              margin: "6px 0 0 34px",
            }}
          >
            {STR.pago.condicionesFalta}
          </p>
        )}
      </div>

      <LegalSheet
        isOpen={legalAbierto}
        onClose={() => setLegalAbierto(false)}
        type="terms"
      />
    </>
  );
}
