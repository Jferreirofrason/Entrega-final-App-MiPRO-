import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { CalendarDays, ChevronRight, Info } from "lucide-react";
import { Skeleton } from "../ui/skeleton";
import { STR } from "../../i18n/strings";
import { CitaHome, elegirCitaMasReciente, debeMostrarVerMas } from "../../logic/citas";
import { cargarCitasHome, leerEscenario } from "../../data/citas";
import { irAlListadoDeCitas, irAlCatalogo } from "../../lib/navegacion";
import { TituloSeccion } from "./TituloSeccion";
import { CitaCard } from "./CitaCard";
import { BloqueError } from "./BloqueError";

type Fase = "cargando" | "error" | "ok";

// Sección "Mis Citas" del Home: muestra solamente la cita más reciente.
// Con dos o más citas aparece "Ver más" hacia el listado completo
// (/proyectos, pantalla existente). Sin citas, el estado vacío invita a
// agendar el primer servicio.
export function SeccionMisCitas() {
  const navigate = useNavigate();
  const location = useLocation();
  const [fase, setFase] = useState<Fase>("cargando");
  const [citas, setCitas] = useState<CitaHome[]>([]);
  const [aviso, setAviso] = useState<string | null>(null);
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    let cancelado = false;
    const { escenario, estadoDemo } = leerEscenario(location.search);
    setFase("cargando");
    cargarCitasHome(escenario, estadoDemo)
      .then((data) => {
        if (cancelado) return;
        setCitas(data);
        setFase("ok");
      })
      .catch(() => {
        if (!cancelado) setFase("error");
      });
    return () => {
      cancelado = true;
    };
  }, [location.search, intento]);

  const onAgendar = useCallback(() => {
    const navego = irAlCatalogo(navigate);
    if (!navego) setAviso(STR.buscador.catalogoPendiente);
  }, [navigate]);

  const citaReciente = elegirCitaMasReciente(citas);
  const mostrarVerMas = fase === "ok" && debeMostrarVerMas(citas.length);

  return (
    <section aria-labelledby="titulo-mis-citas">
      <TituloSeccion
        id="titulo-mis-citas"
        accion={
          mostrarVerMas ? (
            <button
              onClick={() => irAlListadoDeCitas(navigate)}
              className="flex items-center gap-0.5 -mr-2 px-2"
              style={{
                minHeight: "44px",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif",
                fontSize: "13px",
                fontWeight: "var(--font-weight-medium)",
                color: "var(--primary-black)",
              }}
            >
              {STR.misCitas.verMas}
              <ChevronRight size={16} strokeWidth={2} aria-hidden="true" />
            </button>
          ) : undefined
        }
      >
        {STR.misCitas.titulo}
      </TituloSeccion>

      {fase === "cargando" && (
        <div
          role="status"
          aria-label={STR.misCitas.cargando}
          aria-busy="true"
          className="border"
          style={{
            backgroundColor: "var(--card)",
            borderColor: "var(--gray-8)",
            borderRadius: "16px",
            padding: "16px",
          }}
        >
          <Skeleton className="h-6 w-28 rounded-full" style={{ backgroundColor: "var(--gray-8)" }} />
          <Skeleton className="h-5 w-2/3 mt-3" style={{ backgroundColor: "var(--gray-8)" }} />
          <Skeleton className="h-4 w-1/2 mt-2.5" style={{ backgroundColor: "var(--gray-8)" }} />
          <Skeleton className="h-4 w-2/5 mt-3" style={{ backgroundColor: "var(--gray-8)" }} />
        </div>
      )}

      {fase === "error" && (
        <BloqueError
          mensaje={STR.misCitas.error}
          reintentarTexto={STR.misCitas.reintentar}
          onReintentar={() => setIntento((n) => n + 1)}
        />
      )}

      {fase === "ok" && citaReciente && (
        <CitaCard
          cita={citaReciente}
          onVerDetalle={
            // Las citas del mock tienen su detalle de servicio; los fixtures
            // de estados demo no navegan.
            leerEscenario(location.search).estadoDemo
              ? undefined
              : () =>
                  navigate(
                    `/servicios/${citaReciente.id === 1 ? "fixture-aire-multivisita" : `proyecto-${citaReciente.id}`}`,
                  )
          }
        />
      )}

      {fase === "ok" && !citaReciente && (
        <div
          className="flex flex-col items-center gap-3 p-6 text-center border"
          style={{
            backgroundColor: "var(--card)",
            borderColor: "var(--gray-8)",
            borderRadius: "16px",
          }}
        >
          <div
            className="flex items-center justify-center"
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              backgroundColor: "var(--gray-3)",
            }}
          >
            <CalendarDays
              size={24}
              strokeWidth={2}
              color="var(--primary-black)"
              aria-hidden="true"
            />
          </div>
          <p
            style={{
              fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif",
              fontSize: "15px",
              fontWeight: "var(--font-weight-medium)",
              color: "var(--primary-black)",
              margin: 0,
            }}
          >
            {STR.misCitas.vacioTitulo}
          </p>
          <p
            style={{
              fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif",
              fontSize: "13px",
              lineHeight: "19px",
              color: "var(--gray-60)",
              margin: 0,
            }}
          >
            {STR.misCitas.vacioDescripcion}
          </p>
          <button
            onClick={onAgendar}
            className="w-full transition-transform hover:scale-[1.01] active:scale-[0.99] border-none mt-1"
            style={{
              height: "44px",
              backgroundColor: "var(--primary-yellow)",
              borderRadius: "12px",
              fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif",
              fontSize: "14px",
              fontWeight: "var(--font-weight-medium)",
              color: "var(--primary-black)",
              cursor: "pointer",
            }}
          >
            {STR.misCitas.vacioAccion}
          </button>
          <div role="status" className="w-full">
            {aviso && (
              <p
                className="flex items-center justify-center gap-1.5"
                style={{
                  fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif",
                  fontSize: "12px",
                  color: "var(--gray-60)",
                  margin: 0,
                }}
              >
                <Info size={14} strokeWidth={2} style={{ flexShrink: 0 }} aria-hidden="true" />
                {aviso}
              </p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
