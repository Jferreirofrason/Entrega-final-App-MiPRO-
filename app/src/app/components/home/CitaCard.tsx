import { useRef } from "react";
import { CalendarDays, ChevronRight, User } from "lucide-react";
import { CitaHome, debeMostrarTecnico } from "../../logic/citas";
import { formatearFechaHora } from "../../logic/fechas";
import { STR } from "../../i18n/strings";
import { EstadoCita } from "./EstadoCita";

// Tarjeta de la cita más reciente en el Home.
//
// Orden de lectura pensado para una persona no tecnológica: qué servicio
// pidió, cuándo es la visita, qué está pasando (y qué esperar), y quién
// viene. Con `onVerDetalle`, toda la tarjeta navega al detalle del servicio
// y la acción "Ver detalle" queda visible; sin él es solo informativa.
export function CitaCard({
  cita,
  onVerDetalle,
}: {
  cita: CitaHome;
  onVerDetalle?: () => void;
}) {
  const procesando = useRef(false);
  const mostrarTecnico = debeMostrarTecnico(cita);
  const fechaLegible = formatearFechaHora(cita.visitAt, cita.fecha, cita.hora);

  const metaTexto = {
    fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif",
    fontSize: "13px",
    color: "var(--gray-60)",
  } as const;

  const onTap = () => {
    if (!onVerDetalle || procesando.current) return;
    procesando.current = true;
    onVerDetalle();
    setTimeout(() => {
      procesando.current = false;
    }, 600);
  };

  const contenido = (
    <>
      <h4
        className="truncate"
        style={{
          fontFamily: "'Bebas Neue', Arial, sans-serif",
          fontSize: "18px",
          fontWeight: "var(--font-weight-normal)",
          color: "var(--foreground)",
          letterSpacing: "1px",
          textTransform: "uppercase",
          lineHeight: "1.2",
          margin: 0,
        }}
      >
        {cita.titulo}
      </h4>

      <div className="flex items-center gap-1.5" style={{ margin: "8px 0 12px" }}>
        <CalendarDays size={14} color="var(--gray-60)" style={{ flexShrink: 0 }} aria-hidden="true" />
        <span
          style={{
            fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif",
            fontSize: "13px",
            color: "var(--gray-80)",
          }}
        >
          {fechaLegible}
        </span>
      </div>

      <EstadoCita estado={cita.estado} />

      {mostrarTecnico && (
        <div
          className="flex items-center gap-1.5 mt-3 pt-3"
          style={{ borderTop: "1px solid var(--gray-8)" }}
        >
          <User size={14} color="var(--gray-60)" style={{ flexShrink: 0 }} aria-hidden="true" />
          <span style={metaTexto}>
            {STR.misCitas.tecnico}:{" "}
            <span
              style={{
                color: "var(--primary-black)",
                fontWeight: "var(--font-weight-medium)",
              }}
            >
              {cita.tecnico}
            </span>
          </span>
        </div>
      )}

      {onVerDetalle && (
        <div
          className="flex items-center justify-end gap-0.5 pt-3 mt-3"
          style={{ borderTop: "1px solid var(--gray-8)" }}
        >
          <span
            style={{
              fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif",
              fontSize: "13px",
              fontWeight: "var(--font-weight-medium)",
              color: "var(--primary-black)",
            }}
          >
            {STR.servicios.verDetalle}
          </span>
          <ChevronRight size={16} strokeWidth={2.5} color="var(--primary-black)" aria-hidden="true" />
        </div>
      )}
    </>
  );

  const estilosCard = {
    backgroundColor: "var(--card)",
    borderColor: "var(--gray-8)",
    borderRadius: "16px",
    padding: "16px",
  } as const;

  if (onVerDetalle) {
    return (
      <button
        onClick={onTap}
        aria-label={`${cita.titulo}, ${cita.estado}. ${STR.servicios.verDetalle}.`}
        className="w-full text-left border transition-all active:scale-[0.99]"
        style={{ ...estilosCard, cursor: "pointer" }}
      >
        {contenido}
      </button>
    );
  }

  return (
    <article aria-label={`${cita.titulo}, ${cita.estado}`} className="border" style={estilosCard}>
      {contenido}
    </article>
  );
}
