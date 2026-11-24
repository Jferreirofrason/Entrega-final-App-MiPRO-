import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";
import { Skeleton } from "../components/ui/skeleton";
import { BloqueError } from "../components/home/BloqueError";
import { TarjetaReclamo } from "../components/reclamos/TarjetaReclamo";
import { STR } from "../i18n/strings";
import { ReclamoGarantiaCliente, ordenarReclamos } from "../logic/reclamos";
import { cargarReclamos, leerEscenarioReclamos } from "../data/reclamos";
import { paginar } from "../logic/paginado";

type Fase = "cargando" | "error" | "ok";
const TAMANO_PAGINA = 10;

// Listado completo de reclamos de garantía, ordenado por prioridad:
// primero lo que requiere acción del usuario, después visitas próximas,
// activos recientes y por último los finalizados.
export function ListaReclamos() {
  const navigate = useNavigate();
  const location = useLocation();
  const [fase, setFase] = useState<Fase>("cargando");
  const [reclamos, setReclamos] = useState<ReclamoGarantiaCliente[]>([]);
  const [intento, setIntento] = useState(0);
  const [visibles, setVisibles] = useState(TAMANO_PAGINA);

  useEffect(() => {
    let cancelado = false;
    setFase("cargando");
    cargarReclamos(leerEscenarioReclamos(location.search))
      .then((data) => {
        if (cancelado) return;
        setReclamos(ordenarReclamos(data));
        setFase("ok");
      })
      .catch(() => {
        if (!cancelado) setFase("error");
      });
    return () => {
      cancelado = true;
    };
  }, [location.search, intento]);

  return (
    <div className="flex flex-col" style={{ backgroundColor: "var(--primary-white)" }}>
      <header
        className="flex items-center gap-3 px-6 pt-[20px] pb-4 bg-white sticky top-0 z-20"
        style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}
      >
        <button
          onClick={() => navigate("/")}
          aria-label={STR.garantia.volver}
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
            {STR.garantia.listadoTitulo}
          </h1>
        </div>
      </header>

      <section className="px-6 pt-6 pb-8">
        {fase === "cargando" && (
          <div role="status" aria-label={STR.garantia.cargando} aria-busy="true" className="flex flex-col gap-4">
            {[0, 1].map((n) => (
              <div
                key={n}
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
            ))}
          </div>
        )}

        {fase === "error" && (
          <BloqueError
            mensaje={STR.garantia.error}
            reintentarTexto={STR.garantia.reintentar}
            onReintentar={() => setIntento((n) => n + 1)}
          />
        )}

        {fase === "ok" && (
          <div className="flex flex-col gap-4">
            {paginar(reclamos, visibles).visibles.map((r) => (
              <TarjetaReclamo
                key={r.id}
                reclamo={r}
                onVerDetalle={() => navigate(`/reclamos/${r.id}`)}
              />
            ))}
            {paginar(reclamos, visibles).hayMas && (
              <button
                onClick={() => setVisibles((n) => n + TAMANO_PAGINA)}
                className="w-full border transition-all active:scale-[0.99]"
                style={{
                  height: "44px",
                  backgroundColor: "var(--primary-white)",
                  borderColor: "var(--gray-20)",
                  borderRadius: "12px",
                  fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif",
                  fontSize: "14px",
                  fontWeight: "var(--font-weight-medium)",
                  color: "var(--primary-black)",
                  cursor: "pointer",
                }}
              >
                {STR.garantia.verMas}
              </button>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
