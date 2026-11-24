import { useNavigate, useParams } from "react-router";
import { STR } from "../i18n/strings";
import { buscarServicioCatalogo } from "../data/catalogo";
import { guardarDireccionDeSesion } from "../data/direcciones";
import { EncabezadoFlujo } from "../components/agendar/EncabezadoFlujo";
import { FormularioDireccion } from "../components/agendar/FormularioDireccion";

// Pantalla separada para dar de alta una dirección (spec: "Agregar nueva
// dirección" abre una pantalla propia). El formulario es el compartido con
// garantía (components/agendar/FormularioDireccion); acá solo se define el
// encabezado del flujo de agendamiento y a dónde vuelve al guardar: al
// selector de direcciones, con la nueva ya elegida.
export function AgregarDireccion() {
  const { id } = useParams();
  const navigate = useNavigate();
  const servicio = id ? buscarServicioCatalogo(id) : null;

  const meta = { fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif" } as const;

  if (!servicio) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-6 py-20">
        <p style={{ ...meta, fontSize: "14px", color: "var(--gray-60)" }}>
          {STR.agendar.noEncontrado}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: "var(--primary-white)" }}>
      <EncabezadoFlujo titulo={servicio.nombre} etapa={2} onVolver={() => navigate(-1)} />

      <FormularioDireccion
        titulo={STR.agendar.agregarDireccion}
        mensajeAyuda={STR.agendar.mapaAyuda}
        onGuardar={(direccion) => {
          const guardada = guardarDireccionDeSesion(direccion);
          navigate(`/catalogo/${servicio.id}/direccion`, {
            replace: true,
            state: { direccionId: guardada.id },
          });
        }}
      />
    </div>
  );
}
