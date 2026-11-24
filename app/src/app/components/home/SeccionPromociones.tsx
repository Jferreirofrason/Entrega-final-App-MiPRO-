import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { ChevronRight, Info } from "lucide-react";
import { Skeleton } from "../ui/skeleton";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { STR } from "../../i18n/strings";
import {
  INTERVALO_CARRUSEL_MS,
  PromocionConfig,
  siguienteAutomatico,
} from "../../logic/promociones";
import { cargarPromociones, leerEscenarioPromos } from "../../data/promotions";
import { abrirPromocion } from "../../lib/navegacion";
import { TituloSeccion } from "./TituloSeccion";
import { BloqueError } from "./BloqueError";

type Fase = "cargando" | "error" | "ok";

// Sección "Promociones" del Home.
//
// Cada card responde de un vistazo qué servicio se promociona, qué beneficio
// ofrece y qué pasa al tocarla: card horizontal compacta (la imagen es una
// miniatura, no domina la pantalla), título completo, beneficio en una o dos
// líneas sin cortar, y la acción "Ver servicio" siempre visible para que la
// interactividad no dependa de adivinar. Se muestra una card completa por
// vez, con un asomo de la siguiente (~20 px) para sugerir continuidad sin
// cortar contenido. Sin autoavance, sin loop: en la última se detiene. El tap
// delega en lib/navegacion.ts; mientras el detalle de servicio no exista
// (MIPRO-1472) muestra un aviso.
export function SeccionPromociones({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [fase, setFase] = useState<Fase>("cargando");
  const [promos, setPromos] = useState<PromocionConfig[]>([]);
  const [aviso, setAviso] = useState<string | null>(null);
  const [intento, setIntento] = useState(0);
  const [indice, setIndice] = useState(0);
  const pista = useRef<HTMLDivElement>(null);
  // El autoavance se pausa mientras la persona está tocando el carrusel y
  // mientras la pestaña no se ve; retomarlo apenas suelta evitaría que el
  // banner se mueva solo justo cuando quiere leerlo.
  const [pausado, setPausado] = useState(false);
  // Evita que toques repetidos disparen varias navegaciones.
  const procesando = useRef(false);

  useEffect(() => {
    let cancelado = false;
    setFase("cargando");
    cargarPromociones(leerEscenarioPromos(location.search))
      .then((data) => {
        if (cancelado) return;
        setPromos(data);
        setFase("ok");
      })
      .catch(() => {
        if (!cancelado) setFase("error");
      });
    return () => {
      cancelado = true;
    };
  }, [location.search, intento]);

  // Posición de cada banner dentro de la pista. Se mide sobre los hijos
  // reales y NO sobre el ancho del contenedor: cada banner mide el ancho
  // visible menos el asomo del siguiente, más el espacio entre los dos, así
  // que multiplicar por el ancho del contenedor se iba corriendo de a poco
  // hasta quedarse trabado contra el final.
  const posiciones = () => {
    const el = pista.current;
    if (!el) return [] as number[];
    const base = el.getBoundingClientRect().left - el.scrollLeft;
    return [...el.children].map((hijo) => (hijo as HTMLElement).getBoundingClientRect().left - base);
  };

  const indiceActual = (el: HTMLElement, pos: number[]) => {
    if (pos.length === 0) return 0;
    let masCerca = 0;
    for (let i = 1; i < pos.length; i += 1) {
      if (Math.abs(pos[i] - el.scrollLeft) < Math.abs(pos[masCerca] - el.scrollLeft)) masCerca = i;
    }
    return masCerca;
  };

  // Posición actual leída del scroll real: sirve igual para el swipe, para
  // el trackpad y para el autoavance, porque los tres mueven lo mismo.
  useEffect(() => {
    const el = pista.current;
    if (!el) return;
    let pendiente = 0;
    const alScrollear = () => {
      cancelAnimationFrame(pendiente);
      pendiente = requestAnimationFrame(() => setIndice(indiceActual(el, posiciones())));
    };
    el.addEventListener("scroll", alScrollear, { passive: true });
    return () => {
      cancelAnimationFrame(pendiente);
      el.removeEventListener("scroll", alScrollear);
    };
  }, [fase, promos.length]);

  const irA = (i: number) => {
    const el = pista.current;
    const pos = posiciones();
    if (!el || pos[i] === undefined) return;
    el.scrollTo({ left: pos[i], behavior: "smooth" });
  };

  // Autoavance. No corre con una sola promoción, ni con el movimiento
  // reducido activado, ni mientras se está tocando el carrusel.
  useEffect(() => {
    if (fase !== "ok" || promos.length <= 1 || pausado) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const id = window.setInterval(() => {
      if (document.hidden) return;
      const el = pista.current;
      if (!el) return;
      const pos = posiciones();
      if (pos.length === 0) return;
      const siguiente = siguienteAutomatico(indiceActual(el, pos), pos.length);
      el.scrollTo({ left: pos[siguiente], behavior: "smooth" });
    }, INTERVALO_CARRUSEL_MS);

    return () => window.clearInterval(id);
  }, [fase, promos.length, pausado]);

  const onTapPromo = (promo: PromocionConfig) => {
    if (procesando.current) return;
    procesando.current = true;
    const navego = abrirPromocion(navigate, promo);
    if (!navego) setAviso(STR.promociones.destinoPendiente);
    setTimeout(() => {
      procesando.current = false;
    }, 600);
  };

  // Sin promociones vigentes, la sección no se muestra.
  if (fase === "ok" && promos.length === 0) return null;

  const textoBase = {
    fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif",
  } as const;

  return (
    <section aria-labelledby="titulo-promociones" className={className} style={{ display: "flex", flexDirection: "column", gap: "16px", ...style }}>
      <TituloSeccion id="titulo-promociones">
        {STR.promociones.titulo}
      </TituloSeccion>

      {fase === "cargando" && (
        <div
          role="status"
          aria-label={STR.promociones.cargando}
          aria-busy="true"
          style={{ display: "flex", flexDirection: "column", gap: "16px" }}
        >
          <Skeleton
            className="w-full"
            style={{ height: "150px", borderRadius: "16px", backgroundColor: "var(--gray-8)" }}
          />
          <div className="flex justify-center gap-2">
            <Skeleton className="w-5 h-2 rounded-full" style={{ backgroundColor: "var(--gray-8)" }} />
            <Skeleton className="w-2 h-2 rounded-full" style={{ backgroundColor: "var(--gray-8)" }} />
            <Skeleton className="w-2 h-2 rounded-full" style={{ backgroundColor: "var(--gray-8)" }} />
          </div>
        </div>
      )}

      {fase === "error" && (
        <div>
          <BloqueError
            mensaje={STR.promociones.error}
            reintentarTexto={STR.promociones.reintentar}
            onReintentar={() => setIntento((n) => n + 1)}
          />
        </div>
      )}

      {fase === "ok" && promos.length > 0 && (
        <>
          {/* Pista con scroll nativo y ajuste por banner, el mismo patrón
              que el carrusel "Servicios para tu hogar". Al ser scroll de
              verdad funciona el swipe, el trackpad en dos dedos y la rueda
              horizontal; antes era un carrusel por arrastre y con trackpad
              no se movía. El autoavance escribe sobre este mismo scroll. */}
          <div
            ref={pista}
            className="flex overflow-x-auto -mx-6 px-6"
            style={{
              scrollbarWidth: "none",
              scrollSnapType: "x mandatory",
              scrollPaddingLeft: "24px",
              gap: "12px",
            }}
            onPointerDown={() => setPausado(true)}
            onPointerUp={() => setPausado(false)}
            onPointerCancel={() => setPausado(false)}
            onMouseEnter={() => setPausado(true)}
            onMouseLeave={() => setPausado(false)}
          >
            {promos.map((promo) => (
              <div
                key={promo.id}
                className="flex-shrink-0"
                style={{
                  // El siguiente banner asoma ~20px: se ve que hay más.
                  width: promos.length > 1 ? "calc(100% - 32px)" : "100%",
                  scrollSnapAlign: "start",
                }}
              >
                  {/* Banner de alto impacto: fotografía a sangre completa con
                      gradiente negro, beneficio en Bebas blanco y el servicio
                      como chip amarillo. Mismo lenguaje que la card oscura del
                      Home. El texto vive en HTML y el fondo del contenedor es
                      negro: sigue legible aunque la imagen falle. */}
                  <button
                    onClick={() => onTapPromo(promo)}
                    aria-label={`${promo.titulo}. ${promo.detalle}`}
                    className="w-full text-left overflow-hidden transition-all active:scale-[0.98]"
                    style={{
                      border: "none",
                      borderRadius: "16px",
                      boxShadow: "0 8px 28px 0 rgba(0, 0, 0, 0.16)",
                      cursor: "pointer",
                      padding: 0,
                      position: "relative",
                      height: "150px",
                      backgroundColor: "var(--primary-black)",
                      display: "block",
                    }}
                  >
                    <ImageWithFallback
                      src={promo.imagen}
                      alt={promo.descripcion}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    {/* Gradiente para la legibilidad del texto */}
                    <div
                      aria-hidden="true"
                      className="absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(90deg, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.55) 48%, rgba(0,0,0,0.08) 100%)",
                      }}
                    />
                    <div
                      className="absolute inset-0 flex flex-col justify-center items-start"
                      style={{ padding: "16px 30% 16px 18px", gap: "10px" }}
                    >
                      <p
                        style={{
                          fontFamily: "'Bebas Neue', Arial, sans-serif",
                          fontSize: "24px",
                          lineHeight: "1.05",
                          letterSpacing: "1px",
                          textTransform: "uppercase",
                          color: "var(--primary-white)",
                          margin: 0,
                        }}
                      >
                        {promo.beneficio}
                      </p>
                      {/* El nombre del servicio va siempre en una sola línea */}
                      <span
                        className="inline-flex items-center gap-0.5"
                        style={{
                          backgroundColor: "var(--primary-yellow)",
                          borderRadius: "8px",
                          padding: "6px 12px",
                          maxWidth: "100%",
                          ...textoBase,
                          fontSize: "12.5px",
                          fontWeight: "var(--font-weight-medium)",
                          color: "var(--primary-black)",
                        }}
                      >
                        <span
                          style={{
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {promo.titulo}
                        </span>
                        <ChevronRight size={14} strokeWidth={2.5} style={{ flexShrink: 0 }} aria-hidden="true" />
                      </span>
                    </div>
                  </button>
              </div>
            ))}
          </div>

          {promos.length > 1 && (
            <div className="flex justify-center gap-1">
              {promos.map((promo, i) => (
                <button
                  key={promo.id}
                  onClick={() => irA(i)}
                  aria-label={STR.promociones.irA(i + 1)}
                  aria-current={i === indice}
                  className="flex items-center justify-center"
                  style={{
                    minWidth: "28px",
                    // 44 de alto tocable, el mínimo de la app. Los márgenes
                    // negativos descuentan lo que el botón agrega alrededor
                    // del punto, así la fila mide lo que mide el punto y el
                    // gap de 16 de la sección es el que se ve.
                    minHeight: "44px",
                    marginTop: "-18px",
                    marginBottom: "-18px",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  <span
                    aria-hidden="true"
                    className="rounded-full transition-all"
                    style={{
                      width: i === indice ? "20px" : "8px",
                      height: "8px",
                      backgroundColor:
                        i === indice ? "var(--primary-black)" : "var(--gray-20)",
                    }}
                  />
                </button>
              ))}
            </div>
          )}
          {/* Posición disponible para lectores de pantalla, sin anunciar cada
              autoavance (sería ruido cada pocos segundos). */}
          <p className="sr-only">
            {STR.promociones.posicion(indice + 1, promos.length)}
          </p>

          {/* Región viva siempre montada, para que el aviso se anuncie cuando
              aparece. Vacía va en sr-only: no ocupa lugar en la columna. */}
          <div role="status" className={aviso ? undefined : "sr-only"}>
            {aviso && (
              <p
                className="flex items-center gap-1.5"
                style={{
                  ...textoBase,
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
        </>
      )}
    </section>
  );
}
