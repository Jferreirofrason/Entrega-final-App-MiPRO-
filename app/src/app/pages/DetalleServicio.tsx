import { useLocation, useNavigate, useParams } from "react-router";
import { ArrowLeft, Info } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Progress } from "../components/ui/progress";
import { ListaCitasServicio } from "../components/servicios/ListaCitasServicio";
import { ContactarMiPRO } from "../components/servicios/ContactarMiPRO";
import { LineaDeTiempo, TituloSeguimiento } from "../components/servicios/LineaDeTiempo";
import { seguimientoDelServicio, sePuedeReagendar } from "../logic/seguimiento";
import { CalificacionServicio } from "../components/servicios/CalificacionServicio";
import { STR } from "../i18n/strings";
import { buscarServicioPorId } from "../data/servicios";
import { CURRENT_USER } from "../data/user";
import {
  clasificarServicio,
  estadoGeneralServicio,
  fechaDeCierre,
  progresoServicio,
  proximaVisita,
} from "../logic/servicios";
import { presentarEstadoServicio } from "../i18n/estados";
import { formatearFecha, formatearFechaDiaMesAnio } from "../logic/fechas";
import { getStatusConfig } from "../utils/statusConfig";
import { linkWhatsAppCancelacion } from "../logic/contacto";

// Detalle de un servicio, en orden de lectura: estado general, los datos de
// la solicitud, las visitas (la próxima se marca dentro de la lista, sin un
// bloque duplicado) y el cierre según el momento: calificación y ayuda si
// terminó, contacto para cambios si sigue en curso. El avance solo aparece
// cuando hay dos o más visitas: con una sola no agrega información.
export function DetalleServicio() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const servicio = id ? buscarServicioPorId(id, location.search) : null;
  const [contactoAbierto, setContactoAbierto] = useState(false);
  const [cancelarAbierto, setCancelarAbierto] = useState(false);
  // Llegar desde la notificación "¿Cómo estuvo tu servicio?" baja directo
  // al módulo de calificación.
  const irACalificar = new URLSearchParams(location.search).get("calificar") === "1";
  const refCalificacion = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!irACalificar) return;
    // El scroll suave puede cancelarse mientras el layout asienta; el
    // reintento final salta directo para garantizar la llegada.
    const raf = requestAnimationFrame(() =>
      refCalificacion.current?.scrollIntoView({ behavior: "smooth", block: "center" }),
    );
    const timer = window.setTimeout(
      () => refCalificacion.current?.scrollIntoView({ block: "center" }),
      600,
    );
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const meta = {
    fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif",
  } as const;

  if (!servicio) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-6 py-20">
        <p style={{ ...meta, fontSize: "14px", color: "var(--gray-60)" }}>
          {STR.servicios.noEncontrado}
        </p>
        <button
          onClick={() => navigate("/historial?tipo=servicios")}
          className="mt-4 px-4 transition-opacity hover:opacity-80"
          style={{
            height: "44px",
            backgroundColor: "var(--primary-yellow)",
            borderRadius: "12px",
            ...meta,
            fontSize: "14px",
            fontWeight: "var(--font-weight-medium)",
            color: "var(--primary-black)",
            border: "none",
            cursor: "pointer",
          }}
        >
          {STR.servicios.volver}
        </button>
      </div>
    );
  }

  const estado = estadoGeneralServicio(servicio);
  const presentacion = presentarEstadoServicio(estado);
  const config = getStatusConfig(presentacion.claveVisual);
  const enCurso = clasificarServicio(servicio) === "en-curso";
  const progreso = progresoServicio(servicio);
  const conAvance = enCurso && servicio.visitas.length >= 2;

  const textoProgreso = conAvance
    ? progreso.totalConocido
      ? progreso.realizadas === progreso.total
        ? STR.servicios.progresoCompleto
        : STR.servicios.progresoConocido(progreso.realizadas, progreso.total)
      : progreso.realizadas > 0
        ? STR.servicios.progresoAbierto(progreso.realizadas)
        : null
    : null;

  const cierre = !enCurso ? formatearFecha(fechaDeCierre(servicio) ?? undefined) : null;
  // Se evalúa a quienes hicieron el trabajo: cada técnico distinto de las
  // visitas completadas, en orden de participación (un servicio puede
  // pasar por varias manos).
  const tecnicosEvaluados = [
    ...new Set(
      servicio.visitas
        .filter((v) => v.tecnico)
        .map((v) => v.tecnico as string),
    ),
  ];

  const tieneDatosSolicitud = Boolean(
    servicio.numeroReserva ||
      servicio.direccionTexto ||
      servicio.totalEstimado !== undefined ||
      servicio.notas ||
      servicio.contactoNombre,
  );

  return (
    <div className="flex flex-col" style={{ backgroundColor: "var(--primary-white)" }}>
      {/* Header */}
      <header
        className="flex items-center gap-3 px-6 pt-[20px] pb-4 bg-white sticky top-0 z-20"
        style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}
      >
        <button
          // Desde la bandeja de notificaciones la flecha vuelve a la bandeja
          // (history back conserva su posición); el resto vuelve al listado.
          onClick={() =>
            location.state?.desdeNotificaciones || location.state?.desdeHistorial
              ? navigate(-1)
              : navigate("/historial?tipo=servicios")
          }
          aria-label={STR.servicios.volver}
          className="w-11 h-11 rounded-[10px] flex items-center justify-center transition-opacity hover:opacity-80 border flex-shrink-0"
          style={{
            backgroundColor: "var(--primary-white)",
            borderColor: "var(--gray-20)",
            cursor: "pointer",
          }}
        >
          <ArrowLeft size={20} strokeWidth={2} color="var(--primary-black)" aria-hidden="true" />
        </button>
        <div className="flex-1 min-w-0">
          <h1
            className="truncate"
            style={{
              fontFamily: "'Bebas Neue', Arial, sans-serif",
              fontSize: "20px",
              fontWeight: "var(--font-weight-normal)",
              letterSpacing: "1px",
              color: "var(--primary-black)",
              margin: 0,
              textTransform: "uppercase",
            }}
          >
            {servicio.nombre}
          </h1>
        </div>
      </header>

      <section className="px-6 pt-6 pb-8">
        {/* Estado general */}
        <span className="inline-flex items-center gap-1.5">
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
            {presentacion.etiqueta}
          </span>
        </span>

        {cierre && (
          <p style={{ ...meta, fontSize: "13px", color: "var(--gray-80)", margin: "10px 0 0" }}>
            {estado === "cancelado"
              ? STR.servicios.canceladoEl(cierre)
              : STR.servicios.finalizadoEl(cierre)}
          </p>
        )}

        {enCurso && servicio.visitas.length === 0 && presentacion.explicacion && (
          <div className="flex items-start gap-1.5" style={{ margin: "12px 0 0" }}>
            <Info size={14} color="var(--gray-60)" style={{ flexShrink: 0, marginTop: "2px" }} aria-hidden="true" />
            <p style={{ ...meta, fontSize: "13px", lineHeight: "19px", color: "var(--gray-80)", margin: 0 }}>
              {presentacion.explicacion}
            </p>
          </div>
        )}

        {/* Datos de tu solicitud (cuando el servicio nació en la app) */}
        {tieneDatosSolicitud && (
          <div
            className="border"
            style={{
              backgroundColor: "var(--card)",
              borderColor: "var(--gray-8)",
              borderRadius: "12px",
              padding: "16px",
              margin: "24px 0 0",
            }}
          >
            <p style={{ ...meta, fontSize: "11px", color: "var(--gray-60)", textTransform: "uppercase", letterSpacing: "0.5px", margin: 0 }}>
              {STR.servicios.infoBase}
            </p>
            <div className="flex flex-col gap-1" style={{ marginTop: "6px" }}>
              {/* Cuándo se pidió: faltaba, y es el dato con el que la
                  persona ubica la solicitud cuando llama. */}
              {servicio.creadaEl && (
                <p style={{ ...meta, fontSize: "13px", lineHeight: "19px", color: "var(--gray-80)", margin: 0 }}>
                  {STR.misSolicitudes.solicitadoEl(
                    formatearFechaDiaMesAnio(servicio.creadaEl) ?? "",
                  )}
                </p>
              )}
              {servicio.numeroReserva && (
                <p style={{ ...meta, fontSize: "13px", lineHeight: "19px", color: "var(--gray-80)", margin: 0 }}>
                  {STR.servicios.numeroReserva}:{" "}
                  <span style={{ color: "var(--primary-black)", fontWeight: "var(--font-weight-medium)" }}>
                    {servicio.numeroReserva}
                  </span>
                </p>
              )}
              {servicio.direccionTexto && (
                <p style={{ ...meta, fontSize: "13px", lineHeight: "19px", color: "var(--gray-80)", margin: 0 }}>
                  {STR.servicios.direccion}: {servicio.direccionTexto}
                </p>
              )}
              {servicio.contactoNombre && (
                <p style={{ ...meta, fontSize: "13px", lineHeight: "19px", color: "var(--gray-80)", margin: 0 }}>
                  {STR.servicios.recibe}: {servicio.contactoNombre}
                </p>
              )}
              {servicio.totalEstimado !== undefined && (
                <p style={{ ...meta, fontSize: "13px", lineHeight: "19px", color: "var(--gray-80)", margin: 0 }}>
                  {STR.servicios.totalEstimado}:{" "}
                  <span style={{ color: "var(--primary-black)", fontWeight: "var(--font-weight-medium)" }}>
                    ${servicio.totalEstimado}
                  </span>
                </p>
              )}
              {servicio.notas && (
                <p style={{ ...meta, fontSize: "13px", lineHeight: "19px", color: "var(--gray-80)", margin: 0 }}>
                  {STR.servicios.notas}: {servicio.notas}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Seguimiento: SOLO las etapas alcanzadas (logic/seguimiento.ts).
            Va arriba de las visitas porque cuenta el caso; las visitas son
            el detalle de cada una. */}
        <div style={{ marginTop: "24px" }}>
          <TituloSeguimiento />
          <LineaDeTiempo etapas={seguimientoDelServicio(servicio)} />
        </div>

        {/* Visitas: la próxima se marca dentro de la lista */}
        {servicio.visitas.length > 0 && (
          <>
            <h3
              style={{
                fontFamily: "'Bebas Neue', Arial, sans-serif",
                fontSize: "18px",
                fontWeight: "var(--font-weight-normal)",
                textTransform: "uppercase",
                letterSpacing: "1px",
                color: "var(--primary-black)",
                margin: "24px 0 16px",
              }}
            >
              {STR.servicios.recorrido}
            </h3>

            {/* Avance: solo con dos o más visitas aporta lectura */}
            {textoProgreso && (
              <div style={{ margin: "0 0 14px" }}>
                <p
                  style={{
                    ...meta,
                    fontSize: "11px",
                    color: "var(--gray-60)",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    margin: 0,
                  }}
                >
                  {STR.servicios.resumenAvance}
                </p>
                <p style={{ ...meta, fontSize: "13px", color: "var(--gray-80)", margin: "4px 0 0" }}>
                  {textoProgreso}
                </p>
                {progreso.totalConocido && progreso.total > 0 && (
                  <div aria-hidden="true" style={{ marginTop: "6px" }}>
                    <Progress value={(progreso.realizadas / progreso.total) * 100} />
                  </div>
                )}
              </div>
            )}

            <ListaCitasServicio servicio={servicio} />
          </>
        )}

        {/* Cierre de la pantalla según el momento del servicio */}
        {!enCurso ? (
          <div className="flex flex-col gap-3" style={{ marginTop: "24px" }}>
            {estado === "completado" && (
              <div ref={refCalificacion} style={{ scrollMarginTop: "96px" }}>
                <CalificacionServicio servicioId={servicio.id} tecnicos={tecnicosEvaluados} />
              </div>
            )}
            <div
              className="border"
              style={{
                backgroundColor: "var(--gray-3)",
                borderColor: "var(--gray-8)",
                borderRadius: "12px",
                padding: "16px",
              }}
            >
              <p style={{ ...meta, fontSize: "14px", fontWeight: "var(--font-weight-medium)", color: "var(--primary-black)", margin: 0 }}>
                {STR.servicios.ayudaFinalizadoTitulo}
              </p>
              <p style={{ ...meta, fontSize: "13px", lineHeight: "19px", color: "var(--gray-80)", margin: "4px 0 0" }}>
                {STR.servicios.ayudaFinalizadoDetalle}
              </p>
              <button
                onClick={() => setContactoAbierto(true)}
                className="w-full border transition-all active:scale-[0.99] mt-3"
                style={{
                  height: "44px",
                  backgroundColor: "var(--primary-white)",
                  borderColor: "var(--gray-20)",
                  borderRadius: "12px",
                  ...meta,
                  fontSize: "14px",
                  fontWeight: "var(--font-weight-medium)",
                  color: "var(--primary-black)",
                  cursor: "pointer",
                }}
              >
                {STR.servicios.contactarCta}
              </button>
            </div>
          </div>
        ) : (
          /* Cambios y cancelaciones: fuera de la app, con un canal claro.
             No se muestran botones de reprogramar/cancelar que no funcionan. */
          <div
            className="border"
            style={{
              backgroundColor: "var(--gray-3)",
              borderColor: "var(--gray-8)",
              borderRadius: "12px",
              padding: "16px",
              margin: "24px 0 0",
            }}
          >
            <p style={{ ...meta, fontSize: "14px", fontWeight: "var(--font-weight-medium)", color: "var(--primary-black)", margin: 0 }}>
              {STR.servicios.contactarTitulo}
            </p>
            <p style={{ ...meta, fontSize: "13px", lineHeight: "19px", color: "var(--gray-80)", margin: "4px 0 0" }}>
              {STR.servicios.contactarDetalle}
            </p>
            {/* Reagendar NO reprograma: abre el mismo contacto, que es como
                se cambia una fecha hoy. Solo aparece si hay una cita con
                fecha; sin cita no hay nada que mover. */}
            {sePuedeReagendar({
              activa: true,
              tieneCitaConFecha: Boolean(proximaVisita(servicio)?.visitAt),
            }) && (
              <button
                onClick={() => setContactoAbierto(true)}
                className="w-full border-none transition-all active:scale-[0.99] mt-3"
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
                {STR.seguimiento.reagendar}
              </button>
            )}
            <button
              onClick={() => setContactoAbierto(true)}
              className="w-full border transition-all active:scale-[0.99] mt-3"
              style={{
                height: "44px",
                backgroundColor: "var(--primary-white)",
                borderColor: "var(--gray-20)",
                borderRadius: "12px",
                ...meta,
                fontSize: "14px",
                fontWeight: "var(--font-weight-medium)",
                color: "var(--primary-black)",
                cursor: "pointer",
              }}
            >
              {STR.servicios.contactarCta}
            </button>
            <button
              onClick={() => setCancelarAbierto(true)}
              className="block w-full text-center border-none bg-transparent"
              style={{
                ...meta,
                fontSize: "12px",
                color: "var(--gray-60)",
                textDecoration: "underline",
                marginTop: "10px",
                cursor: "pointer",
              }}
            >
              {STR.servicios.cancelarPregunta}
            </button>
          </div>
        )}
      </section>

      <ContactarMiPRO
        abierto={contactoAbierto}
        onCambio={setContactoAbierto}
        descripcion={!enCurso ? STR.servicios.ayudaFinalizadoDetalle : undefined}
      />
      <ContactarMiPRO
        abierto={cancelarAbierto}
        onCambio={setCancelarAbierto}
        descripcion={STR.servicios.cancelarContactoDetalle}
        linkWhatsApp={linkWhatsAppCancelacion(
          [CURRENT_USER.firstName, CURRENT_USER.lastName].filter(Boolean).join(" "),
          servicio.numeroReserva ?? servicio.id,
        )}
        textoCerrar={STR.servicios.contactarVolver}
      />
    </div>
  );
}
