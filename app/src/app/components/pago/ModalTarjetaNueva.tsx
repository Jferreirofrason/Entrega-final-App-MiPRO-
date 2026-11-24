import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { STR } from "../../i18n/strings";
import { Campo, estiloInput } from "../garantia/Campo";
import {
  formatearNumero,
  formatearVencimiento,
  hayErrores,
  soloDigitos,
  validarTarjetaNueva,
  type DatosTarjetaNueva,
  type ErroresTarjeta,
} from "../../logic/tarjetas";

// Alta de una tarjeta, en un popup sobre la pantalla de pago.
//
// ⚠️ SIMULADO. No hay pasarela ni tokenización: los datos no salen del
// navegador y de lo que se escribe sobreviven solo la marca, los cuatro
// últimos dígitos y el vencimiento (ver logic/tarjetas.ts). El código de
// seguridad no se guarda en ninguna parte, ni enmascarado. Cuando haya
// pasarela, este formulario lo reemplaza su SDK y el número de tarjeta no
// vuelve a pasar por acá.
//
// Cerrar, cancelar o tocar afuera no agrega nada y no toca la selección que
// había: el alta solo tiene efecto al guardar con los datos válidos.
//
// La estructura es la del sheet de la app (grip, título con X, contenido
// que scrollea, pie con las acciones). El pie está afuera del scroll, así
// "Guardar tarjeta" no se va de pantalla cuando el teclado achica el alto
// visible; de mantener el campo enfocado a la vista se encarga el hook
// `useCampoVisibleConTeclado`, que corre en el Layout.
// Dos líneas de la etiqueta (19px de interlínea cada una), que es lo que
// necesita "Código de seguridad" en pantalla angosta.
const ALTO_ETIQUETA = "38px";

export function ModalTarjetaNueva({
  abierto,
  onCerrar,
  onGuardar,
}: {
  abierto: boolean;
  onCerrar: () => void;
  onGuardar: (datos: DatosTarjetaNueva, predeterminada: boolean) => void;
}) {
  const [datos, setDatos] = useState<DatosTarjetaNueva>({
    titular: "",
    numero: "",
    vence: "",
    codigo: "",
  });
  const [predeterminada, setPredeterminada] = useState(false);
  const [errores, setErrores] = useState<ErroresTarjeta>({});
  const primerCampo = useRef<HTMLInputElement>(null);

  // Cada vez que se abre, el formulario arranca limpio: la casilla de
  // predeterminada vuelve a desmarcarse y no quedan errores de un intento
  // anterior.
  useEffect(() => {
    if (!abierto) return;
    setDatos({ titular: "", numero: "", vence: "", codigo: "" });
    setPredeterminada(false);
    setErrores({});
    primerCampo.current?.focus();
  }, [abierto]);

  // Escape cierra, como tocar afuera.
  useEffect(() => {
    if (!abierto) return;
    const alSoltar = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCerrar();
    };
    window.addEventListener("keydown", alSoltar);
    return () => window.removeEventListener("keydown", alSoltar);
  }, [abierto, onCerrar]);

  if (!abierto) return null;

  const meta = { fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif" } as const;

  const escribir = (campo: keyof DatosTarjetaNueva, valor: string) => {
    setDatos((d) => ({ ...d, [campo]: valor }));
    // Si el campo ya había avisado, el error se va mientras se corrige.
    setErrores((e) => (e[campo] ? { ...e, [campo]: undefined } : e));
  };

  const guardar = () => {
    const encontrados = validarTarjetaNueva(datos, new Date());
    if (hayErrores(encontrados)) {
      setErrores(encontrados);
      return;
    }
    onGuardar(datos, predeterminada);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0" style={{ backgroundColor: "rgba(0, 0, 0, 0.45)" }} onClick={onCerrar} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-tarjeta-nueva"
        className="relative z-10 w-full max-w-lg bg-white rounded-t-[24px] flex flex-col max-h-[90dvh]"
        style={{ boxShadow: "0 -8px 30px rgba(0, 0, 0, 0.15)" }}
      >
        <div className="flex justify-center py-2 shrink-0">
          <div className="w-12 h-1.5 rounded-full" style={{ backgroundColor: "var(--gray-20)" }} />
        </div>

        <div
          className="px-6 pb-4 pt-2 flex items-center justify-between shrink-0"
          style={{ borderBottom: "1px solid var(--gray-8)" }}
        >
          <h3
            id="titulo-tarjeta-nueva"
            style={{
              fontFamily: "'Bebas Neue', Arial, sans-serif",
              fontSize: "20px",
              letterSpacing: "1px",
              textTransform: "uppercase",
              color: "var(--primary-black)",
              margin: 0,
            }}
          >
            {STR.pago.agregarTarjeta}
          </h3>
          <button
            type="button"
            onClick={onCerrar}
            aria-label={STR.pago.cerrar}
            className="flex items-center justify-center rounded-full border-none bg-transparent"
            style={{ width: "36px", height: "36px", cursor: "pointer" }}
          >
            <X size={18} color="var(--gray-60)" aria-hidden="true" />
          </button>
        </div>

        <div className="px-6 py-5 overflow-y-auto flex-1 flex flex-col" style={{ gap: "16px" }}>
          <Campo id="tarjeta-titular" etiqueta={STR.pago.campoTitular} obligatorio error={errores.titular}>
            <input
              ref={primerCampo}
              id="tarjeta-titular"
              type="text"
              autoComplete="cc-name"
              value={datos.titular}
              onChange={(e) => escribir("titular", e.target.value)}
              placeholder={STR.pago.campoTitularEjemplo}
              style={estiloInput(!!errores.titular)}
            />
          </Campo>

          <Campo
            id="tarjeta-numero"
            etiqueta={STR.pago.campoNumero}
            obligatorio
            error={errores.numero}
            ayuda={
              // Qué tarjetas se aceptan. Vivía en la fila de alta de la
              // pantalla; ahora que esa fila es solo "+ Agregar", el dato
              // va donde se usa.
              <p style={{ ...meta, fontSize: "12px", lineHeight: "16px", color: "var(--gray-60)", margin: 0 }}>
                {STR.pago.agregarTarjetaDetalle}
              </p>
            }
          >
            <input
              id="tarjeta-numero"
              type="text"
              inputMode="numeric"
              autoComplete="cc-number"
              value={formatearNumero(datos.numero)}
              onChange={(e) => escribir("numero", soloDigitos(e.target.value).slice(0, 19))}
              placeholder="0000 0000 0000 0000"
              style={estiloInput(!!errores.numero)}
            />
          </Campo>

          {/* Vencimiento y código, uno al lado del otro. "Código de
              seguridad" entra en dos líneas y "Vencimiento" en una, así que
              las dos etiquetas reservan el mismo alto: los campos, y sus
              mensajes de error, arrancan a la misma altura. */}
          <div className="flex items-start" style={{ gap: "12px" }}>
            <div className="flex-1">
              <Campo
                id="tarjeta-vence"
                etiqueta={STR.pago.campoVence}
                obligatorio
                error={errores.vence}
                minAltoEtiqueta={ALTO_ETIQUETA}
              >
                <input
                  id="tarjeta-vence"
                  type="text"
                  inputMode="numeric"
                  autoComplete="cc-exp"
                  value={formatearVencimiento(datos.vence)}
                  onChange={(e) => escribir("vence", soloDigitos(e.target.value).slice(0, 4))}
                  placeholder="MM/AA"
                  style={estiloInput(!!errores.vence)}
                />
              </Campo>
            </div>
            <div className="flex-1">
              <Campo
                id="tarjeta-codigo"
                etiqueta={STR.pago.campoCodigo}
                obligatorio
                error={errores.codigo}
                minAltoEtiqueta={ALTO_ETIQUETA}
              >
                <input
                  id="tarjeta-codigo"
                  type="text"
                  inputMode="numeric"
                  autoComplete="cc-csc"
                  value={datos.codigo}
                  onChange={(e) => escribir("codigo", soloDigitos(e.target.value).slice(0, 4))}
                  placeholder="000"
                  style={estiloInput(!!errores.codigo)}
                />
              </Campo>
            </div>
          </div>

          <label
            className="flex items-start gap-3"
            style={{ ...meta, fontSize: "13px", lineHeight: "19px", color: "var(--primary-black)", cursor: "pointer" }}
          >
            <input
              type="checkbox"
              checked={predeterminada}
              onChange={(e) => setPredeterminada(e.target.checked)}
              style={{ width: "20px", height: "20px", marginTop: "0", accentColor: "var(--primary-black)", flexShrink: 0 }}
            />
            {STR.pago.usarComoPredeterminada}
          </label>

          <p style={{ ...meta, fontSize: "12px", lineHeight: "17px", color: "var(--gray-60)", margin: 0 }}>
            {STR.pago.altaDemostracion}
          </p>
        </div>

        <div
          className="p-4 flex items-center justify-end shrink-0"
          style={{ gap: "10px", borderTop: "1px solid var(--gray-8)", backgroundColor: "var(--gray-3)" }}
        >
          <button
            type="button"
            onClick={onCerrar}
            style={{
              ...meta,
              fontSize: "13px",
              fontWeight: "var(--font-weight-medium)",
              color: "var(--primary-black)",
              backgroundColor: "var(--primary-white)",
              border: "1px solid var(--gray-20)",
              borderRadius: "10px",
              padding: "12px 18px",
              minHeight: "44px",
              cursor: "pointer",
            }}
          >
            {STR.pago.cancelar}
          </button>
          <button
            type="button"
            onClick={guardar}
            style={{
              ...meta,
              fontSize: "13px",
              fontWeight: "var(--font-weight-medium)",
              color: "var(--primary-black)",
              backgroundColor: "var(--primary-yellow)",
              border: "none",
              borderRadius: "10px",
              padding: "12px 20px",
              minHeight: "44px",
              cursor: "pointer",
            }}
          >
            {STR.pago.guardarTarjeta}
          </button>
        </div>
      </div>
    </div>
  );
}
