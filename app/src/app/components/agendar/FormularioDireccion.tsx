import { useState } from "react";
import { STR } from "../../i18n/strings";
import { DireccionNueva, validarDireccionNueva } from "../../logic/solicitudServicio";
import { BuscadorDireccionMapa } from "./BuscadorDireccionMapa";
import { Campo, estiloInput } from "../garantia/Campo";

export const DIRECCION_VACIA: DireccionNueva = {
  alias: "",
  provincia: "",
  distrito: "",
  corregimiento: "",
  barrio: "",
  calle: "",
  casa: "",
  edificio: "",
  piso: "",
  numero: "",
  detalles: "",
};

// Alta de una dirección: el mapa simulado arriba y los campos debajo.
//
// Es UNA sola implementación a propósito. Antes había dos: la de
// agendamiento pedía once campos y la de garantía solo cuatro, con otro
// encabezado y otra validación, así que la misma tarea se hacía distinto
// según desde dónde se llegara. Dar de alta una dirección es lo mismo en
// los dos casos y ahora comparten formulario, orden de campos, validación
// y textos; lo único que cambia es el encabezado de cada flujo y a dónde
// se vuelve al guardar, que resuelve la pantalla que lo monta.
export function FormularioDireccion({
  titulo,
  mensajeAyuda,
  onGuardar,
  textoGuardar = STR.agendar.guardarDireccion,
  inicial,
}: {
  titulo: string;
  mensajeAyuda: string;
  onGuardar: (direccion: DireccionNueva) => void;
  textoGuardar?: string;
  /**
   * Valores con los que arranca el formulario, para editar una dirección ya
   * cargada. Sin esto, arranca vacío, que es como lo usan los dos flujos
   * que ya lo montaban.
   */
  inicial?: DireccionNueva;
}) {
  const [nueva, setNueva] = useState<DireccionNueva>(inicial ?? DIRECCION_VACIA);
  const [busqueda, setBusqueda] = useState("");
  const [ubicacion, setUbicacion] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const meta = { fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif" } as const;

  const campoNueva = (clave: keyof DireccionNueva, valor: string) => {
    setNueva((d) => ({ ...d, [clave]: valor }));
    setError(null);
  };

  const guardar = () => {
    const errores = validarDireccionNueva(nueva);
    if (errores.length > 0) {
      setError(errores[0]);
      return;
    }
    onGuardar(nueva);
  };

  const inputTexto = (
    clave: keyof DireccionNueva,
    etiqueta: string,
    placeholder?: string,
  ) => (
    <Campo id={`dir-${clave}`} etiqueta={etiqueta} obligatorio>
      <input
        id={`dir-${clave}`}
        type="text"
        value={nueva[clave] ?? ""}
        placeholder={placeholder}
        onChange={(e) => campoNueva(clave, e.target.value)}
        style={estiloInput()}
      />
    </Campo>
  );

  return (
    <>
      <div className="flex-1 overflow-y-auto px-6 pt-6 pb-8">
        <h2
          style={{
            ...meta,
            fontSize: "16px",
            fontWeight: "var(--font-weight-medium)",
            color: "var(--primary-black)",
            margin: 0,
          }}
        >
          {titulo}
        </h2>

        <div className="flex flex-col gap-4 mt-4">
          <BuscadorDireccionMapa
            busqueda={busqueda}
            onBusquedaChange={setBusqueda}
            ubicacion={ubicacion}
            mensajeAyuda={mensajeAyuda}
            onSeleccionar={(l) => {
              setNueva((d) => ({ ...d, ...l.datos }));
              setUbicacion(`${l.titulo}, ${l.detalle}`);
              setBusqueda("");
              setError(null);
            }}
          />

          {/* Los once son obligatorios: si falta uno, el técnico puede no
              llegar y el prototipo no tiene cómo pedirlo después. */}
          {inputTexto("alias", STR.agendar.alias, STR.agendar.aliasPlaceholder)}
          {inputTexto("provincia", STR.agendar.provincia)}
          {inputTexto("distrito", STR.agendar.distrito)}
          {inputTexto("corregimiento", STR.agendar.corregimiento)}
          {inputTexto("barrio", STR.agendar.barrio)}
          {inputTexto("calle", STR.agendar.calle)}
          {inputTexto("casa", STR.agendar.casa)}
          {inputTexto("edificio", STR.agendar.edificio)}
          {inputTexto("piso", STR.agendar.piso)}
          {inputTexto("numero", STR.agendar.numero)}
          {inputTexto("detalles", STR.agendar.detalles)}
        </div>

        {error && (
          <p
            role="alert"
            style={{ ...meta, fontSize: "12px", color: "var(--error-red)", margin: "10px 0 0" }}
          >
            {error}
          </p>
        )}
      </div>

      <div
        className="px-6 py-4 bg-white flex-shrink-0"
        style={{ borderTop: "1px solid var(--gray-8)" }}
      >
        <button
          onClick={guardar}
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
          {textoGuardar}
        </button>
      </div>
    </>
  );
}
