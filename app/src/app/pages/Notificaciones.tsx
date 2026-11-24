import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Bell, CheckCheck, MoreVertical, Trash2 } from "lucide-react";
import { STR } from "../i18n/strings";
import {
  NotificacionCliente,
  eliminarNotificacion,
  eliminarTodasLasNotificaciones,
  listarNotificaciones,
  marcarLeida,
  marcarTodasLeidas,
  restaurarNotificacion,
} from "../data/notificaciones";
import {
  GrupoFecha,
  agruparNotificaciones,
  encabezadoDeCaso,
  tituloDeNotificacion,
} from "../logic/notificaciones";
import { CLAVE_VISUAL_DE_ESTADO } from "../logic/misSolicitudes";
import { getStatusConfig } from "../utils/statusConfig";
import { formatearFechaCorta, formatearHora } from "../logic/fechas";
import { buscarServicioPorId } from "../data/servicios";
import { buscarReclamoPorId } from "../data/reclamos";
import { HojaAcciones, AccionHoja } from "../components/pago/HojaAcciones";
import { ModalBorrarNotificaciones } from "../components/home/ModalBorrarNotificaciones";

// Bandeja de notificaciones: filas de ancho completo, agrupadas por fecha
// relativa (Hoy / Ayer / Anteriores) y ordenadas de lo más reciente a lo
// más viejo. Abrir una fila navega al caso y la deja leída (persiste al
// volver).
//
// ── Sobre la forma de esta pantalla ──────────────────────────────────
//
// Es un REGISTRO de lo que fue pasando con tus solicitudes, no un catálogo.
// Por eso se compone como un registro y no como una grilla de tarjetas:
// filas a ancho completo separadas por hairlines, y el encabezado de fecha
// con la tipografía de títulos y una regla que corre hasta el borde.
//
// ── Qué dice cada fila, y en qué orden ───────────────────────────────
//
// 1. DE QUÉ CASO HABLA, EN TEXTO: "Servicio · Instalación de aire
//    acondicionado" o "Garantía · Refrigeradora Samsung". Va PRIMERO y
//    dice la palabra completa. Antes esto se insinuaba con un ícono por
//    tipo, y un ícono se interpreta: si tenés dos solicitudes en curso,
//    "Tu cita está programada" sin el nombre del caso no dice nada. El
//    nombre sale de las mismas fuentes a las que la fila ya navega, no de
//    un campo nuevo: si el servicio cambia de nombre, la bandeja lo
//    refleja sola.
//
// 2. EL TÍTULO SEGÚN EL ESTADO, de la matriz cerrada de logic.
//
// 3. EL ESTADO, en un chip con su texto. El color y el ícono salen del
//    mismo lugar que en el historial y en los detalles
//    (CLAVE_VISUAL_DE_ESTADO más getStatusConfig): un estado no puede
//    verse de dos colores según desde dónde se lo mire. Y el chip lleva
//    SIEMPRE su palabra: el color no comunica solo.
//
// 4. FECHA Y HORA. En Hoy y Ayer el grupo ya da el día, así que la fila
//    muestra la hora; en Anteriores, fecha y hora.
//
// 5. LEÍDO O NO LEÍDO, con el punto en su propia columna al borde
//    izquierdo: las filas nuevas forman una columna que se barre de un
//    vistazo. Pegado a la hora se leía como viñeta del horario, que es
//    otra cosa. Además, una fila leída baja TODO un escalón de gris, no
//    solo el peso del título: así la bandeja se vacía a la vista.
//
// No hay chevron: la fila entera es el botón. Una flecha gris repetida
// diez veces no agregaba una affordance que ya estaba y se comía ancho.
//
// ── Las acciones ─────────────────────────────────────────────────────
//
// Van en el menú de tres puntos del encabezado, no sueltas en la lista:
// son acciones sobre la bandeja, no sobre una fila. Cada opción aparece
// solo si tiene sentido, y con la bandeja vacía el menú no aparece: un
// menú de acciones que no se pueden hacer es una puerta a un cuarto vacío.
//
// "Borrar todas" pide confirmación porque no se puede deshacer. Eliminar
// UNA no la pide: se deshace con el botón del aviso de abajo.
export function Notificaciones() {
  const navigate = useNavigate();
  const [notificaciones, setNotificaciones] = useState<
    (NotificacionCliente & { leida: boolean })[]
  >(() => listarNotificaciones());
  const procesando = useRef(false);
  /** Id de la última eliminada, mientras se pueda deshacer. */
  const [eliminada, setEliminada] = useState<string | null>(null);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [confirmarBorrado, setConfirmarBorrado] = useState(false);
  /** Aviso de "borramos todas", que se va solo. */
  const [borradas, setBorradas] = useState(false);

  const meta = { fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif" } as const;

  const hoy = (() => {
    const d = new Date();
    const mes = String(d.getMonth() + 1).padStart(2, "0");
    const dia = String(d.getDate()).padStart(2, "0");
    return `${d.getFullYear()}-${mes}-${dia}`;
  })();

  const grupos = agruparNotificaciones(notificaciones, hoy);
  const sinLeer = notificaciones.filter((n) => !n.leida).length;
  const hayNotificaciones = notificaciones.length > 0;

  /**
   * El nombre del caso del que habla cada fila: el servicio contratado o el
   * producto en garantía.
   *
   * Sale de las MISMAS fuentes a las que la fila ya navega, no de un campo
   * nuevo de la notificación. Se resuelve una vez por render y no por fila,
   * porque cada búsqueda reconstruye la lista entera.
   */
  const casoDe = useMemo(() => {
    const nombres = new Map<string, string>();
    for (const n of notificaciones) {
      if (nombres.has(n.id)) continue;
      if (n.reclamoId) {
        const r = buscarReclamoPorId(n.reclamoId);
        if (r) nombres.set(n.id, r.producto);
      } else if (n.servicioId) {
        const s = buscarServicioPorId(n.servicioId);
        if (s) nombres.set(n.id, s.nombre);
      }
    }
    return nombres;
  }, [notificaciones]);

  const destinoDe = (n: NotificacionCliente): string | null => {
    if (n.reclamoId) return `/reclamos/${n.reclamoId}`;
    if (n.servicioId) return `/servicios/${n.servicioId}`;
    return null;
  };

  // La flecha del detalle vuelve a la bandeja conservando la posición de la
  // lista: se guarda el scroll del contenedor al salir y se restaura al
  // volver. El destino recibe el origen para que su flecha haga history back.
  const raiz = useRef<HTMLDivElement>(null);
  const CLAVE_SCROLL = "mipro-notificaciones-scroll";

  // El "Deshacer" dura 6 segundos: lo suficiente para arrepentirse, no
  // tanto como para quedar tapando la lista.
  useEffect(() => {
    if (!eliminada) return;
    const t = window.setTimeout(() => setEliminada(null), 6000);
    return () => window.clearTimeout(t);
  }, [eliminada]);

  useEffect(() => {
    if (!borradas) return;
    const t = window.setTimeout(() => setBorradas(false), 4000);
    return () => window.clearTimeout(t);
  }, [borradas]);

  useEffect(() => {
    try {
      const guardado = sessionStorage.getItem(CLAVE_SCROLL);
      if (guardado && raiz.current?.parentElement) {
        raiz.current.parentElement.scrollTop = Number(guardado);
        sessionStorage.removeItem(CLAVE_SCROLL);
      }
    } catch {
      // Sin storage: la lista vuelve arriba, nada más.
    }
  }, []);

  const abrir = (n: NotificacionCliente) => {
    const destino = destinoDe(n);
    if (!destino || procesando.current) return;
    procesando.current = true;
    marcarLeida(n.id);
    setNotificaciones(listarNotificaciones());
    try {
      const scroll = raiz.current?.parentElement?.scrollTop ?? 0;
      sessionStorage.setItem(CLAVE_SCROLL, String(scroll));
    } catch {
      // Sin storage: al volver, la lista arranca arriba.
    }
    navigate(destino, { state: { desdeNotificaciones: true } });
    setTimeout(() => {
      procesando.current = false;
    }, 600);
  };

  // Eliminar una no pide confirmación: es de bajo riesgo y se puede
  // deshacer. La que sí la pide es vaciar la bandeja entera.
  const eliminar = (n: NotificacionCliente) => {
    eliminarNotificacion(n.id);
    setNotificaciones(listarNotificaciones());
    setEliminada(n.id);
  };

  const deshacerEliminar = () => {
    if (!eliminada) return;
    restaurarNotificacion(eliminada);
    setNotificaciones(listarNotificaciones());
    setEliminada(null);
  };

  const marcarTodas = () => {
    marcarTodasLeidas();
    setNotificaciones(listarNotificaciones());
    setMenuAbierto(false);
  };

  const borrarTodas = () => {
    eliminarTodasLasNotificaciones();
    setNotificaciones(listarNotificaciones());
    setConfirmarBorrado(false);
    setEliminada(null);
    setBorradas(true);
  };

  const etiquetaGrupo: Record<GrupoFecha, string> = {
    hoy: STR.notificaciones.grupoHoy,
    ayer: STR.notificaciones.grupoAyer,
    anteriores: STR.notificaciones.grupoAnteriores,
  };

  /**
   * Fecha y hora de la fila.
   *
   * En Hoy y Ayer el encabezado del grupo ya dice el día: repetirlo en cada
   * fila es ruido, así que va solo la hora. En Anteriores hace falta el día,
   * y entonces van los dos.
   */
  const cuando = (n: NotificacionCliente, grupo: GrupoFecha): string => {
    const hora = formatearHora(n.fecha) ?? "";
    if (grupo !== "anteriores") return hora;
    const fecha = formatearFechaCorta(n.fecha) ?? "";
    return hora ? `${fecha}, ${hora}` : fecha;
  };

  const fila = (
    n: NotificacionCliente & { leida: boolean },
    grupo: GrupoFecha,
    i: number,
  ) => {
    const caso = casoDe.get(n.id);
    const encabezado = caso ? encabezadoDeCaso(n.tipoCaso, caso) : null;
    const titulo = tituloDeNotificacion(n.tipoCaso, n.estado);
    const visual = getStatusConfig(CLAVE_VISUAL_DE_ESTADO[n.estado]);
    const IconoEstado = visual.icon;
    // Intensidad, de menor a mayor: leída, sin leer. Una fila leída baja
    // TODO un escalón de gris, no solo el peso del título.
    const colorTitulo = n.leida ? "var(--gray-80)" : "var(--primary-black)";
    const colorCaso = n.leida ? "var(--gray-40)" : "var(--gray-60)";

    return (
      // La fila es un contenedor con DOS controles: abrir y eliminar. Un
      // botón adentro de otro botón no es HTML válido, así que la zona que
      // abre es su propio botón y la papelera es otro, al lado.
      <div
        key={n.id}
        className="flex items-stretch"
        style={{
          borderTop: i > 0 ? "1px solid var(--gray-8)" : "none",
          // Lo no leído se sombrea de amarillo, con la barra al borde. Va en
          // el contenedor y no en el botón de abrir para que el sombreado
          // llegue hasta la papelera y la fila se lea como una sola pieza.
          backgroundColor: n.leida ? "transparent" : "var(--amarillo-sin-leer)",
          boxShadow: n.leida ? undefined : "inset 3px 0 0 var(--primary-yellow)",
        }}
      >
        <button
          onClick={() => abrir(n)}
          aria-label={`${n.leida ? "" : `${STR.notificaciones.noLeida}. `}${encabezado ? `${encabezado}. ` : ""}${titulo}. ${n.estado}. ${cuando(n, grupo)}`}
          className="flex-1 min-w-0 text-left transition-colors active:bg-[var(--gray-3)]"
          style={{
            display: "grid",
            // Dos columnas: el punto de no leída tiene la suya al borde y el
            // texto se queda con todo lo que sobra. Sin chevron: la zona
            // entera es el botón.
            gridTemplateColumns: "8px 1fr",
            columnGap: "10px",
            alignItems: "start",
            padding: "14px 4px 14px 24px",
            minHeight: "44px",
            border: "none",
            background: "none",
            cursor: "pointer",
          }}
        >
          {/* Punto de no leída, en su propia columna. */}
          <span
            aria-hidden="true"
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              marginTop: "6px",
              backgroundColor: n.leida ? "transparent" : "var(--primary-black)",
            }}
          />

          <span className="min-w-0">
            {/* De qué caso habla, en texto y con la palabra completa:
                "Servicio · ..." o "Garantía · ...". Va primero porque es lo
                que ubica a la notificación. */}
            {encabezado && (
              <span
                className="block truncate"
                style={{
                  ...meta,
                  fontSize: "12px",
                  lineHeight: "17px",
                  color: colorCaso,
                }}
              >
                {encabezado}
              </span>
            )}

            <span className="flex items-baseline gap-2" style={{ marginTop: encabezado ? "3px" : 0 }}>
              <span
                className="flex-1 min-w-0 line-clamp-2"
                style={{
                  ...meta,
                  fontSize: "15px",
                  lineHeight: "20px",
                  fontWeight: n.leida
                    ? "var(--font-weight-normal)"
                    : "var(--font-weight-medium)",
                  color: colorTitulo,
                }}
              >
                {titulo}
              </span>
              <span
                className="flex-shrink-0"
                style={{ ...meta, fontSize: "12px", color: "var(--gray-40)" }}
              >
                {cuando(n, grupo)}
              </span>
            </span>

            {/* El estado, con su palabra. El color acompaña, no informa
                solo: mismo chip que el historial y los detalles. */}
            <span
              className="inline-flex items-center"
              style={{
                gap: "5px",
                marginTop: "7px",
                padding: "3px 8px",
                borderRadius: "999px",
                backgroundColor: visual.bg,
              }}
            >
              <IconoEstado size={12} strokeWidth={2.5} color={visual.color} aria-hidden="true" />
              <span
                style={{
                  ...meta,
                  fontSize: "12px",
                  lineHeight: "16px",
                  fontWeight: "var(--font-weight-medium)",
                  color: visual.color,
                }}
              >
                {n.estado}
              </span>
            </span>
          </span>
        </button>

        {/* Eliminar: 44 de ancho, alineada con la primera línea del texto.
            Se puede deshacer, así que no pide confirmación. */}
        <button
          type="button"
          onClick={() => eliminar(n)}
          aria-label={STR.notificaciones.eliminar(titulo)}
          className="flex justify-center border-none bg-transparent shrink-0 transition-opacity active:opacity-60"
          style={{ width: "44px", paddingTop: "15px", alignItems: "flex-start", cursor: "pointer" }}
        >
          <Trash2 size={16} strokeWidth={2} color="var(--gray-40)" aria-hidden="true" />
        </button>
      </div>
    );
  };

  return (
    <div
      ref={raiz}
      className="flex flex-col"
      // El alto completo del marco, siempre: es lo que le deja al vacío un
      // espacio real donde centrarse. Sin esto la columna mide lo que mide
      // su contenido y el vacío queda colgado arriba.
      style={{ backgroundColor: "var(--primary-white)", minHeight: "100%" }}
    >
      <header
        className="flex items-center gap-3 px-6 pt-[20px] pb-4 bg-white sticky top-0 z-20"
        style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}
      >
        <button
          onClick={() => navigate(-1)}
          aria-label={STR.notificaciones.volver}
          className="w-11 h-11 rounded-[10px] flex items-center justify-center transition-opacity hover:opacity-80 border flex-shrink-0"
          style={{
            backgroundColor: "var(--primary-white)",
            borderColor: "var(--gray-20)",
            cursor: "pointer",
          }}
        >
          <ArrowLeft size={20} strokeWidth={2} color="var(--primary-black)" aria-hidden="true" />
        </button>
        <h1
          className="truncate flex-1"
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
          {STR.notificaciones.titulo}
        </h1>

        {/* El menú solo existe si hay algo sobre lo que actuar. */}
        {hayNotificaciones && (
          <button
            type="button"
            onClick={() => setMenuAbierto(true)}
            aria-label={STR.notificaciones.acciones}
            aria-haspopup="dialog"
            className="w-11 h-11 rounded-[10px] flex items-center justify-center transition-opacity hover:opacity-80 border-none bg-transparent flex-shrink-0"
            style={{ cursor: "pointer" }}
          >
            <MoreVertical size={20} strokeWidth={2} color="var(--primary-black)" aria-hidden="true" />
          </button>
        )}
      </header>

      <section className={hayNotificaciones ? "pb-8" : "pb-8 flex-1 flex"}>
        {/* El contador: solo con pendientes. Con la bandeja al día no hay
            nada que contar, y "0 notificaciones sin leer" es ruido. */}
        {sinLeer > 0 && (
          <div
            className="px-6"
            style={{ paddingTop: "12px", paddingBottom: "2px" }}
          >
            <span
              className="block truncate"
              style={{
                ...meta,
                fontSize: "13px",
                fontWeight: "var(--font-weight-medium)",
                color: "var(--primary-black)",
              }}
            >
              {STR.notificaciones.sinLeer(sinLeer)}
            </span>
          </div>
        )}

        {!hayNotificaciones ? (
          // El vacío de la bandeja: la campana del sistema a 48, el título
          // y una frase que dice qué esperar. Centrado en el espacio que
          // sobra, sin tarjeta y sin botón: una bandeja vacía no es un
          // callejón ni una falla, es que está todo al día. No hay nada que
          // ir a hacer, así que no hay CTA.
          <div
            role="status"
            className="flex-1 flex flex-col items-center justify-center text-center px-6"
          >
            <Bell size={48} strokeWidth={1.5} color="var(--gray-40)" aria-hidden="true" />
            <h2
              style={{
                fontFamily: "'Bebas Neue', Arial, sans-serif",
                fontSize: "20px",
                letterSpacing: "1px",
                textTransform: "uppercase",
                color: "var(--primary-black)",
                margin: "16px 0 0",
              }}
            >
              {STR.notificaciones.vacioTitulo}
            </h2>
            <p
              style={{
                ...meta,
                fontSize: "14px",
                lineHeight: "20px",
                color: "var(--gray-60)",
                margin: "8px 0 0",
                maxWidth: "32ch",
              }}
            >
              {STR.notificaciones.vacioTexto}
            </p>
          </div>
        ) : (
          <div className="flex flex-col">
            {grupos.map(({ grupo, items }, iGrupo) => (
              <div key={grupo}>
                {/* Encabezado de fecha: tipografía de títulos y una regla
                    que corre hasta el borde. Marca el corte sin encerrar
                    nada. */}
                <div
                  className="flex items-center gap-3 px-6"
                  // Sin la línea del contador arriba (bandeja toda leída),
                  // el primer grupo necesita su propio aire.
                  style={{
                    paddingTop: iGrupo === 0 ? (sinLeer > 0 ? "14px" : "18px") : "26px",
                    paddingBottom: "8px",
                  }}
                >
                  <h2
                    style={{
                      fontFamily: "'Bebas Neue', Arial, sans-serif",
                      fontSize: "16px",
                      fontWeight: "var(--font-weight-normal)",
                      letterSpacing: "1px",
                      textTransform: "uppercase",
                      color: "var(--primary-black)",
                      margin: 0,
                    }}
                  >
                    {etiquetaGrupo[grupo]}
                  </h2>
                  <span
                    aria-hidden="true"
                    className="flex-1"
                    style={{ height: "1px", backgroundColor: "var(--gray-8)" }}
                  />
                </div>
                <div style={{ borderTop: "1px solid var(--gray-8)" }}>
                  {items.map((n, i) => fila(n, grupo, i))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Menú de la bandeja. Marcar todas aparece solo con pendientes; si no
          hay, se muestra el estado en vez de una opción que no hace nada. */}
      <HojaAcciones
        abierto={menuAbierto}
        onCerrar={() => setMenuAbierto(false)}
        titulo={STR.notificaciones.accionesTitulo}
      >
        {sinLeer > 0 ? (
          <AccionHoja
            icono={<CheckCheck size={20} strokeWidth={2} color="var(--primary-black)" />}
            texto={STR.notificaciones.marcarTodas}
            onAccion={marcarTodas}
          />
        ) : (
          <AccionHoja
            icono={<CheckCheck size={20} strokeWidth={2} color="var(--gray-60)" />}
            texto={STR.notificaciones.todasLeidas}
            tono="estado"
          />
        )}
        <AccionHoja
          icono={<Trash2 size={20} strokeWidth={2} color="var(--error-red)" />}
          texto={STR.notificaciones.borrarTodas}
          tono="destructivo"
          onAccion={() => {
            setMenuAbierto(false);
            setConfirmarBorrado(true);
          }}
        />
      </HojaAcciones>

      <ModalBorrarNotificaciones
        abierto={confirmarBorrado}
        onCerrar={() => setConfirmarBorrado(false)}
        onBorrar={borrarTodas}
      />

      {/* El "Deshacer": aparece abajo, encima del contenido, y se va solo.
          Es lo que reemplaza a un "¿Estás seguro?" para una acción chica:
          en vez de frenar antes, se puede volver atrás después. */}
      {(eliminada || borradas) && (
        <div
          role="status"
          className="fixed left-0 right-0 flex justify-center px-4"
          style={{ bottom: "calc(16px + env(safe-area-inset-bottom))", zIndex: 40 }}
        >
          <div
            className="flex items-center"
            style={{
              gap: "16px",
              maxWidth: "100%",
              padding: "10px 12px 10px 16px",
              borderRadius: "12px",
              backgroundColor: "var(--primary-black)",
              boxShadow: "0 6px 20px rgba(0, 0, 0, 0.18)",
            }}
          >
            <span
              style={{
                ...meta,
                fontSize: "13px",
                lineHeight: "19px",
                color: "var(--primary-white)",
              }}
            >
              {eliminada ? STR.notificaciones.eliminada : STR.notificaciones.borradas}
            </span>
            {/* Borrar todas no se deshace, así que ese aviso no lleva botón. */}
            {eliminada && (
              <button
                type="button"
                onClick={deshacerEliminar}
                className="border-none bg-transparent shrink-0"
                style={{
                  ...meta,
                  minHeight: "36px",
                  padding: "0 4px",
                  fontSize: "13px",
                  fontWeight: "var(--font-weight-medium)",
                  color: "var(--primary-yellow)",
                  cursor: "pointer",
                }}
              >
                {STR.notificaciones.deshacer}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
