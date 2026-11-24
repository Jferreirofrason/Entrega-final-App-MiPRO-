import { STR } from "../../i18n/strings";
import { formatearFecha } from "../../logic/fechas";
import type { EtapaAlcanzada } from "../../logic/seguimiento";

const meta = { fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif" } as const;

// El seguimiento de una solicitud: solo lo que YA PASÓ.
//
// No dibuja el camino completo con la mitad en gris. Una línea que muestra
// etapas futuras promete un recorrido que nadie confirmó, y a la segunda
// vez que no se cumple deja de creerse. Lo que viene después lo cuenta el
// estado del caso, que sí es una afirmación que la app puede sostener.
//
// La última etapa es donde está el caso hoy y se marca con un punto lleno;
// las anteriores van con el punto hueco. Una etapa sin fecha se muestra sin
// fecha: no se estima ninguna.
export function LineaDeTiempo({ etapas }: { etapas: EtapaAlcanzada[] }) {
  if (etapas.length === 0) return null;

  return (
    <ol className="flex flex-col" style={{ margin: 0, padding: 0, listStyle: "none" }}>
      {etapas.map((etapa, i) => {
        const ultima = i === etapas.length - 1;
        const color = etapa.cancelada
          ? "var(--error-red)"
          : ultima
            ? "var(--primary-black)"
            : "var(--gray-40)";
        const fecha = formatearFecha(etapa.fecha);

        return (
          <li key={`${etapa.titulo}-${i}`} className="flex" style={{ gap: "12px" }}>
            {/* Columna del hilo: punto y, si hay algo después, el tramo que
                lo une. El último no lleva tramo: no hay a dónde seguir. */}
            <div className="flex flex-col items-center shrink-0" style={{ width: "12px" }}>
              <span
                aria-hidden="true"
                style={{
                  width: "10px",
                  height: "10px",
                  marginTop: "5px",
                  borderRadius: "50%",
                  backgroundColor: etapa.ultima ? color : "transparent",
                  border: `2px solid ${color}`,
                }}
              />
              {!ultima && (
                <span
                  aria-hidden="true"
                  className="flex-1"
                  style={{ width: "2px", backgroundColor: "var(--gray-8)", marginBlock: "2px" }}
                />
              )}
            </div>

            <div className="flex flex-col min-w-0" style={{ paddingBottom: ultima ? 0 : "14px" }}>
              <span
                style={{
                  ...meta,
                  fontSize: "14px",
                  lineHeight: "20px",
                  fontWeight: etapa.ultima
                    ? "var(--font-weight-medium)"
                    : "var(--font-weight-normal)",
                  color: etapa.cancelada ? "var(--error-red)" : "var(--primary-black)",
                }}
              >
                {etapa.titulo}
              </span>
              {/* Sin fecha no se dibuja una línea vacía ni se inventa una. */}
              {fecha && (
                <span style={{ ...meta, fontSize: "12px", lineHeight: "17px", color: "var(--gray-60)" }}>
                  {fecha}
                </span>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/** El título del bloque, igual en servicio y en garantía. */
export function TituloSeguimiento() {
  return (
    <h2
      style={{
        fontFamily: "'Bebas Neue', Arial, sans-serif",
        fontSize: "16px",
        letterSpacing: "1px",
        textTransform: "uppercase",
        color: "var(--primary-black)",
        margin: "0 0 12px",
      }}
    >
      {STR.seguimiento.titulo}
    </h2>
  );
}
