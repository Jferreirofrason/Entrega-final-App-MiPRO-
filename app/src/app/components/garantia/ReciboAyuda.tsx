import cochezLogoUrl from "../../../imports/cochez-logo.svg";

// Diagrama propio (sin foto real, mismo criterio que los de RevisarLugar):
// un recibo SIMULADO con datos inventados, que ilustra dónde está cada dato
// en un comprobante de Cochez. Se reutiliza en las dos ayudas del paso 1
// (factura y código de producto) porque ambos datos viven en el mismo
// comprobante, solo cambia cuál de los dos se resalta.
export function DiagramaRecibo({ resaltar }: { resaltar: "factura" | "codigo" }) {
  const oro = "#8A7A00";
  const resaltoFill = "rgba(255, 238, 0, 0.28)";
  const mono = "'Courier New', Courier, monospace";

  return (
    <svg
      viewBox="0 0 240 330"
      role="img"
      aria-label={
        resaltar === "factura"
          ? "Comprobante de compra con el número de factura señalado debajo del código de barras"
          : "Comprobante de compra con el código de producto señalado junto al nombre del producto"
      }
      className="w-full"
      style={{ display: "block" }}
    >
      {/* Papel */}
      <rect x="10" y="6" width="220" height="300" rx="3" fill="var(--primary-white)" stroke="var(--gray-20)" strokeWidth="1.5" />

      {/* Encabezado: logo oficial de Cochez */}
      <image href={cochezLogoUrl} x="84" y="11" width="72" height="15" />
      <text x="120" y="41" textAnchor="middle" style={{ font: "400 8px 'Helvetica Neue LT Std', Arial", fill: "var(--gray-60)" }}>Cochez y Cía. · Comprobante de venta</text>
      <line x1="24" y1="52" x2="216" y2="52" stroke="var(--gray-20)" strokeWidth="1" strokeDasharray="3 3" />

      {/* Línea de producto, con el código resaltado cuando corresponde */}
      <text x="24" y="70" style={{ font: `400 9px ${mono}`, fill: "var(--gray-80)" }}>1.00 x $1.15</text>
      {resaltar === "codigo" && (
        <rect x="21" y="76" width="76" height="14" rx="3" fill={resaltoFill} stroke={oro} strokeWidth="1.5" />
      )}
      <text x="24" y="86" style={{ font: `700 9px ${mono}`, fill: resaltar === "codigo" ? "var(--primary-black)" : "var(--gray-80)" }}>X010-000005</text>
      <text x="24" y="98" style={{ font: `400 9px ${mono}`, fill: "var(--gray-60)" }}>PERRIER SLIM CAN</text>
      {resaltar === "codigo" && (
        <>
          <path d="M97 83 L128 83" stroke={oro} strokeWidth="1.5" fill="none" />
          <path d="M124 79 L130 83 L124 87" stroke={oro} strokeWidth="1.5" fill="none" strokeLinejoin="round" strokeLinecap="round" />
          <text x="132" y="86" style={{ font: `700 9px 'Helvetica Neue LT Std', Arial`, fill: oro }}>SKU</text>
        </>
      )}

      <line x1="24" y1="112" x2="216" y2="112" stroke="var(--gray-20)" strokeWidth="1" strokeDasharray="3 3" />

      {/* Totales */}
      <text x="24" y="128" style={{ font: `400 9px ${mono}`, fill: "var(--gray-80)" }}>SUBTOTAL</text>
      <text x="216" y="128" textAnchor="end" style={{ font: `400 9px ${mono}`, fill: "var(--gray-80)" }}>$1.15</text>
      <text x="24" y="142" style={{ font: `700 10px ${mono}`, fill: "var(--primary-black)" }}>TOTAL</text>
      <text x="216" y="142" textAnchor="end" style={{ font: `700 10px ${mono}`, fill: "var(--primary-black)" }}>$1.15</text>

      <line x1="24" y1="154" x2="216" y2="154" stroke="var(--gray-20)" strokeWidth="1" strokeDasharray="3 3" />

      {/* Código de barras (ilustrativo) */}
      <g fill="var(--primary-black)">
        {[
          2, 5, 6, 9, 11, 12, 15, 18, 19, 22, 25, 26, 29, 32, 33, 36, 39, 40,
          43, 46, 47, 50, 53, 54, 57, 60, 61, 64, 67, 68, 71, 74, 75, 78, 81,
          82, 85, 88, 89, 92,
        ].map((offset, i) => (
          <rect
            key={i}
            x={30 + offset * 2}
            y="166"
            width={i % 3 === 0 ? 2 : 1}
            height="34"
          />
        ))}
      </g>

      {/* Número de factura, debajo del código de barras */}
      {resaltar === "factura" && (
        <rect x="55" y="206" width="130" height="16" rx="3" fill={resaltoFill} stroke={oro} strokeWidth="1.5" />
      )}
      <text x="120" y="218" textAnchor="middle" style={{ font: `700 10px ${mono}`, fill: resaltar === "factura" ? "var(--primary-black)" : "var(--gray-80)" }}>VCP1-048217</text>
      {resaltar === "factura" && (
        <>
          <path d="M120 226 L120 240" stroke={oro} strokeWidth="1.5" fill="none" />
          <path d="M116 236 L120 241 L124 236" stroke={oro} strokeWidth="1.5" fill="none" strokeLinejoin="round" strokeLinecap="round" />
          <text x="120" y="254" textAnchor="middle" style={{ font: `700 9px 'Helvetica Neue LT Std', Arial`, fill: oro, letterSpacing: "0.3px" }}>N.º DE FACTURA</text>
        </>
      )}

      <line x1="24" y1={resaltar === "factura" ? 264 : 236} x2="216" y2={resaltar === "factura" ? 264 : 236} stroke="var(--gray-20)" strokeWidth="1" strokeDasharray="3 3" />
      <text x="120" y={resaltar === "factura" ? 280 : 252} textAnchor="middle" style={{ font: "400 7px 'Helvetica Neue LT Std', Arial", fill: "var(--gray-40)", fontStyle: "italic" }}>Comprobante de ejemplo, no corresponde a una compra real</text>
    </svg>
  );
}
