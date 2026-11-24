import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import { es } from "date-fns/locale";
import { Info, Moon, Sun } from "lucide-react";
import { Calendar } from "../components/ui/calendar";
import { STR } from "../i18n/strings";
import { buscarServicioCatalogo } from "../data/catalogo";
import {
  leerBorradorServicio,
  guardarBorradorServicio,
} from "../data/borradorServicio";
import {
  BLOQUES_HORARIOS,
  BloqueHorario,
  validarFecha,
} from "../logic/solicitudServicio";
import { EncabezadoFlujo } from "../components/agendar/EncabezadoFlujo";
import { MarcaCampo } from "../components/garantia/Campo";

function fechaISO(d: Date): string {
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mes}-${dia}`;
}

// Etapa 3 del agendamiento: fecha y bloque horario PREFERIDOS.
//
// La elección es una preferencia, no una confirmación: un agente de MiPRO
// contacta al cliente para confirmar la fecha y el horario (y coordinar el
// pago). La pantalla lo dice de forma explícita.
export function FechaServicio() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const desdeRevision = Boolean(
    (location.state as { desdeRevision?: boolean } | null)?.desdeRevision,
  );
  const servicio = id ? buscarServicioCatalogo(id) : null;
  const inicial = id ? leerBorradorServicio(id) : null;

  const [fecha, setFecha] = useState(inicial?.fechaPreferida ?? "");
  const [bloque, setBloque] = useState<BloqueHorario | undefined>(inicial?.bloque);
  const [error, setError] = useState<string | null>(null);

  const meta = { fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif" } as const;

  if (!servicio || !inicial) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-6 py-20">
        <p style={{ ...meta, fontSize: "14px", color: "var(--gray-60)" }}>
          {STR.agendar.noEncontrado}
        </p>
      </div>
    );
  }

  const hoy = fechaISO(new Date());
  const manana = fechaISO(new Date(Date.now() + 24 * 60 * 60 * 1000));

  const continuar = () => {
    const borrador = { ...inicial, fechaPreferida: fecha || undefined, bloque };
    const errores = validarFecha(borrador, hoy);
    if (errores.length > 0) {
      setError(errores[0]);
      return;
    }
    guardarBorradorServicio(borrador);
    if (desdeRevision) {
      // Volver directo a la revisión sin duplicarla en el historial.
      navigate(-1);
      return;
    }
    navigate(`/catalogo/${servicio.id}/resumen`);
  };

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: "var(--primary-white)" }}>
      <EncabezadoFlujo
        titulo={servicio.nombre}
        etapa={3}
        onVolver={() => {
          if (desdeRevision) {
            // La edición se descarta: la revisión conserva lo confirmado.
            navigate(-1);
            return;
          }
          // Volver conserva lo elegido hasta ahora.
          guardarBorradorServicio({ ...inicial, fechaPreferida: fecha || undefined, bloque });
          navigate(-1);
        }}
      />

      <div className="flex-1 overflow-y-auto px-6 pt-6 pb-8">
        <h2 style={{ ...meta, fontSize: "16px", fontWeight: "var(--font-weight-medium)", color: "var(--primary-black)", margin: 0 }}>
          {STR.agendar.fechaTitulo}
        </h2>

        <p style={{ ...meta, fontSize: "13px", fontWeight: "var(--font-weight-medium)", color: "var(--primary-black)", margin: "16px 0 0" }}>
          {STR.agendar.fechaCampo}{" "}
          <MarcaCampo obligatorio />
        </p>
        <div
          className="border mt-2 flex justify-center"
          style={{ borderColor: "var(--gray-8)", borderRadius: "16px", backgroundColor: "var(--card)" }}
        >
          <Calendar
            mode="single"
            locale={es}
            selected={fecha ? new Date(`${fecha}T12:00:00`) : undefined}
            onSelect={(dia) => {
              if (!dia) return;
              setFecha(fechaISO(dia));
              setError(null);
            }}
            disabled={{ before: new Date(`${manana}T12:00:00`) }}
            classNames={{
              day_selected:
                "!bg-[var(--primary-yellow)] !text-[var(--primary-black)] !font-bold hover:!bg-[var(--primary-yellow)]",
              day_today: "!bg-[var(--gray-8)] !text-[var(--primary-black)]",
            }}
          />
        </div>

        <p style={{ ...meta, fontSize: "13px", fontWeight: "var(--font-weight-medium)", color: "var(--primary-black)", margin: "24px 0 0" }}>
          {STR.agendar.bloqueCampo}{" "}
          <MarcaCampo obligatorio />
        </p>
        <div className="flex gap-3 mt-2" role="radiogroup" aria-label={STR.agendar.bloqueCampo}>
          {BLOQUES_HORARIOS.map((b) => {
            const elegido = bloque === b.id;
            const Icono = b.id === "manana" ? Sun : Moon;
            return (
              <button
                key={b.id}
                role="radio"
                aria-checked={elegido}
                onClick={() => {
                  setBloque(b.id);
                  setError(null);
                }}
                className="flex-1 border-2 transition-colors active:scale-[0.98]"
                style={{
                  backgroundColor: elegido ? "rgba(255, 238, 0, 0.08)" : "var(--card)",
                  borderColor: elegido ? "var(--primary-yellow)" : "var(--gray-8)",
                  borderRadius: "12px",
                  padding: "16px",
                  cursor: "pointer",
                }}
              >
                <span className="flex flex-col items-center gap-1">
                  <span className="flex items-center gap-2">
                    <Icono size={18} strokeWidth={2} color="var(--primary-black)" aria-hidden="true" />
                    <span style={{ ...meta, fontSize: "14px", fontWeight: "var(--font-weight-medium)", color: "var(--primary-black)" }}>
                      {b.etiqueta}
                    </span>
                  </span>
                  <span style={{ ...meta, fontSize: "12px", color: "var(--gray-60)" }}>
                    {b.detalle}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        {/* La fecha es una preferencia: lo decimos sin rodeos */}
        <div
          className="flex items-start gap-1.5 mt-6 p-3"
          style={{ backgroundColor: "var(--gray-3)", borderRadius: "10px" }}
        >
          <Info size={14} color="var(--gray-60)" style={{ flexShrink: 0, marginTop: "2px" }} aria-hidden="true" />
          <p style={{ ...meta, fontSize: "13px", lineHeight: "19px", color: "var(--gray-80)", margin: 0 }}>
            {STR.agendar.fechaAclaracion}
          </p>
        </div>

        {error && (
          <p role="alert" style={{ ...meta, fontSize: "12px", color: "var(--error-red)", margin: "10px 0 0" }}>
            {error}
          </p>
        )}
      </div>

      <div className="px-6 py-4 bg-white flex-shrink-0" style={{ borderTop: "1px solid var(--gray-8)" }}>
        <button
          onClick={continuar}
          className="w-full transition-transform hover:scale-[1.01] active:scale-[0.99] border-none"
          style={{
            height: "56px",
            backgroundColor: "var(--primary-yellow)",
            borderRadius: "12px",
            ...meta,
            fontSize: "16px",
            fontWeight: "var(--font-weight-medium)",
            color: "var(--primary-black)",
            cursor: "pointer",
          }}
        >
          {STR.agendar.continuar}
        </button>
      </div>
    </div>
  );
}
