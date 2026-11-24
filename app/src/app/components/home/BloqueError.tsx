import { AlertCircle } from "lucide-react";

// Error de una sección del Home: no bloquea el resto de la pantalla y ofrece
// reintentar. Card y botón siguen los patrones existentes de la app.
export function BloqueError({
  mensaje,
  reintentarTexto,
  onReintentar,
}: {
  mensaje: string;
  reintentarTexto: string;
  onReintentar: () => void;
}) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-3 p-5 text-center border"
      style={{
        backgroundColor: "var(--card)",
        borderColor: "var(--gray-8)",
        borderRadius: "16px",
      }}
    >
      <AlertCircle size={22} strokeWidth={2} color="var(--gray-60)" aria-hidden="true" />
      <p
        style={{
          fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif",
          fontSize: "13px",
          color: "var(--gray-60)",
          margin: 0,
        }}
      >
        {mensaje}
      </p>
      <button
        onClick={onReintentar}
        className="px-5 border transition-transform hover:scale-[1.01] active:scale-[0.99]"
        style={{
          minHeight: "44px",
          backgroundColor: "var(--primary-white)",
          borderColor: "var(--gray-20)",
          borderRadius: "10px",
          fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif",
          fontSize: "13px",
          fontWeight: "var(--font-weight-medium)",
          color: "var(--primary-black)",
          cursor: "pointer",
        }}
      >
        {reintentarTexto}
      </button>
    </div>
  );
}
