import { getStatusConfig } from "../../utils/statusConfig";
import { presentarEstado } from "../../i18n/estados";

// Estado de la cita en lenguaje cotidiano: qué pasó y qué esperar después.
//
// El valor interno del dominio no se muestra: se traduce con la capa de
// presentación (i18n/estados.ts). El color y el ícono vienen del sistema de
// estados existente (statusConfig) y solo refuerzan: el texto va siempre en
// tonos oscuros para asegurar contraste AA sobre el fondo tintado, y alcanza
// por sí solo para comprender el estado.
export function EstadoCita({ estado }: { estado: string }) {
  const config = getStatusConfig(estado);
  const presentacion = presentarEstado(estado);
  const Icono = config.icon;

  return (
    <div
      style={{
        backgroundColor: config.bg,
        borderRadius: "10px",
        padding: "10px 12px",
      }}
    >
      <div className="flex items-center gap-2">
        <Icono
          size={16}
          strokeWidth={2.5}
          color={config.color}
          style={{ flexShrink: 0 }}
          aria-hidden="true"
        />
        <span
          style={{
            fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif",
            fontSize: "14px",
            fontWeight: "var(--font-weight-medium)",
            color: "var(--primary-black)",
          }}
        >
          {presentacion.etiqueta}
        </span>
      </div>
      {presentacion.explicacion && (
        <p
          style={{
            fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif",
            fontSize: "13px",
            lineHeight: "19px",
            color: "var(--gray-80)",
            margin: "4px 0 0",
            paddingLeft: "24px",
          }}
        >
          {presentacion.explicacion}
        </p>
      )}
    </div>
  );
}
