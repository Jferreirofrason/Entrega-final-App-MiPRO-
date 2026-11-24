import { User } from "lucide-react";
import { CitaReclamo, historialCita } from "../../logic/reclamos";
import { claveVisualCita, debeMostrarTecnico } from "../../logic/estadosCita.ts";
import { formatearFecha } from "../../logic/fechas";
import { getStatusConfig } from "../../utils/statusConfig";
import { STR } from "../../i18n/strings";

// Historial del reclamo: cómo fue cambiando cada cita, con sus fechas.
//
// Una fila por CAMBIO DE ESTADO, no por etapa del proceso. El recorrido
// habitual es Por coordinar → Cita confirmada → En curso → Completada, y
// "Cancelada" es la salida posible desde cualquier estado anterior.
//
// Solo se listan los estados ALCANZADOS: las etapas que todavía no
// ocurrieron no aparecen, ni en gris ni como "pendiente". Mostrarlas haría
// leer como recorrido algo que no pasó.
//
// "Inspección", "Reparación" o "Control final" son TÍTULOS de la cita
// (nomenclatura de backoffice), nunca estados: por eso encabezan el bloque
// y no aparecen dentro de la lista de cambios.
export function HistorialCitas({ citas }: { citas: readonly CitaReclamo[] }) {
  const meta = {
    fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif",
  } as const;

  return (
    <ol className="flex flex-col gap-3" style={{ margin: 0, padding: 0, listStyle: "none" }}>
      {citas.map((c) => {
        const cambios = historialCita(c);
        const mostrarTecnico = debeMostrarTecnico(c.estado) && Boolean(c.tecnico);
        return (
          <li
            key={c.id}
            className="border"
            style={{
              backgroundColor: "var(--card)",
              borderColor: "var(--gray-8)",
              borderRadius: "12px",
              padding: "12px 16px",
            }}
          >
            <p
              style={{
                ...meta,
                fontSize: "14px",
                lineHeight: "20px",
                fontWeight: "var(--font-weight-medium)",
                color: "var(--primary-black)",
                margin: 0,
              }}
            >
              {c.tipo}
            </p>

            <ol
              className="flex flex-col"
              style={{ margin: "8px 0 0", padding: 0, listStyle: "none" }}
            >
              {cambios.map((cambio, i) => {
                const config = getStatusConfig(claveVisualCita(cambio.estado));
                const fecha = formatearFecha(cambio.fecha);
                const ultimo = i === cambios.length - 1;
                return (
                  <li key={cambio.estado} className="flex gap-2.5">
                    {/* Punto y conector: el recorrido se lee de arriba
                        hacia abajo. El conector solo une estados que YA
                        ocurrieron; nunca apunta a una etapa futura. */}
                    <div
                      className="flex flex-col items-center"
                      style={{ width: "14px", flexShrink: 0 }}
                    >
                      <span
                        aria-hidden="true"
                        className="inline-block rounded-full"
                        style={{
                          width: "8px",
                          height: "8px",
                          backgroundColor: config.color,
                          marginTop: "5px",
                        }}
                      />
                      {!ultimo && (
                        <span
                          aria-hidden="true"
                          className="flex-1"
                          style={{
                            width: "2px",
                            backgroundColor: "var(--gray-8)",
                            margin: "2px 0",
                          }}
                        />
                      )}
                    </div>

                    <div style={{ paddingBottom: ultimo ? 0 : "10px", minWidth: 0 }}>
                      <p
                        style={{
                          ...meta,
                          fontSize: "13px",
                          lineHeight: "19px",
                          fontWeight: "var(--font-weight-medium)",
                          color: "var(--primary-black)",
                          margin: 0,
                        }}
                      >
                        {cambio.estado}
                      </p>
                      {fecha && (
                        <p
                          style={{
                            ...meta,
                            fontSize: "12px",
                            lineHeight: "18px",
                            color: "var(--gray-60)",
                            margin: "1px 0 0",
                          }}
                        >
                          {fecha}
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>

            {(mostrarTecnico || c.horario) && (
              <div
                style={{
                  marginTop: "8px",
                  paddingTop: "8px",
                  borderTop: "1px solid var(--gray-8)",
                }}
              >
                {c.horario && (
                  <p style={{ ...meta, fontSize: "12px", color: "var(--gray-80)", margin: 0 }}>
                    {c.horario}
                  </p>
                )}
                {mostrarTecnico && (
                  <div className="flex items-center gap-1.5" style={{ marginTop: c.horario ? "2px" : 0 }}>
                    <User size={13} color="var(--gray-60)" style={{ flexShrink: 0 }} aria-hidden="true" />
                    <span style={{ ...meta, fontSize: "12px", color: "var(--gray-80)" }}>
                      {STR.servicios.tecnico}: {c.tecnico}
                    </span>
                  </div>
                )}
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
