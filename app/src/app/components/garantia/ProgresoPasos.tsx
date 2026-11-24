import { progresoDePaso } from "../../logic/solicitudGarantia";

// Indicador de pasos del flujo: círculos numerados 1-2-3-4 centrados.
// El activo va en amarillo, los completados en negro y los pendientes en
// gris. El estado se anuncia por aria con el nombre del paso; el color
// nunca es la única señal (el número siempre está visible). La revisión
// final ("Revisar y enviar") es el paso 4.
export function ProgresoPasos({ paso }: { paso: 1 | 2 | 3 | 4 }) {
  const progreso = progresoDePaso(paso);
  const meta = {
    fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif",
  } as const;

  return (
    <div
      role="status"
      aria-label={`${progreso.texto}: ${progreso.titulo}`}
      className="flex items-center justify-center gap-3"
      style={{ padding: "12px 0 6px" }}
    >
      {([1, 2, 3, 4] as const).map((n) => {
        const activo = n === paso;
        const completado = n < paso;
        return (
          <span
            key={n}
            aria-hidden="true"
            className="flex items-center justify-center"
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              backgroundColor: activo
                ? "var(--primary-yellow)"
                : completado
                  ? "var(--primary-black)"
                  : "var(--gray-8)",
              ...meta,
              fontSize: "14px",
              fontWeight: "var(--font-weight-medium)",
              color: activo
                ? "var(--primary-black)"
                : completado
                  ? "var(--primary-yellow)"
                  : "var(--gray-60)",
            }}
          >
            {n}
          </span>
        );
      })}
    </div>
  );
}
