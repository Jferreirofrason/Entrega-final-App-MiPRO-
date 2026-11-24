import { HojaAcciones } from "../pago/HojaAcciones";
import { STR } from "../../i18n/strings";
import {
  hayFiltros,
  SIN_FILTROS,
  type FiltroDeEstado,
  type FiltroDeTipo,
  type FiltrosDeHistorial,
} from "../../logic/misSolicitudes";

const meta = { fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif" } as const;

// El panel de filtros del historial.
//
// Mismo patrón que el de Mis productos y por el mismo motivo: UN estado de
// filtro para las dos dimensiones. Dos filas de chips, cada una con su
// propio "Todos" encendido, no se pueden leer; acá no hay chip de "todo",
// y no tener filtro es no tener filtro.
//
// Se aplica en vivo: cada toque recorta la lista de atrás y el contador de
// arriba dice cuántas quedan. No hay Aplicar ni Cancelar porque no hay nada
// que confirmar.
export function HojaDeFiltrosHistorial({
  abierto,
  onCerrar,
  filtros,
  onCambiar,
  cuantasQuedan,
}: {
  abierto: boolean;
  onCerrar: () => void;
  filtros: FiltrosDeHistorial;
  onCambiar: (nuevos: FiltrosDeHistorial) => void;
  cuantasQuedan: number;
}) {
  const opcion = (texto: string, activo: boolean, onClick: () => void, clave: string) => (
    <button
      key={clave}
      type="button"
      onClick={onClick}
      aria-pressed={activo}
      className="whitespace-nowrap border transition-transform active:scale-[0.99]"
      style={{
        ...meta,
        minHeight: "40px",
        padding: "0 14px",
        borderRadius: "999px",
        borderColor: activo ? "var(--primary-yellow)" : "var(--gray-20)",
        backgroundColor: activo ? "var(--primary-yellow)" : "var(--primary-white)",
        fontSize: "14px",
        fontWeight: activo ? "var(--font-weight-medium)" : "var(--font-weight-normal)",
        color: "var(--primary-black)",
        cursor: "pointer",
      }}
    >
      {texto}
    </button>
  );

  const grupo = (titulo: string, hijos: React.ReactNode) => (
    <div className="flex flex-col" style={{ gap: "10px" }}>
      <p
        style={{
          ...meta,
          fontSize: "13px",
          fontWeight: "var(--font-weight-medium)",
          letterSpacing: "0.5px",
          textTransform: "uppercase",
          color: "var(--gray-60)",
          margin: 0,
        }}
      >
        {titulo}
      </p>
      <div className="flex flex-wrap" style={{ gap: "8px" }}>
        {hijos}
      </div>
    </div>
  );

  // Tocar el chip que ya está puesto lo saca: es la forma de volver a
  // "todos" sin un chip de "todos".
  const ponerEstado = (valor: Exclude<FiltroDeEstado, "todos">) =>
    onCambiar({ ...filtros, estado: filtros.estado === valor ? "todos" : valor });
  const ponerTipo = (valor: Exclude<FiltroDeTipo, "todos">) =>
    onCambiar({ ...filtros, tipo: filtros.tipo === valor ? "todos" : valor });

  return (
    <HojaAcciones abierto={abierto} onCerrar={onCerrar} titulo={STR.misSolicitudes.panelTitulo}>
      <div
        className="flex flex-col"
        style={{
          gap: "20px",
          padding: "4px 24px 0",
          paddingBottom: "calc(8px + env(safe-area-inset-bottom))",
        }}
      >
        <p
          aria-live="polite"
          style={{
            ...meta,
            fontSize: "14px",
            fontWeight: "var(--font-weight-medium)",
            color: cuantasQuedan === 0 ? "var(--gray-60)" : "var(--primary-black)",
            margin: 0,
          }}
        >
          {cuantasQuedan === 0
            ? STR.misSolicitudes.panelSinResultado
            : STR.misSolicitudes.panelResultado(cuantasQuedan)}
        </p>

        {grupo(STR.misSolicitudes.panelEstado, [
          opcion(
            STR.misSolicitudes.filtroActivos,
            filtros.estado === "activos",
            () => ponerEstado("activos"),
            "activos",
          ),
          opcion(
            STR.misSolicitudes.filtroFinalizados,
            filtros.estado === "finalizados",
            () => ponerEstado("finalizados"),
            "finalizados",
          ),
        ])}

        {grupo(STR.misSolicitudes.panelTipo, [
          opcion(
            STR.misSolicitudes.filtroServicios,
            filtros.tipo === "servicio",
            () => ponerTipo("servicio"),
            "servicio",
          ),
          opcion(
            STR.misSolicitudes.filtroGarantias,
            filtros.tipo === "garantia",
            () => ponerTipo("garantia"),
            "garantia",
          ),
        ])}

        <div className="flex" style={{ gap: "8px", paddingTop: "4px" }}>
          {hayFiltros(filtros) && (
            <button
              type="button"
              onClick={() => onCambiar(SIN_FILTROS)}
              className="border transition-transform active:scale-[0.99]"
              style={{
                ...meta,
                flex: "1 1 0",
                minHeight: "44px",
                borderRadius: "12px",
                borderColor: "var(--gray-20)",
                backgroundColor: "var(--primary-white)",
                fontSize: "14px",
                fontWeight: "var(--font-weight-medium)",
                color: "var(--primary-black)",
                cursor: "pointer",
              }}
            >
              {STR.misSolicitudes.panelLimpiar}
            </button>
          )}
          <button
            type="button"
            onClick={onCerrar}
            className="border-none transition-transform active:scale-[0.99]"
            style={{
              ...meta,
              flex: "1 1 0",
              minHeight: "44px",
              borderRadius: "12px",
              backgroundColor: "var(--primary-yellow)",
              fontSize: "14px",
              fontWeight: "var(--font-weight-medium)",
              color: "var(--primary-black)",
              cursor: "pointer",
            }}
          >
            {STR.misSolicitudes.panelListo}
          </button>
        </div>
      </div>
    </HojaAcciones>
  );
}
