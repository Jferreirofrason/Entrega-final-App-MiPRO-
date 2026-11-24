import { useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft } from "lucide-react";
import { Campo, estiloInput } from "../components/garantia/Campo";
import { STR } from "../i18n/strings";
import { buscarProductoPorId, guardarEdicionManual } from "../data/compras";
import {
  edicionDesdeProducto,
  puedeEditarse,
  validarEdicionManual,
  type EdicionManual,
} from "../logic/compras";

const meta = { fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif" } as const;

// Editar un producto que cargó la persona.
//
// Solo llega acá lo que se puede editar: de una COMPRA no se corrige nada
// desde la app, porque esos datos vienen del comercio y pisarlos acá no
// cambiaría la factura. Si alguien entra por la dirección a editar una
// compra, la pantalla lo dice y lo devuelve al detalle.
//
// Un campo vacío BORRA el dato, no lo deja como estaba: si alguien limpia
// "Modelo" es porque no lo sabe, y el detalle tiene que poder decir "sin
// cargar". El único obligatorio es el nombre, que es con lo que la persona
// reconoce el producto en la lista.
export function EditarMiProducto() {
  const navigate = useNavigate();
  const { id } = useParams();
  const producto = useMemo(() => (id ? buscarProductoPorId(id) : null), [id]);

  const [edicion, setEdicion] = useState<EdicionManual>(() =>
    producto ? edicionDesdeProducto(producto) : {
      name: "", brand: "", category: "", modelo: "", serialNumber: "",
    },
  );
  const [error, setError] = useState<string | null>(null);
  const campoNombre = useRef<HTMLInputElement>(null);

  const volver = () => navigate(-1);

  if (!producto || !puedeEditarse(producto)) {
    return (
      <div className="flex flex-col" style={{ backgroundColor: "var(--primary-white)" }}>
        {cabecera(volver, STR.compras.editarTitulo)}
        <div className="px-6 pt-8">
          <p style={{ ...meta, fontSize: "15px", lineHeight: "21px", color: "var(--gray-60)", margin: 0 }}>
            {producto ? STR.compras.detalleCompraFija : STR.compras.detalleNoEncontrado}
          </p>
        </div>
      </div>
    );
  }

  const cambiar = (campo: keyof EdicionManual) => (valor: string) => {
    setEdicion((e) => ({ ...e, [campo]: valor }));
    setError(null);
  };

  const guardar = () => {
    const errores = validarEdicionManual(edicion);
    if (errores.length > 0) {
      setError(errores[0]);
      campoNombre.current?.focus();
      return;
    }
    guardarEdicionManual(producto.id, edicion);
    // Vuelve al detalle, que se vuelve a montar y ya lee lo corregido.
    navigate(`/mis-productos/${producto.id}`, { replace: true });
  };

  return (
    <div className="flex flex-col" style={{ backgroundColor: "var(--primary-white)" }}>
      {cabecera(volver, STR.compras.editarTitulo)}

      <div className="flex flex-col px-6 pt-5 pb-8" style={{ gap: "16px" }}>
        <p style={{ ...meta, fontSize: "14px", lineHeight: "20px", color: "var(--gray-60)", margin: 0, maxWidth: "42ch" }}>
          {STR.compras.editarAviso}
        </p>

        <Campo
          id="producto-nombre"
          etiqueta={STR.compras.detalleNombre}
          obligatorio
          error={error}
        >
          <input
            id="producto-nombre"
            ref={campoNombre}
            type="text"
            value={edicion.name}
            onChange={(e) => cambiar("name")(e.target.value)}
            style={estiloInput(Boolean(error))}
          />
        </Campo>

        <Campo id="producto-marca" etiqueta={STR.compras.detalleMarca}>
          <input
            id="producto-marca"
            type="text"
            value={edicion.brand}
            onChange={(e) => cambiar("brand")(e.target.value)}
            style={estiloInput()}
          />
        </Campo>

        <Campo id="producto-categoria" etiqueta={STR.compras.detalleCategoria}>
          <input
            id="producto-categoria"
            type="text"
            value={edicion.category}
            onChange={(e) => cambiar("category")(e.target.value)}
            style={estiloInput()}
          />
        </Campo>

        <Campo id="producto-modelo" etiqueta={STR.compras.detalleModelo}>
          <input
            id="producto-modelo"
            type="text"
            value={edicion.modelo}
            onChange={(e) => cambiar("modelo")(e.target.value)}
            style={estiloInput()}
          />
        </Campo>

        <Campo id="producto-serie" etiqueta={STR.compras.detalleSerie}>
          <input
            id="producto-serie"
            type="text"
            value={edicion.serialNumber}
            onChange={(e) => cambiar("serialNumber")(e.target.value)}
            style={estiloInput()}
          />
        </Campo>

        <div className="flex flex-col" style={{ gap: "8px", paddingTop: "4px" }}>
          <button
            type="button"
            onClick={guardar}
            className="border-none transition-transform active:scale-[0.99]"
            style={{
              ...meta,
              minHeight: "48px",
              borderRadius: "12px",
              backgroundColor: "var(--primary-yellow)",
              fontSize: "14px",
              fontWeight: "var(--font-weight-medium)",
              color: "var(--primary-black)",
              cursor: "pointer",
            }}
          >
            {STR.compras.editarGuardar}
          </button>
          <button
            type="button"
            onClick={volver}
            className="border transition-transform active:scale-[0.99]"
            style={{
              ...meta,
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
            {STR.compras.editarCancelar}
          </button>
        </div>
      </div>
    </div>
  );
}

function cabecera(onVolver: () => void, titulo: string) {
  return (
    <header
      className="flex items-center gap-3 px-6 pt-[20px] pb-4 bg-white sticky top-0 z-20"
      style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}
    >
      <button
        type="button"
        onClick={onVolver}
        aria-label={STR.compras.detalleVolver}
        className="w-11 h-11 rounded-[10px] flex items-center justify-center transition-opacity hover:opacity-80 border flex-shrink-0"
        style={{
          backgroundColor: "var(--primary-white)",
          borderColor: "var(--gray-20)",
          cursor: "pointer",
        }}
      >
        <ArrowLeft size={20} strokeWidth={2} color="var(--primary-black)" aria-hidden="true" />
      </button>
      <h1
        className="truncate flex-1"
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
        {titulo}
      </h1>
    </header>
  );
}
