import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { ChevronRight, ShieldCheck } from "lucide-react";
import { Skeleton } from "../ui/skeleton";
import { STR } from "../../i18n/strings";
import {
  ReclamoGarantiaCliente,
  debeMostrarVerTodos,
  reclamoParaHome,
} from "../../logic/reclamos";
import { cargarReclamos, leerEscenarioReclamos } from "../../data/reclamos";
import { TituloSeccion } from "../home/TituloSeccion";
import { BloqueError } from "../home/BloqueError";
import { TarjetaReclamoCompacta } from "./TarjetaReclamoCompacta";

type Fase = "cargando" | "error" | "ok";

// Sección "Garantía y reclamos" del Home.
//
// Compacta a propósito: una fila de acceso para iniciar la solicitud (toda
// la fila es tocable) y, debajo, el reclamo más relevante. El hub de la
// pestaña Garantía es la vista completa; el Home solo da la entrada. Con
// más de un reclamo aparece "Ver todos" hacia el hub. Si esta sección
// falla, el resto del Home sigue funcionando.
export function SeccionGarantia({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [fase, setFase] = useState<Fase>("cargando");
  const [reclamos, setReclamos] = useState<ReclamoGarantiaCliente[]>([]);
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    let cancelado = false;
    setFase("cargando");
    cargarReclamos(leerEscenarioReclamos(location.search))
      .then((data) => {
        if (cancelado) return;
        setReclamos(data);
        setFase("ok");
      })
      .catch(() => {
        if (!cancelado) setFase("error");
      });
    return () => {
      cancelado = true;
    };
  }, [location.search, intento]);

  const destacado = reclamoParaHome(reclamos);

  const meta = {
    fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif",
  } as const;

  return (
    <section aria-labelledby="titulo-garantia" className={className} style={{ display: "flex", flexDirection: "column", gap: "16px", ...style }}>
      <TituloSeccion
        id="titulo-garantia"
        accion={
          fase === "ok" && debeMostrarVerTodos(reclamos.length) ? (
            <button
              // Al historial, recortado a Garantías: "Ver todos" lleva a
              // todos los casos, no al hub desde donde se abre uno nuevo.
              onClick={() => navigate("/historial?tipo=garantias")}
              className="flex items-center gap-0.5 -mr-2 px-2"
              style={{
                minHeight: "44px",
                background: "none",
                border: "none",
                cursor: "pointer",
                ...meta,
                fontSize: "13px",
                fontWeight: "var(--font-weight-medium)",
                color: "var(--primary-black)",
              }}
            >
              {STR.garantia.verTodos}
              <ChevronRight size={16} strokeWidth={2} aria-hidden="true" />
            </button>
          ) : undefined
        }
      >
        {STR.garantia.titulo}
      </TituloSeccion>

      {/* Iniciar una solicitud: la fila completa es la acción */}
      <button
        onClick={() => navigate("/garantia/producto")}
        className="w-full text-left border transition-all active:scale-[0.99]"
        style={{
          backgroundColor: "var(--card)",
          borderColor: "var(--gray-8)",
          borderRadius: "14px",
          padding: "12px 14px",
          cursor: "pointer",
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center flex-shrink-0"
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "10px",
              backgroundColor: "var(--primary-black)",
            }}
          >
            <ShieldCheck size={20} strokeWidth={2} color="var(--primary-yellow)" aria-hidden="true" />
          </div>
          <div className="flex-1 min-w-0">
            <p
              style={{
                ...meta,
                fontSize: "14px",
                fontWeight: "var(--font-weight-medium)",
                color: "var(--primary-black)",
                margin: 0,
              }}
            >
              {STR.garantia.solicitar}
            </p>
            <p
              className="truncate"
              style={{
                ...meta,
                fontSize: "12px",
                lineHeight: "17px",
                color: "var(--gray-60)",
                margin: "2px 0 0",
              }}
            >
              {STR.garantia.introDescripcion}
            </p>
          </div>
          <ChevronRight size={18} strokeWidth={2} color="var(--gray-40)" style={{ flexShrink: 0 }} aria-hidden="true" />
        </div>
      </button>

      {/* Tarea B: consultar el reclamo más relevante */}
      {fase === "cargando" && (
        <div
          role="status"
          aria-label={STR.garantia.cargando}
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
          <Skeleton className="h-14 w-full mt-3 rounded-lg" style={{ backgroundColor: "var(--gray-8)" }} />
        </div>
      )}

      {fase === "error" && (
        <div>
          <BloqueError
            mensaje={STR.garantia.error}
            reintentarTexto={STR.garantia.reintentar}
            onReintentar={() => setIntento((n) => n + 1)}
          />
        </div>
      )}

      {/* Etiqueta y card del reclamo van juntas: 8, elementos relacionados. */}
      {fase === "ok" && destacado && (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
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
            {STR.garantia.reclamoReciente}
          </p>
          <TarjetaReclamoCompacta
            reclamo={destacado}
            onVerDetalle={() => navigate(`/reclamos/${destacado.id}`)}
          />
        </div>
      )}
    </section>
  );
}
