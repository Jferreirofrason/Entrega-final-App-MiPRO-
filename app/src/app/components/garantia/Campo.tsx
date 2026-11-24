import { ReactNode } from "react";
import { STR } from "../../i18n/strings";

// Campo de formulario del flujo de garantía, según el design system:
// label persistente (el placeholder nunca es la única etiqueta), marca
// explícita de Obligatorio u Opcional, texto de ayuda y error en lenguaje
// claro. `children` es el control (input, select, textarea).
/**
 * La marca de un campo: "Obligatorio*" o "Opcional".
 *
 * Es UNA sola implementación y la usa TODA la app, no solo este formulario.
 * Antes cada pantalla se armaba su propio span con sus propios estilos y la
 * misma marca se veía distinta según dónde estuvieras; además había
 * etiquetas que metían "(opcional)" dentro del texto, con lo cual no había
 * forma de cambiarlo en un solo lugar.
 *
 * Reglas: sin caja alta (es un dato de servicio, no un encabezado), el
 * asterisco DESPUÉS y pegado a la palabra, en rojo y dibujado más grande
 * que el texto porque a 11px el glifo queda arriba y casi no se ve. El
 * color nunca va solo: la palabra también lo dice.
 */
export function MarcaCampo({ obligatorio = false }: { obligatorio?: boolean }) {
  return (
    <span
      className="flex-shrink-0"
      style={{
        fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif",
        fontSize: "11px",
        fontWeight: "var(--font-weight-normal)",
        color: "var(--gray-60)",
        letterSpacing: "0.2px",
        textTransform: "none",
      }}
    >
      {obligatorio ? STR.garantiaFlujo.obligatorio : STR.garantiaFlujo.opcional}
      {obligatorio && (
        <span
          aria-hidden="true"
          style={{
            color: "var(--error-red)",
            fontSize: "16px",
            fontWeight: "var(--font-weight-bold, 700)",
            lineHeight: 0,
            position: "relative",
            top: "3px",
            marginLeft: "1px",
          }}
        >
          *
        </span>
      )}
    </span>
  );
}

export function Campo({
  id,
  etiqueta,
  obligatorio = false,
  ayuda,
  error,
  children,
  minAltoEtiqueta,
}: {
  id: string;
  etiqueta: string;
  obligatorio?: boolean;
  ayuda?: ReactNode;
  error?: string | null;
  children: ReactNode;
  /**
   * Alto mínimo de la etiqueta. Se usa cuando dos campos van uno al lado
   * del otro y una de las dos etiquetas entra en dos líneas: sin esto, el
   * campo de la etiqueta corta arranca más arriba que el otro. Donde no se
   * pasa, no cambia nada.
   */
  minAltoEtiqueta?: string;
}) {
  const meta = {
    fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif",
  } as const;

  return (
    <div className="flex flex-col" style={{ gap: "6px" }}>
      <label
        htmlFor={id}
        className="flex items-baseline justify-between gap-2"
        style={{
          ...meta,
          fontSize: "13px",
          lineHeight: "19px",
          fontWeight: "var(--font-weight-medium)",
          color: "var(--primary-black)",
          minHeight: minAltoEtiqueta,
        }}
      >
        {etiqueta}
        <MarcaCampo obligatorio={obligatorio} />
      </label>
      {children}
      {ayuda}
      {error && (
        <p
          role="alert"
          style={{ ...meta, fontSize: "12px", lineHeight: "18px", color: "var(--error-red)", margin: 0 }}
        >
          {error}
        </p>
      )}
    </div>
  );
}

/** Estilo compartido de inputs del flujo (design system: 44px, radius 8). */
export const estiloInput = (conError?: boolean) =>
  ({
    fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif",
    fontSize: "14px",
    color: "var(--foreground)",
    height: "44px",
    borderRadius: "8px",
    border: `1px solid ${conError ? "var(--error-red)" : "var(--gray-20)"}`,
    backgroundColor: "var(--primary-white)",
    padding: "8px 12px",
    width: "100%",
    outline: "none",
  }) as const;
