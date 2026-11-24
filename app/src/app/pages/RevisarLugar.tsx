import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import { ArrowLeft, Check, CheckCircle2, ClipboardList, Info } from "lucide-react";
import { Progress } from "../components/ui/progress";
import { Skeleton } from "../components/ui/skeleton";
import { STR } from "../i18n/strings";
import { buscarServicioCatalogo } from "../data/catalogo";
import {
  leerBorradorServicio,
  guardarBorradorServicio,
} from "../data/borradorServicio";
import {
  CuestionarioLugar,
  OpcionLugar,
  PreguntaLugar,
  ResultadoLugar,
  cargarCuestionario,
  leerEscenarioLugar,
} from "../data/cuestionarioLugar";

// Paso "Revisar el lugar": una pregunta por vez, en lenguaje cotidiano,
// con "No estoy seguro" siempre disponible y sin exponer reglas internas.
// Selección única = avance automático al tocar (sin botón Continuar); la
// excepción es "No estoy seguro", que revela información y espera el OK.
// La inspección se presenta como un paso normal del servicio, nunca como un
// error. La desinstalación es un adicional que el cliente decide.

type Fase =
  | "cargando"
  | "error"
  | "intro"
  | "preguntas"
  | "desinstalacion"
  | "resultado";

interface Respuesta {
  preguntaId: string;
  opcionId: string;
}

const meta = { fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif" } as const;

// Diagramas propios (sin imágenes externas), con los tokens del sistema.
function DiagramaVoltaje() {
  return (
    <svg viewBox="0 0 280 110" role="img" aria-label="Comparación entre un tomacorriente común de 110 voltios y uno de 220 voltios, que es más grande y con ranuras en distinta posición" className="w-full" style={{ maxWidth: "280px" }}>
      <rect x="20" y="14" width="90" height="64" rx="10" fill="var(--gray-3)" stroke="var(--gray-40)" strokeWidth="2" />
      <rect x="47" y="30" width="6" height="18" rx="2" fill="var(--gray-80)" />
      <rect x="77" y="30" width="6" height="18" rx="2" fill="var(--gray-80)" />
      <circle cx="65" cy="60" r="4" fill="var(--gray-80)" />
      <text x="65" y="98" textAnchor="middle" style={{ font: "600 12px 'Helvetica Neue LT Std', Arial", fill: "var(--gray-60)" }}>110 V</text>
      <rect x="160" y="8" width="100" height="74" rx="10" fill="rgba(255, 238, 0, 0.15)" stroke="#8A7A00" strokeWidth="2.5" />
      <rect x="186" y="24" width="7" height="20" rx="2" fill="var(--primary-black)" transform="rotate(-20 189 34)" />
      <rect x="228" y="24" width="7" height="20" rx="2" fill="var(--primary-black)" transform="rotate(20 231 34)" />
      <rect x="206" y="52" width="9" height="16" rx="2" fill="var(--primary-black)" />
      <text x="210" y="98" textAnchor="middle" style={{ font: "600 12px 'Helvetica Neue LT Std', Arial", fill: "var(--primary-black)" }}>220 V</text>
    </svg>
  );
}

function DiagramaUnidades() {
  return (
    <svg viewBox="0 0 300 120" role="img" aria-label="La unidad interior va dentro de la vivienda y la unidad exterior queda fuera, a menos de 3 metros de distancia" className="w-full" style={{ maxWidth: "300px" }}>
      <path d="M14 52 L88 16 L162 52" fill="none" stroke="var(--gray-80)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="26" y="52" width="124" height="54" fill="var(--gray-3)" stroke="var(--gray-80)" strokeWidth="2.5" rx="2" />
      <rect x="44" y="62" width="52" height="16" rx="4" fill="rgba(255, 238, 0, 0.5)" stroke="var(--primary-black)" strokeWidth="2" />
      <text x="70" y="96" textAnchor="middle" style={{ font: "500 10px 'Helvetica Neue LT Std', Arial", fill: "var(--gray-60)" }}>Interior</text>
      <rect x="216" y="64" width="52" height="42" rx="4" fill="var(--gray-3)" stroke="var(--primary-black)" strokeWidth="2.5" />
      <circle cx="242" cy="85" r="12" fill="none" stroke="var(--primary-black)" strokeWidth="2" />
      <text x="242" y="118" textAnchor="middle" style={{ font: "500 10px 'Helvetica Neue LT Std', Arial", fill: "var(--gray-60)" }}>Exterior</text>
      <path d="M156 40 L210 40" stroke="#8A7A00" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="5 5" />
      <text x="183" y="32" textAnchor="middle" style={{ font: "600 11px 'Helvetica Neue LT Std', Arial", fill: "#8A7A00" }}>menos de 3 m</text>
    </svg>
  );
}

export function RevisarLugar() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const servicio = id ? buscarServicioCatalogo(id) : null;

  const [fase, setFase] = useState<Fase>("cargando");
  const [cuestionario, setCuestionario] = useState<CuestionarioLugar | null>(null);
  const [historial, setHistorial] = useState<Respuesta[]>([]);
  const [preguntaId, setPreguntaId] = useState<string | null>(null);
  const [seleccion, setSeleccion] = useState<string | null>(null);
  const [ayudaAbierta, setAyudaAbierta] = useState(false);
  const [resultado, setResultado] = useState<ResultadoLugar | null>(null);
  const [agregaDesinstalacion, setAgregaDesinstalacion] = useState(false);
  const [intento, setIntento] = useState(0);
  const procesando = useRef(false);
  const timerAvance = useRef<number | null>(null);

  // Un timer pendiente no debe disparar sobre una pantalla que ya no está.
  useEffect(() => {
    return () => {
      if (timerAvance.current !== null) window.clearTimeout(timerAvance.current);
    };
  }, []);

  useEffect(() => {
    if (!id) return;
    let cancelado = false;
    setFase("cargando");
    cargarCuestionario(id, leerEscenarioLugar(location.search))
      .then((c) => {
        if (cancelado) return;
        if (!c) {
          // Servicio sin cuestionario: transición natural, sin pantalla vacía.
          navigate(`/catalogo/${id}`, { replace: true });
          return;
        }
        // Cambiar de servicio reinicia el recorrido: nada del cuestionario
        // anterior puede contaminar las respuestas ni el resultado.
        setCuestionario(c);
        setHistorial([]);
        setPreguntaId(null);
        setSeleccion(null);
        setAyudaAbierta(false);
        // Si la revisión de ESTE servicio ya se completó (el resultado vive
        // en el borrador), volver acá no obliga a repetirla: se muestra el
        // resultado guardado, con la opción de revisar respuestas de nuevo.
        const previo = leerBorradorServicio(id);
        if (previo.condiciones) {
          setResultado(previo.condiciones);
          setAgregaDesinstalacion(previo.incluyeDesinstalacion ?? false);
          setFase("resultado");
        } else {
          // Sin pantalla de introducción: directo a la primera pregunta.
          setResultado(null);
          setAgregaDesinstalacion(false);
          setPreguntaId(c.inicial);
          setSeleccion(null);
          setFase("preguntas");
        }
      })
      .catch(() => {
        if (!cancelado) setFase("error");
      });
    return () => {
      cancelado = true;
    };
  }, [id, location.search, intento, navigate]);

  if (!servicio) return null;

  const pregunta: PreguntaLugar | null =
    cuestionario?.preguntas.find((p) => p.id === preguntaId) ?? null;
  const opcionElegida: OpcionLugar | null =
    pregunta?.opciones.find((o) => o.id === seleccion) ?? null;

  const marcaDesinstalacion = (respuestas: Respuesta[]) =>
    respuestas.some((r) => {
      const p = cuestionario?.preguntas.find((x) => x.id === r.preguntaId);
      return p?.opciones.find((o) => o.id === r.opcionId)?.marcaDesinstalacion;
    });

  const continuarCon = (opcion: OpcionLugar) => {
    if (!pregunta) return;
    const nuevo = [...historial, { preguntaId: pregunta.id, opcionId: opcion.id }];
    setHistorial(nuevo);
    setAyudaAbierta(false);
    if (opcion.siguiente) {
      setPreguntaId(opcion.siguiente);
      setSeleccion(null);
      return;
    }
    const res = opcion.resultado ?? "inspeccion";
    setResultado(res);
    if (res === "estandar" && marcaDesinstalacion(nuevo)) {
      setFase("desinstalacion");
    } else {
      setFase("resultado");
    }
  };

  const continuar = () => {
    if (!opcionElegida) return;
    continuarCon(opcionElegida);
  };

  // Selección única con avance automático (regla del flujo): tocar la
  // opción la marca con feedback inmediato y avanza sola tras una pausa
  // breve. La respuesta queda guardada: la flecha del header permite volver
  // y corregirla. Ningún botón "Continuar" en preguntas simples.
  const elegirOpcion = (opcion: OpcionLugar) => {
    setSeleccion(opcion.id);
    if (timerAvance.current !== null) window.clearTimeout(timerAvance.current);
    timerAvance.current = window.setTimeout(() => continuarCon(opcion), 300);
  };

  // Única acción de regreso: la flecha del header. Retrocede una pregunta
  // conservando la respuesta que se había elegido; en la primera pregunta
  // (o sin recorrido que revisar) sale del paso.
  const volverUnaPregunta = () => {
    if (timerAvance.current !== null) window.clearTimeout(timerAvance.current);
    setAyudaAbierta(false);
    if (historial.length === 0) {
      navigate(-1);
      return;
    }
    const ultima = historial[historial.length - 1];
    setHistorial(historial.slice(0, -1));
    setPreguntaId(ultima.preguntaId);
    setSeleccion(ultima.opcionId);
    if (fase === "resultado" || fase === "desinstalacion") {
      setResultado(null);
      setAgregaDesinstalacion(false);
      setFase("preguntas");
    }
  };

  const confirmar = (condiciones: ResultadoLugar) => {
    if (procesando.current) return;
    procesando.current = true;
    // El resultado de la revisión viaja en el borrador: la solicitud se
    // crea recién al confirmar el resumen, al final del flujo.
    guardarBorradorServicio({
      ...leerBorradorServicio(servicio.id),
      condiciones,
      incluyeDesinstalacion: agregaDesinstalacion || undefined,
      precioDesinstalacion: agregaDesinstalacion
        ? cuestionario?.precioDesinstalacion
        : undefined,
    });
    navigate(`/catalogo/${servicio.id}/configurar`);
  };

  const ctaBase = {
    height: "56px",
    borderRadius: "12px",
    ...meta,
    fontSize: "16px",
    fontWeight: "var(--font-weight-medium)",
    cursor: "pointer",
  } as const;

  const cardOpcion = (elegida: boolean) =>
    ({
      backgroundColor: elegida ? "rgba(255, 238, 0, 0.08)" : "var(--card)",
      borderColor: elegida ? "var(--primary-yellow)" : "var(--gray-8)",
      borderWidth: "2px",
      borderRadius: "12px",
      padding: "16px",
      minHeight: "72px",
      cursor: "pointer",
      width: "100%",
      textAlign: "left" as const,
    }) as const;

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: "var(--primary-white)" }}>
      {/* Header */}
      <header className="px-6 pt-[20px] pb-3 bg-white sticky top-0 z-20" style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
        <div className="flex items-center gap-3">
          <button
            onClick={volverUnaPregunta}
            aria-label={STR.lugar.volver}
            className="w-11 h-11 rounded-[10px] flex items-center justify-center transition-opacity hover:opacity-80 border flex-shrink-0"
            style={{ backgroundColor: "var(--primary-white)", borderColor: "var(--gray-20)", cursor: "pointer" }}
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
              {STR.lugar.paso}
            </h1>
            <p className="truncate" style={{ ...meta, fontSize: "13px", color: "var(--gray-60)", margin: 0 }}>
              {servicio.nombre}
            </p>
          </div>
        </div>
        {fase === "preguntas" && cuestionario && (
          <div
            role="status"
            aria-label={`${STR.lugar.progresoPaso(historial.length + 1, cuestionario.maximoPreguntas)}. ${STR.lugar.progreso}`}
            style={{ marginTop: "12px" }}
          >
            <div className="flex items-baseline justify-between gap-3">
              <span style={{ ...meta, fontSize: "14px", fontWeight: "var(--font-weight-medium)", color: "var(--primary-black)" }}>
                {STR.lugar.progresoPaso(historial.length + 1, cuestionario.maximoPreguntas)}
              </span>
              <span className="truncate" style={{ ...meta, fontSize: "13px", color: "var(--gray-60)" }}>
                {STR.lugar.progreso}
              </span>
            </div>
            <div aria-hidden="true" style={{ marginTop: "8px" }}>
              <Progress value={((historial.length + 1) / cuestionario.maximoPreguntas) * 100} />
            </div>
          </div>
        )}
      </header>

      <div className="flex-1 overflow-y-auto px-6 pt-6 pb-8">
        {/* Cargando */}
        {fase === "cargando" && (
          <div role="status" aria-label={STR.lugar.cargando} aria-busy="true">
            <Skeleton className="h-5 w-3/4" style={{ backgroundColor: "var(--gray-8)" }} />
            <Skeleton className="h-4 w-1/2 mt-2" style={{ backgroundColor: "var(--gray-8)" }} />
            <Skeleton className="h-14 w-full mt-5 rounded-xl" style={{ backgroundColor: "var(--gray-8)" }} />
            <Skeleton className="h-14 w-full mt-3 rounded-xl" style={{ backgroundColor: "var(--gray-8)" }} />
            <Skeleton className="h-14 w-full mt-3 rounded-xl" style={{ backgroundColor: "var(--gray-8)" }} />
          </div>
        )}

        {/* Error */}
        {fase === "error" && (
          <div
            role="alert"
            className="flex flex-col items-center gap-3 p-6 text-center border"
            style={{ backgroundColor: "var(--card)", borderColor: "var(--gray-8)", borderRadius: "16px" }}
          >
            <p style={{ ...meta, fontSize: "15px", fontWeight: "var(--font-weight-medium)", color: "var(--primary-black)", margin: 0 }}>
              {STR.lugar.errorTitulo}
            </p>
            <p style={{ ...meta, fontSize: "13px", lineHeight: "19px", color: "var(--gray-60)", margin: 0 }}>
              {STR.lugar.errorDetalle}
            </p>
            <button
              onClick={() => setIntento((n) => n + 1)}
              className="w-full transition-transform hover:scale-[1.01] active:scale-[0.99] border-none"
              style={{ ...ctaBase, backgroundColor: "var(--primary-yellow)", color: "var(--primary-black)" }}
            >
              {STR.lugar.reintentar}
            </button>
          </div>
        )}

        {fase === "preguntas" && pregunta && (
          <>
            <h2 style={{ ...meta, fontSize: "20px", lineHeight: "27px", fontWeight: "var(--font-weight-medium)", color: "var(--primary-black)", margin: 0 }}>
              {pregunta.texto}
            </h2>
            {pregunta.ayudaBreve && (
              <p style={{ ...meta, fontSize: "14px", lineHeight: "20px", color: "var(--gray-60)", margin: "8px 0 0" }}>
                {pregunta.ayudaBreve}
              </p>
            )}

            <div className="flex flex-col gap-3" style={{ marginTop: "24px" }} role="radiogroup" aria-label={pregunta.texto}>
              {pregunta.opciones.map((o) => {
                const elegida = seleccion === o.id;
                return (
                  <button
                    key={o.id}
                    role="radio"
                    aria-checked={elegida}
                    onClick={() => elegirOpcion(o)}
                    className="border-2 transition-colors active:scale-[0.99]"
                    style={cardOpcion(elegida)}
                  >
                    <span className="flex items-center gap-3">
                      {/* Indicador tipo radio a la izquierda: siempre visible */}
                      <span
                        aria-hidden="true"
                        className="flex items-center justify-center flex-shrink-0"
                        style={{
                          width: "22px",
                          height: "22px",
                          borderRadius: "50%",
                          border: elegida ? "none" : "2px solid var(--gray-40)",
                          backgroundColor: elegida ? "var(--primary-yellow)" : "var(--primary-white)",
                        }}
                      >
                        {elegida && <Check size={14} strokeWidth={3} color="var(--primary-black)" />}
                      </span>
                      <span className="flex-1 min-w-0">
                        <span
                          className="block"
                          style={{ ...meta, fontSize: "16px", lineHeight: "22px", fontWeight: "var(--font-weight-medium)", color: "var(--primary-black)" }}
                        >
                          {o.etiqueta}
                        </span>
                        {o.descripcion && (
                          <span
                            className="block"
                            style={{ ...meta, fontSize: "14px", lineHeight: "19px", color: "var(--gray-60)", marginTop: "2px" }}
                          >
                            {o.descripcion}
                          </span>
                        )}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Confirmación accesible de la selección */}
            <p aria-live="polite" className="sr-only">
              {opcionElegida ? STR.lugar.seleccionaste(opcionElegida.etiqueta) : ""}
            </p>

            {pregunta.comoIdentifico && (
              <div className="mt-4">
                <button
                  onClick={() => setAyudaAbierta(!ayudaAbierta)}
                  aria-expanded={ayudaAbierta}
                  className="px-0"
                  style={{ ...meta, fontSize: "13px", fontWeight: "var(--font-weight-medium)", color: "var(--info-blue)", background: "none", border: "none", cursor: "pointer", minHeight: "44px" }}
                >
                  {STR.lugar.comoIdentifico}
                </button>
                {ayudaAbierta && (
                  <div className="p-4" style={{ backgroundColor: "var(--gray-3)", borderRadius: "12px" }}>
                    <p style={{ ...meta, fontSize: "14px", fontWeight: "var(--font-weight-medium)", color: "var(--primary-black)", margin: 0 }}>
                      {pregunta.comoIdentifico.titulo}
                    </p>
                    <p style={{ ...meta, fontSize: "13px", lineHeight: "19px", color: "var(--gray-80)", margin: "6px 0 12px" }}>
                      {pregunta.comoIdentifico.descripcion}
                    </p>
                    {pregunta.comoIdentifico.diagrama === "voltaje" && <DiagramaVoltaje />}
                    {pregunta.comoIdentifico.diagrama === "unidades" && <DiagramaUnidades />}
                    <p style={{ ...meta, fontSize: "12px", lineHeight: "18px", color: "var(--gray-60)", margin: "12px 0 0" }}>
                      {STR.lugar.dudaExtra}
                    </p>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Oferta de desinstalación */}
        {fase === "desinstalacion" && cuestionario && (
          <>
            <h2 style={{ ...meta, fontSize: "20px", lineHeight: "27px", fontWeight: "var(--font-weight-medium)", color: "var(--primary-black)", margin: 0 }}>
              {STR.lugar.desTitulo}
            </h2>
            <p style={{ ...meta, fontSize: "14px", lineHeight: "21px", color: "var(--gray-80)", margin: "8px 0 0" }}>
              {STR.lugar.desDescripcion}
            </p>
            {cuestionario.precioDesinstalacion !== undefined && (
              <p style={{ ...meta, fontSize: "14px", fontWeight: "var(--font-weight-medium)", color: "var(--primary-black)", margin: "10px 0 0" }}>
                {STR.lugar.desPrecio(cuestionario.precioDesinstalacion)}
              </p>
            )}
            <div className="flex flex-col gap-3 mt-5">
              <button
                onClick={() => {
                  setAgregaDesinstalacion(true);
                  setFase("resultado");
                }}
                className="w-full transition-transform hover:scale-[1.01] active:scale-[0.99] border-none"
                style={{ ...ctaBase, backgroundColor: "var(--primary-yellow)", color: "var(--primary-black)" }}
              >
                {STR.lugar.desAgregar}
              </button>
              <button
                onClick={() => {
                  setAgregaDesinstalacion(false);
                  setFase("resultado");
                }}
                className="w-full border transition-transform hover:scale-[1.01] active:scale-[0.99]"
                style={{ ...ctaBase, backgroundColor: "var(--primary-white)", borderColor: "var(--gray-20)", color: "var(--primary-black)" }}
              >
                {STR.lugar.desNoNecesito}
              </button>
            </div>
          </>
        )}

        {/* Resultado */}
        {fase === "resultado" && resultado && (
          <div className="flex flex-col items-center text-center pt-6">
            <div
              className="flex items-center justify-center"
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                backgroundColor:
                  resultado === "estandar" ? "rgba(88, 202, 138, 0.12)" : "rgba(51, 109, 208, 0.1)",
              }}
            >
              {resultado === "estandar" ? (
                <CheckCircle2 size={32} strokeWidth={2.5} color="var(--success-green)" aria-hidden="true" />
              ) : (
                <ClipboardList size={30} strokeWidth={2.5} color="var(--info-blue)" aria-hidden="true" />
              )}
            </div>
            <h2
              style={{
                fontFamily: "'Bebas Neue', Arial, sans-serif",
                fontSize: "22px",
                letterSpacing: "1px",
                textTransform: "uppercase",
                color: "var(--primary-black)",
                margin: "16px 0 0",
              }}
            >
              {resultado === "estandar" ? STR.lugar.okTitulo : STR.lugar.inspTitulo}
            </h2>
            <p style={{ ...meta, fontSize: "14px", lineHeight: "21px", color: "var(--gray-80)", margin: "8px 0 0", maxWidth: "300px" }}>
              {resultado === "estandar" ? STR.lugar.okDescripcion : STR.lugar.inspDescripcion}
            </p>

            {resultado === "estandar" && (
              <>
                {agregaDesinstalacion && (
                  <div
                    className="w-full text-left p-4 mt-5"
                    style={{ backgroundColor: "var(--gray-3)", borderRadius: "12px" }}
                  >
                    <p style={{ ...meta, fontSize: "14px", fontWeight: "var(--font-weight-medium)", color: "var(--primary-black)", margin: 0 }}>
                      {STR.lugar.okDesinstalacion}
                    </p>
                    {cuestionario?.precioDesinstalacion !== undefined && (
                      <p style={{ ...meta, fontSize: "14px", lineHeight: "20px", color: "var(--gray-80)", margin: "4px 0 0" }}>
                        {STR.lugar.desPrecio(cuestionario.precioDesinstalacion)}
                      </p>
                    )}
                  </div>
                )}
                <p style={{ ...meta, fontSize: "13px", lineHeight: "19px", color: "var(--gray-60)", margin: "14px 0 0", maxWidth: "300px" }}>
                  {STR.lugar.okAclaracion}
                </p>
              </>
            )}

            {resultado === "inspeccion" && (
              <div
                className="w-full text-left p-4 mt-5"
                style={{ backgroundColor: "var(--gray-3)", borderRadius: "12px" }}
              >
                <p style={{ ...meta, fontSize: "14px", fontWeight: "var(--font-weight-medium)", color: "var(--primary-black)", margin: 0 }}>
                  {STR.lugar.inspCosto}
                </p>
                <p style={{ ...meta, fontSize: "13px", lineHeight: "19px", color: "var(--gray-80)", margin: "4px 0 0" }}>
                  {STR.lugar.inspDescuento}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Acción inferior */}
      {fase === "resultado" && (
        <div className="px-6 py-4 bg-white flex-shrink-0" style={{ borderTop: "1px solid var(--gray-8)" }}>
          {fase === "resultado" && (
            <>
              <button
                onClick={() => confirmar(resultado!)}
                className="w-full transition-transform hover:scale-[1.01] active:scale-[0.99] border-none"
                style={{ ...ctaBase, backgroundColor: "var(--primary-yellow)", color: "var(--primary-black)" }}
              >
                {resultado === "estandar" ? STR.lugar.okCta : STR.lugar.inspCta}
              </button>
            </>
          )}
        </div>
      )}

    </div>
  );
}
