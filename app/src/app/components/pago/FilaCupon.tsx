import { Tag, X } from "lucide-react";
import { STR } from "../../i18n/strings";

// El cupón, en una fila compacta.
//
// Sin cupón es una línea con su acción; con cupón aplicado muestra el
// código, el descuento y cómo sacarlo. Nada más: el detalle económico vive
// en el pie, junto al total.
//
// ⚠️ La validación es de DEMOSTRACIÓN (ver data/beneficios.ts). No hay
// porcentajes, vigencias ni reglas de acumulación: eso lo define Comercial.
export function FilaCupon({
  codigo,
  descuento,
  onAbrir,
  onQuitar,
  formatearMonto,
}: {
  /** null = no hay cupón aplicado. */
  codigo: string | null;
  descuento: number;
  onAbrir: () => void;
  onQuitar: () => void;
  formatearMonto: (monto: number) => string;
}) {
  const meta = { fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif" } as const;

  const caja = {
    padding: "12px 14px",
    borderRadius: "16px",
    backgroundColor: "var(--gray-3)",
  } as const;

  if (codigo) {
    return (
      <div className="flex items-center" style={{ ...caja, gap: "12px" }}>
        <Tag size={18} strokeWidth={2} color="var(--primary-black)" aria-hidden="true" />
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
            {STR.pago.cuponAplicado(codigo)}
          </span>
          <span
            className="block"
            style={{ ...meta, fontSize: "13px", lineHeight: "18px", color: "var(--gray-60)" }}
          >
            {`${STR.pago.descuento} ${formatearMonto(descuento)}`}
          </span>
        </span>
        <button
          type="button"
          onClick={onQuitar}
          aria-label={STR.pago.cuponQuitar}
          className="flex shrink-0 items-center justify-center rounded-full border-none bg-transparent"
          style={{ width: "36px", height: "36px", cursor: "pointer" }}
        >
          <X size={18} color="var(--gray-60)" aria-hidden="true" />
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onAbrir}
      className="flex w-full items-center border-none text-left"
      style={{ ...caja, gap: "12px", minHeight: "56px", cursor: "pointer" }}
    >
      <Tag size={18} strokeWidth={2} color="var(--primary-black)" aria-hidden="true" />
      <span
        className="min-w-0 flex-1"
        style={{
          ...meta,
          fontSize: "14px",
          lineHeight: "20px",
          fontWeight: "var(--font-weight-medium)",
          color: "var(--primary-black)",
        }}
      >
        {STR.pago.cuponPregunta}
      </span>
      <span
        className="shrink-0"
        style={{
          ...meta,
          fontSize: "13px",
          fontWeight: "var(--font-weight-medium)",
          color: "var(--info-blue)",
        }}
      >
        {STR.pago.cuponAgregar}
      </span>
    </button>
  );
}
