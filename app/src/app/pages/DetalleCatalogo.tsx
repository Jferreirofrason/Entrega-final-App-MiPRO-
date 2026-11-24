import { useRef } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Info } from "lucide-react";
import { STR } from "../i18n/strings";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { buscarServicioCatalogo } from "../data/catalogo";
import { tieneCuestionario } from "../data/cuestionarioLugar";
import {
  leerBorradorServicio,
  guardarBorradorServicio,
} from "../data/borradorServicio";
import { avisoEvaluacion, presentarPrecio } from "../logic/catalogo";
import { PRECIO_INSPECCION_USD } from "../logic/solicitudServicio";

// Detalle de un servicio del catálogo (MIPRO-1472): qué es, qué incluye y
// cómo sigue. La acción principal crea la solicitud y lleva a la
// confirmación; la solicitud queda visible en "Mis Citas".
export function DetalleCatalogo() {
  const { id } = useParams();
  const navigate = useNavigate();
  const servicio = id ? buscarServicioCatalogo(id) : null;
  const procesando = useRef(false);

  const meta = {
    fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif",
  } as const;

  if (!servicio) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-6 py-20">
        <p style={{ ...meta, fontSize: "14px", color: "var(--gray-60)" }}>
          {STR.catalogo.noEncontrado}
        </p>
        <button
          onClick={() => navigate("/catalogo")}
          className="mt-4 px-4 transition-opacity hover:opacity-80"
          style={{
            height: "44px",
            backgroundColor: "var(--primary-yellow)",
            borderRadius: "12px",
            ...meta,
            fontSize: "14px",
            fontWeight: "var(--font-weight-medium)",
            color: "var(--primary-black)",
            border: "none",
            cursor: "pointer",
          }}
        >
          {STR.catalogo.volver}
        </button>
      </div>
    );
  }

  // Una sola regla para el aviso de evaluación previa, la misma que usa el
  // catálogo: así el listado y el detalle no pueden decir cosas distintas
  // del mismo servicio.
  const aviso = avisoEvaluacion(servicio);

  const onSolicitar = () => {
    if (procesando.current) return;
    procesando.current = true;
    // Servicios de instalación con cuestionario: primero "Revisar el lugar".
    // El resto entra directo a la configuración. La solicitud se crea al
    // final del flujo (resumen), nunca desde el detalle.
    // Iniciar el agendamiento SIEMPRE hace las preguntas de nuevo: se
    // descarta el resultado de una revisión anterior (el resto del borrador,
    // cantidad o dirección a medias, se conserva).
    // Inspección obligatoria: no hay preguntas que hacer, la visita de
    // evaluación va siempre; el resultado queda decidido en el borrador.
    if (servicio.inspeccionObligatoria) {
      guardarBorradorServicio({
        ...leerBorradorServicio(servicio.id),
        condiciones: "inspeccion",
        incluyeDesinstalacion: undefined,
      });
    } else if (tieneCuestionario(servicio.id)) {
      guardarBorradorServicio({
        ...leerBorradorServicio(servicio.id),
        condiciones: undefined,
        incluyeDesinstalacion: undefined,
      });
    }
    const destino = !servicio.inspeccionObligatoria && tieneCuestionario(servicio.id)
      ? `/catalogo/${servicio.id}/revisar-lugar`
      : `/catalogo/${servicio.id}/configurar`;
    navigate(destino);
    setTimeout(() => {
      procesando.current = false;
    }, 600);
  };

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: "var(--primary-white)" }}>
      <header
        className="flex items-center gap-3 px-6 pt-[20px] pb-4 bg-white sticky top-0 z-20"
        style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}
      >
        <button
          onClick={() => navigate(-1)}
          aria-label={STR.catalogo.volver}
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
            {STR.catalogo.titulo}
          </h1>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <section className="px-6 pt-6 pb-8">
          {/* Toda ficha abre con imagen. Que la foto sea todavía la de la
              categoría y no la propia del servicio queda como marca interna
              (imagenProvisional), para que negocio audite qué falta cargar:
              en pantalla NO se aclara nada. */}
          {servicio.imagen && (
            <div
              className="w-full overflow-hidden mb-4"
              style={{ aspectRatio: "2.2 / 1", borderRadius: "14px", backgroundColor: "var(--gray-8)" }}
            >
              <ImageWithFallback
                src={servicio.imagen}
                alt={servicio.imagenAlt ?? ""}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center flex-shrink-0"
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                backgroundColor: "var(--gray-3)",
              }}
            >
              <servicio.icono size={24} strokeWidth={2} color="var(--primary-black)" aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0">
              <h2
                style={{
                  fontFamily: "'Bebas Neue', Arial, sans-serif",
                  fontSize: "22px",
                  fontWeight: "var(--font-weight-normal)",
                  color: "var(--foreground)",
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                  lineHeight: "1.2",
                  margin: 0,
                }}
              >
                {servicio.nombre}
              </h2>
              <p style={{ ...meta, fontSize: "12px", color: "var(--gray-60)", margin: "2px 0 0" }}>
                {[servicio.categoria, servicio.subcategoria].filter(Boolean).join(" · ")}
              </p>
            </div>
          </div>

          <div className="flex items-baseline gap-2 flex-wrap" style={{ marginTop: "10px" }}>
            <span style={{ ...meta, fontSize: "18px", fontWeight: "var(--font-weight-medium)", color: "var(--primary-black)" }}>
              {presentarPrecio(servicio)}
            </span>
          </div>

          {/* Descripción en texto: la estructura de la ficha la incluye
              siempre. Que sea la provisional o la definitiva queda como
              marca interna (descripcionProvisional); en pantalla se lee
              igual, sin ninguna leyenda. */}
          {servicio.descripcion && (
            <p style={{ ...meta, fontSize: "14px", lineHeight: "21px", color: "var(--gray-80)", margin: "14px 0 0" }}>
              {servicio.descripcion}
            </p>
          )}

          {aviso !== "no" && (
            <div
              className="mt-4 border"
              style={{
                backgroundColor: "var(--card)",
                borderColor: "var(--gray-20)",
                borderLeft: "4px solid var(--primary-yellow)",
                borderRadius: "10px",
                padding: "16px",
              }}
            >
              <p
                style={{
                  ...meta,
                  fontSize: "12px",
                  fontWeight: "var(--font-weight-medium)",
                  color: "var(--gray-60)",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  margin: 0,
                }}
              >
                {STR.catalogo.importante}
              </p>
              <p style={{ ...meta, fontSize: "15px", lineHeight: "21px", fontWeight: "var(--font-weight-medium)", color: "var(--primary-black)", margin: "6px 0 0" }}>
                {aviso === "obligatoria"
                  ? STR.catalogo.inspeccionObligatoriaTitulo
                  : STR.catalogo.inspeccionTitulo}
              </p>
              <p style={{ ...meta, fontSize: "14px", lineHeight: "20px", color: "var(--gray-80)", margin: "6px 0 0" }}>
                {aviso === "obligatoria"
                  ? STR.catalogo.inspeccionObligatoriaDetalle
                  : STR.catalogo.inspeccionDetalle}
              </p>
              {/* El costo de la evaluación, explícito y separado */}
              <div
                style={{
                  marginTop: "10px",
                  paddingTop: "10px",
                  borderTop: "1px solid var(--gray-8)",
                }}
              >
                {/* El costo definido para ESTE servicio (mientras el negocio
                    no cargue montos por SKU, aplica el general de $20). */}
                <p style={{ ...meta, fontSize: "14px", fontWeight: "var(--font-weight-medium)", color: "var(--primary-black)", margin: 0 }}>
                  {STR.catalogo.inspeccionCosto(servicio.costoEvaluacion ?? PRECIO_INSPECCION_USD)}
                </p>
                <p style={{ ...meta, fontSize: "13px", lineHeight: "19px", color: "var(--gray-60)", margin: "3px 0 0" }}>
                  {STR.catalogo.inspeccionDescuento}
                </p>
              </div>
            </div>
          )}

          <div
            className="flex items-start gap-1.5 mt-4 p-3"
            style={{ backgroundColor: "var(--gray-3)", borderRadius: "10px" }}
          >
            <Info size={14} color="var(--gray-60)" style={{ flexShrink: 0, marginTop: "2px" }} aria-hidden="true" />
            <p style={{ ...meta, fontSize: "13px", lineHeight: "19px", color: "var(--gray-80)", margin: 0 }}>
              {STR.catalogo.comoSigueDetalle}
            </p>
          </div>
        </section>
      </div>

      {/* Acción primaria del flujo (fija dentro del flujo, no en el Home) */}
      <div
        className="px-6 py-4 bg-white flex-shrink-0"
        style={{ borderTop: "1px solid var(--gray-8)" }}
      >
        <button
          onClick={onSolicitar}
          className="w-full transition-transform hover:scale-[1.01] active:scale-[0.99] border-none"
          style={{
            // CTA primario fijo: misma altura que los Continuar del flujo.
            height: "56px",
            backgroundColor: "var(--primary-yellow)",
            borderRadius: "12px",
            ...meta,
            fontSize: "16px",
            fontWeight: "var(--font-weight-medium)",
            color: "var(--primary-black)",
            cursor: "pointer",
          }}
        >
          {STR.catalogo.solicitar}
        </button>
      </div>
    </div>
  );
}
