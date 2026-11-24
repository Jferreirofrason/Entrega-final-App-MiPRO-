import { useEffect, useState } from "react";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { STR } from "../../i18n/strings";
import cmfLogoUrl from "../../../imports/cmf-logo.png";
import cmfArteClasicaUrl from "../../../imports/cmf-tarjeta-clasica.png";
import cmfArteBlackUrl from "../../../imports/cmf-tarjeta-black.png";
import { DEMORA_CMF_MS, PLANES_DEMO, TARJETAS_CMF_DEMO } from "../../data/cmf";
import { ENLACE_SOLICITUD_CMF } from "../../data/enlaces";
import {
  alcanzaCredito,
  type ArteCmf,
  estadoDePlanes,
  planesDeLaCompra,
  type EstadoConsultaCmf,
  type PlanCalculado,
  type TarjetaCmf,
} from "../../logic/cmf";

/**
 * La cara de cada tarjeta, para que se reconozca de un vistazo.
 *
 * ⚠️ Son ARTES, no datos: el número y los textos que traen las imágenes son
 * del material de CMF y NO son los de nadie. Lo que se muestra como dato de
 * la persona es el nombre de la tarjeta y sus cuatro últimos, que salen de
 * la tarjeta, al lado de la miniatura.
 *
 * Una tarjeta sin arte conocido cae en el logo: no se le adivina una cara.
 */
const ARTES: Record<ArteCmf, string> = {
  clasica: cmfArteClasicaUrl,
  black: cmfArteBlackUrl,
};

/** Proporción de las imágenes (380 × 240). La miniatura no estira ni recorta. */
const ANCHO_MINIATURA = 64;

export interface EleccionCmf {
  tarjeta: TarjetaCmf;
  plan: PlanCalculado;
  /** Importe de la compra con el que se calculó el plan. */
  montoCompra: number;
}

// Financiación con Crédito CMF, en dos pasos: la tarjeta y el plan.
//
// Va como pantalla encima del checkout, no como ruta aparte: así vuelve con
// todo lo cargado intacto (cupón, facturación, condiciones) y el botón de
// volver sigue siendo claro.
//
// ⚠️ SIMULADO. Las tarjetas y los planes salen de data/cmf.ts y la pantalla
// lo dice. La consulta tiene su demora, su error y sus estados vacíos
// porque son los que va a tener con integración.
//
// "Continuar" NO paga: deja elegidas la tarjeta y las cuotas, y vuelve al
// checkout con todo lo demás intacto. El pago empieza en "Confirmar pago",
// después de aceptar las condiciones.
//
// Los planes van agrupados en un bloque gris muy claro con una fila blanca
// cada uno, igual que "Otros medios de pago" en el checkout: es el patrón de
// la casa para elegir entre opciones. Tres cajas grises sueltas pesaban y
// se leían como bloques; agrupadas se leen como una lista, y sobre blanco el
// verde de la elegida se ve de verdad.
//
// Cada fila:
//
//   izquierda   la cantidad de cuotas y lo que se paga por cada una
//   derecha     el total, más chico y en gris, acompañando
//   al final    el selector
//
// La fila no dice nada más: ni "sin intereses", ni los cargos del plan, ni
// que las cuotas son de demostración. Es decisión de producto, no un dato
// que falte: `afirmaSinIntereses` y `cargos` siguen en logic/cmf.ts con sus
// pruebas, y que esto es simulado está dicho acá y en data/cmf.ts.
export function PantallaCmf({
  montoCompra,
  eleccionPrevia,
  onCerrar,
  onUsarPlan,
  onOtroMetodo,
  formatearMonto,
  onEnlaceSinConfigurar,
}: {
  montoCompra: number;
  /** Para volver a abrir en el plan ya elegido. */
  eleccionPrevia: EleccionCmf | null;
  onCerrar: () => void;
  onUsarPlan: (eleccion: EleccionCmf) => void;
  onOtroMetodo: () => void;
  formatearMonto: (monto: number) => string;
  onEnlaceSinConfigurar: () => void;
}) {
  const [estado, setEstado] = useState<EstadoConsultaCmf>("cargando");
  const [tarjetas, setTarjetas] = useState<readonly TarjetaCmf[]>([]);
  const [tarjeta, setTarjeta] = useState<TarjetaCmf | null>(eleccionPrevia?.tarjeta ?? null);
  const [estadoPlanes, setEstadoPlanes] = useState<EstadoConsultaCmf>("cargando");
  const [planes, setPlanes] = useState<PlanCalculado[]>([]);
  const [planId, setPlanId] = useState<string | null>(eleccionPrevia?.plan.id ?? null);
  const [intento, setIntento] = useState(0);

  const meta = { fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif" } as const;

  // Consulta de tarjetas. Con integración, acá va su llamada.
  useEffect(() => {
    setEstado("cargando");
    const id = window.setTimeout(() => {
      setTarjetas(TARJETAS_CMF_DEMO);
      setEstado(TARJETAS_CMF_DEMO.length === 0 ? "sin-tarjetas" : "ok");
    }, DEMORA_CMF_MS);
    return () => window.clearTimeout(id);
  }, [intento]);

  // Consulta de planes de la tarjeta elegida, para ESTE importe.
  useEffect(() => {
    if (!tarjeta) return;
    setEstadoPlanes("cargando");
    const id = window.setTimeout(() => {
      const calculados = planesDeLaCompra(PLANES_DEMO, montoCompra);
      setPlanes(calculados);
      setEstadoPlanes(estadoDePlanes(calculados, tarjeta.disponible));
    }, DEMORA_CMF_MS);
    return () => window.clearTimeout(id);
  }, [tarjeta, montoCompra, intento]);

  const titulo = tarjeta ? STR.pago.cmfElegirCuotas : STR.pago.cmfElegirTarjeta;
  const planElegido = planes.find((p) => p.id === planId) ?? null;

  const volver = () => {
    if (tarjeta) {
      setTarjeta(null);
      setPlanId(null);
      return;
    }
    onCerrar();
  };

  const aviso = (texto: string, acciones?: { texto: string; onAccion: () => void }[]) => (
    <div
      className="flex flex-col"
      style={{ gap: "10px", padding: "16px", borderRadius: "16px", backgroundColor: "var(--gray-3)" }}
    >
      <p style={{ ...meta, fontSize: "14px", lineHeight: "20px", color: "var(--primary-black)", margin: 0 }}>
        {texto}
      </p>
      {acciones?.map((a) => (
        <button
          key={a.texto}
          type="button"
          onClick={a.onAccion}
          className="self-start border-none bg-transparent px-0"
          style={{
            ...meta,
            fontSize: "13px",
            fontWeight: "var(--font-weight-medium)",
            color: "var(--info-blue)",
            minHeight: "40px",
            cursor: "pointer",
          }}
        >
          {a.texto}
        </button>
      ))}
    </div>
  );

  const cargando = (texto: string) => (
    <p style={{ ...meta, fontSize: "14px", lineHeight: "20px", color: "var(--gray-60)", margin: 0 }}>
      {texto}
    </p>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ backgroundColor: "var(--primary-white)" }}
      role="dialog"
      aria-modal="true"
      aria-label={titulo}
    >
      <header
        className="px-4 pt-[20px] pb-3 flex items-center shrink-0"
        style={{ gap: "12px", borderBottom: "1px solid var(--gray-8)" }}
      >
        <button
          type="button"
          onClick={volver}
          aria-label={STR.pago.volver}
          className="flex items-center justify-center border flex-shrink-0"
          style={{
            width: "44px",
            height: "44px",
            borderRadius: "10px",
            backgroundColor: "var(--primary-white)",
            borderColor: "var(--gray-20)",
            cursor: "pointer",
          }}
        >
          <ArrowLeft size={20} strokeWidth={2} color="var(--primary-black)" aria-hidden="true" />
        </button>
        <h2
          className="truncate"
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
      </header>

      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-8">
        {/* ── Paso 1: la tarjeta ── */}
        {!tarjeta && (
          <>
            {estado === "cargando" && cargando(STR.pago.cmfCargando)}

            {estado === "error" &&
              aviso(STR.pago.cmfError, [
                { texto: STR.pago.cmfReintentar, onAccion: () => setIntento((i) => i + 1) },
                { texto: STR.pago.cmfOtroMetodo, onAccion: onOtroMetodo },
              ])}

            {estado === "sin-tarjetas" && (
              <div className="flex flex-col" style={{ gap: "10px" }}>
                {aviso(STR.pago.cmfSinTarjetas)}
                <p style={{ ...meta, fontSize: "13px", lineHeight: "19px", color: "var(--gray-60)", margin: 0 }}>
                  {STR.pago.cmfSinTarjetasAyuda}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    if (!ENLACE_SOLICITUD_CMF) {
                      onEnlaceSinConfigurar();
                      return;
                    }
                    window.open(ENLACE_SOLICITUD_CMF, "_blank", "noopener,noreferrer");
                  }}
                  className="self-start border-none bg-transparent px-0"
                  style={{
                    ...meta,
                    fontSize: "14px",
                    fontWeight: "var(--font-weight-medium)",
                    color: "var(--info-blue)",
                    minHeight: "44px",
                    cursor: "pointer",
                  }}
                >
                  {STR.pago.cmfSolicitar}
                </button>
              </div>
            )}

            {estado === "ok" && (
              <>
                <p
                  style={{
                    ...meta,
                    fontSize: "14px",
                    lineHeight: "20px",
                    color: "var(--gray-60)",
                    margin: "0 0 12px",
                  }}
                >
                  {STR.pago.cmfElegirTarjetaAyuda}
                </p>
                <div className="flex flex-col" style={{ gap: "12px" }}>
                  {tarjetas.map((t) => {
                    const arte = t.arte ? ARTES[t.arte] : null;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => {
                          setTarjeta(t);
                          setPlanId(null);
                        }}
                        className="flex w-full items-center text-left"
                        style={{
                          gap: "12px",
                          padding: "12px 14px",
                          borderRadius: "14px",
                          backgroundColor: "var(--primary-white)",
                          border: "1px solid var(--gray-20)",
                          cursor: "pointer",
                        }}
                      >
                        {/* La tarjeta, a escala y entera: el ancho manda y el
                            alto sale de su proporción. Sin recortes ni
                            deformaciones. */}
                        <span
                          className="flex shrink-0 items-center justify-center overflow-hidden"
                          style={{
                            width: `${ANCHO_MINIATURA}px`,
                            borderRadius: "6px",
                          }}
                        >
                          <img
                            src={arte ?? cmfLogoUrl}
                            alt=""
                            aria-hidden="true"
                            style={{
                              width: arte ? "100%" : "40px",
                              height: "auto",
                              display: "block",
                            }}
                          />
                        </span>

                        <span className="min-w-0 flex-1">
                          {/* Nombre de la tarjeta: entra en dos líneas si
                              hace falta, no se recorta. */}
                          <span
                            className="block"
                            style={{
                              ...meta,
                              fontSize: "15px",
                              lineHeight: "20px",
                              fontWeight: "var(--font-weight-medium)",
                              color: "var(--primary-black)",
                            }}
                          >
                            {t.nombre}
                          </span>
                          <span
                            className="block"
                            style={{
                              ...meta,
                              fontSize: "13px",
                              lineHeight: "18px",
                              color: "var(--gray-60)",
                            }}
                          >
                            {`•••• ${t.ultimos}`}
                          </span>
                        </span>

                        <ChevronRight
                          size={20}
                          strokeWidth={2}
                          color="var(--gray-40)"
                          aria-hidden="true"
                          style={{ flexShrink: 0 }}
                        />
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </>
        )}

        {/* ── Paso 2: el plan ── */}
        {tarjeta && (
          <>
            {/* La tarjeta elegida: logo, nombre, los cuatro últimos y el
                importe que se financia. Va en blanco y se separa del listado
                con una línea, no con otra caja: es el encabezado de las
                cuotas, no una tarjeta más.

                No lleva "Cambiar": la flecha del encabezado ya vuelve al
                paso de la tarjeta. */}
            <div
              className="flex items-center"
              style={{
                gap: "12px",
                padding: "0 0 12px",
                marginBottom: "12px",
                backgroundColor: "var(--primary-white)",
                borderBottom: "1px solid var(--gray-8)",
              }}
            >
              <span
                className="flex shrink-0 items-center justify-center"
                style={{ width: "44px", height: "30px" }}
              >
                <img
                  src={cmfLogoUrl}
                  alt=""
                  aria-hidden="true"
                  style={{ width: "40px", height: "auto", display: "block" }}
                />
              </span>
              <span className="min-w-0 flex-1">
                <span
                  className="block truncate"
                  style={{
                    ...meta,
                    fontSize: "14px",
                    lineHeight: "20px",
                    fontWeight: "var(--font-weight-medium)",
                    color: "var(--primary-black)",
                  }}
                >
                  {`${tarjeta.nombre} •••• ${tarjeta.ultimos}`}
                </span>
                <span
                  className="block"
                  style={{ ...meta, fontSize: "13px", lineHeight: "18px", color: "var(--gray-60)" }}
                >
                  {`${STR.pago.cmfCompraAFinanciar}: ${formatearMonto(montoCompra)}`}
                </span>
              </span>
            </div>

            {estadoPlanes === "cargando" && cargando(STR.pago.cmfCargandoPlanes)}

            {estadoPlanes === "error" &&
              aviso(STR.pago.cmfError, [
                { texto: STR.pago.cmfReintentar, onAccion: () => setIntento((i) => i + 1) },
                { texto: STR.pago.cmfOtroMetodo, onAccion: onOtroMetodo },
              ])}

            {estadoPlanes === "sin-planes" &&
              aviso(STR.pago.cmfSinPlanes, [
                { texto: STR.pago.cmfCambiar, onAccion: () => setTarjeta(null) },
                { texto: STR.pago.cmfOtroMetodo, onAccion: onOtroMetodo },
              ])}

            {estadoPlanes === "credito-insuficiente" &&
              aviso(STR.pago.cmfCreditoInsuficiente, [
                { texto: STR.pago.cmfCambiar, onAccion: () => setTarjeta(null) },
                { texto: STR.pago.cmfOtroMetodo, onAccion: onOtroMetodo },
              ])}

            {estadoPlanes === "ok" && (
              <>
                <div
                  role="radiogroup"
                  aria-label={STR.pago.cmfElegirCuotas}
                  className="flex flex-col"
                  style={{
                    gap: "8px",
                    padding: "8px",
                    borderRadius: "16px",
                    backgroundColor: "var(--gray-3)",
                  }}
                >
                  {planes.map((p) => {
                    const elegido = p.id === planId;
                    const entra = alcanzaCredito(p.total, tarjeta.disponible);
                    const cuotas =
                      p.cuotas === 1
                        ? STR.pago.cmfUnaCuota(formatearMonto(p.montoCuota))
                        : STR.pago.cmfCuotasDe(p.cuotas, formatearMonto(p.montoCuota));
                    return (
                      <button
                        key={p.id}
                        type="button"
                        role="radio"
                        aria-checked={elegido}
                        disabled={!entra}
                        aria-label={`${cuotas}. ${STR.pago.cmfTotal} ${formatearMonto(
                          p.total,
                        )}`}
                        onClick={() => setPlanId(p.id)}
                        className="flex w-full items-center text-left"
                        style={{
                          gap: "12px",
                          minHeight: "56px",
                          padding: "12px 14px",
                          borderRadius: "12px",
                          backgroundColor: "var(--primary-white)",
                          // El borde va siempre, transparente cuando no está
                          // elegido: así la fila no salta de alto.
                          border: "1.5px solid",
                          borderColor: elegido ? "var(--success-green)" : "transparent",
                          opacity: entra ? 1 : 0.5,
                          cursor: entra ? "pointer" : "default",
                        }}
                      >
                        {/* Izquierda: las cuotas y lo que se paga por cada
                            una. Es el dato que se compara, así que es lo
                            único con peso en la fila. */}
                        <span
                          className="min-w-0 flex-1"
                          style={{
                            ...meta,
                            fontSize: "15px",
                            lineHeight: "20px",
                            fontWeight: "var(--font-weight-medium)",
                            color: "var(--primary-black)",
                          }}
                        >
                          {cuotas}
                        </span>

                        {/* Derecha: el total, más chico y en gris, para que
                            acompañe sin competir. */}
                        <span
                          className="shrink-0"
                          style={{
                            ...meta,
                            fontSize: "13px",
                            lineHeight: "18px",
                            color: "var(--gray-60)",
                          }}
                        >
                          {`${STR.pago.cmfTotal} `}
                          <span style={{ color: "var(--primary-black)" }}>
                            {formatearMonto(p.total)}
                          </span>
                        </span>

                        <span
                          aria-hidden="true"
                          className="flex shrink-0 items-center justify-center"
                          style={{
                            width: "18px",
                            height: "18px",
                            borderRadius: "50%",
                            border: `1.5px solid ${elegido ? "var(--success-green)" : "var(--gray-20)"}`,
                            backgroundColor: "var(--primary-white)",
                          }}
                        >
                          {elegido && (
                            <span
                              style={{
                                width: "9px",
                                height: "9px",
                                borderRadius: "50%",
                                backgroundColor: "var(--success-green)",
                              }}
                            />
                          )}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* Un solo botón principal, y solo en el paso del plan. */}
      {tarjeta && estadoPlanes === "ok" && (
        <div
          className="px-4 pt-3 pb-4 shrink-0"
          style={{ borderTop: "1px solid var(--gray-8)", backgroundColor: "var(--primary-white)" }}
        >
          <button
            type="button"
            disabled={!planElegido}
            onClick={() => {
              if (!planElegido) return;
              onUsarPlan({ tarjeta, plan: planElegido, montoCompra });
            }}
            className="w-full border-none"
            style={{
              height: "48px",
              borderRadius: "12px",
              backgroundColor: planElegido ? "var(--primary-yellow)" : "var(--gray-8)",
              ...meta,
              fontSize: "16px",
              fontWeight: "var(--font-weight-medium)",
              color: planElegido ? "var(--primary-black)" : "var(--gray-60)",
              cursor: planElegido ? "pointer" : "default",
            }}
          >
            {STR.pago.cmfUsarCuotas}
          </button>
        </div>
      )}
    </div>
  );
}
