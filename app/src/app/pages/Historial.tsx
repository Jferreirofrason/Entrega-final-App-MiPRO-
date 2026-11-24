import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import {
  ArrowLeft,
  ChevronRight,
  ClipboardList,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Wrench,
  X,
} from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { Skeleton } from "../components/ui/skeleton";
import { BloqueError } from "../components/home/BloqueError";
import { HojaDeFiltrosHistorial } from "../components/historial/HojaDeFiltrosHistorial";
import { STR } from "../i18n/strings";
import { getStatusConfig } from "../utils/statusConfig";
import { formatearCitaDeListado, formatearFechaDiaMesAnio } from "../logic/fechas";
import { cargarMisSolicitudes } from "../data/misSolicitudes";
import { leerEscenarioServicios } from "../data/servicios";
import { leerEscenarioReclamos } from "../data/reclamos";
import {
  aplicarFiltros,
  filtrosDesdeLaDireccion,
  filtrosPuestos,
  listarHistorial,
  quitarFiltro,
  SIN_FILTROS,
  CLAVE_VISUAL_DE_ESTADO,
  type FiltroPuesto,
  type FiltrosDeHistorial,
  type SolicitudUnificada,
} from "../logic/misSolicitudes";

type Fase = "cargando" | "error" | "ok";

const meta = { fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif" } as const;

// Historial de solicitudes: servicios y garantías en una sola lista.
//
// ── Dónde vive, y por qué ────────────────────────────────────────────
//
// NO es un sexto tab. La barra ya tiene cinco (Inicio, Servicios,
// Productos, Garantía, Perfil) y a 390 px cada uno mide 78: un sexto deja
// las etiquetas por debajo de lo legible y los targets por debajo de 44.
//
// Vive adentro de Perfil, que es donde se consulta "lo mío", y tiene
// accesos directos desde los dos módulos donde la persona mira el
// seguimiento más seguido:
//
//   Perfil → Historial de solicitudes        #/historial
//   Inicio → Mis servicios, "Ver todos"      #/historial?tipo=servicios
//   Garantía → "Ver todos"                   #/historial?tipo=garantias
//
// El tab encendido acompaña a la puerta por la que se entró (ver
// logic/tabs.ts): entrar desde Garantía y ver "Perfil" marcado se lee como
// si la app te hubiera cambiado de sección sin avisar.
//
// ── Qué NO hace ──────────────────────────────────────────────────────
//
// No duplica datos ni detalle: lee los servicios y los casos de garantía
// que la app ya tiene y cada fila abre el detalle que ya existe
// (/servicios/:id, /reclamos/:id). Esta pantalla es una PUERTA.
export function Historial() {
  const navigate = useNavigate();
  const location = useLocation();
  const [fase, setFase] = useState<Fase>("cargando");
  const [sinConexion, setSinConexion] = useState(false);
  const [solicitudes, setSolicitudes] = useState<SolicitudUnificada[]>([]);
  const [intento, setIntento] = useState(0);
  const [termino, setTermino] = useState("");
  const [filtros, setFiltros] = useState<FiltrosDeHistorial>(() =>
    filtrosDesdeLaDireccion(location.search),
  );
  const [panelAbierto, setPanelAbierto] = useState(false);

  // Los escenarios de QA de las dos fuentes siguen funcionando: esta
  // pantalla los lee de la misma dirección (?servicios= y ?reclamos=).
  useEffect(() => {
    let cancelado = false;
    setFase("cargando");
    cargarMisSolicitudes(
      leerEscenarioServicios(location.search),
      leerEscenarioReclamos(location.search),
    )
      .then((data) => {
        if (cancelado) return;
        setSolicitudes(data);
        setFase("ok");
      })
      .catch((e: unknown) => {
        if (cancelado) return;
        setSinConexion(e instanceof Error && e.message === "sin-conexion");
        setFase("error");
      });
    return () => {
      cancelado = true;
    };
  }, [location.search, intento]);

  // Los accesos contextuales entran con su recorte puesto.
  useEffect(() => {
    setFiltros(filtrosDesdeLaDireccion(location.search));
  }, [location.search]);

  const puestos = useMemo(() => filtrosPuestos(filtros), [filtros]);
  const visibles = useMemo(
    () => listarHistorial(solicitudes, filtros, termino),
    [solicitudes, filtros, termino],
  );
  // Lo que recortan los filtros SIN la búsqueda: es lo que cuenta el panel,
  // porque adentro del panel no se está escribiendo en el buscador.
  const cuantasConFiltros = useMemo(
    () => aplicarFiltros(solicitudes, filtros).length,
    [solicitudes, filtros],
  );

  const textoDeFiltro = (puesto: FiltroPuesto): string => {
    if (puesto.dimension === "estado") {
      return puesto.valor === "activos"
        ? STR.misSolicitudes.filtroActivos
        : STR.misSolicitudes.filtroFinalizados;
    }
    return puesto.valor === "servicio"
      ? STR.misSolicitudes.filtroServicios
      : STR.misSolicitudes.filtroGarantias;
  };

  const skeletons = (
    <div
      role="status"
      aria-label={STR.misSolicitudes.cargando}
      aria-busy="true"
      className="flex flex-col"
      style={{ gap: "10px" }}
    >
      {[0, 1, 2, 3].map((n) => (
        <div
          key={n}
          className="flex"
          style={{
            gap: "12px",
            padding: "12px",
            borderRadius: "14px",
            border: "1px solid var(--gray-8)",
            backgroundColor: "var(--card)",
          }}
        >
          <Skeleton
            className="shrink-0"
            style={{ width: "56px", height: "56px", borderRadius: "10px", backgroundColor: "var(--gray-8)" }}
          />
          <div className="flex-1">
            <Skeleton className="h-3 w-16" style={{ backgroundColor: "var(--gray-8)" }} />
            <Skeleton className="h-4 w-3/4 mt-2" style={{ backgroundColor: "var(--gray-8)" }} />
            <Skeleton className="h-3 w-1/2 mt-2" style={{ backgroundColor: "var(--gray-8)" }} />
          </div>
        </div>
      ))}
    </div>
  );

  const vacio = (titulo: string, texto: string, conAccion = false) => (
    <div
      className="flex flex-col items-center text-center"
      style={{
        gap: "10px",
        padding: "28px 18px",
        borderRadius: "16px",
        border: "1px solid var(--gray-8)",
        backgroundColor: "var(--card)",
      }}
    >
      <div
        className="flex items-center justify-center"
        style={{ width: "48px", height: "48px", borderRadius: "12px", backgroundColor: "var(--gray-3)" }}
      >
        <ClipboardList size={22} strokeWidth={2} color="var(--gray-60)" aria-hidden="true" />
      </div>
      <h2
        style={{
          fontFamily: "'Bebas Neue', Arial, sans-serif",
          fontSize: "20px",
          letterSpacing: "1px",
          textTransform: "uppercase",
          color: "var(--primary-black)",
          margin: 0,
        }}
      >
        {titulo}
      </h2>
      <p style={{ ...meta, fontSize: "14px", lineHeight: "20px", color: "var(--gray-60)", margin: 0, maxWidth: "32ch" }}>
        {texto}
      </p>
      {/* Sin solicitudes, la salida es pedir una: es la acción que ofrecía
          "Mis Citas" y lo único suyo que no estaba acá. En "sin resultados"
          no va: ahí la salida es cambiar el filtro, no ir a otro lado. */}
      {conAccion && (
        <button
          type="button"
          onClick={() => navigate("/catalogo")}
          className="border transition-transform active:scale-[0.99]"
          style={{
            ...meta,
            minHeight: "44px",
            marginTop: "4px",
            padding: "0 16px",
            borderRadius: "10px",
            borderColor: "var(--gray-20)",
            backgroundColor: "var(--primary-white)",
            fontSize: "14px",
            fontWeight: "var(--font-weight-medium)",
            color: "var(--primary-black)",
            cursor: "pointer",
          }}
        >
          {STR.misSolicitudes.vacioAccion}
        </button>
      )}
    </div>
  );

  const fila = (s: SolicitudUnificada) => {
    const visual = getStatusConfig(CLAVE_VISUAL_DE_ESTADO[s.estado]);
    const Icono = s.tipo === "servicio" ? Wrench : ShieldCheck;
    const creada = formatearFechaDiaMesAnio(s.creadaEl);
    const cita = formatearCitaDeListado(s.citaAt, s.citaFinAt);

    return (
      <button
        key={`${s.tipo}-${s.id}`}
        type="button"
        onClick={() => navigate(s.ruta, { state: { desdeHistorial: true } })}
        aria-label={STR.misSolicitudes.verDetalle(s.titulo)}
        className="w-full text-left flex items-start transition-colors active:bg-[var(--gray-3)]"
        style={{
          gap: "12px",
          padding: "12px",
          borderRadius: "14px",
          border: "1px solid var(--gray-8)",
          backgroundColor: "var(--card)",
          cursor: "pointer",
        }}
      >
        {/* Un servicio tiene foto del catálogo; una garantía habla de un
            producto de la persona, del que no hay foto. Sin foto, el
            respaldo con el ícono del tipo: nunca una imagen rota. */}
        {s.imagen ? (
          <ImageWithFallback
            src={s.imagen}
            alt=""
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "10px",
              objectFit: "cover",
              backgroundColor: "var(--gray-3)",
              flexShrink: 0,
            }}
          />
        ) : (
          <div
            aria-hidden="true"
            className="flex items-center justify-center shrink-0"
            style={{ width: "56px", height: "56px", borderRadius: "10px", backgroundColor: "var(--gray-3)" }}
          >
            <Icono size={20} strokeWidth={2} color="var(--gray-60)" />
          </div>
        )}

        <div className="flex flex-col flex-1 min-w-0" style={{ gap: "2px" }}>
          <span
            style={{
              ...meta,
              fontSize: "11px",
              fontWeight: "var(--font-weight-medium)",
              letterSpacing: "0.5px",
              textTransform: "uppercase",
              color: "var(--gray-60)",
            }}
          >
            {s.tipo === "servicio"
              ? STR.misSolicitudes.tipoServicio
              : STR.misSolicitudes.tipoGarantia}
          </span>

          <span
            className="line-clamp-2"
            style={{
              ...meta,
              fontSize: "15px",
              lineHeight: "20px",
              fontWeight: "var(--font-weight-medium)",
              color: "var(--primary-black)",
            }}
          >
            {s.titulo}
          </span>

          {s.numero && (
            <span style={{ ...meta, fontSize: "13px", lineHeight: "18px", color: "var(--gray-60)" }}>
              {STR.misSolicitudes.numero(s.numero)}
            </span>
          )}

          {/* El estado principal del CASO. El técnico no va acá: pertenece a
              una visita puntual y se ve en el detalle. */}
          <span
            className="self-start inline-flex items-center"
            style={{
              ...meta,
              gap: "5px",
              marginTop: "4px",
              padding: "3px 8px",
              borderRadius: "6px",
              backgroundColor: visual.bg,
              fontSize: "12px",
              fontWeight: "var(--font-weight-medium)",
              color: visual.color,
            }}
          >
            <visual.icon size={12} strokeWidth={2.4} aria-hidden="true" />
            {s.estado}
          </span>

          {creada && (
            <span style={{ ...meta, fontSize: "12px", lineHeight: "17px", color: "var(--gray-60)", marginTop: "4px" }}>
              {STR.misSolicitudes.solicitadoEl(creada)}
            </span>
          )}
          {/* Sin cita no se dibuja una línea vacía. */}
          {cita && (
            <span
              style={{
                ...meta,
                fontSize: "12px",
                lineHeight: "17px",
                fontWeight: "var(--font-weight-medium)",
                color: "var(--primary-black)",
              }}
            >
              {STR.misSolicitudes.proximaCita(cita)}
            </span>
          )}
        </div>

        <ChevronRight
          size={16}
          strokeWidth={2}
          color="var(--gray-40)"
          className="shrink-0"
          style={{ marginTop: "20px" }}
          aria-hidden="true"
        />
      </button>
    );
  };

  const listado = () => {
    if (fase === "cargando") return skeletons;
    if (fase === "error") {
      return (
        <BloqueError
          mensaje={`${STR.misSolicitudes.error} ${
            sinConexion ? STR.misSolicitudes.sinConexion : ""
          }`.trim()}
          reintentarTexto={STR.misSolicitudes.reintentar}
          onReintentar={() => setIntento((n) => n + 1)}
        />
      );
    }
    // No tener solicitudes es un estado de la cuenta; no encontrar nada es
    // el resultado de un filtro o de una búsqueda. No son el mismo vacío.
    if (solicitudes.length === 0) {
      return vacio(STR.misSolicitudes.vacioTitulo, STR.misSolicitudes.vacioTexto, true);
    }
    if (visibles.length === 0) {
      return vacio(
        STR.misSolicitudes.sinResultadosTitulo,
        STR.misSolicitudes.sinResultadosTexto,
      );
    }
    return (
      <div className="flex flex-col" style={{ gap: "10px" }}>
        {visibles.map(fila)}
      </div>
    );
  };

  return (
    <div className="flex flex-col" style={{ backgroundColor: "var(--primary-white)" }}>
      <header
        className="flex items-center gap-3 px-6 pt-[20px] pb-4 bg-white sticky top-0 z-20"
        style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}
      >
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label={STR.misSolicitudes.volver}
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
          {STR.misSolicitudes.titulo}
        </h1>
      </header>

      <div className="flex flex-col px-6 pt-4 pb-6" style={{ gap: "16px" }}>
        <div className="flex flex-col" style={{ gap: "10px" }}>
          <div className="flex items-center" style={{ gap: "8px" }}>
            <div
              className="flex items-center flex-1 min-w-0"
              style={{
                gap: "8px",
                height: "44px",
                borderRadius: "10px",
                border: termino ? "1px solid var(--primary-yellow)" : "1px solid var(--gray-8)",
                backgroundColor: "var(--gray-3)",
                padding: "8px 14px",
              }}
            >
              <Search size={18} strokeWidth={2} color="var(--gray-60)" style={{ flexShrink: 0 }} aria-hidden="true" />
              <input
                type="search"
                aria-label={STR.misSolicitudes.etiquetaBusqueda}
                placeholder={STR.misSolicitudes.buscar}
                value={termino}
                onChange={(e) => setTermino(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none min-w-0"
                style={{ ...meta, fontSize: "14px", color: "var(--foreground)" }}
              />
              {termino.length > 0 && (
                <button
                  type="button"
                  onClick={() => setTermino("")}
                  aria-label={STR.misSolicitudes.borrarBusqueda}
                  className="flex items-center justify-center border-none shrink-0"
                  style={{
                    width: "24px",
                    height: "24px",
                    borderRadius: "50%",
                    backgroundColor: "var(--gray-20)",
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  <X size={13} strokeWidth={2.5} color="var(--primary-black)" aria-hidden="true" />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => setPanelAbierto(true)}
              aria-label={
                puestos.length > 0
                  ? STR.misSolicitudes.abrirFiltrosCon(puestos.length)
                  : STR.misSolicitudes.abrirFiltros
              }
              aria-expanded={panelAbierto}
              className="flex items-center justify-center border shrink-0 transition-transform active:scale-[0.97]"
              style={{
                ...meta,
                gap: "6px",
                width: puestos.length > 0 ? "auto" : "44px",
                paddingInline: puestos.length > 0 ? "12px" : "0",
                height: "44px",
                borderRadius: "10px",
                borderColor: puestos.length > 0 ? "var(--primary-yellow)" : "var(--gray-8)",
                backgroundColor: puestos.length > 0 ? "var(--primary-yellow)" : "var(--gray-3)",
                cursor: "pointer",
              }}
            >
              <SlidersHorizontal
                size={18}
                strokeWidth={2}
                color={puestos.length > 0 ? "var(--primary-black)" : "var(--gray-60)"}
                aria-hidden="true"
              />
              {puestos.length > 0 && (
                <span
                  aria-hidden="true"
                  style={{
                    ...meta,
                    fontSize: "13px",
                    fontWeight: "var(--font-weight-medium)",
                    color: "var(--primary-black)",
                  }}
                >
                  {puestos.length}
                </span>
              )}
            </button>
          </div>

          {/* Lo que quedó puesto, cada uno con su X. Sin filtros no se
              dibuja nada: un chip de "todos" encendido no recorta. */}
          {puestos.length > 0 && (
            <div
              role="group"
              aria-label={STR.misSolicitudes.etiquetaFiltros}
              className="flex overflow-x-auto scrollbar-hide"
              style={{
                gap: "8px",
                scrollbarWidth: "none",
                marginInline: "-24px",
                paddingInline: "24px",
              }}
            >
              {puestos.map((puesto) => {
                const texto = textoDeFiltro(puesto);
                return (
                  <button
                    key={`${puesto.dimension}:${puesto.valor}`}
                    type="button"
                    onClick={() => setFiltros((f) => quitarFiltro(f, puesto))}
                    aria-label={STR.misSolicitudes.quitarFiltro(texto)}
                    className="flex items-center whitespace-nowrap border-none shrink-0"
                    style={{
                      ...meta,
                      gap: "6px",
                      minHeight: "36px",
                      padding: "0 10px 0 14px",
                      borderRadius: "999px",
                      backgroundColor: "var(--primary-yellow)",
                      fontSize: "13px",
                      fontWeight: "var(--font-weight-medium)",
                      color: "var(--primary-black)",
                      cursor: "pointer",
                    }}
                  >
                    {texto}
                    <X size={14} strokeWidth={2.5} color="var(--primary-black)" aria-hidden="true" />
                  </button>
                );
              })}
              {puestos.length > 1 && (
                <button
                  type="button"
                  onClick={() => setFiltros(SIN_FILTROS)}
                  className="whitespace-nowrap border-none bg-transparent shrink-0"
                  style={{
                    ...meta,
                    minHeight: "36px",
                    padding: "0 4px",
                    fontSize: "13px",
                    fontWeight: "var(--font-weight-medium)",
                    color: "var(--info-blue)",
                    cursor: "pointer",
                  }}
                >
                  {STR.misSolicitudes.limpiarFiltros}
                </button>
              )}
            </div>
          )}
        </div>

        {listado()}
      </div>

      <HojaDeFiltrosHistorial
        abierto={panelAbierto}
        onCerrar={() => setPanelAbierto(false)}
        filtros={filtros}
        onCambiar={setFiltros}
        cuantasQuedan={cuantasConFiltros}
      />
    </div>
  );
}
