import { useState } from "react";
import { Check, Plus, X } from "lucide-react";
import { STR } from "../../i18n/strings";
import { guardarDireccionDeSesion } from "../../data/direcciones";
import type { DireccionNueva } from "../../logic/solicitudServicio";
import { concatenarDireccion } from "../../logic/solicitudServicio";
import { FormularioDireccion } from "../agendar/FormularioDireccion";

// La dirección de facturación del checkout.
//
// Son DOS cosas distintas y la pantalla lo dice: la dirección donde se
// presta el servicio, que ya está elegida en el flujo, y la que va en la
// factura. Por defecto son la misma, que es el caso de siempre.
//
// Al desmarcar, el alta reutiliza el MISMO formulario que el resto de la
// app (components/agendar/FormularioDireccion), con sus campos, su buscador
// con mapa y sus validaciones, y guarda en el MISMO lugar
// (data/direcciones). No hay un segundo sistema de direcciones.
//
// Cambiar la facturación NUNCA toca la dirección del servicio: son dos
// datos separados y el servicio se sigue prestando donde se eligió.
//
// Cancelar el alta no pierde nada del checkout: es una ventana encima.
//
// ⚠️ PENDIENTE: si la facturación pide datos fiscales (RUC o razón social)
// y si es obligatoria. Hoy pide lo mismo que cualquier dirección.
export function BloqueFacturacion({
  direccionDelServicio,
  usarOtra,
  onUsarOtra,
  facturacion,
  onCambiarFacturacion,
  mostrarFalta,
  onIrAlServicio,
}: {
  /** La del servicio, que es la que se usa cuando la casilla está marcada. */
  direccionDelServicio: string | null;
  /** true = la casilla está desmarcada y factura a otra dirección. */
  usarOtra: boolean;
  onUsarOtra: (usar: boolean) => void;
  /** La dirección cargada para facturar, si ya hay una. */
  facturacion: DireccionNueva | null;
  onCambiarFacturacion: (direccion: DireccionNueva | null) => void;
  mostrarFalta: boolean;
  /** Lleva a cargar la dirección del servicio, cuando no hay ninguna. */
  onIrAlServicio?: () => void;
}) {
  const [formAbierto, setFormAbierto] = useState(false);
  const meta = { fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif" } as const;

  const esLaMisma = !usarOtra;
  const textoFacturacion = esLaMisma
    ? direccionDelServicio
    : facturacion
      ? concatenarDireccion(facturacion)
      : null;
  // Con la casilla marcada se factura a la dirección del servicio: si esa
  // no existe, el que falta es ese dato, no uno de esta sección. Decir
  // "completá la dirección de facturación" con la casilla marcada manda a
  // la persona a un lugar donde no hay nada que completar.
  const faltaLaDelServicio = esLaMisma && !direccionDelServicio;
  const falta = mostrarFalta && !textoFacturacion;

  return (
    <>
      <div>
        {/* El título va AFUERA del recuadro, con el mismo estilo que los
            otros títulos de sección de la pantalla. */}
        <h3
          style={{
            ...meta,
            fontSize: "13px",
            lineHeight: "18px",
            fontWeight: "var(--font-weight-medium)",
            color: "var(--gray-60)",
            margin: "0 0 10px",
          }}
        >
          {STR.pago.facturacionTitulo}
        </h3>

        {/* Casilla propia: el amarillo de la casa con el tilde en negro. La
            nativa pinta el tilde en blanco y sobre amarillo no se ve. El
            input real sigue ahí, invisible, para que funcione el teclado y
            los lectores de pantalla; toda la etiqueta es tocable. */}
        <label className="flex items-start" style={{ gap: "12px", cursor: "pointer" }}>
          <span className="relative flex shrink-0 items-center justify-center" style={{ marginTop: "0px" }}>
            <input
              type="checkbox"
              checked={esLaMisma}
              onChange={(e) => {
                // Marcar vuelve a facturar a la dirección del servicio y
                // suelta la otra. Desmarcar NO abre nada: muestra la
                // acción para cargarla.
                onUsarOtra(!e.target.checked);
                if (e.target.checked) onCambiarFacturacion(null);
              }}
              className="absolute opacity-0"
              style={{ width: "22px", height: "22px", margin: 0, cursor: "pointer" }}
            />
            <span
              aria-hidden="true"
              className="flex items-center justify-center"
              style={{
                width: "22px",
                height: "22px",
                borderRadius: "6px",
                backgroundColor: esLaMisma ? "var(--primary-yellow)" : "var(--primary-white)",
                border: esLaMisma ? "none" : "1.5px solid var(--gray-20)",
              }}
            >
              {esLaMisma && <Check size={15} strokeWidth={3} color="var(--primary-black)" />}
            </span>
          </span>
          <span
            style={{
              ...meta,
              fontSize: "14px",
              lineHeight: "20px",
              color: "var(--primary-black)",
            }}
          >
            {STR.pago.facturacionMisma}
          </span>
        </label>

        {/* La dirección, en su bloque gris claro. */}
        {textoFacturacion && (
          <div
            style={{
              marginTop: "14px",
              padding: "16px",
              borderRadius: "16px",
              backgroundColor: falta ? "rgba(224, 82, 99, 0.08)" : "var(--gray-3)",
            }}
          >
            <div className="flex items-start justify-between" style={{ gap: "12px" }}>
              <span className="min-w-0">
                <span
                  className="block"
                  style={{ ...meta, fontSize: "12px", lineHeight: "16px", color: "var(--gray-60)" }}
                >
                  {STR.pago.facturacionParaFacturar}
                </span>
                <span
                  className="block"
                  style={{
                    ...meta,
                    fontSize: "14px",
                    lineHeight: "20px",
                    color: "var(--primary-black)",
                    marginTop: "4px",
                  }}
                >
                  {textoFacturacion}
                </span>
              </span>
              {!esLaMisma && (
                <button
                  type="button"
                  onClick={() => setFormAbierto(true)}
                  className="shrink-0 border-none bg-transparent px-0"
                  style={{
                    ...meta,
                    fontSize: "13px",
                    fontWeight: "var(--font-weight-medium)",
                    color: "var(--info-blue)",
                    minHeight: "40px",
                    cursor: "pointer",
                  }}
                >
                  {STR.pago.facturacionEditar}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Sin casilla y sin dirección cargada, la acción para cargarla. */}
        {!esLaMisma && !textoFacturacion && (
          <button
            type="button"
            onClick={() => setFormAbierto(true)}
            className="flex items-center border-none bg-transparent px-0 text-left"
            style={{ gap: "6px", marginTop: "12px", minHeight: "44px", cursor: "pointer" }}
          >
            <Plus size={16} strokeWidth={2.5} color="var(--info-blue)" aria-hidden="true" />
            <span
              style={{
                ...meta,
                fontSize: "14px",
                lineHeight: "20px",
                fontWeight: "var(--font-weight-medium)",
                color: "var(--info-blue)",
              }}
            >
              {STR.pago.facturacionAgregar}
            </span>
          </button>
        )}

        {falta && (
          <>
            <p
              role="alert"
              style={{ ...meta, fontSize: "12px", lineHeight: "17px", color: "var(--error-red)", margin: "8px 0 0" }}
            >
              {faltaLaDelServicio ? STR.pago.facturacionSinServicio : STR.pago.facturacionFalta}
            </p>
            {faltaLaDelServicio && onIrAlServicio && (
              <button
                type="button"
                onClick={onIrAlServicio}
                className="border-none bg-transparent px-0"
                style={{
                  ...meta,
                  fontSize: "13px",
                  fontWeight: "var(--font-weight-medium)",
                  color: "var(--info-blue)",
                  minHeight: "40px",
                  cursor: "pointer",
                }}
              >
                {STR.pago.facturacionIrAlServicio}
              </button>
            )}
          </>
        )}
      </div>

      {/* El alta, en una ventana sobre el checkout: cancelar no pierde nada
          de lo cargado. El formulario es el mismo de toda la app. */}
      {formAbierto && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div
            className="absolute inset-0"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.45)" }}
            onClick={() => setFormAbierto(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label={STR.pago.facturacionTitulo}
            className="relative z-10 w-full max-w-lg bg-white rounded-t-[24px] flex flex-col max-h-[92dvh]"
            style={{ boxShadow: "0 -8px 30px rgba(0, 0, 0, 0.15)" }}
          >
            <div className="flex justify-center py-2 shrink-0">
              <div className="w-12 h-1.5 rounded-full" style={{ backgroundColor: "var(--gray-20)" }} />
            </div>
            {/* Solo la X: el título lo pone el propio formulario, que es el
                mismo de toda la app. */}
            <div className="px-4 pb-1 pt-0 flex items-center justify-end shrink-0">
              <button
                type="button"
                onClick={() => setFormAbierto(false)}
                aria-label={STR.pago.cerrar}
                className="flex items-center justify-center rounded-full border-none bg-transparent"
                style={{ width: "36px", height: "36px", cursor: "pointer" }}
              >
                <X size={18} color="var(--gray-60)" aria-hidden="true" />
              </button>
            </div>
            <div className="overflow-y-auto px-2 pb-4">
              <FormularioDireccion
                titulo={STR.pago.facturacionTitulo}
                mensajeAyuda={STR.pago.facturacionAyudaModal}
                inicial={facturacion ?? undefined}
                onGuardar={(nueva) => {
                  // Queda guardada entre las direcciones de la sesión, como
                  // cualquier otra, y elegida SOLO para facturar.
                  guardarDireccionDeSesion(nueva);
                  onCambiarFacturacion(nueva);
                  setFormAbierto(false);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
