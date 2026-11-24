import { STR } from "../../i18n/strings";
import { Campo, estiloInput } from "../garantia/Campo";
import type { EstadoRegalo } from "../../logic/beneficios";

// El código de la tarjeta de regalo, dentro de su propia fila.
//
// ⚠️ La validación es de DEMOSTRACIÓN: compara contra una lista de códigos
// de prueba (data/beneficios.ts). No hay emisión, ni saldos reales, ni PIN.
// El PIN no se pide porque todavía no sabemos si el sistema lo usa.
//
// El saldo y el monto a usar se muestran SOLO cuando el código validó: sin
// dato no se inventa un número.
//
// Si el saldo no alcanza, no se completa con otro medio: el pago combinado
// está pendiente de definición y la pantalla lo dice en lugar de suponerlo.
export function PanelTarjetaRegalo({
  codigo,
  estado,
  saldo,
  total,
  onCambiarCodigo,
  onValidar,
  onReiniciar,
  formatearMonto,
}: {
  codigo: string;
  estado: EstadoRegalo;
  /** Saldo validado, si lo hay. */
  saldo: number | null;
  total: number;
  onCambiarCodigo: (codigo: string) => void;
  onValidar: () => void;
  onReiniciar: () => void;
  formatearMonto: (monto: number) => string;
}) {
  const meta = { fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif" } as const;
  const validando = estado === "validando";

  const nota = (texto: string, tono: "error" | "gris" = "gris") => (
    <p
      style={{
        ...meta,
        fontSize: "12px",
        lineHeight: "17px",
        color: tono === "error" ? "var(--error-red)" : "var(--gray-60)",
        margin: 0,
      }}
    >
      {texto}
    </p>
  );

  if (estado === "valida" && saldo !== null) {
    return (
      <div className="flex flex-col" style={{ gap: "4px" }}>
        <p
          style={{
            ...meta,
            fontSize: "13px",
            lineHeight: "18px",
            fontWeight: "var(--font-weight-medium)",
            color: "var(--primary-black)",
            margin: 0,
          }}
        >
          {STR.pago.regaloSaldo(formatearMonto(saldo))}
        </p>
        {nota(STR.pago.regaloAUsar(formatearMonto(total)))}
        <button
          type="button"
          onClick={onReiniciar}
          className="self-start border-none bg-transparent px-0"
          style={{
            ...meta,
            fontSize: "13px",
            fontWeight: "var(--font-weight-medium)",
            color: "var(--info-blue)",
            minHeight: "36px",
            cursor: "pointer",
          }}
        >
          {STR.pago.regaloOtroCodigo}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col" style={{ gap: "8px" }}>
      <Campo
        id="regalo-codigo"
        etiqueta={STR.pago.regaloCodigo}
        obligatorio
        error={estado === "invalida" ? STR.pago.regaloInvalida : null}
      >
        <div className="flex items-start" style={{ gap: "8px" }}>
          <input
            id="regalo-codigo"
            type="text"
            inputMode="text"
            autoComplete="off"
            value={codigo}
            onChange={(e) => onCambiarCodigo(e.target.value)}
            disabled={validando}
            placeholder="MIPRO0000"
            style={{ ...estiloInput(estado === "invalida"), textTransform: "uppercase" }}
          />
          <button
            type="button"
            onClick={onValidar}
            disabled={validando || !codigo.trim()}
            className="shrink-0 border-none"
            style={{
              ...meta,
              height: "44px",
              padding: "0 16px",
              borderRadius: "8px",
              backgroundColor: codigo.trim() && !validando ? "var(--primary-black)" : "var(--gray-8)",
              color: codigo.trim() && !validando ? "var(--primary-white)" : "var(--gray-60)",
              fontSize: "13px",
              fontWeight: "var(--font-weight-medium)",
              cursor: codigo.trim() && !validando ? "pointer" : "default",
            }}
          >
            {STR.pago.regaloValidar}
          </button>
        </div>
      </Campo>

      {validando && nota(STR.pago.regaloValidando)}
      {estado === "saldo-insuficiente" && saldo !== null && (
        <>
          {nota(STR.pago.regaloSinSaldo(formatearMonto(saldo), formatearMonto(total)), "error")}
          {nota(STR.pago.regaloCombinadoPendiente)}
        </>
      )}
      {nota(STR.pago.regaloSimulado)}
    </div>
  );
}
