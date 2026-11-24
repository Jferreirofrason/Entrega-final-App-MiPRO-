import { ReactNode } from "react";
import { STR } from "../../i18n/strings";

export interface MedioEnLista {
  id: string;
  logo: ReactNode;
  principal: string;
  secundario?: string;
  /** Tercera línea, para la aclaración de CMF. */
  discreto?: string;
  /** false = se muestra apagado y no se puede elegir. */
  disponible?: boolean;
  /**
   * Lo que el medio necesita resolver DENTRO de su fila cuando está
   * elegido, como el código de la tarjeta de regalo. Va debajo, adentro de
   * la misma fila blanca.
   */
  panel?: ReactNode;
}

/** Espacio reservado para el logo: el mismo para todos los medios. */
const CAJA_LOGO = { ancho: 44, alto: 30 };

// Yappy y Crédito CMF, agrupados en un bloque gris muy claro con una fila
// blanca por medio.
//
// Van juntos a propósito: son las formas de pagar que no son una tarjeta
// guardada, así que se leen como una lista y no como tarjetas sueltas, que
// es lo que competía con el carrusel. El gris agrupa y las filas blancas
// separan, sin bordes ni sombras: el peso lo hace el espacio.
//
// Cada fila: el logo a la izquierda, el nombre y su descripción en el
// medio, el radio a la derecha. El logo NO va en un recuadro, pero sí
// ocupa siempre el mismo espacio, así los nombres arrancan todos en la
// misma columna aunque un logo sea más ancho que otro.
//
// Logo y radio se centran contra el bloque de texto completo: con
// `items-center` lo calcula el navegador, así que vale con dos o con tres
// líneas sin medidas fijas. CMF crece lo que necesita y sus dos
// aclaraciones no se comprimen.
//
// Toda la fila es el control. Elegida: el radio marcado y un fondo amarillo
// suave que queda DENTRO de sus límites, porque el contenedor recorta.
export function ListaMediosPago({
  medios,
  elegidoId,
  onElegir,
}: {
  medios: MedioEnLista[];
  elegidoId?: string | null;
  onElegir: (id: string) => void;
}) {
  const meta = { fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif" } as const;

  return (
    <div
      className="flex flex-col"
      style={{
        gap: "8px",
        padding: "8px",
        borderRadius: "16px",
        backgroundColor: "var(--gray-3)",
      }}
    >
      {medios.map((medio) => {
        const disponible = medio.disponible !== false;
        const elegida = elegidoId === medio.id;

        const cuerpo = (
          <>
            <span
              className="flex shrink-0 items-center justify-center"
              style={{ width: `${CAJA_LOGO.ancho}px`, height: `${CAJA_LOGO.alto}px` }}
            >
              {medio.logo}
            </span>

            <span className="min-w-0 flex-1 text-left">
              <span
                className="block"
                style={{
                  ...meta,
                  fontSize: "14px",
                  lineHeight: "20px",
                  fontWeight: "var(--font-weight-medium)",
                  color: disponible ? "var(--primary-black)" : "var(--gray-60)",
                }}
              >
                {medio.principal}
              </span>
              {medio.secundario && (
                <span
                  className="block"
                  style={{ ...meta, fontSize: "13px", lineHeight: "18px", color: "var(--gray-60)" }}
                >
                  {medio.secundario}
                </span>
              )}
              {(medio.discreto || !disponible) && (
                <span
                  className="block"
                  style={{
                    ...meta,
                    fontSize: "12px",
                    lineHeight: "17px",
                    color: "var(--gray-40)",
                    marginTop: "1px",
                  }}
                >
                  {disponible ? medio.discreto : STR.pago.noDisponible}
                </span>
              )}
            </span>

            {disponible && (
              <span
                aria-hidden="true"
                className="flex shrink-0 items-center justify-center"
                style={{
                  width: "20px",
                  height: "20px",
                  borderRadius: "50%",
                  border: `1.5px solid ${elegida ? "var(--primary-black)" : "var(--gray-20)"}`,
                  backgroundColor: "var(--primary-white)",
                }}
              >
                {elegida && (
                  <span
                    style={{
                      width: "10px",
                      height: "10px",
                      borderRadius: "50%",
                      backgroundColor: "var(--primary-black)",
                    }}
                  />
                )}
              </span>
            )}
          </>
        );

        const fila = {
          width: "100%",
          padding: "14px",
          gap: "12px",
          borderRadius: "12px",
          backgroundColor: elegida ? "rgba(255, 238, 0, 0.28)" : "var(--primary-white)",
        } as const;

        // Un medio no disponible no es un control.
        if (!disponible) {
          return (
            <div key={medio.id} className="flex items-center" style={fila}>
              {cuerpo}
            </div>
          );
        }

        // Con panel, la fila blanca contiene el control y el panel: así el
        // código de la tarjeta de regalo no queda afuera de su propia fila,
        // y el panel no es parte del control (no se elige al tocarlo).
        if (medio.panel && elegida) {
          return (
            <div key={medio.id} style={fila}>
              <button
                type="button"
                role="radio"
                aria-checked={elegida}
                onClick={() => onElegir(medio.id)}
                className="flex w-full items-center border-none bg-transparent p-0"
                style={{ gap: "12px", cursor: "pointer" }}
              >
                {cuerpo}
              </button>
              <div style={{ marginTop: "12px" }}>{medio.panel}</div>
            </div>
          );
        }

        return (
          <button
            key={medio.id}
            type="button"
            role="radio"
            aria-checked={elegida}
            onClick={() => onElegir(medio.id)}
            className="flex items-center border-none transition-colors duration-150"
            style={{ ...fila, cursor: "pointer" }}
          >
            {cuerpo}
          </button>
        );
      })}
    </div>
  );
}
