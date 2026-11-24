import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { ArrowLeft, ChevronRight, Search, SearchX, X } from "lucide-react";
import { STR } from "../i18n/strings";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { ICONO_CATEGORIA, SERVICIOS_MIPRO, ServicioCatalogoUI } from "../data/catalogo";
import { DEPARTAMENTO_MIPRO } from "../data/catalogoMipro";
import {
  cantidadArticulos,
  categoriaDe,
  subcategoriasVisibles,
} from "../logic/catalogoMipro";
import {
  agruparPorCategoria,
  avisoEvaluacion,
  filtrarCatalogo,
  ordenarAlfabeticamente,
  presentarPrecio,
} from "../logic/catalogo";

// Catálogo de servicios en TRES niveles: Categoría → Subcategoría →
// Servicios/SKUs. "MiPRO" es el departamento (capa de datos) y nunca una
// pantalla. La jerarquía viene de los documentos del negocio
// (data/catalogoMipro); nada del contenido está hardcodeado en la vista.
//
// Nivel 1 (/catalogo): buscador global + categorías.
// Nivel 2 (/catalogo?cat=...): subcategorías (máx. 9, con el grupo "Otros…"
//   que define la data).
// Nivel 3 (/catalogo?cat=...&sub=...): los servicios/SKUs de esa
//   subcategoría, con buscador predictivo dentro del listado.
//
// La búsqueda SIEMPRE devuelve servicios/SKUs (nunca categorías ni
// subcategorías): desde el nivel 1 cruza todo el catálogo; en el nivel 3
// filtra el listado visible. El precio sigue la regla de producto: "Desde
// $X" con precio del PIM, "Precio a cotizar" sin precio cerrado.
export function CatalogoServicios() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const categoria = params.get("cat");
  const subId = params.get("sub");
  const terminoInicial = params.get("q") ?? "";
  const [termino, setTermino] = useState(terminoInicial);
  const campoBusqueda = useRef<HTMLInputElement>(null);

  // Al cambiar de nivel, el término no arrastra la búsqueda anterior.
  useEffect(() => {
    setTermino(params.get("q") ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoria, subId]);

  // Llegar desde la barra del Home abre el teclado listo para escribir.
  useEffect(() => {
    if (params.get("enfocar") === "1") {
      campoBusqueda.current?.focus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const categorias = DEPARTAMENTO_MIPRO.categorias;
  const categoriaActual = categoria ? categoriaDe(DEPARTAMENTO_MIPRO, categoria) : null;
  const subcategorias = categoriaActual ? subcategoriasVisibles(categoriaActual) : [];
  const subcategoriaActual = subId
    ? subcategorias.find((s) => s.id === subId) ?? null
    : null;

  const buscandoGlobal = categoria === null && termino.trim().length > 0;

  // Nivel 3: los servicios de la subcategoría, con filtro predictivo local.
  const serviciosDeSub = subcategoriaActual
    ? SERVICIOS_MIPRO.filter(
        (s) => s.categoria === categoria && s.subcategoria === subcategoriaActual.nombre,
      )
    : [];
  const resultados = ordenarAlfabeticamente(
    buscandoGlobal
      ? filtrarCatalogo(SERVICIOS_MIPRO, termino)
      : subcategoriaActual
        ? termino.trim()
          ? filtrarCatalogo(serviciosDeSub, termino)
          : serviciosDeSub
        : [],
  );
  const grupos = agruparPorCategoria(resultados);

  const meta = {
    fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif",
  } as const;
  const bebas = {
    fontFamily: "'Bebas Neue', Arial, sans-serif",
    fontWeight: "var(--font-weight-normal)",
    textTransform: "uppercase",
  } as const;

  const filaServicio = (servicio: ServicioCatalogoUI, i: number) => {
    // El slot de precio no repite la condición: de eso se encarga el badge.
    // Todos los SKUs tienen precio base: presentarPrecio nunca devuelve
    // "Precio a cotizar".
    const precio = presentarPrecio(servicio);
    const conDesde = precio.startsWith("Desde ");
    const soloMonto = precio.startsWith("$");
    // Misma regla que el detalle (logic/catalogo.ts): el listado y la ficha
    // no pueden decir cosas distintas del mismo servicio.
    const aviso = avisoEvaluacion(servicio);
    const badge =
      aviso === "obligatoria"
        ? STR.catalogo.badgeRequiereEvaluacion
        : aviso === "puede"
          ? STR.catalogo.badgePuedeEvaluacion
          : null;
    return (
      <button
        key={servicio.id}
        onClick={() => navigate(`/catalogo/${servicio.id}`)}
        aria-label={[servicio.nombre, servicio.descripcion, badge, STR.catalogo.verServicio].filter(Boolean).join(". ")}
        className="w-full text-left transition-colors active:bg-[var(--gray-3)]"
        style={{
          padding: "12px 16px",
          border: "none",
          borderTop: i > 0 ? "1px solid var(--gray-8)" : "1px solid transparent",
          backgroundColor: "transparent",
          cursor: "pointer",
        }}
      >
        <div className="flex items-center gap-3">
        {/* Con foto cargada se muestra la foto con el sello; los SKUs sin
            foto llevan solo el sello de su categoría (el PIM define las
            imágenes productivas). */}
        <div
          className="relative flex-shrink-0 overflow-hidden flex items-center justify-center"
          style={{ width: "64px", height: "64px", borderRadius: "10px", backgroundColor: "var(--gray-8)" }}
        >
          {/* La miniatura usa la foto CUADRADA de la subcategoría: en 64 px
              una apaisada recortada pierde los costados, que es donde está
              lo que se reconoce. Sin cuadrada, cae a la apaisada. */}
          {(servicio.imagenCuadrada ?? servicio.imagen) ? (
            <>
              <ImageWithFallback
                src={servicio.imagenCuadrada ?? servicio.imagen}
                alt=""
                className="w-full h-full object-cover"
              />
              <span
                aria-hidden="true"
                className="absolute bottom-0 right-0 flex items-center justify-center"
                style={{
                  width: "22px",
                  height: "22px",
                  backgroundColor: "var(--primary-black)",
                  borderTopLeftRadius: "8px",
                }}
              >
                <servicio.icono size={12} strokeWidth={2.2} color="var(--primary-yellow)" />
              </span>
            </>
          ) : (
            <servicio.icono size={24} strokeWidth={2} color="var(--gray-60)" aria-hidden="true" />
          )}
        </div>
        {/* Filas fijas: todas las filas miden lo mismo */}
        <div className="flex-1 min-w-0">
          <p
            className="line-clamp-2"
            style={{
              ...meta,
              fontSize: "14px",
              lineHeight: "19px",
              minHeight: "38px",
              fontWeight: "var(--font-weight-medium)",
              color: "var(--primary-black)",
              margin: 0,
            }}
          >
            {servicio.nombre}
          </p>
          {/* Descripción en texto: parte de la estructura de toda ficha.
              Dos líneas exactas (alto fijo) para que las filas midan lo
              mismo con descripciones cortas y largas. El límite de
              caracteres del texto definitivo quedó PENDIENTE de revisión;
              acá se recorta visualmente, no se trunca el dato. */}
          <p
            className="line-clamp-2"
            style={{
              ...meta,
              fontSize: "12px",
              lineHeight: "17px",
              minHeight: "34px",
              color: "var(--gray-60)",
              margin: "2px 0 0",
            }}
          >
            {servicio.descripcion ?? "\u00A0"}
          </p>
          <p
            style={{
              ...meta,
              fontSize: "12px",
              height: "20px",
              overflow: "hidden",
              whiteSpace: "nowrap",
              color: "var(--gray-60)",
              margin: "2px 0 0",
            }}
          >
            {conDesde || soloMonto ? (
              <>
                {conDesde ? "Desde " : ""}
                <span style={{ fontSize: "14px", fontWeight: "var(--font-weight-bold, 700)", color: "var(--primary-black)" }}>
                  {conDesde ? precio.slice("Desde ".length) : precio}
                </span>
              </>
            ) : (
              precio
            )}
          </p>
        </div>
        <ChevronRight size={18} strokeWidth={2} color="var(--gray-40)" style={{ flexShrink: 0 }} aria-hidden="true" />
        </div>

        {/* ...y ocupa el ancho de la fila: condición visible, no nota perdida */}
        {badge && (
          <span
            className="flex items-center gap-2 w-full"
            style={{
              marginTop: "8px",
              padding: "6px 10px",
              borderRadius: "8px",
              backgroundColor: "rgba(255, 238, 0, 0.18)",
              border: "1px solid rgba(0, 0, 0, 0.08)",
            }}
          >
            <span style={{ ...meta, fontSize: "14px", lineHeight: "18px", fontWeight: "var(--font-weight-medium)", color: "var(--primary-black)" }}>
              {badge}
            </span>
          </span>
        )}
      </button>
    );
  };

  const sinResultados = (
    <div
      className="flex flex-col items-center gap-3 p-6 text-center border"
      role="status"
      style={{
        backgroundColor: "var(--card)",
        borderColor: "var(--gray-8)",
        borderRadius: "16px",
      }}
    >
      <div
        className="flex items-center justify-center"
        style={{ width: "48px", height: "48px", borderRadius: "12px", backgroundColor: "var(--primary-black)" }}
      >
        <SearchX size={24} strokeWidth={2} color="var(--primary-yellow)" aria-hidden="true" />
      </div>
      <p style={{ ...meta, fontSize: "15px", fontWeight: "var(--font-weight-medium)", color: "var(--primary-black)", margin: 0 }}>
        {STR.catalogo.sinResultados(termino)}
      </p>
      <p style={{ ...meta, fontSize: "13px", lineHeight: "19px", color: "var(--gray-60)", margin: 0 }}>
        {STR.catalogo.sinResultadosAyuda}
      </p>
      <button
        onClick={() => setTermino("")}
        className="w-full transition-transform hover:scale-[1.01] active:scale-[0.99] border-none"
        style={{
          height: "44px",
          backgroundColor: "var(--primary-yellow)",
          borderRadius: "12px",
          ...meta,
          fontSize: "14px",
          fontWeight: "var(--font-weight-medium)",
          color: "var(--primary-black)",
          cursor: "pointer",
        }}
      >
        {STR.catalogo.verListadoCompleto}
      </button>
    </div>
  );

  const campoDeBusqueda = (placeholder: string, etiqueta: string) => (
    <div className="px-6">
      <div
        className="flex items-center gap-2 w-full transition-all mt-2.5"
        style={{
          height: "44px",
          borderRadius: "10px",
          border: termino ? "1px solid var(--primary-yellow)" : "1px solid var(--gray-8)",
          backgroundColor: "var(--gray-3)",
          padding: "8px 14px",
        }}
      >
        <Search size={18} strokeWidth={2} color="var(--gray-60)" style={{ flexShrink: 0 }} aria-hidden="true" />
        <input
          ref={campoBusqueda}
          type="search"
          enterKeyHint="search"
          placeholder={placeholder}
          aria-label={etiqueta}
          value={termino}
          onChange={(e) => setTermino(e.target.value)}
          className="flex-1 bg-transparent border-none outline-none w-full"
          style={{ ...meta, fontSize: "14px", color: "var(--foreground)" }}
        />
        {termino.length > 0 && (
          <button
            type="button"
            onClick={() => setTermino("")}
            aria-label={STR.catalogo.limpiar}
            style={{
              width: "20px",
              height: "20px",
              borderRadius: "50%",
              backgroundColor: "var(--gray-20)",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              padding: 0,
            }}
          >
            <X size={12} strokeWidth={2.5} color="var(--gray-80)" aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );

  // Título y subtexto del header según el nivel.
  const titulo = subcategoriaActual?.nombre ?? categoria ?? STR.catalogo.titulo;
  const subtexto = subcategoriaActual || buscandoGlobal
    ? STR.catalogo.cantidadServicios(resultados.length)
    : categoriaActual
      ? STR.catalogo.cantidadSubcategorias(subcategorias.length)
      : STR.catalogo.cantidadCategorias(categorias.length);
  const destinoVolver = subcategoriaActual
    ? `/catalogo?cat=${encodeURIComponent(categoria ?? "")}`
    : categoria
      ? "/catalogo"
      : "/";

  const listaContenedor = (contenido: React.ReactNode) => (
    <div
      className="border overflow-hidden"
      style={{ borderColor: "var(--gray-8)", borderRadius: "14px", backgroundColor: "var(--card)", boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}
    >
      {contenido}
    </div>
  );

  return (
    <div className="flex flex-col" style={{ backgroundColor: "var(--primary-white)" }}>
      <header
        className="pt-[20px] pb-3 bg-white sticky top-0 z-20"
        style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}
      >
        <div className="flex items-center gap-3 px-6">
          <button
            onClick={() => navigate(destinoVolver)}
            aria-label={STR.catalogo.volver}
            className="w-11 h-11 rounded-[10px] flex items-center justify-center transition-opacity hover:opacity-80 border flex-shrink-0"
            style={{
              backgroundColor: "var(--primary-white)",
              borderColor: "var(--gray-20)",
              cursor: "pointer",
            }}
          >
            <ArrowLeft size={20} strokeWidth={2} color="var(--primary-black)" aria-hidden="true" />
          </button>
          <div className="flex-1 min-w-0 flex items-baseline gap-2">
            <h1
              className="truncate"
              style={{
                ...bebas,
                fontSize: "20px",
                letterSpacing: "1px",
                color: "var(--primary-black)",
                margin: 0,
              }}
            >
              {titulo}
            </h1>
            <span className="flex-shrink-0" style={{ ...meta, fontSize: "12px", color: "var(--gray-60)" }}>
              {subtexto}
            </span>
          </div>
        </div>

        {/* Buscador global (nivel 1) y predictivo dentro del listado (nivel 3):
            los resultados siempre son servicios/SKUs. */}
        {categoria === null && campoDeBusqueda(STR.catalogo.buscar, STR.catalogo.etiquetaBusqueda)}
        {subcategoriaActual && campoDeBusqueda(STR.catalogo.buscarEnLista, STR.catalogo.etiquetaBusquedaLista)}
      </header>

      <section className="px-6 pt-6 pb-8">
        {subcategoriaActual ? (
          // ── Nivel 3: servicios/SKUs de la subcategoría ──
          resultados.length === 0 ? (
            sinResultados
          ) : (
            listaContenedor(resultados.map(filaServicio))
          )
        ) : categoriaActual ? (
          // ── Nivel 2: subcategorías de la categoría ──
          <div>
            <p style={{ ...meta, fontSize: "13px", color: "var(--gray-60)", margin: "0 0 10px" }}>
              {STR.catalogo.explorarSubcategorias}
            </p>
            {listaContenedor(
              subcategorias.map((sub, i) => (
                <button
                  key={sub.id}
                  onClick={() =>
                    navigate(
                      `/catalogo?cat=${encodeURIComponent(categoria ?? "")}&sub=${encodeURIComponent(sub.id)}`,
                    )
                  }
                  aria-label={`${sub.nombre}, ${STR.catalogo.cantidadServicios(sub.articulos.length)}. ${STR.catalogo.verSubcategoria}.`}
                  className="w-full text-left transition-colors active:bg-[var(--gray-3)] flex items-center gap-3"
                  style={{
                    padding: "12px 16px",
                    minHeight: "56px",
                    border: "none",
                    borderTop: i > 0 ? "1px solid var(--gray-8)" : "1px solid transparent",
                    backgroundColor: "transparent",
                    cursor: "pointer",
                  }}
                >
                  <span className="flex-1 min-w-0">
                    <span
                      className="block line-clamp-2"
                      style={{
                        ...meta,
                        fontSize: "15px",
                        lineHeight: "20px",
                        fontWeight: "var(--font-weight-medium)",
                        color: "var(--primary-black)",
                      }}
                    >
                      {sub.nombre}
                    </span>
                    <span
                      className="block"
                      style={{ ...meta, fontSize: "12px", lineHeight: "17px", color: "var(--gray-60)" }}
                    >
                      {STR.catalogo.cantidadServicios(sub.articulos.length)}
                    </span>
                  </span>
                  <ChevronRight size={18} strokeWidth={2} color="var(--gray-40)" style={{ flexShrink: 0 }} aria-hidden="true" />
                </button>
              )),
            )}
          </div>
        ) : buscandoGlobal ? (
          // ── Búsqueda global: servicios directos, agrupados por categoría ──
          resultados.length === 0 ? (
            sinResultados
          ) : (
            <div className="flex flex-col gap-6" aria-label={STR.catalogo.resultadosDe(termino)}>
              {grupos.map((grupo) => (
                <div key={grupo.categoria}>
                  <div className="flex items-center gap-2 mb-4">
                    <span
                      aria-hidden="true"
                      style={{ width: "4px", height: "16px", backgroundColor: "var(--primary-yellow)", flexShrink: 0 }}
                    />
                    <h2
                      style={{
                        ...bebas,
                        fontSize: "16px",
                        letterSpacing: "1px",
                        color: "var(--primary-black)",
                        margin: 0,
                      }}
                    >
                      {grupo.categoria}
                    </h2>
                    <span style={{ ...meta, fontSize: "12px", color: "var(--gray-60)" }}>
                      {grupo.servicios.length}
                    </span>
                  </div>
                  {listaContenedor(grupo.servicios.map(filaServicio))}
                </div>
              ))}
            </div>
          )
        ) : (
          // ── Nivel 1: categorías ──
          <div>
            <p
              style={{
                ...meta,
                fontSize: "13px",
                color: "var(--gray-60)",
                margin: "0 0 10px",
              }}
            >
              {STR.catalogo.explorar}
            </p>
            {listaContenedor(
              categorias.map((cat, i) => {
                const Icono = ICONO_CATEGORIA[cat.nombre];
                const cantidad = cantidadArticulos(cat);
                return (
                  <button
                    key={cat.nombre}
                    onClick={() => navigate(`/catalogo?cat=${encodeURIComponent(cat.nombre)}`)}
                    aria-label={`${cat.nombre}, ${STR.catalogo.cantidadServicios(cantidad)}. ${STR.catalogo.verCategoria}.`}
                    className="w-full text-left transition-colors active:bg-[var(--gray-3)] flex items-center gap-3"
                    style={{
                      padding: "12px 16px",
                      minHeight: "64px",
                      border: "none",
                      borderTop: i > 0 ? "1px solid var(--gray-8)" : "1px solid transparent",
                      backgroundColor: "transparent",
                      cursor: "pointer",
                    }}
                  >
                    <span
                      aria-hidden="true"
                      className="flex items-center justify-center flex-shrink-0"
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "10px",
                        backgroundColor: "var(--primary-black)",
                      }}
                    >
                      {Icono && <Icono size={19} strokeWidth={2} color="var(--primary-yellow)" />}
                    </span>
                    <span className="flex-1 min-w-0">
                      <span
                        className="block truncate"
                        style={{
                          ...bebas,
                          fontSize: "17px",
                          letterSpacing: "1px",
                          lineHeight: "21px",
                          color: "var(--primary-black)",
                        }}
                      >
                        {cat.nombre}
                      </span>
                      <span
                        className="block"
                        style={{ ...meta, fontSize: "12px", lineHeight: "17px", color: "var(--gray-60)" }}
                      >
                        {STR.catalogo.cantidadServicios(cantidad)}
                      </span>
                    </span>
                    <ChevronRight size={18} strokeWidth={2} color="var(--gray-40)" style={{ flexShrink: 0 }} aria-hidden="true" />
                  </button>
                );
              }),
            )}
          </div>
        )}
      </section>
    </div>
  );
}
