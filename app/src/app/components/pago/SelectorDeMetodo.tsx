import { useEffect } from "react";
import { Plus, X } from "lucide-react";
import { STR } from "../../i18n/strings";
import { MarcaMedio } from "./MarcaMedio";
import { enmascararTarjeta, type MedioPago, type MedioPagoTarjeta } from "../../logic/pago";

/**
 * El selector de cómo pagar, en una hoja sobre el checkout.
 *
 * Existe porque la pantalla principal muestra UN medio, el predeterminado,
 * ya elegido. Acá adentro están todos los demás: las otras tarjetas, las
 * billeteras y el alta. Mostrarlos siempre en la pantalla obligaba a
 * decidir algo que en la mayoría de los casos ya está decidido.
 *
 * Elegir cierra la hoja: no hay un "Listo" que confirme una elección que
 * ya se hizo con el dedo.
 *
 * ⚠️ Crédito CMF entra en la lista SOLO si el backend dice que está
 * habilitado (seOfreceCmf en logic/cmf.ts). Cuando no está, no hay opción
 * ni banner ni enlace para solicitarlo: no se ofrece lo que no se tiene.
 */
export function SelectorDeMetodo({
  abierto,
  tarjetas,
  otrosMedios,
  elegidoId,
  onElegir,
  onAgregarTarjeta,
  onCerrar,
  nombreDelMedio,
  detalleDelMedio,
}: {
  abierto: boolean;
  tarjetas: readonly MedioPagoTarjeta[];
  /** Yappy, CMF y la tarjeta de regalo, ya filtrados por disponibilidad. */
  otrosMedios: readonly MedioPago[];
  elegidoId: string | null;
  onElegir: (medio: MedioPago) => void;
  /** null = el alta no se ofrece. */
  onAgregarTarjeta?: () => void;
  onCerrar: () => void;
  nombreDelMedio: (medio: MedioPago) => string;
  detalleDelMedio: (medio: MedioPago) => string | null;
}) {
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

  const fila = (
    medio: MedioPago,
    logo: React.ReactNode,
    principal: string,
    secundario: string | null,
  ) => {
    const elegido = medio.id === elegidoId;
    return (
      <button
        key={medio.id}
        type="button"
        role="radio"
        aria-checked={elegido}
        onClick={() => onElegir(medio)}
        className="flex w-full items-center text-left"
        style={{
          gap: "12px",
          minHeight: "56px",
          padding: "12px 14px",
          borderRadius: "12px",
          backgroundColor: elegido ? "rgba(255, 238, 0, 0.28)" : "var(--primary-white)",
          border: "none",
          cursor: "pointer",
        }}
      >
        <span
          className="flex shrink-0 items-center justify-center"
          style={{ width: "44px", height: "30px" }}
        >
          {logo}
        </span>
        <span className="min-w-0 flex-1">
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
            {principal}
          </span>
          {secundario && (
            <span
              className="block"
              style={{ ...meta, fontSize: "13px", lineHeight: "18px", color: "var(--gray-60)" }}
            >
              {secundario}
            </span>
          )}
        </span>
        <span
          aria-hidden="true"
          className="flex shrink-0 items-center justify-center"
          style={{
            width: "20px",
            height: "20px",
            borderRadius: "50%",
            border: `1.5px solid ${elegido ? "var(--primary-black)" : "var(--gray-20)"}`,
            backgroundColor: "var(--primary-white)",
          }}
        >
          {elegido && (
            <span
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                backgroundColor: "var(--primary-black)",
              }}
            />
          )}
        </span>
      </button>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0" style={{ backgroundColor: "rgba(0, 0, 0, 0.45)" }} onClick={onCerrar} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={STR.pago.selectorTitulo}
        className="relative z-10 w-full max-w-lg bg-white rounded-t-[24px] flex flex-col max-h-[85dvh]"
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
            style={{
              fontFamily: "'Bebas Neue', Arial, sans-serif",
              fontSize: "20px",
              letterSpacing: "1px",
              textTransform: "uppercase",
              color: "var(--primary-black)",
              margin: 0,
            }}
          >
            {STR.pago.selectorTitulo}
          </h3>
          <button
            type="button"
            onClick={onCerrar}
            aria-label={STR.pago.cerrar}
            className="flex shrink-0 items-center justify-center rounded-full border-none bg-transparent"
            style={{ width: "36px", height: "36px", cursor: "pointer" }}
          >
            <X size={18} color="var(--gray-60)" aria-hidden="true" />
          </button>
        </div>

        <div
          role="radiogroup"
          aria-label={STR.pago.selectorTitulo}
          className="overflow-y-auto px-4 py-3 flex flex-col"
          style={{ gap: "4px" }}
        >
          {tarjetas.map((t) =>
            fila(
              t,
              <MarcaMedio medio={t} ancho={t.marca === "Visa" ? 38 : 32} />,
              `${t.marca} ${enmascararTarjeta(t.ultimos)}`,
              t.banco ?? STR.pago.vence(t.vence),
            ),
          )}

          {otrosMedios.map((m) =>
            fila(m, <MarcaMedio medio={m} ancho={34} />, nombreDelMedio(m), detalleDelMedio(m)),
          )}

          {/* El alta, al final y como acción, no como un medio más. */}
          {onAgregarTarjeta && (
            <button
              type="button"
              onClick={onAgregarTarjeta}
              className="flex w-full items-center text-left"
              style={{
                gap: "12px",
                minHeight: "56px",
                marginTop: "4px",
                padding: "12px 14px",
                borderRadius: "12px",
                backgroundColor: "var(--primary-white)",
                border: "1px solid var(--gray-8)",
                cursor: "pointer",
              }}
            >
              <span
                className="flex shrink-0 items-center justify-center"
                style={{ width: "44px", height: "30px" }}
              >
                <Plus size={20} strokeWidth={2} color="var(--primary-black)" aria-hidden="true" />
              </span>
              <span
                style={{
                  ...meta,
                  fontSize: "15px",
                  lineHeight: "20px",
                  fontWeight: "var(--font-weight-medium)",
                  color: "var(--primary-black)",
                }}
              >
                {STR.pago.agregarTarjeta}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
