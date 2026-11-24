import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Skeleton } from "../components/ui/skeleton";
import { BloqueError } from "../components/home/BloqueError";
import { TarjetaReclamoHub } from "../components/reclamos/TarjetaReclamoHub";
import { STR } from "../i18n/strings";
import {
  ReclamoGarantiaCliente,
  esReclamoActivo,
  ordenarReclamos,
} from "../logic/reclamos";
import { cargarReclamos, leerEscenarioReclamos } from "../data/reclamos";
import { paginar } from "../logic/paginado";

const TAMANO_PAGINA = 10;

type Fase = "cargando" | "error" | "ok";

// Hub de "Garantía y reclamos": la entrada de la pestaña Garantía.
//
// La acción para iniciar un reclamo va ARRIBA, siempre visible, con una
// línea que explica el proceso (sin un paso previo de "Comenzar"). Debajo,
// los casos organizados en dos tabs: en curso y finalizados.
export function GarantiaHub() {
  const navigate = useNavigate();
  const location = useLocation();
  const [fase, setFase] = useState<Fase>("cargando");
  const [sinConexion, setSinConexion] = useState(false);
  const [reclamos, setReclamos] = useState<ReclamoGarantiaCliente[]>([]);
  const [intento, setIntento] = useState(0);
  const [visiblesFinalizados, setVisiblesFinalizados] = useState(TAMANO_PAGINA);

  useEffect(() => {
    let cancelado = false;
    setFase("cargando");
    cargarReclamos(leerEscenarioReclamos(location.search))
      .then((data) => {
        if (cancelado) return;
        setReclamos(ordenarReclamos(data));
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

  const activos = reclamos.filter(esReclamoActivo);
  const finalizados = reclamos.filter((r) => !esReclamoActivo(r));
  // Carga progresiva: el histórico de finalizados puede ser largo, los
  // activos nunca se recortan.
  const paginaFinalizados = paginar(finalizados, visiblesFinalizados);

  const meta = { fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif" } as const;

  const etiquetaTab = (nombre: string, cantidad: number) =>
    fase === "ok" && cantidad > 0
      ? STR.servicios.tabConCantidad(nombre, cantidad)
      : nombre;

  const skeletons = (
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
  );

  const vacio = (titulo: string, descripcion: string) => (
    <div
      className="flex flex-col items-center gap-2 p-6 text-center border"
      style={{
        backgroundColor: "var(--card)",
        borderColor: "var(--gray-8)",
        borderRadius: "16px",
      }}
    >
      <p style={{ ...meta, fontSize: "14px", fontWeight: "var(--font-weight-medium)", color: "var(--primary-black)", margin: 0 }}>
        {titulo}
      </p>
      <p style={{ ...meta, fontSize: "13px", lineHeight: "19px", color: "var(--gray-60)", margin: 0 }}>
        {descripcion}
      </p>
    </div>
  );

  const lista = (items: ReclamoGarantiaCliente[]) => (
    <div className="flex flex-col gap-4">
      {items.map((r) => (
        <TarjetaReclamoHub
          key={r.id}
          reclamo={r}
          onVerDetalle={() => navigate(`/reclamos/${r.id}`)}
        />
      ))}
    </div>
  );

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
            {STR.garantia.titulo}
          </h1>
        </div>
      </header>

      <section className="px-6 pt-6 pb-8">
        {/* Iniciar un reclamo: siempre visible, arriba de los casos */}
        <div
          className="border"
          style={{
            backgroundColor: "var(--card)",
            borderColor: "var(--gray-8)",
            borderRadius: "16px",
            padding: "16px",
          }}
        >
          <div className="flex items-start gap-3">
            <div
              className="flex items-center justify-center flex-shrink-0"
              style={{ width: "40px", height: "40px", borderRadius: "10px", backgroundColor: "var(--primary-black)" }}
            >
              <ShieldCheck size={20} strokeWidth={2} color="var(--primary-yellow)" aria-hidden="true" />
            </div>
            <p style={{ ...meta, fontSize: "13px", lineHeight: "19px", color: "var(--gray-80)", margin: 0 }}>
              {STR.garantia.introDescripcion}
            </p>
          </div>
          <button
            onClick={() => navigate("/garantia/producto")}
            className="w-full transition-transform hover:scale-[1.01] active:scale-[0.99] border-none mt-3"
            style={{
              // Acción principal de la pantalla: un paso más de presencia.
              height: "48px",
              backgroundColor: "var(--primary-yellow)",
              borderRadius: "12px",
              ...meta,
              fontSize: "14px",
              fontWeight: "var(--font-weight-medium)",
              color: "var(--primary-black)",
              cursor: "pointer",
            }}
          >
            {STR.garantia.solicitar}
          </button>
        </div>

        <div className="mt-6">
          {fase === "error" ? (
            <BloqueError
              mensaje={sinConexion ? STR.garantia.sinConexion : STR.garantia.error}
              reintentarTexto={STR.garantia.reintentar}
              onReintentar={() => setIntento((n) => n + 1)}
            />
          ) : (
            <Tabs defaultValue="en-curso">
              <TabsList className="w-full h-10 mb-3" style={{ backgroundColor: "var(--gray-3)" }}>
                <TabsTrigger
                  value="en-curso"
                  className="flex-1"
                  style={{ ...meta, fontSize: "13px", fontWeight: "var(--font-weight-medium)" }}
                >
                  {etiquetaTab(STR.garantia.tabEnCurso, activos.length)}
                </TabsTrigger>
                <TabsTrigger
                  value="finalizados"
                  className="flex-1"
                  style={{ ...meta, fontSize: "13px", fontWeight: "var(--font-weight-medium)" }}
                >
                  {etiquetaTab(STR.garantia.tabFinalizados, finalizados.length)}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="en-curso">
                {fase === "cargando"
                  ? skeletons
                  : activos.length === 0
                    ? vacio(STR.garantia.vacioEnCursoTitulo, STR.garantia.vacioEnCursoDetalle)
                    : lista(activos)}
              </TabsContent>

              <TabsContent value="finalizados">
                {fase === "cargando" ? (
                  skeletons
                ) : finalizados.length === 0 ? (
                  vacio(STR.garantia.vacioFinalizadosTitulo, STR.garantia.vacioFinalizadosDetalle)
                ) : (
                  <>
                    {lista(paginaFinalizados.visibles)}
                    {paginaFinalizados.hayMas && (
                      <button
                        onClick={() => setVisiblesFinalizados((n) => n + TAMANO_PAGINA)}
                        className="w-full border transition-all active:scale-[0.99] mt-4"
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
                        {STR.garantia.verMas}
                      </button>
                    )}
                  </>
                )}
              </TabsContent>
            </Tabs>
          )}
        </div>
      </section>
    </div>
  );
}
