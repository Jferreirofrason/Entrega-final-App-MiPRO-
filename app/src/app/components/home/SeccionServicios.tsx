import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { ChevronRight } from "lucide-react";
import { Skeleton } from "../ui/skeleton";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { STR } from "../../i18n/strings";
import { presentarPrecio } from "../../logic/catalogo";
import {
  ServicioCatalogoUI,
  cargarDestacados,
  leerEscenarioDestacados,
} from "../../data/catalogo";
import { TituloSeccion } from "./TituloSeccion";
import { BloqueError } from "./BloqueError";

type Fase = "cargando" | "error" | "ok";

// Sección "Servicios para tu hogar": la entrada visible al catálogo.
// Carrusel horizontal de accesos compactos con fotografía (destacados de
// configuración local del MVP, pendiente de producto), precio y la marca de
// inspección cuando aplica; scroll-snap alinea cada card al margen y el
// asomo de la siguiente es intencional. Cierra con el acceso al catálogo
// completo. Compacto a propósito: el Home prioriza el servicio activo.
export function SeccionServicios({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [fase, setFase] = useState<Fase>("cargando");
  const [destacados, setDestacados] = useState<ServicioCatalogoUI[]>([]);
  const [intento, setIntento] = useState(0);
  const procesando = useRef(false);

  useEffect(() => {
    let cancelado = false;
    setFase("cargando");
    cargarDestacados(leerEscenarioDestacados(location.search))
      .then((data) => {
        if (cancelado) return;
        setDestacados(data);
        setFase("ok");
      })
      .catch(() => {
        if (!cancelado) setFase("error");
      });
    return () => {
      cancelado = true;
    };
  }, [location.search, intento]);

  const meta = { fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif" } as const;

  const abrir = (destino: string) => {
    if (procesando.current) return;
    procesando.current = true;
    navigate(destino);
    setTimeout(() => {
      procesando.current = false;
    }, 600);
  };

  return (
    <section
      aria-labelledby="titulo-servicios-hogar"
      className={className}
      /* 24 entre el bloque de encabezado y cards y el botón de abajo. */
      style={{ display: "flex", flexDirection: "column", gap: "24px", ...style }}
    >
      {/* Encabezado y cards van juntos: 16 entre el subtítulo y el carrusel. */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <TituloSeccion id="titulo-servicios-hogar" bajada={STR.serviciosHogar.descripcion}>
        {STR.serviciosHogar.titulo}
      </TituloSeccion>

      {fase === "cargando" && (
        <div role="status" aria-label={STR.serviciosHogar.cargando} aria-busy="true" className="flex gap-3 overflow-hidden">
          {[0, 1, 2].map((n) => (
            <div
              key={n}
              className="border flex-shrink-0"
              style={{ width: "156px", borderColor: "var(--gray-8)", borderRadius: "14px", overflow: "hidden" }}
            >
              <Skeleton className="w-full h-[88px] rounded-none" style={{ backgroundColor: "var(--gray-8)" }} />
              <div style={{ padding: "10px" }}>
                <Skeleton className="h-4 w-full" style={{ backgroundColor: "var(--gray-8)" }} />
                <Skeleton className="h-3.5 w-1/2 mt-2" style={{ backgroundColor: "var(--gray-8)" }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {fase === "error" && (
        <div>
          <BloqueError
            mensaje={STR.serviciosHogar.error}
            reintentarTexto={STR.serviciosHogar.reintentar}
            onReintentar={() => setIntento((n) => n + 1)}
          />
          <div className="flex justify-center">
            <button
              onClick={() => abrir("/catalogo")}
              className="flex items-center gap-0.5 px-2"
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
              {STR.serviciosHogar.verCatalogo}
              <ChevronRight size={16} strokeWidth={2} aria-hidden="true" />
            </button>
          </div>
        </div>
      )}

      {fase === "ok" && destacados.length === 0 && (
        <div
          className="flex flex-col items-center gap-3 p-6 text-center border"
          style={{
            backgroundColor: "var(--card)",
            borderColor: "var(--gray-8)",
            borderRadius: "16px",
          }}
        >
          <p style={{ ...meta, fontSize: "13px", lineHeight: "19px", color: "var(--gray-60)", margin: 0 }}>
            {STR.serviciosHogar.vacioTexto}
          </p>
          <button
            onClick={() => abrir("/catalogo")}
            className="w-full transition-transform hover:scale-[1.01] active:scale-[0.99] border-none"
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
            {STR.serviciosHogar.vacioAccion}
          </button>
        </div>
      )}

      {fase === "ok" && destacados.length > 0 && (
        <div
          className="flex gap-3 overflow-x-auto -mx-6 px-6 pb-1"
          style={{
            scrollbarWidth: "none",
            scrollSnapType: "x mandatory",
            scrollPaddingLeft: "24px",
          }}
        >
          {destacados.map((servicio) => {
            const precio = presentarPrecio(servicio);
            return (
              <button
                key={servicio.id}
                onClick={() => abrir(`/catalogo/${servicio.id}`)}
                aria-label={[servicio.nombre, precio, servicio.requiereInspeccion ? STR.serviciosHogar.inspeccion : null]
                  .filter(Boolean)
                  .join(". ")}
                className="text-left border transition-all active:scale-[0.98] flex-shrink-0 overflow-hidden"
                style={{
                  width: "156px",
                  scrollSnapAlign: "start",
                  backgroundColor: "var(--card)",
                  borderColor: "var(--gray-8)",
                  borderRadius: "14px",
                  padding: 0,
                  cursor: "pointer",
                }}
              >
                <div
                  className="relative"
                  style={{ width: "100%", height: "88px", backgroundColor: "var(--gray-8)" }}
                >
                  <ImageWithFallback
                    src={servicio.imagen}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  <span
                    aria-hidden="true"
                    className="absolute bottom-0 right-0 flex items-center justify-center"
                    style={{
                      width: "22px",
                      height: "22px",
                      backgroundColor: "var(--primary-black)",
                      borderTopLeftRadius: "8px",
                    }}
                  >
                    <servicio.icono size={12} strokeWidth={2.2} color="var(--primary-yellow)" />
                  </span>
                </div>
                {/* Filas fijas: todas las cards miden lo mismo */}
                <div style={{ padding: "8px 10px 10px" }}>
                  <p
                    className="line-clamp-2"
                    style={{
                      ...meta,
                      fontSize: "13px",
                      lineHeight: "17px",
                      minHeight: "34px",
                      fontWeight: "var(--font-weight-medium)",
                      color: "var(--primary-black)",
                      margin: 0,
                    }}
                  >
                    {servicio.nombre}
                  </p>
                  <p style={{ ...meta, fontSize: "12px", lineHeight: "17px", minHeight: "17px", fontWeight: "var(--font-weight-medium)", color: "var(--primary-black)", margin: "2px 0 0" }}>
                    {precio}
                  </p>
                  <p
                    className="line-clamp-2"
                    style={{ ...meta, fontSize: "10.5px", lineHeight: "14px", minHeight: "28px", color: "var(--gray-60)", margin: "1px 0 0" }}
                  >
                    {servicio.inspeccionObligatoria
                      ? STR.catalogo.conEvaluacion
                      : servicio.requiereInspeccion
                        ? STR.serviciosHogar.inspeccion
                        : " "}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}

      </div>

      {fase === "ok" && destacados.length > 0 && (
        <button
          onClick={() => abrir("/catalogo")}
          className="w-full flex items-center justify-center gap-1 transition-transform hover:scale-[1.01] active:scale-[0.99] border-none"
          style={{
            height: "44px",
            backgroundColor: "var(--primary-yellow)",
            borderRadius: "12px",
            cursor: "pointer",
            ...meta,
            fontSize: "14px",
            fontWeight: "var(--font-weight-medium)",
            color: "var(--primary-black)",
          }}
        >
          {STR.serviciosHogar.verTodosServicios}
          <ChevronRight size={16} strokeWidth={2.5} aria-hidden="true" />
        </button>
      )}
    </section>
  );
}
