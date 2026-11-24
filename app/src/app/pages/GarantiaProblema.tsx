import { useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { AlertTriangle, ArrowLeft, ImagePlus, Loader2, Check, X } from "lucide-react";
import { STR } from "../i18n/strings";
import { leerBorrador, guardarBorrador } from "../data/borradorGarantia";
import {
  AdjuntoSolicitud,
  categoriaPorId,
  validarPaso2,
} from "../logic/solicitudGarantia";
import { categoriasParaTipo, recomendacionParaCategoria } from "../data/recomendacionesProblema";
import { ProgresoPasos } from "../components/garantia/ProgresoPasos";
import { Campo, estiloInput, MarcaCampo } from "../components/garantia/Campo";

// Paso 2: contar el problema con categorías guiadas (nada de redactar un
// diagnóstico técnico). Antes del campo abierto, un filtro de diagnóstico:
// al elegir qué pasa, se muestra una recomendación simple y segura; si el
// problema persiste, el cliente confirma y recién ahí aparece la
// descripción opcional y los adjuntos. QA: ?adjuntos=falla hace fallar la
// próxima subida.
export function GarantiaProblema() {
  const navigate = useNavigate();
  const location = useLocation();
  const desdeRevision = Boolean(
    (location.state as { desdeRevision?: boolean } | null)?.desdeRevision,
  );
  const inicial = leerBorrador();
  const categoriasDisponibles = categoriasParaTipo(inicial.producto?.tipo);

  const [categoria, setCategoria] = useState(inicial.problema?.categoria ?? "");
  const [persisteConfirmado, setPersisteConfirmado] = useState(
    Boolean(inicial.problema?.categoria),
  );
  const [descripcion, setDescripcion] = useState(inicial.problema?.descripcion ?? "");
  const [adjuntos, setAdjuntos] = useState<AdjuntoSolicitud[]>(inicial.problema?.adjuntos ?? []);
  const [error, setError] = useState<string | null>(null);
  const inputArchivos = useRef<HTMLInputElement>(null);
  const grupoCategorias = useRef<HTMLDivElement>(null);
  const forzarFallo = useRef(
    new URLSearchParams(location.search).get("adjuntos") === "falla",
  );

  const meta = { fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif" } as const;
  const categoriaElegida = categoria ? categoriaPorId(categoria) : null;

  const simularCarga = (adjunto: AdjuntoSolicitud) => {
    setTimeout(() => {
      const fallo = forzarFallo.current;
      forzarFallo.current = false;
      setAdjuntos((lista) =>
        lista.map((a) => (a.id === adjunto.id ? { ...a, estado: fallo ? "fallo" : "listo" } : a)),
      );
    }, 800);
  };

  const agregarArchivos = (archivos: FileList | null) => {
    if (!archivos) return;
    const nuevos: AdjuntoSolicitud[] = [...archivos].map((f, i) => ({
      id: `adj-${Date.now()}-${i}`,
      nombre: f.name,
      estado: "cargando",
    }));
    setAdjuntos((lista) => [...lista, ...nuevos]);
    nuevos.forEach(simularCarga);
  };

  const continuar = () => {
    const problema = {
      categoria,
      descripcion: descripcion.trim() || undefined,
      // Los adjuntos fallidos no bloquean: son opcionales.
      adjuntos: adjuntos.filter((a) => a.estado !== "fallo"),
    };
    const errores = validarPaso2({ problema: categoria ? problema : undefined });
    if (errores.length > 0) {
      setError(errores[0]);
      grupoCategorias.current?.focus();
      return;
    }
    guardarBorrador({ problema });
    if (desdeRevision) {
      navigate(-1);
      return;
    }
    navigate("/garantia/revisar");
  };

  const producto = inicial.producto;

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: "var(--primary-white)" }}>
      <header className="px-6 pt-[20px] pb-2 bg-white sticky top-0 z-20" style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            aria-label={STR.garantiaFlujo.volver}
            className="w-11 h-11 rounded-[10px] flex items-center justify-center transition-opacity hover:opacity-80 border flex-shrink-0"
            style={{ backgroundColor: "var(--primary-white)", borderColor: "var(--gray-20)", cursor: "pointer" }}
          >
            <ArrowLeft size={20} strokeWidth={2} color="var(--primary-black)" aria-hidden="true" />
          </button>
          <h1
            className="truncate flex-1"
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
            {STR.garantiaFlujo.titulo}
          </h1>
        </div>
        <ProgresoPasos paso={2} />
      </header>

      <div className="flex-1 overflow-y-auto px-6 pt-6 pb-8">
        {producto && (
          <p style={{ ...meta, fontSize: "12px", color: "var(--gray-60)", margin: "0 0 12px" }}>
            {STR.garantiaFlujo.p3Producto}:{" "}
            <span style={{ color: "var(--primary-black)", fontWeight: "var(--font-weight-medium)" }}>
              {producto.nombre}
            </span>
          </p>
        )}

        {/* Desplegable, como los selectores del paso 1 (decisión de diseño:
            nada de chips acá). Las opciones dependen del tipo de producto
            elegido en el paso 1. */}
        <div ref={grupoCategorias} tabIndex={-1} className="mt-1">
          <Campo id="problema" etiqueta={STR.garantiaFlujo.p2Pregunta} obligatorio error={error}>
            <select
              id="problema"
              value={categoria}
              onChange={(e) => {
                setCategoria(e.target.value);
                setPersisteConfirmado(false);
                setError(null);
              }}
              style={{ ...estiloInput(Boolean(error)), appearance: "auto" }}
            >
              <option value="">{STR.garantiaFlujo.p2Placeholder}</option>
              {categoriasDisponibles.map((c) => (
                <option key={c.id} value={c.id}>{c.etiqueta}</option>
              ))}
            </select>
          </Campo>
        </div>

        {categoriaElegida?.avisoSeguridad && (
          <div
            role="alert"
            className="flex items-start gap-2 mt-3 p-3"
            style={{ backgroundColor: "rgba(255, 238, 0, 0.2)", borderRadius: "10px" }}
          >
            <AlertTriangle size={16} strokeWidth={2.5} color="#8A7A00" style={{ flexShrink: 0, marginTop: "1px" }} aria-hidden="true" />
            <p style={{ ...meta, fontSize: "13px", lineHeight: "19px", color: "var(--primary-black)", margin: 0 }}>
              {categoriaElegida.avisoSeguridad}
            </p>
          </div>
        )}

        {/* Filtro de diagnóstico: antes del campo abierto, una recomendación
            simple y segura. Si el problema persiste, el cliente confirma y
            recién ahí aparece el resto del formulario. */}
        {categoriaElegida && !persisteConfirmado && (
          <div
            className="mt-3 p-3"
            style={{ backgroundColor: "var(--card)", borderRadius: "10px", border: "1px solid var(--gray-8)" }}
          >
            <p style={{ ...meta, fontSize: "13px", fontWeight: "var(--font-weight-medium)", color: "var(--primary-black)", margin: 0 }}>
              {STR.garantiaFlujo.p2Recomendacion}
            </p>
            <p style={{ ...meta, fontSize: "13px", lineHeight: "19px", color: "var(--gray-80)", margin: "4px 0 0" }}>
              {recomendacionParaCategoria(categoriaElegida.id)}
            </p>
            <button
              onClick={() => setPersisteConfirmado(true)}
              className="mt-3"
              style={{
                ...meta,
                fontSize: "13px",
                fontWeight: "var(--font-weight-medium)",
                color: "var(--info-blue)",
                background: "none",
                border: "none",
                cursor: "pointer",
                minHeight: "44px",
                padding: 0,
              }}
            >
              {STR.garantiaFlujo.p2SiguePasando}
            </button>
          </div>
        )}

        {categoriaElegida && persisteConfirmado && (
          <>
            <div className="mt-6">
              <label
                htmlFor="descripcion"
                className="flex items-baseline justify-between gap-2"
                style={{ ...meta, fontSize: "13px", lineHeight: "19px", fontWeight: "var(--font-weight-medium)", color: "var(--primary-black)" }}
              >
                {STR.garantiaFlujo.p2Detalle}
                <MarcaCampo />
              </label>
              <textarea
                id="descripcion"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                rows={3}
                style={{
                  ...meta,
                  fontSize: "14px",
                  lineHeight: "20px",
                  color: "var(--foreground)",
                  width: "100%",
                  borderRadius: "8px",
                  border: "1px solid var(--gray-20)",
                  padding: "10px 12px",
                  marginTop: "6px",
                  outline: "none",
                  resize: "vertical",
                }}
              />
              <p style={{ ...meta, fontSize: "12px", lineHeight: "18px", color: "var(--gray-60)", margin: "4px 0 0" }}>
                {STR.garantiaFlujo.p2DetalleAyuda}
              </p>
            </div>

            <div className="mt-6">
              <p className="flex items-baseline justify-between gap-2" style={{ ...meta, fontSize: "13px", lineHeight: "19px", fontWeight: "var(--font-weight-medium)", color: "var(--primary-black)", margin: 0 }}>
                {STR.garantiaFlujo.p2Adjuntos}
                <MarcaCampo />
              </p>
              <p style={{ ...meta, fontSize: "12px", lineHeight: "18px", color: "var(--gray-60)", margin: "2px 0 8px" }}>
                {STR.garantiaFlujo.p2AdjuntosAyuda}
              </p>
              <button
                onClick={() => inputArchivos.current?.click()}
                className="w-full border transition-all active:scale-[0.99] flex items-center justify-center gap-2"
                style={{
                  minHeight: "44px",
                  backgroundColor: "var(--primary-white)",
                  borderColor: "var(--gray-20)",
                  borderRadius: "10px",
                  ...meta,
                  fontSize: "13px",
                  fontWeight: "var(--font-weight-medium)",
                  color: "var(--primary-black)",
                  cursor: "pointer",
                }}
              >
                <ImagePlus size={18} strokeWidth={2} aria-hidden="true" />
                {STR.garantiaFlujo.p2Agregar}
              </button>
              <input
                ref={inputArchivos}
                type="file"
                accept="image/*,video/*"
                multiple
                className="sr-only"
                aria-label={STR.garantiaFlujo.p2Agregar}
                onChange={(e) => {
                  agregarArchivos(e.target.files);
                  e.target.value = "";
                }}
              />

              {adjuntos.length > 0 && (
                <ul className="flex flex-col gap-2 mt-3" style={{ margin: "12px 0 0", padding: 0, listStyle: "none" }}>
                  {adjuntos.map((a) => (
                    <li
                      key={a.id}
                      className="flex items-center gap-2 border"
                      style={{ borderColor: "var(--gray-8)", borderRadius: "10px", padding: "10px 12px" }}
                    >
                      {a.estado === "cargando" && (
                        <Loader2 size={16} strokeWidth={2.5} color="var(--gray-60)" className="animate-spin flex-shrink-0" aria-hidden="true" />
                      )}
                      {a.estado === "listo" && (
                        <Check size={16} strokeWidth={2.5} color="var(--success-green)" className="flex-shrink-0" aria-hidden="true" />
                      )}
                      {a.estado === "fallo" && (
                        <AlertTriangle size={16} strokeWidth={2.5} color="var(--error-red)" className="flex-shrink-0" aria-hidden="true" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="truncate" style={{ ...meta, fontSize: "13px", color: "var(--primary-black)", margin: 0 }}>
                          {a.nombre}
                        </p>
                        <p style={{ ...meta, fontSize: "11px", color: a.estado === "fallo" ? "var(--error-red)" : "var(--gray-60)", margin: 0 }}>
                          {a.estado === "cargando" && STR.garantiaFlujo.p2Cargando}
                          {a.estado === "listo" && STR.garantiaFlujo.p2Listo}
                          {a.estado === "fallo" && STR.garantiaFlujo.p2Fallo}
                        </p>
                      </div>
                      {a.estado === "fallo" && (
                        <button
                          onClick={() => {
                            setAdjuntos((lista) => lista.map((x) => (x.id === a.id ? { ...x, estado: "cargando" } : x)));
                            simularCarga(a);
                          }}
                          style={{ ...meta, fontSize: "12px", fontWeight: "var(--font-weight-medium)", color: "var(--info-blue)", background: "none", border: "none", cursor: "pointer", minHeight: "44px" }}
                        >
                          {STR.garantiaFlujo.p2Reintentar}
                        </button>
                      )}
                      <button
                        onClick={() => setAdjuntos((lista) => lista.filter((x) => x.id !== a.id))}
                        aria-label={`${STR.garantiaFlujo.p2Eliminar} ${a.nombre}`}
                        className="flex items-center justify-center flex-shrink-0"
                        style={{ width: "32px", height: "44px", background: "none", border: "none", cursor: "pointer" }}
                      >
                        <X size={16} strokeWidth={2.5} color="var(--gray-60)" aria-hidden="true" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </div>

      {(!categoriaElegida || persisteConfirmado) && (
        <div className="px-6 py-4 bg-white flex-shrink-0" style={{ borderTop: "1px solid var(--gray-8)" }}>
          <button
            onClick={continuar}
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
            {STR.garantiaFlujo.continuar}
          </button>
        </div>
      )}
    </div>
  );
}
