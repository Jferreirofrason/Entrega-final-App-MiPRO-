import { useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import { Camera, Minus, Package, Plus, X } from "lucide-react";
import { STR } from "../i18n/strings";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { DesgloseCosto } from "../components/servicios/DesgloseCosto";
import { buscarServicioCatalogo } from "../data/catalogo";
import { PRECIO_BASE_REFERENCIAL_USD, formatearMonto } from "../logic/catalogo";
import {
  leerBorradorServicio,
  guardarBorradorServicio,
} from "../data/borradorServicio";
import {
  CANTIDAD_MAXIMA,
  CANTIDAD_MINIMA,
  validarConfiguracion,
} from "../logic/solicitudServicio";
import type { AdjuntoSolicitud } from "../logic/solicitudGarantia";
import { EncabezadoFlujo } from "../components/agendar/EncabezadoFlujo";
import { Campo, estiloInput, MarcaCampo } from "../components/garantia/Campo";

// Etapa 1 del agendamiento: cantidad, fotos y notas.
// El total estimado se recalcula en pantalla (precio base × cantidad);
// los adicionales se cotizan aparte. Todo queda en el borrador: volver
// atrás no pierde nada.
export function ConfigurarServicio() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  // Edición puntual desde "Revisa tu solicitud": Continuar vuelve directo a
  // la revisión (sin pasos intermedios) y la flecha descarta lo no guardado.
  const desdeRevision = Boolean(
    (location.state as { desdeRevision?: boolean } | null)?.desdeRevision,
  );
  const servicio = id ? buscarServicioCatalogo(id) : null;
  const inicial = id ? leerBorradorServicio(id) : null;

  const [cantidad, setCantidad] = useState(inicial?.cantidad ?? 1);
  const [notas, setNotas] = useState(inicial?.notas ?? "");
  const [fotos, setFotos] = useState<AdjuntoSolicitud[]>(inicial?.fotos ?? []);
  const [error, setError] = useState<string | null>(null);
  const inputFotos = useRef<HTMLInputElement>(null);

  const meta = { fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif" } as const;

  if (!servicio || !inicial) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-6 py-20">
        <p style={{ ...meta, fontSize: "14px", color: "var(--gray-60)" }}>
          {STR.agendar.noEncontrado}
        </p>
      </div>
    );
  }


  const cambiarCantidad = (delta: number) => {
    setCantidad((c) => Math.min(CANTIDAD_MAXIMA, Math.max(CANTIDAD_MINIMA, c + delta)));
    setError(null);
  };

  const agregarFotos = (lista: FileList | null) => {
    if (!lista) return;
    const nuevas: AdjuntoSolicitud[] = Array.from(lista).map((archivo, i) => ({
      id: `foto-${Date.now()}-${i}`,
      nombre: archivo.name,
      estado: "listo",
    }));
    setFotos((f) => [...f, ...nuevas]);
  };

  const continuar = () => {
    const borrador = { ...inicial, cantidad, notas: notas.trim() || undefined, fotos };
    const errores = validarConfiguracion(borrador);
    if (errores.length > 0) {
      setError(errores[0]);
      return;
    }
    guardarBorradorServicio(borrador);
    if (desdeRevision) {
      navigate(-1);
      return;
    }
    navigate(`/catalogo/${servicio.id}/direccion`);
  };

  // Menos con borde neutro; más con el amarillo del sistema. Sutiles, 44px.
  const botonCantidad = (
    etiqueta: string,
    icono: React.ReactNode,
    onClick: () => void,
    deshabilitado: boolean,
    primario: boolean,
  ) => (
    <button
      onClick={onClick}
      aria-label={etiqueta}
      disabled={deshabilitado}
      className="flex items-center justify-center border transition-all active:scale-95 flex-shrink-0"
      style={{
        width: "44px",
        height: "44px",
        borderRadius: "12px",
        backgroundColor: deshabilitado
          ? "var(--gray-3)"
          : primario
            ? "var(--primary-yellow)"
            : "var(--primary-white)",
        borderColor: deshabilitado
          ? "var(--gray-8)"
          : primario
            ? "var(--primary-black)"
            : "var(--gray-20)",
        cursor: deshabilitado ? "default" : "pointer",
        opacity: deshabilitado ? 0.5 : 1,
      }}
    >
      {icono}
    </button>
  );

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: "var(--primary-white)" }}>
      <EncabezadoFlujo
        titulo={servicio.nombre}
        etapa={1}
        onVolver={() => {
          if (desdeRevision) {
            // La edición se descarta: la revisión conserva lo confirmado.
            navigate(-1);
            return;
          }
          // Volver conserva lo editado: el borrador se guarda sin validar.
          guardarBorradorServicio({ ...inicial, cantidad, notas: notas.trim() || undefined, fotos });
          navigate(-1);
        }}
      />

      <div className="flex-1 overflow-y-auto px-6 pt-6 pb-8">
        {/* El servicio elegido, con su foto: el ancla visual de la etapa */}
        <div
          className="flex items-center gap-3 border overflow-hidden"
          style={{
            backgroundColor: "var(--card)",
            borderColor: "var(--gray-8)",
            borderRadius: "14px",
            padding: "8px 12px 8px 8px",
          }}
        >
          <div
            className="flex-shrink-0 overflow-hidden flex items-center justify-center"
            style={{ width: "40px", height: "40px", borderRadius: "8px", backgroundColor: "var(--gray-8)" }}
          >
            {servicio.imagen ? (
              <ImageWithFallback src={servicio.imagen} alt="" className="w-full h-full object-cover" />
            ) : (
              <servicio.icono size={18} strokeWidth={2} color="var(--gray-60)" aria-hidden="true" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p
              style={{
                fontFamily: "'Bebas Neue', Arial, sans-serif",
                fontSize: "16px",
                letterSpacing: "0.5px",
                textTransform: "uppercase",
                color: "var(--primary-black)",
                lineHeight: "1.15",
                margin: 0,
              }}
            >
              {servicio.nombre}
            </p>
            <p style={{ ...meta, fontSize: "13px", color: "var(--gray-60)", margin: "2px 0 0" }}>
              {STR.agendar.precioServicio(formatearMonto(servicio.precioDesde ?? PRECIO_BASE_REFERENCIAL_USD))}
            </p>
          </div>
        </div>

        {/* El producto que originó la solicitud, cuando se entró desde Mis
            productos. Es CONTEXTO y nada más: ningún paso ni validación del
            flujo cambia por esto, y si no hay compra el bloque no existe.
            Viaja en el borrador y llega con la solicitud. */}
        {inicial.compra && (
          <div
            className="flex mt-3"
            style={{
              gap: "10px",
              padding: "12px 14px",
              borderRadius: "12px",
              border: "1px solid var(--gray-8)",
              backgroundColor: "var(--gray-3)",
            }}
          >
            <Package
              size={16}
              strokeWidth={2}
              color="var(--gray-60)"
              style={{ flexShrink: 0, marginTop: "2px" }}
              aria-hidden="true"
            />
            <div className="min-w-0">
              <p
                style={{
                  ...meta,
                  fontSize: "11px",
                  fontWeight: "var(--font-weight-medium)",
                  letterSpacing: "0.5px",
                  textTransform: "uppercase",
                  color: "var(--gray-60)",
                  margin: 0,
                }}
              >
                {STR.compras.contextoServicio}
              </p>
              <p
                style={{
                  ...meta,
                  fontSize: "14px",
                  fontWeight: "var(--font-weight-medium)",
                  color: "var(--primary-black)",
                  lineHeight: "19px",
                  margin: "2px 0 0",
                }}
              >
                {inicial.compra.nombre}
              </p>
              {/* Un producto cargado a mano no tiene SKU: no se dibuja una
                  línea vacía ni se inventa un código. */}
              {inicial.compra.sku && (
                <p style={{ ...meta, fontSize: "13px", color: "var(--gray-60)", margin: "2px 0 0" }}>
                  {STR.compras.sku(inicial.compra.sku)}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Cantidad: sección plana, selector compacto */}
        <div className="mt-6">
          <p style={{ ...meta, fontSize: "16px", fontWeight: "var(--font-weight-medium)", color: "var(--primary-black)", margin: 0 }}>
            {STR.agendar.cantidadPregunta}
          </p>
          {/* Ancho completo: menos | número centrado real | más */}
          <div className="flex items-center justify-between w-full mt-3">
            {botonCantidad(
              STR.agendar.menos,
              <Minus size={20} strokeWidth={2.5} color="var(--primary-black)" aria-hidden="true" />,
              () => cambiarCantidad(-1),
              cantidad <= CANTIDAD_MINIMA,
              false,
            )}
            <span
              aria-live="polite"
              aria-label={STR.agendar.unidades(cantidad)}
              className="text-center"
              style={{
                fontFamily: "'Bebas Neue', Arial, sans-serif",
                fontSize: "32px",
                color: "var(--primary-black)",
              }}
            >
              {cantidad}
            </span>
            {botonCantidad(
              STR.agendar.mas,
              <Plus size={20} strokeWidth={2.5} color="var(--primary-black)" aria-hidden="true" />,
              () => cambiarCantidad(1),
              cantidad >= CANTIDAD_MAXIMA,
              true,
            )}
          </div>
        </div>

        {/* Costos: sección plana, recalculada en vivo con la cantidad */}
        <div className="mt-6">
          <DesgloseCosto
            servicio={servicio}
            cantidad={cantidad}
            condiciones={inicial?.condiciones}
            incluyeDesinstalacion={inicial?.incluyeDesinstalacion}
            precioDesinstalacion={inicial?.precioDesinstalacion}
          />
        </div>

        {error && (
          <p role="alert" style={{ ...meta, fontSize: "12px", color: "var(--error-red)", margin: "8px 0 0" }}>
            {error}
          </p>
        )}

        {/* Fotos (opcional) */}
        <div className="mt-6">
          <div className="flex items-baseline gap-2">
            <p style={{ ...meta, fontSize: "14px", fontWeight: "var(--font-weight-medium)", color: "var(--primary-black)", margin: 0 }}>
              {STR.agendar.fotos}
            </p>
<MarcaCampo />
          </div>
          <p style={{ ...meta, fontSize: "12px", lineHeight: "18px", color: "var(--gray-60)", margin: "2px 0 0" }}>
            {STR.agendar.fotosAyuda}
          </p>
          <button
            onClick={() => inputFotos.current?.click()}
            className="w-full border flex items-center justify-center gap-2 mt-2 transition-all active:scale-[0.99]"
            style={{
              height: "44px",
              backgroundColor: "var(--primary-white)",
              borderColor: "var(--gray-20)",
              borderRadius: "12px",
              cursor: "pointer",
            }}
          >
            <Camera size={18} strokeWidth={2} color="var(--primary-black)" aria-hidden="true" />
            <span style={{ ...meta, fontSize: "14px", fontWeight: "var(--font-weight-medium)", color: "var(--primary-black)" }}>
              {STR.agendar.agregarFotos}
            </span>
          </button>
          <input
            ref={inputFotos}
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            aria-label={STR.agendar.agregarFotos}
            onChange={(e) => {
              agregarFotos(e.target.files);
              e.target.value = "";
            }}
          />
          {fotos.length > 0 && (
            <ul className="flex flex-col gap-2 mt-2" style={{ margin: "8px 0 0", padding: 0, listStyle: "none" }}>
              {fotos.map((foto) => (
                <li
                  key={foto.id}
                  className="flex items-center gap-2 border"
                  style={{ borderColor: "var(--gray-8)", borderRadius: "10px", padding: "8px 12px" }}
                >
                  <span className="flex-1 truncate" style={{ ...meta, fontSize: "13px", color: "var(--gray-80)" }}>
                    {foto.nombre}
                  </span>
                  <button
                    onClick={() => setFotos((f) => f.filter((x) => x.id !== foto.id))}
                    aria-label={`${STR.agendar.eliminarFoto} ${foto.nombre}`}
                    className="flex items-center justify-center flex-shrink-0"
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "50%",
                      backgroundColor: "transparent",
                      border: "none",
                      cursor: "pointer",
                      margin: "-8px -12px -8px 0",
                    }}
                  >
                    <span
                      className="flex items-center justify-center"
                      style={{ width: "28px", height: "28px", borderRadius: "50%", backgroundColor: "var(--gray-8)" }}
                    >
                      <X size={14} strokeWidth={2.5} color="var(--gray-80)" aria-hidden="true" />
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Notas (opcional) */}
        <div className="mt-6">
          <Campo
            id="notas"
            etiqueta={STR.agendar.notas}
            ayuda={
              <p style={{ ...meta, fontSize: "12px", lineHeight: "18px", color: "var(--gray-60)", margin: 0 }}>
                {STR.agendar.notasAyuda}
              </p>
            }
          >
            <textarea
              id="notas"
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              rows={3}
              style={{ ...estiloInput(), height: "auto", minHeight: "88px", paddingTop: "10px", resize: "vertical" }}
            />
          </Campo>
        </div>
      </div>

      <div className="px-6 py-4 bg-white flex-shrink-0" style={{ borderTop: "1px solid var(--gray-8)" }}>
        <button
          onClick={continuar}
          className="w-full transition-transform hover:scale-[1.01] active:scale-[0.99] border-none"
          style={{
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
          {STR.agendar.continuar}
        </button>
      </div>
    </div>
  );
}
