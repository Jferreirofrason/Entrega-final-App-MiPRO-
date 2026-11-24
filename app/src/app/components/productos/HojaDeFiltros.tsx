import { HojaAcciones } from "../pago/HojaAcciones";
import { STR } from "../../i18n/strings";
import {
  alternar,
  hayFiltros,
  SIN_FILTROS,
  type FiltrosDeProductos,
  type OpcionesDeFiltro,
  type OrigenProducto,
} from "../../logic/compras";

const meta = { fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif" } as const;

// El panel de filtros de Mis productos.
//
// Se aplica EN VIVO: cada toque recorta la lista que está detrás y el
// contador de arriba dice cuántos quedan. No hay "Aplicar" ni "Cancelar"
// porque no hay nada que confirmar: lo que se ve es el resultado, y
// "Limpiar" deshace todo de una.
//
// Procedencia es una sola opción (un producto o viene de una compra o se
// cargó a mano, no las dos). Tienda, categoría y año son varias: elegir
// Novey y Cochez a la vez es una pregunta razonable.
//
// Las opciones salen de los datos (opcionesDeFiltro): nunca se ofrece un
// recorte que devolvería una lista vacía.
export function HojaDeFiltros({
  abierto,
  onCerrar,
  filtros,
  onCambiar,
  opciones,
  cuantosQuedan,
}: {
  abierto: boolean;
  onCerrar: () => void;
  filtros: FiltrosDeProductos;
  onCambiar: (nuevos: FiltrosDeProductos) => void;
  opciones: OpcionesDeFiltro;
  cuantosQuedan: number;
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
        color: activo ? "var(--primary-black)" : "var(--primary-black)",
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

  const ponerOrigen = (valor: OrigenProducto) =>
    onCambiar({ ...filtros, origen: filtros.origen === valor ? "todos" : valor });

  const conFiltros = hayFiltros(filtros);

  return (
    <HojaAcciones abierto={abierto} onCerrar={onCerrar} titulo={STR.compras.panelTitulo}>
      <div
        className="flex flex-col"
        style={{
          gap: "20px",
          padding: "4px 24px 0",
          paddingBottom: "calc(8px + env(safe-area-inset-bottom))",
        }}
      >
        {/* Cuántos quedan, arriba de todo: la respuesta a lo que se acaba de
            tocar, sin tener que cerrar el panel para verla. */}
        <p
          aria-live="polite"
          style={{
            ...meta,
            fontSize: "14px",
            fontWeight: "var(--font-weight-medium)",
            color: cuantosQuedan === 0 ? "var(--gray-60)" : "var(--primary-black)",
            margin: 0,
          }}
        >
          {cuantosQuedan === 0
            ? STR.compras.panelSinResultado
            : STR.compras.panelResultado(cuantosQuedan)}
        </p>

        {opciones.conProcedencia &&
          grupo(STR.compras.panelProcedencia, [
            opcion(
              STR.compras.filtroComprados,
              filtros.origen === "purchase",
              () => ponerOrigen("purchase"),
              "purchase",
            ),
            opcion(
              STR.compras.filtroManuales,
              filtros.origen === "manual",
              () => ponerOrigen("manual"),
              "manual",
            ),
          ])}

        {opciones.tiendas.length > 0 &&
          grupo(
            STR.compras.panelTienda,
            opciones.tiendas.map((t) =>
              opcion(
                t,
                filtros.tiendas.includes(t),
                () => onCambiar({ ...filtros, tiendas: alternar(filtros.tiendas, t) }),
                t,
              ),
            ),
          )}

        {opciones.categorias.length > 0 &&
          grupo(
            STR.compras.panelCategoria,
            opciones.categorias.map((c) =>
              opcion(
                c,
                filtros.categorias.includes(c),
                () => onCambiar({ ...filtros, categorias: alternar(filtros.categorias, c) }),
                c,
              ),
            ),
          )}

        {opciones.anios.length > 0 &&
          grupo(
            STR.compras.panelAnio,
            opciones.anios.map((a) =>
              opcion(
                String(a),
                filtros.anios.includes(a),
                () => onCambiar({ ...filtros, anios: alternar(filtros.anios, a) }),
                String(a),
              ),
            ),
          )}

        {/* Pie: limpiar y cerrar. "Limpiar" solo existe si hay algo que
            limpiar; un botón apagado que nunca se enciende es ruido. */}
        <div className="flex" style={{ gap: "8px", paddingTop: "4px" }}>
          {conFiltros && (
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
              {STR.compras.panelLimpiar}
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
            {STR.compras.panelListo}
          </button>
        </div>
      </div>
    </HojaAcciones>
  );
}
