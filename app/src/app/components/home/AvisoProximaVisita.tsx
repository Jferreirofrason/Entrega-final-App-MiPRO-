import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { CalendarDays, ChevronRight, User } from "lucide-react";
import { STR } from "../../i18n/strings";
import { cargarServicios, leerEscenarioServicios } from "../../data/servicios";
import { clasificarServicio, estadoGeneralServicio } from "../../logic/servicios";
import { presentarEstadoServicio } from "../../i18n/estados";
import { getStatusConfig } from "../../utils/statusConfig";
import { TituloSeccion } from "./TituloSeccion";
import {
  situacionRelevante,
  prioridadDeAviso,
  AvisoCita,
  PrioridadAviso,
} from "../../logic/avisoCitas";
import { formatearFechaRango } from "../../logic/fechas";

// Resumen de "Mis servicios" en el Home.
//
// La prioridad se comunica por POSICIÓN y tratamiento: el Home monta este
// componente dos veces (prioridad "alta" debajo del saludo, "media" después
// de servicios) y cada instancia solo muestra el aviso que le corresponde.
// La card representa el SERVICIO completo (no una visita suelta): nombre,
// situación y próxima visita cuando existe. Una visita en curso usa la card
// destacada (fondo tonal amarillo, acento y tag con indicador de actividad);
// el técnico en camino usa la destacada en neutro; próxima visita y solicitud
// mantienen la card informativa. "Ver todos" solo aparece cuando el usuario
// tiene más de un servicio en curso (con uno solo, la card ya es el acceso).
// Sin servicios, la instancia "media" muestra el estado vacío con la acción
// de explorar. Si la carga falla, no bloquea el Home.
export function AvisoProximaVisita({
  prioridad,
  className,
  style,
}: {
  prioridad: PrioridadAviso;
  className?: string;
  style?: React.CSSProperties;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [aviso, setAviso] = useState<AvisoCita | null>(null);
  const [enCurso, setEnCurso] = useState(0);
  const [sinServicios, setSinServicios] = useState(false);
  const procesando = useRef(false);

  useEffect(() => {
    let cancelado = false;
    cargarServicios(leerEscenarioServicios(location.search))
      .then((servicios) => {
        if (cancelado) return;
        setAviso(situacionRelevante(servicios));
        setEnCurso(servicios.filter((s) => clasificarServicio(s) === "en-curso").length);
        setSinServicios(servicios.length === 0);
      })
      .catch(() => {
        if (!cancelado) setAviso(null);
      });
    return () => {
      cancelado = true;
    };
  }, [location.search]);

  const meta = { fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif" } as const;

  // Sin servicios agendados: estado vacío compacto (posición media, para no
  // desplazar el descubrimiento de servicios que ES la acción sugerida).
  if (sinServicios && prioridad === "media") {
    return (
      <section aria-label={STR.misCitas.vacioTitulo} className={className} style={{ display: "flex", flexDirection: "column", gap: "16px", ...style }}>
        <div
          className="border text-center"
          style={{
            backgroundColor: "var(--card)",
            borderColor: "var(--gray-8)",
            borderRadius: "16px",
            padding: "16px",
          }}
        >
          <p
            style={{
              ...meta,
              fontSize: "14px",
              fontWeight: "var(--font-weight-medium)",
              color: "var(--primary-black)",
              margin: 0,
            }}
          >
            {STR.misCitas.vacioTitulo}
          </p>
          <p style={{ ...meta, fontSize: "14px", lineHeight: "19px", color: "var(--gray-60)", margin: "4px 0 0" }}>
            {STR.misCitas.vacioDetalle}
          </p>
          <button
            onClick={() => navigate("/catalogo")}
            className="w-full transition-transform hover:scale-[1.01] active:scale-[0.99] border-none mt-3"
            style={{
              height: "44px",
              backgroundColor: "var(--primary-yellow)",
              borderRadius: "12px",
              ...meta,
              fontSize: "14px",
              fontWeight: "var(--font-weight-medium)",
              color: "var(--primary-black)",
              cursor: "pointer",
            }}
          >
            {STR.misCitas.vacioAccion}
          </button>
        </div>
      </section>
    );
  }

  if (!aviso || prioridadDeAviso(aviso.tipo) !== prioridad) return null;

  const irAlDetalle = () => {
    if (procesando.current) return;
    procesando.current = true;
    navigate(`/servicios/${aviso.servicio.id}`);
    setTimeout(() => {
      procesando.current = false;
    }, 600);
  };

  // "Ver todos" vive como acción del título de sección (mismo patrón que
  // el resto del Home), nunca como un link flotante.
  const accionVerTodos =
    enCurso > 1 ? (
      <button
        // Al historial, recortado a Servicios: "Ver todos" de Mis
        // servicios tiene que llevar a TODOS, no solo a las citas
        // coordinadas. El tab sigue siendo Servicios (logic/tabs.ts).
        onClick={() => navigate("/historial?tipo=servicios")}
        className="flex items-center gap-0.5 -mr-2 px-2"
        style={{
          minHeight: "44px",
          background: "none",
          border: "none",
          cursor: "pointer",
          ...meta,
          fontSize: "14px",
          fontWeight: "var(--font-weight-medium)",
          color: "var(--primary-black)",
        }}
      >
        {STR.avisoCita.verTodos}
        <ChevronRight size={16} strokeWidth={2} aria-hidden="true" />
      </button>
    ) : undefined;

  // ── Card destacada: visita en curso o técnico en camino ──
  //
  // El estado más vivo del Home lleva el tratamiento más fuerte de la
  // marca: bloque negro con amarillo puro. El servicio es el protagonista
  // (Bebas grande); el estado y el mensaje lo acompañan sin repetirse en
  // jerarquía, y la acción es una fila, como en el resto del Home.
  if (aviso.tipo === "visita-en-curso" || aviso.tipo === "tecnico-en-camino") {
    const esEnCurso = aviso.tipo === "visita-en-curso";
    const etiqueta = esEnCurso ? STR.avisoCita.enCursoAhora : STR.avisoCita.enCamino;
    const mensaje = esEnCurso ? STR.avisoCita.mensajeEnCurso : STR.avisoCita.mensajeEnCamino;

    return (
      <section aria-label={`${etiqueta}: ${aviso.servicio.nombre}`} className={className} style={{ display: "flex", flexDirection: "column", gap: "16px", ...style }}>
        <TituloSeccion id="titulo-mis-servicios" accion={accionVerTodos}>
          {STR.avisoCita.tituloSeccion}
        </TituloSeccion>
        <button
          onClick={irAlDetalle}
          className="w-full text-left transition-all active:scale-[0.99]"
          style={{
            backgroundColor: "var(--primary-black)",
            border: "none",
            borderRadius: "16px",
            boxShadow: "0 8px 28px 0 rgba(0, 0, 0, 0.18)",
            padding: "16px",
            cursor: "pointer",
            // Texto claro sobre negro: sin esto el navegador engorda los
            // trazos (el suavizado por defecto agrega peso) y la misma
            // Bebas que en el resto del Home se ve en negro sobre blanco
            // acá parecía una versión bold. Con suavizado en escala de
            // grises los trazos vuelven a medir lo mismo en los dos fondos.
            WebkitFontSmoothing: "antialiased",
            MozOsxFontSmoothing: "grayscale",
          }}
        >
          {/* Estado con indicador de actividad */}
          <span className="inline-flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className="inline-block motion-safe:animate-pulse"
              style={{ width: "8px", height: "8px", borderRadius: "2px", backgroundColor: "var(--primary-yellow)" }}
            />
            <span
              style={{
                ...meta,
                fontSize: "11px",
                fontWeight: "var(--font-weight-medium)",
                color: "var(--primary-yellow)",
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}
            >
              {etiqueta}
            </span>
          </span>

          {/* Servicio: el protagonista */}
          <p
            style={{
              fontFamily: "'Bebas Neue', Arial, sans-serif",
              fontSize: "22px",
              // Un poco más de aire que el resto de los títulos (1px): en
              // caja alta y sobre negro, las letras condensadas de Bebas se
              // pegan entre sí y el bloque se lee como una mancha.
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              color: "var(--primary-white)",
              lineHeight: "1.1",
              margin: "8px 0 0",
            }}
          >
            {aviso.servicio.nombre}
          </p>

          {/* El chip ya dice qué pasa: técnico y acción comparten una fila
              y la card queda baja. Sin técnico, el mensaje ocupa su lugar. */}
          <div
            className="flex items-center justify-between gap-4"
            style={{ marginTop: "12px", minHeight: "20px" }}
          >
            {aviso.visita?.tecnico ? (
              <span className="flex items-center gap-1.5 min-w-0">
                <User size={14} color="rgba(255, 255, 255, 0.72)" style={{ flexShrink: 0 }} aria-hidden="true" />
                <span className="truncate" style={{ ...meta, fontSize: "13px", color: "rgba(255, 255, 255, 0.72)" }}>
                  {STR.avisoCita.tecnico}:{" "}
                  <span style={{ color: "var(--primary-white)", fontWeight: "var(--font-weight-medium)" }}>
                    {aviso.visita.tecnico}
                  </span>
                </span>
              </span>
            ) : (
              <span className="truncate" style={{ ...meta, fontSize: "13px", color: "rgba(255, 255, 255, 0.72)" }}>
                {mensaje}
              </span>
            )}
            <span className="flex items-center gap-0.5 flex-shrink-0">
              <span
                style={{
                  ...meta,
                  fontSize: "13px",
                  fontWeight: "var(--font-weight-medium)",
                  color: "var(--primary-yellow)",
                }}
              >
                {STR.avisoCita.verProgreso}
              </span>
              <ChevronRight size={16} strokeWidth={2.5} color="var(--primary-yellow)" aria-hidden="true" />
            </span>
          </div>
        </button>
      </section>
    );
  }

  // ── Card de "Mis servicios": el servicio completo, no una visita suelta ──
  const estado = presentarEstadoServicio(estadoGeneralServicio(aviso.servicio));
  const config = getStatusConfig(estado.claveVisual);

  return (
    <section aria-label={`${STR.avisoCita.tituloSeccion}: ${aviso.servicio.nombre}`} className={className} style={{ display: "flex", flexDirection: "column", gap: "16px", ...style }}>
      <TituloSeccion id="titulo-mis-servicios" accion={accionVerTodos}>
        {STR.avisoCita.tituloSeccion}
      </TituloSeccion>
      <button
        onClick={irAlDetalle}
        className="w-full text-left border transition-all active:scale-[0.99]"
        style={{
          backgroundColor: "var(--card)",
          borderColor: "var(--gray-8)",
          borderRadius: "16px",
          padding: "14px 16px",
          cursor: "pointer",
        }}
      >
        {/* Estado general del servicio */}
        <span
          className="inline-flex items-center gap-1.5"
        >
          <span
            aria-hidden="true"
            className="inline-block"
            style={{ width: "7px", height: "7px", borderRadius: "2px", backgroundColor: config.color }}
          />
          <span
            style={{
              ...meta,
              fontSize: "11px",
              fontWeight: "var(--font-weight-medium)",
              color: config.color,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            {estado.etiqueta}
          </span>
        </span>

        <p
          style={{
            fontFamily: "'Bebas Neue', Arial, sans-serif",
            fontSize: "18px",
            letterSpacing: "1px",
            textTransform: "uppercase",
            color: "var(--primary-black)",
            lineHeight: "1.2",
            margin: "8px 0 0",
          }}
        >
          {aviso.servicio.nombre}
        </p>

        {/* Mensaje explicativo del estado */}
        {estado.explicacion && !aviso.visita?.visitAt && (
          <p style={{ ...meta, fontSize: "14px", lineHeight: "19px", color: "var(--gray-80)", margin: "4px 0 0" }}>
            {estado.explicacion}
          </p>
        )}

        {/* Próxima visita, solo con datos reales */}
        {aviso.visita?.visitAt && (
          <>
            <p style={{ ...meta, fontSize: "13px", fontWeight: "var(--font-weight-medium)", color: "var(--primary-black)", margin: "6px 0 0" }}>
              {aviso.visita.proposito
                ? STR.avisoCita.proximaVisitaDe(aviso.visita.proposito)
                : STR.avisoCita.proximaVisita}
            </p>
            <div className="flex items-center gap-1.5" style={{ marginTop: "3px" }}>
              <CalendarDays size={14} color="var(--gray-60)" style={{ flexShrink: 0 }} aria-hidden="true" />
              <span style={{ ...meta, fontSize: "13px", color: "var(--gray-80)" }}>
                {formatearFechaRango(aviso.visita.visitAt, aviso.visita.visitaFinAt)}
              </span>
            </div>
          </>
        )}
        {/* Técnico y acción comparten fila: la card queda baja */}
        <div
          className="flex items-center justify-between gap-4"
          style={{ marginTop: "12px", minHeight: "20px" }}
        >
          {aviso.visita?.tecnico ? (
            <span className="flex items-center gap-1.5 min-w-0">
              <User size={14} color="var(--gray-60)" style={{ flexShrink: 0 }} aria-hidden="true" />
              <span className="truncate" style={{ ...meta, fontSize: "13px", color: "var(--gray-80)" }}>
                {STR.avisoCita.tecnico}:{" "}
                <span style={{ color: "var(--primary-black)", fontWeight: "var(--font-weight-medium)" }}>
                  {aviso.visita.tecnico}
                </span>
              </span>
            </span>
          ) : aviso.visita ? (
            <span className="flex items-center gap-1.5 min-w-0">
              <User size={14} color="var(--gray-40)" style={{ flexShrink: 0 }} aria-hidden="true" />
              <span className="truncate" style={{ ...meta, fontSize: "13px", color: "var(--gray-60)" }}>
                {STR.avisoCita.tecnico}: {STR.servicios.tecnicoPorAsignar}
              </span>
            </span>
          ) : (
            <span />
          )}
          <span className="flex items-center gap-0.5 flex-shrink-0">
            <span
              style={{
                ...meta,
                fontSize: "13px",
                fontWeight: "var(--font-weight-medium)",
                color: "var(--primary-black)",
              }}
            >
              {STR.avisoCita.verProgreso}
            </span>
            <ChevronRight size={16} strokeWidth={2.5} color="var(--primary-black)" aria-hidden="true" />
          </span>
        </div>
      </button>
    </section>
  );
}
