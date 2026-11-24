import { useState } from "react";
import { Check, Star } from "lucide-react";
import { STR } from "../../i18n/strings";
import { Campo } from "../garantia/Campo";
import {
  guardarCalificacion,
  leerCalificacion,
} from "../../data/calificaciones";

// Calificación de un servicio finalizado: estrellas para el servicio y una
// fila por CADA técnico que participó (un servicio puede pasar por varias
// manos; cada valoración se atribuye por nombre). Se envía una sola vez;
// si ya existe, se muestra la confirmación directamente.
export function CalificacionServicio({
  servicioId,
  tecnicos,
}: {
  servicioId: string;
  /** Técnicos que trabajaron en el servicio, en orden de participación. */
  tecnicos: string[];
}) {
  const guardada = leerCalificacion(servicioId);
  const [enviada, setEnviada] = useState(guardada !== null);
  const [valorServicio, setValorServicio] = useState(guardada?.servicio ?? 0);
  const [valoresTecnicos, setValoresTecnicos] = useState<Record<string, number>>(
    () =>
      Object.fromEntries(
        (guardada?.tecnicos ?? []).map((t) => [t.nombre, t.valor]),
      ),
  );
  // Comentario opcional: visual del prototipo, no simula envío real.
  const [comentario, setComentario] = useState(guardada?.comentario ?? "");

  const meta = { fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif" } as const;

  const completa =
    valorServicio > 0 && tecnicos.every((t) => (valoresTecnicos[t] ?? 0) > 0);

  const enviar = () => {
    if (!completa) return;
    guardarCalificacion(servicioId, {
      servicio: valorServicio,
      tecnicos: tecnicos.map((nombre) => ({
        nombre,
        valor: valoresTecnicos[nombre],
      })),
      comentario: comentario.trim() || undefined,
    });
    setEnviada(true);
  };

  const filaEstrellas = (
    aspecto: string,
    valor: number,
    onValor: (n: number) => void,
  ) => (
    <div key={aspecto} className="flex items-center justify-between gap-3" style={{ marginTop: "10px" }}>
      <span className="min-w-0" style={{ ...meta, fontSize: "14px", lineHeight: "19px", color: "var(--gray-80)" }}>
        {aspecto}
      </span>
      <div className="flex flex-shrink-0" role="radiogroup" aria-label={aspecto}>
        {[1, 2, 3, 4, 5].map((n) => {
          const activa = n <= valor;
          return (
            <button
              key={n}
              role="radio"
              aria-checked={valor === n}
              aria-label={STR.servicios.calificarCon(aspecto.toLowerCase(), n)}
              onClick={() => onValor(n)}
              className="flex items-center justify-center transition-transform active:scale-[0.92]"
              style={{
                width: "40px",
                height: "44px",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
              }}
            >
              <Star
                size={24}
                strokeWidth={2}
                color={activa ? "var(--primary-black)" : "var(--gray-40)"}
                fill={activa ? "var(--primary-yellow)" : "none"}
                aria-hidden="true"
              />
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div
      className="border"
      style={{
        // Enviada: toda la card pintada con el verde de éxito muy claro del
        // sistema y borde verde apenas tenue (nunca gris), como cierre.
        backgroundColor: enviada ? "rgba(88, 202, 138, 0.1)" : "var(--card)",
        borderColor: enviada ? "rgba(88, 202, 138, 0.25)" : "var(--gray-8)",
        borderRadius: "16px",
        padding: "16px",
      }}
    >
      {enviada ? (
        // Cierre exitoso del caso, después de la última visita completada:
        // círculo de éxito RELLENO con check en blanco (máximo contraste)
        // sobre la superficie verde suave, título en Bebas y una sola línea
        // de apoyo. No parece otro ítem del historial.
        <div className="flex flex-col items-center text-center" role="status">
          {/* Círculo blanco con el check en el verde de éxito: el punto de
              mayor contraste sobre la superficie verde clara. */}
          <span
            className="flex items-center justify-center"
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "50%",
              backgroundColor: "var(--card)",
              border: "1px solid rgba(88, 202, 138, 0.35)",
            }}
          >
            <Check size={24} strokeWidth={3} color="var(--success-green)" aria-hidden="true" />
          </span>
          <p
            style={{
              fontFamily: "'Bebas Neue', Arial, sans-serif",
              fontSize: "20px",
              letterSpacing: "1px",
              textTransform: "uppercase",
              color: "var(--primary-black)",
              margin: "8px 0 0",
            }}
          >
            {STR.servicios.calificacionGracias}
          </p>
          <p style={{ ...meta, fontSize: "13px", lineHeight: "19px", color: "var(--gray-80)", margin: "3px 0 0", maxWidth: "260px" }}>
            {STR.servicios.calificacionGraciasDetalle}
          </p>
        </div>
      ) : (
        <>
          <p
            style={{
              fontFamily: "'Bebas Neue', Arial, sans-serif",
              fontSize: "18px",
              letterSpacing: "1px",
              textTransform: "uppercase",
              color: "var(--primary-black)",
              margin: 0,
            }}
          >
            {STR.servicios.calificacionTitulo}
          </p>
          {filaEstrellas(STR.servicios.calificacionServicio, valorServicio, setValorServicio)}
          {/* Un solo técnico se presenta como hasta ahora; con varios, cada
              fila lleva su nombre para atribuir la valoración. */}
          {tecnicos.map((nombre) =>
            filaEstrellas(
              tecnicos.length === 1
                ? STR.servicios.calificacionTecnicoDe(nombre)
                : nombre,
              valoresTecnicos[nombre] ?? 0,
              (n) => setValoresTecnicos((v) => ({ ...v, [nombre]: n })),
            ),
          )}
          {/* Comentario opcional (visual del prototipo).
              Va con el componente de campo de la app, no con una etiqueta
              armada a mano: la de antes era un flex en fila y el textarea
              entraba como TERCERA columna al lado de "Comentario" y de la
              marca, en vez de ir debajo y a lo ancho. Las filas de arriba
              son etiqueta + estrellas porque ahí el control es chico; un
              campo de texto largo no se acomoda al lado de su etiqueta. */}
          {/* 20 y no 14: entre dos filas de estrellas hay 10, y con 14 el
              comentario se leía como una fila más de la lista en vez de
              como otra cosa. */}
          <div style={{ marginTop: "20px" }}>
            <Campo id="calificacion-comentario" etiqueta={STR.servicios.calificacionComentario}>
              <textarea
                id="calificacion-comentario"
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                placeholder={STR.servicios.calificacionComentarioPlaceholder}
                rows={3}
                maxLength={300}
                className="w-full outline-none"
                style={{
                  ...meta,
                  fontSize: "14px",
                  lineHeight: "20px",
                  color: "var(--foreground)",
                  backgroundColor: "var(--gray-3)",
                  border: "1px solid var(--gray-8)",
                  borderRadius: "10px",
                  padding: "10px 12px",
                  resize: "none",
                }}
              />
            </Campo>
          </div>
          <button
            onClick={enviar}
            disabled={!completa}
            className="w-full transition-transform hover:scale-[1.01] active:scale-[0.99] border-none mt-4"
            style={{
              height: "48px",
              backgroundColor: "var(--primary-yellow)",
              borderRadius: "12px",
              ...meta,
              fontSize: "14px",
              fontWeight: "var(--font-weight-medium)",
              color: "var(--primary-black)",
              opacity: completa ? 1 : 0.3,
              cursor: completa ? "pointer" : "default",
            }}
          >
            {STR.servicios.calificacionEnviar}
          </button>
        </>
      )}
    </div>
  );
}
