import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { STR } from "../../i18n/strings";
import { Campo, estiloInput } from "../garantia/Campo";
import { enmascararTarjeta, type MedioPagoTarjeta } from "../../logic/pago";
import { validarTitular } from "../../logic/tarjetas";
import { MarcaMedio } from "./MarcaMedio";

// Editar una tarjeta guardada.
//
// ⚠️ Lo único editable es el nombre del titular. El número y el vencimiento
// se muestran como dato, no como campo: sin pasarela no hay forma de volver
// a validarlos, y con pasarela los dos viven del lado del proveedor junto
// al token. Cambiarlos es dar de alta la tarjeta otra vez, y eso es lo que
// ofrece el botón del pie.
//
// El número nunca aparece completo y el código de seguridad no se pide ni
// se precarga: no se guarda en ninguna parte.
export function ModalEditarTarjeta({
  tarjeta,
  onCerrar,
  onGuardar,
  onAgregarOtra,
}: {
  /** null = cerrado. */
  tarjeta: MedioPagoTarjeta | null;
  onCerrar: () => void;
  onGuardar: (titular: string) => void;
  /** Cierra esta ventana y abre el alta de una tarjeta nueva. */
  onAgregarOtra: () => void;
}) {
  const [titular, setTitular] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tarjeta) return;
    setTitular(tarjeta.titular ?? "");
    setError(null);
  }, [tarjeta]);

  useEffect(() => {
    if (!tarjeta) return;
    const alSoltar = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCerrar();
    };
    window.addEventListener("keydown", alSoltar);
    return () => window.removeEventListener("keydown", alSoltar);
  }, [tarjeta, onCerrar]);

  if (!tarjeta) return null;

  const meta = { fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif" } as const;

  const guardar = () => {
    const encontrado = validarTitular(titular);
    if (encontrado) {
      setError(encontrado);
      return;
    }
    onGuardar(titular);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0" style={{ backgroundColor: "rgba(0, 0, 0, 0.45)" }} onClick={onCerrar} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-editar-tarjeta"
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
            id="titulo-editar-tarjeta"
            style={{
              fontFamily: "'Bebas Neue', Arial, sans-serif",
              fontSize: "20px",
              letterSpacing: "1px",
              textTransform: "uppercase",
              color: "var(--primary-black)",
              margin: 0,
            }}
          >
            {STR.pago.editarTarjeta}
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

        <div className="px-6 py-5 overflow-y-auto flex flex-col" style={{ gap: "16px" }}>
          {/* Encabezado compacto: qué tarjeta se está editando, en dos
              líneas y sin rótulos de más. */}
          <div
            className="flex items-center gap-3"
            style={{ padding: "10px 12px", borderRadius: "10px", backgroundColor: "var(--gray-3)" }}
          >
            <span
              className="flex shrink-0 items-center justify-center overflow-hidden"
              style={{
                width: "44px",
                height: "30px",
                borderRadius: "4px",
                backgroundColor: "var(--primary-white)",
                border: "1px solid var(--gray-8)",
              }}
            >
              <MarcaMedio medio={tarjeta} />
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
                {`${tarjeta.marca} ${enmascararTarjeta(tarjeta.ultimos)}`}
              </span>
              <span
                className="block truncate"
                style={{ ...meta, fontSize: "13px", lineHeight: "18px", color: "var(--gray-60)" }}
              >
                {[tarjeta.banco, `${STR.pago.campoVence} ${tarjeta.vence}`]
                  .filter(Boolean)
                  .join(" · ")}
              </span>
            </span>
          </div>

          <Campo
            id="editar-titular"
            etiqueta={STR.pago.campoTitular}
            obligatorio
            error={error}
          >
            <input
              id="editar-titular"
              type="text"
              autoComplete="cc-name"
              value={titular}
              onChange={(e) => {
                setTitular(e.target.value);
                if (error) setError(null);
              }}
              placeholder={STR.pago.campoTitularEjemplo}
              style={estiloInput(!!error)}
            />
          </Campo>

          <p style={{ ...meta, fontSize: "12px", lineHeight: "17px", color: "var(--gray-60)", margin: 0 }}>
            {STR.pago.editarNota}
          </p>

          <button
            type="button"
            onClick={onAgregarOtra}
            className="self-start border-none bg-transparent px-0"
            style={{
              ...meta,
              fontSize: "13px",
              fontWeight: "var(--font-weight-medium)",
              color: "var(--info-blue)",
              minHeight: "44px",
              cursor: "pointer",
            }}
          >
            {STR.pago.agregarTarjeta}
          </button>
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
            {STR.pago.guardarCambios}
          </button>
        </div>
      </div>
    </div>
  );
}
