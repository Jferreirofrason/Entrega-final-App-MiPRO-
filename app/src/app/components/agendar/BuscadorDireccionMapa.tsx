import { Check, MapPin, Search } from "lucide-react";
import { STR } from "../../i18n/strings";
import { LUGARES_SIMULADOS, LugarSimulado } from "../../data/lugaresSimulados";

// Búsqueda + mapa simulado para el alta de una dirección: se usa tanto en
// el agendamiento de un servicio como en el flujo de garantía. Cada pantalla
// decide qué hacer con el lugar elegido (autocompletar sus propios campos)
// y solo el mensaje del mapa cambia según el contexto ("ubicar el servicio"
// vs. "ubicar el producto").
export function BuscadorDireccionMapa({
  busqueda,
  onBusquedaChange,
  ubicacion,
  onSeleccionar,
  mensajeAyuda,
}: {
  busqueda: string;
  onBusquedaChange: (valor: string) => void;
  ubicacion: string | null;
  onSeleccionar: (lugar: LugarSimulado) => void;
  mensajeAyuda: string;
}) {
  const meta = { fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif" } as const;

  return (
    <div>
      <div
        className="flex items-center gap-2 w-full"
        style={{
          height: "44px",
          borderRadius: "10px",
          border: "1px solid var(--gray-8)",
          backgroundColor: "var(--gray-3)",
          padding: "8px 14px",
        }}
      >
        <Search size={18} strokeWidth={2} color="var(--gray-60)" style={{ flexShrink: 0 }} aria-hidden="true" />
        <input
          type="search"
          placeholder={STR.agendar.buscarMapa}
          aria-label={STR.agendar.buscarMapa}
          value={busqueda}
          onChange={(e) => onBusquedaChange(e.target.value)}
          className="flex-1 bg-transparent border-none outline-none w-full"
          style={{ ...meta, fontSize: "14px", color: "var(--foreground)" }}
        />
      </div>
      {busqueda.trim().length > 0 && !ubicacion && (
        <ul
          className="border mt-1 overflow-hidden"
          style={{ borderColor: "var(--gray-8)", borderRadius: "10px", margin: "4px 0 0", padding: 0, listStyle: "none" }}
        >
          {LUGARES_SIMULADOS.filter((l) =>
            `${l.titulo} ${l.detalle}`.toLowerCase().includes(busqueda.trim().toLowerCase()),
          ).map((l) => (
            <li key={l.id}>
              <button
                onClick={() => onSeleccionar(l)}
                className="w-full text-left flex items-start gap-2 transition-colors hover:bg-[var(--gray-3)]"
                style={{ padding: "12px 16px", background: "none", border: "none", cursor: "pointer" }}
              >
                <MapPin size={16} strokeWidth={2} color="var(--gray-60)" style={{ flexShrink: 0, marginTop: "2px" }} aria-hidden="true" />
                <span>
                  <span style={{ ...meta, fontSize: "14px", fontWeight: "var(--font-weight-medium)", color: "var(--primary-black)", display: "block" }}>
                    {l.titulo}
                  </span>
                  <span style={{ ...meta, fontSize: "12px", color: "var(--gray-60)" }}>{l.detalle}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <div
        className="relative overflow-hidden mt-2"
        role="img"
        aria-label={ubicacion ? STR.agendar.ubicacionConfirmada(ubicacion) : mensajeAyuda}
        style={{
          height: "130px",
          borderRadius: "12px",
          border: "1px solid var(--gray-8)",
          backgroundColor: "#EBEEE9",
          backgroundImage:
            "linear-gradient(90deg, rgba(255,255,255,0.9) 6px, transparent 6px), linear-gradient(0deg, rgba(255,255,255,0.9) 6px, transparent 6px), linear-gradient(45deg, rgba(190,205,185,0.5) 12px, transparent 12px)",
          backgroundSize: "84px 84px, 84px 84px, 168px 168px",
        }}
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
          <span
            className="flex items-center justify-center"
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50% 50% 50% 0",
              transform: "rotate(-45deg)",
              backgroundColor: ubicacion ? "var(--primary-black)" : "var(--gray-40)",
            }}
          >
            <MapPin size={17} strokeWidth={2.2} color="var(--primary-yellow)" style={{ transform: "rotate(45deg)" }} aria-hidden="true" />
          </span>
          <span
            className="px-2.5 py-1"
            style={{
              ...meta,
              fontSize: "12px",
              fontWeight: "var(--font-weight-medium)",
              color: "var(--primary-black)",
              backgroundColor: "rgba(255,255,255,0.92)",
              borderRadius: "999px",
              maxWidth: "90%",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {ubicacion ?? mensajeAyuda}
          </span>
        </div>
      </div>
      {ubicacion && (
        <p role="status" className="flex items-center gap-1.5" style={{ ...meta, fontSize: "12px", color: "var(--gray-80)", margin: "6px 0 0" }}>
          <Check size={14} strokeWidth={2.5} color="var(--success-green)" style={{ flexShrink: 0 }} aria-hidden="true" />
          {STR.agendar.mapaConfirmado}
        </p>
      )}
    </div>
  );
}
