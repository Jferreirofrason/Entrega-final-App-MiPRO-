import { ReactNode } from "react";

// Encabezado de sección del Home. Marca el ritmo vertical de arriba de cada
// sección, con la escala de la app: 8 entre el título y su bajada, 16 hasta
// el contenido.
//
// El encabezado NO reserva espacio vacío: una sección sin bajada mide solo su
// fila de título, y su contenido arranca 16 más abajo. El gap hasta el
// contenido lo pone la sección, que es un flex en columna, no un margen de
// este componente.
//
//   fila del título y la acción     ALTO_FILA_TITULO
//   gap a la bajada, si hay         GAP_SEGUNDA_LINEA
//   bajada
//   ── el gap al contenido (GAP_CONTENIDO) lo aplica la sección ──
//
// Los valores son iguales en mobile y en desktop.

/**
 * Alto de la fila del título: el alto de la caja de texto de Bebas 18.
 * Es fijo para que el botón "Ver todos", que mide 44 de alto tocable, no
 * estire la fila y corra el contenido de la sección hacia abajo.
 */
export const ALTO_FILA_TITULO = 27;

/** Separación entre el título y su bajada: 8, elementos relacionados. */
export const GAP_SEGUNDA_LINEA = 8;

/** Separación entre el encabezado y el contenido de la sección: 16. */
export const GAP_CONTENIDO = 16;

export function TituloSeccion({
  id,
  children,
  accion,
  bajada,
}: {
  id: string;
  children: ReactNode;
  accion?: ReactNode;
  /** Segunda línea del encabezado. Sin bajada, el espacio queda reservado. */
  bajada?: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: `${GAP_SEGUNDA_LINEA}px`,
      }}
    >
      {/* Fila de alto fijo: la acción no la estira. El botón "Ver todos" sigue
          midiendo 44px de alto tocable y sobresale de la fila, centrado, sin
          empujar nada: el alto de la fila lo manda esta caja. */}
      <div
        className="flex items-center justify-between"
        style={{ height: `${ALTO_FILA_TITULO}px` }}
      >
        <h3
          id={id}
          style={{
            fontFamily: "'Bebas Neue', Arial, sans-serif",
            fontSize: "18px",
            lineHeight: `${ALTO_FILA_TITULO}px`,
            fontWeight: "var(--font-weight-normal)",
            textTransform: "uppercase",
            letterSpacing: "1px",
            color: "var(--primary-black)",
            margin: 0,
          }}
        >
          {children}
        </h3>
        {accion}
      </div>

      {/* Bajada. Sin bajada no se dibuja nada: no se reserva espacio vacío. */}
      {bajada && (
        <p
          style={{
            fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif",
            fontSize: "13px",
            lineHeight: "19px",
            color: "var(--gray-60)",
            margin: 0,
          }}
        >
          {bajada}
        </p>
      )}
    </div>
  );
}
