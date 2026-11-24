import { User } from "lucide-react";
import { ServicioCliente, VisitaServicio, visitasEnOrden } from "../../logic/servicios";
import {
  claveVisualCita,
  debeMostrarFecha,
  debeMostrarTecnico,
  etiquetaEstadoCita,
} from "../../logic/estadosCita.ts";
import { formatearFecha, formatearFechaRango } from "../../logic/fechas";
import { getStatusConfig } from "../../utils/statusConfig";
import { STR } from "../../i18n/strings";

// Listado de las CITAS de un servicio.
//
// En Servicios, el listado principal muestra el caso y su detalle muestra
// las citas asociadas: un caso puede tener varias. Cada fila dice tres
// cosas y en este orden: el título de la cita, su estado y la fecha.
//
// El estado va SIEMPRE antes que la fecha ("Cita confirmada · 12 de marzo"),
// porque lo primero que se pregunta el cliente es en qué anda esa cita, no
// cuándo era. "Próxima visita" no se usa como estado: es una circunstancia,
// así que viaja como una marca aparte sobre la cita más cercana y nunca
// reemplaza al estado (esa alternativa quedó pendiente de validación).
//
// Esto NO es el historial de estados de Garantías: allá interesa cómo fue
// cambiando UNA cita; acá interesa CUÁNTAS citas tiene el caso y en qué
// anda cada una.
export function ListaCitasServicio({ servicio }: { servicio: ServicioCliente }) {
  const citas = visitasEnOrden(servicio);

  const meta = {
    fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif",
  } as const;

  /** "Cita confirmada · 12 de marzo": estado primero, fecha después. Sin
   * fecha (o con la cita por coordinar) queda solo el estado. */
  const estadoConFecha = (v: VisitaServicio) => {
    const etiqueta = etiquetaEstadoCita(v.estado);
    if (!debeMostrarFecha(v.estado)) return etiqueta;
    const fecha = v.visitAt
      ? formatearFechaRango(v.visitAt, v.visitaFinAt) || formatearFecha(v.visitAt)
      : "";
    return fecha ? `${etiqueta} · ${fecha}` : etiqueta;
  };

  return (
    <ul className="flex flex-col gap-2" style={{ margin: 0, padding: 0, listStyle: "none" }}>
      {citas.map((v) => {
        const config = getStatusConfig(claveVisualCita(v.estado));
        const mostrarTecnico = debeMostrarTecnico(v.estado) && Boolean(v.tecnico);
        return (
          <li
            key={v.id}
            className="border"
            style={{
              backgroundColor: "var(--card)",
              borderColor: "var(--gray-8)",
              borderRadius: "12px",
              padding: "12px 16px",
            }}
          >
            {/* Título de la cita: la nomenclatura de backoffice
                (Inspección, Instalación, Reparación, Control final). Es un
                título, nunca un estado. */}
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
              {v.proposito ?? STR.servicios.visitaGenerica}
            </p>

            {/* Estado y fecha, en ese orden. El ícono acompaña al texto: el
                color nunca es la única señal. */}
            <div className="flex items-center gap-1.5" style={{ marginTop: "4px" }}>
              <config.icon
                size={14}
                strokeWidth={2.5}
                color={config.color}
                style={{ flexShrink: 0 }}
                aria-hidden="true"
              />
              <span
                style={{
                  ...meta,
                  fontSize: "13px",
                  lineHeight: "19px",
                  color: "var(--gray-80)",
                }}
              >
                {estadoConFecha(v)}
              </span>
            </div>

            {mostrarTecnico && (
              <div className="flex items-center gap-1.5" style={{ marginTop: "2px" }}>
                <User size={13} color="var(--gray-60)" style={{ flexShrink: 0 }} aria-hidden="true" />
                <span style={{ ...meta, fontSize: "13px", color: "var(--gray-80)" }}>
                  {STR.servicios.tecnico}:{" "}
                  <span style={{ color: "var(--primary-black)", fontWeight: "var(--font-weight-medium)" }}>
                    {v.tecnico}
                  </span>
                </span>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
