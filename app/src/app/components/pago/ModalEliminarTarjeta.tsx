import { useEffect } from "react";
import { X } from "lucide-react";
import { STR } from "../../i18n/strings";
import { enmascararTarjeta, type MedioPagoTarjeta } from "../../logic/pago";

// Confirmación para eliminar una tarjeta.
//
// No pregunta "¿estás seguro?": dice qué tarjeta es, por marca y cuatro
// últimos dígitos, y qué cambia si se elimina. Si era la elegida para este
// pago, avisa que habrá que elegir otra; si era la predeterminada, avisa
// que no se asigna otra sola.
export function ModalEliminarTarjeta({
  tarjeta,
  eraLaElegida,
  onCerrar,
  onEliminar,
  copia,
}: {
  /** null = cerrado. */
  tarjeta: MedioPagoTarjeta | null;
  eraLaElegida: boolean;
  onCerrar: () => void;
  onEliminar: () => void;
  /**
   * Título y primera línea alternativos, para Perfil. Sin esto va el copy
   * del checkout, que nombra la tarjeta en el título porque ahí se borra
   * desde el carrusel.
   */
  copia?: { titulo: string; texto: (tarjeta: string) => string };
}) {
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
  const nombre = `${tarjeta.marca} ${enmascararTarjeta(tarjeta.ultimos)}`;

  const parrafo = (texto: string, fuerte = false) => (
    <p
      key={texto}
      style={{
        ...meta,
        fontSize: fuerte ? "14px" : "13px",
        lineHeight: fuerte ? "20px" : "19px",
        fontWeight: fuerte ? "var(--font-weight-medium)" : "var(--font-weight-normal)",
        color: fuerte ? "var(--primary-black)" : "var(--gray-80)",
        margin: 0,
      }}
    >
      {texto}
    </p>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0" style={{ backgroundColor: "rgba(0, 0, 0, 0.45)" }} onClick={onCerrar} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-eliminar-tarjeta"
        className="relative z-10 w-full max-w-lg bg-white rounded-t-[24px] flex flex-col max-h-[90dvh]"
        style={{ boxShadow: "0 -8px 30px rgba(0, 0, 0, 0.15)" }}
      >
        <div className="flex justify-center py-2 shrink-0">
          <div className="w-12 h-1.5 rounded-full" style={{ backgroundColor: "var(--gray-20)" }} />
        </div>

        {/* Sin barra de título: la pregunta ES el encabezado, así no se
            repite "Eliminar tarjeta" dos veces. */}
        <div className="px-6 pb-1 pt-1 flex items-start justify-between shrink-0" style={{ gap: "12px" }}>
          <h3
            id="titulo-eliminar-tarjeta"
            style={{
              ...meta,
              fontSize: "17px",
              lineHeight: "23px",
              fontWeight: "var(--font-weight-semibold)",
              color: "var(--primary-black)",
              margin: "6px 0 0",
            }}
          >
            {copia ? copia.titulo : STR.pago.eliminarQue(nombre)}
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

        <div className="px-6 pb-5 pt-1 flex flex-col" style={{ gap: "8px" }}>
          {parrafo(copia ? copia.texto(nombre) : STR.pago.eliminarQueCambia)}
          {eraLaElegida && parrafo(STR.pago.eliminarEraElegida)}
          {tarjeta.predeterminada && parrafo(STR.pago.eliminarEraPredeterminada)}
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
            onClick={onEliminar}
            style={{
              ...meta,
              fontSize: "13px",
              fontWeight: "var(--font-weight-medium)",
              color: "var(--primary-white)",
              backgroundColor: "var(--error-red)",
              border: "none",
              borderRadius: "10px",
              padding: "12px 20px",
              minHeight: "44px",
              cursor: "pointer",
            }}
          >
            {STR.pago.eliminarTarjeta}
          </button>
        </div>
      </div>
    </div>
  );
}
