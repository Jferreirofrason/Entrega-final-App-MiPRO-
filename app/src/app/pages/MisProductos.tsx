import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { Package, Plus, Search, SlidersHorizontal, X } from "lucide-react";
import { Skeleton } from "../components/ui/skeleton";
import { BloqueError } from "../components/home/BloqueError";
import { FilaCompra } from "../components/productos/FilaCompra";
import { HojaDeFiltros } from "../components/productos/HojaDeFiltros";
import { STR } from "../i18n/strings";
import { cargarMisProductos, leerEscenarioCompras } from "../data/compras";
import { guardarBorrador } from "../data/borradorGarantia";
import {
  guardarBorradorServicio,
  leerBorradorServicio,
} from "../data/borradorServicio";
import {
  aplicarFiltros,
  contextoDeCompra,
  compraCompleta,
  esManual,
  filtrosPuestos,
  listarMisProductos,
  opcionesDeFiltro,
  productoSolicitudDesdeCompra,
  quitarFiltro,
  SIN_FILTROS,
  type FiltroPuesto,
  type FiltrosDeProductos,
  type ProductoPropio,
} from "../logic/compras";

type Fase = "cargando" | "error" | "ok";

const meta = { fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif" } as const;

/** La procedencia se puede fijar desde la dirección: ?origen=manual. */
function leerFiltros(search: string): FiltrosDeProductos {
  const crudo = new URLSearchParams(search).get("origen");
  if (crudo === "manual") return { ...SIN_FILTROS, origen: "manual" };
  if (crudo === "purchase" || crudo === "comprados") {
    return { ...SIN_FILTROS, origen: "purchase" };
  }
  return SIN_FILTROS;
}

/** Cómo se lee cada filtro puesto en su chip. */
function textoDeFiltro(puesto: FiltroPuesto): string {
  switch (puesto.tipo) {
    case "origen":
      return puesto.valor === "manual"
        ? STR.compras.filtroManuales
        : STR.compras.filtroComprados;
    case "tienda":
      return STR.compras.filtroTienda(puesto.valor);
    case "categoria":
      return puesto.valor;
    case "anio":
      return STR.compras.filtroAnio(puesto.valor);
  }
}

/** Un filtro puesto se identifica por su tipo y su valor. */
function claveDeFiltro(puesto: FiltroPuesto): string {
  return `${puesto.tipo}:${puesto.valor}`;
}

// Mis Productos: lo que la persona compró y lo que cargó a mano.
//
// Pantalla RAÍZ del tab "Productos" (sin flecha de volver). Responde una
// sola pregunta: "tengo este producto, ¿cómo pido ayuda sin volver a cargar
// los datos?". Por eso cada ficha tiene las acciones a mano.
//
// UNA SOLA LISTA. Antes había dos destinos (las compras acá y los productos
// cargados a mano en Perfil) y para la persona son lo mismo: sus productos.
// Lo que cambia es qué se sabe de cada uno, y eso lo dice la ficha. El
// filtro de procedencia solo existe cuando hay algo cargado a mano.
//
// Las acciones NO crean flujos nuevos: precargan el que ya existe. Garantía
// entra por /garantia/producto y servicio por /catalogo/:id con el producto
// guardado como contexto del borrador.
export function MisProductos() {
  const navigate = useNavigate();
  const location = useLocation();
  const [fase, setFase] = useState<Fase>("cargando");
  const [productos, setProductos] = useState<ProductoPropio[]>([]);
  const [intento, setIntento] = useState(0);
  const [termino, setTermino] = useState("");
  const [filtros, setFiltros] = useState<FiltrosDeProductos>(() => leerFiltros(location.search));
  const [panelAbierto, setPanelAbierto] = useState(false);

  useEffect(() => {
    let cancelado = false;
    setFase("cargando");
    cargarMisProductos(leerEscenarioCompras(location.search))
      .then((data) => {
        if (cancelado) return;
        setProductos(data);
        setFase("ok");
      })
      .catch(() => {
        if (cancelado) return;
        setFase("error");
      });
    return () => {
      cancelado = true;
    };
  }, [location.search, intento]);

  // Perfil abre esta misma pantalla recortada: ?origen=manual. Si la
  // dirección cambia, el filtro acompaña.
  useEffect(() => {
    setFiltros(leerFiltros(location.search));
  }, [location.search]);

  // Las opciones del panel salen de los datos, no de una constante: nunca se
  // ofrece un recorte que devolvería una lista vacía.
  const opciones = useMemo(() => opcionesDeFiltro(productos), [productos]);
  const puestos = useMemo(() => filtrosPuestos(filtros), [filtros]);

  // El corte vive en el dominio (logic/compras.ts, con pruebas): la pantalla
  // solo dibuja lo que recibe.
  const visibles = useMemo(
    () => listarMisProductos(productos, filtros, termino),
    [productos, filtros, termino],
  );
  // Lo que recortan los filtros SIN la búsqueda: es lo que cuenta el panel,
  // porque adentro del panel no se está escribiendo en el buscador.
  const cuantosConFiltros = useMemo(
    () => aplicarFiltros(productos, filtros).length,
    [productos, filtros],
  );

  // ── Garantía: el formulario llega con lo que se sabe del producto ──
  const pedirGarantia = (p: ProductoPropio) => {
    guardarBorrador({ producto: productoSolicitudDesdeCompra(p) });
    navigate("/garantia/producto", {
      state: {
        desdeCompra: true,
        manual: esManual(p),
        compraCompleta: compraCompleta(p),
      },
    });
  };

  // ── Servicio: el producto viaja en el borrador del servicio elegido ──
  const pedirServicio = (p: ProductoPropio, servicioId: string) => {
    const borrador = leerBorradorServicio(servicioId);
    guardarBorradorServicio({ ...borrador, compra: contextoDeCompra(p) });
    navigate(`/catalogo/${servicioId}`);
  };

  const chipDePuesto = (puesto: FiltroPuesto) => {
    const texto = textoDeFiltro(puesto);
    return (
      <button
        key={claveDeFiltro(puesto)}
        type="button"
        onClick={() => setFiltros((f) => quitarFiltro(f, puesto))}
        aria-label={STR.compras.quitarFiltro(texto)}
        className="flex items-center whitespace-nowrap border-none shrink-0"
        style={{
          ...meta,
          gap: "6px",
          minHeight: "36px",
          padding: "0 10px 0 14px",
          borderRadius: "999px",
          backgroundColor: "var(--primary-yellow)",
          fontSize: "13px",
          fontWeight: "var(--font-weight-medium)",
          color: "var(--primary-black)",
          cursor: "pointer",
        }}
      >
        {texto}
        <X size={14} strokeWidth={2.5} color="var(--primary-black)" aria-hidden="true" />
      </button>
    );
  };

  const skeletons = (
    <div
      role="status"
      aria-label={STR.compras.cargando}
      aria-busy="true"
      className="flex flex-col"
      style={{ gap: "12px" }}
    >
      {[0, 1, 2, 3].map((n) => (
        <div
          key={n}
          className="flex"
          style={{
            gap: "12px",
            padding: "12px",
            borderRadius: "14px",
            border: "1px solid var(--gray-8)",
            backgroundColor: "var(--card)",
          }}
        >
          <Skeleton
            className="shrink-0"
            style={{ width: "72px", height: "72px", borderRadius: "10px", backgroundColor: "var(--gray-8)" }}
          />
          <div className="flex-1">
            <Skeleton className="h-4 w-4/5" style={{ backgroundColor: "var(--gray-8)" }} />
            <Skeleton className="h-3 w-1/3 mt-2" style={{ backgroundColor: "var(--gray-8)" }} />
            <Skeleton className="h-3 w-1/2 mt-2" style={{ backgroundColor: "var(--gray-8)" }} />
          </div>
        </div>
      ))}
    </div>
  );

  const vacio = (titulo: string, texto: string) => (
    <div
      className="flex flex-col items-center text-center"
      style={{
        gap: "10px",
        padding: "28px 18px",
        borderRadius: "16px",
        border: "1px solid var(--gray-8)",
        backgroundColor: "var(--card)",
      }}
    >
      <div
        className="flex items-center justify-center"
        style={{ width: "48px", height: "48px", borderRadius: "12px", backgroundColor: "var(--gray-3)" }}
      >
        <Package size={22} strokeWidth={2} color="var(--gray-60)" aria-hidden="true" />
      </div>
      <h2
        style={{
          fontFamily: "'Bebas Neue', Arial, sans-serif",
          fontSize: "20px",
          letterSpacing: "1px",
          textTransform: "uppercase",
          color: "var(--primary-black)",
          margin: 0,
        }}
      >
        {titulo}
      </h2>
      <p style={{ ...meta, fontSize: "14px", lineHeight: "20px", color: "var(--gray-60)", margin: 0, maxWidth: "30ch" }}>
        {texto}
      </p>
    </div>
  );

  const listado = () => {
    if (fase === "cargando") return skeletons;
    if (fase === "error") {
      return (
        <BloqueError
          mensaje={`${STR.compras.error} ${STR.compras.errorTexto}`}
          reintentarTexto={STR.compras.reintentar}
          onReintentar={() => setIntento((n) => n + 1)}
        />
      );
    }
    // Dos vacíos distintos: no tener productos es un estado de la cuenta y
    // no encontrar nada es el resultado de un filtro.
    if (productos.length === 0) {
      return vacio(STR.compras.vacioTitulo, STR.compras.vacioTexto);
    }
    if (visibles.length === 0) {
      return vacio(STR.compras.sinResultadosTitulo, STR.compras.sinResultadosTexto);
    }
    return (
      <div className="flex flex-col" style={{ gap: "12px" }}>
        {visibles.map((p) => (
          <FilaCompra
            key={p.id}
            producto={p}
            onAbrir={(x) => navigate(`/mis-productos/${x.id}`)}
            onGarantia={pedirGarantia}
            onServicio={pedirServicio}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col" style={{ backgroundColor: "var(--primary-white)" }}>
      {/* Encabezado de pantalla raíz: sin flecha de volver, igual que el
          Home. "Agregar" vive acá porque desde que las dos listas se
          unieron, esta pantalla es la única puerta al alta a mano. */}
      <header
        className="px-6 pt-5 pb-4 bg-white sticky top-0 z-20 flex items-center"
        style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.05)", gap: "12px" }}
      >
        <h1
          className="flex-1 min-w-0 truncate"
          style={{
            fontFamily: "'Bebas Neue', Arial, sans-serif",
            fontSize: "20px",
            fontWeight: "var(--font-weight-normal)",
            letterSpacing: "1px",
            color: "var(--primary-black)",
            margin: 0,
            textTransform: "uppercase",
          }}
        >
          {STR.compras.titulo}
        </h1>
        <button
          type="button"
          onClick={() => navigate("/mis-productos/agregar")}
          aria-label={STR.compras.agregarProducto}
          className="flex items-center border shrink-0 transition-transform active:scale-[0.99]"
          style={{
            ...meta,
            gap: "6px",
            minHeight: "36px",
            padding: "0 12px",
            borderRadius: "10px",
            borderColor: "var(--gray-20)",
            backgroundColor: "var(--primary-white)",
            fontSize: "13px",
            fontWeight: "var(--font-weight-medium)",
            color: "var(--primary-black)",
            cursor: "pointer",
          }}
        >
          <Plus size={16} strokeWidth={2} color="var(--primary-black)" aria-hidden="true" />
          {STR.compras.agregar}
        </button>
      </header>

      <div className="flex flex-col px-6 pt-4 pb-4" style={{ gap: "16px" }}>
        <p style={{ ...meta, fontSize: "14px", lineHeight: "20px", color: "var(--gray-60)", margin: 0, maxWidth: "42ch" }}>
          {STR.compras.intro}
        </p>

        {/* Buscador y filtros en la misma línea: buscar y recortar son la
            misma intención ("mostrame menos"), y separarlos en dos filas
            hacía que el encabezado creciera sin necesidad. */}
        <div className="flex flex-col" style={{ gap: "10px" }}>
          <div className="flex items-center" style={{ gap: "8px" }}>
          <div
            className="flex items-center flex-1 min-w-0"
            style={{
              gap: "8px",
              height: "44px",
              borderRadius: "10px",
              border: termino ? "1px solid var(--primary-yellow)" : "1px solid var(--gray-8)",
              backgroundColor: "var(--gray-3)",
              padding: "8px 14px",
            }}
          >
            <Search size={18} strokeWidth={2} color="var(--gray-60)" style={{ flexShrink: 0 }} aria-hidden="true" />
            <input
              type="search"
              aria-label={STR.compras.etiquetaBusqueda}
              placeholder={STR.compras.buscar}
              value={termino}
              onChange={(e) => setTermino(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none min-w-0"
              style={{ ...meta, fontSize: "15px", color: "var(--foreground)" }}
            />
            {termino.length > 0 && (
              <button
                type="button"
                onClick={() => setTermino("")}
                aria-label={STR.compras.borrarBusqueda}
                className="flex items-center justify-center border-none shrink-0"
                style={{
                  width: "24px",
                  height: "24px",
                  borderRadius: "50%",
                  backgroundColor: "var(--gray-20)",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                <X size={13} strokeWidth={2.5} color="var(--primary-black)" aria-hidden="true" />
              </button>
            )}
          </div>

          {/* El ícono de filtros. Cuando hay alguno puesto se enciende y
              dice cuántos: que el panel esté cerrado no puede esconder que
              la lista está recortada. */}
          <button
            type="button"
            onClick={() => setPanelAbierto(true)}
            aria-label={
              puestos.length > 0
                ? STR.compras.abrirFiltrosCon(puestos.length)
                : STR.compras.abrirFiltros
            }
            aria-expanded={panelAbierto}
            className="flex items-center justify-center border shrink-0 transition-transform active:scale-[0.97]"
            style={{
              ...meta,
              gap: "6px",
              width: puestos.length > 0 ? "auto" : "44px",
              paddingInline: puestos.length > 0 ? "12px" : "0",
              height: "44px",
              borderRadius: "10px",
              borderColor: puestos.length > 0 ? "var(--primary-yellow)" : "var(--gray-8)",
              backgroundColor: puestos.length > 0 ? "var(--primary-yellow)" : "var(--gray-3)",
              cursor: "pointer",
            }}
          >
            <SlidersHorizontal
              size={18}
              strokeWidth={2}
              color={puestos.length > 0 ? "var(--primary-black)" : "var(--gray-60)"}
              aria-hidden="true"
            />
            {puestos.length > 0 && (
              <span
                aria-hidden="true"
                style={{
                  ...meta,
                  fontSize: "13px",
                  fontWeight: "var(--font-weight-medium)",
                  color: "var(--primary-black)",
                }}
              >
                {puestos.length}
              </span>
            )}
          </button>
          </div>

          {/* Lo que quedó puesto, cada uno con su X. Sin filtros no se
              dibuja NADA: un chip de "todos" encendido es un chip que no
              recorta, y ahí empezaba la confusión. Se sale del padding de
              la pantalla para desplazarse de borde a borde. */}
          {puestos.length > 0 && (
            <div
              role="group"
              aria-label={STR.compras.etiquetaFiltros}
              className="flex overflow-x-auto scrollbar-hide"
              style={{
                gap: "8px",
                scrollbarWidth: "none",
                marginInline: "-24px",
                paddingInline: "24px",
              }}
            >
              {puestos.map(chipDePuesto)}
              {puestos.length > 1 && (
                <button
                  type="button"
                  onClick={() => setFiltros(SIN_FILTROS)}
                  className="whitespace-nowrap border-none bg-transparent shrink-0"
                  style={{
                    ...meta,
                    minHeight: "36px",
                    padding: "0 4px",
                    fontSize: "13px",
                    fontWeight: "var(--font-weight-medium)",
                    color: "var(--info-blue)",
                    cursor: "pointer",
                  }}
                >
                  {STR.compras.limpiarFiltros}
                </button>
              )}
            </div>
          )}
        </div>

        {listado()}
      </div>

      <HojaDeFiltros
        abierto={panelAbierto}
        onCerrar={() => setPanelAbierto(false)}
        filtros={filtros}
        onCambiar={setFiltros}
        opciones={opciones}
        cuantosQuedan={cuantosConFiltros}
      />
    </div>
  );
}
