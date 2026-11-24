import { useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";
import { STR } from "../i18n/strings";
import { guardarDireccionDeSesion } from "../data/direcciones";
import { FormularioDireccion } from "../components/agendar/FormularioDireccion";

// Alta de una dirección desde el flujo de garantía.
//
// Usa EL MISMO formulario que el agendamiento de un servicio
// (components/agendar/FormularioDireccion): mismos campos, mismo orden,
// misma validación y los mismos textos. Antes acá había una versión
// recortada a cuatro campos; una dirección es la misma cosa en los dos
// flujos y quien la carga no tiene por qué encontrarse con dos pantallas
// distintas. Lo único propio de esta pantalla es el encabezado del flujo de
// garantía y la vuelta a la revisión con la nueva dirección ya elegida. Si
// se vuelve sin guardar, el borrador de la solicitud no se toca.
export function GarantiaAgregarDireccion() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: "var(--primary-white)" }}>
      <header
        className="px-6 pt-[20px] pb-3 bg-white sticky top-0 z-20"
        style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            aria-label={STR.garantiaFlujo.volver}
            className="w-11 h-11 rounded-[10px] flex items-center justify-center transition-opacity hover:opacity-80 border flex-shrink-0"
            style={{ backgroundColor: "var(--primary-white)", borderColor: "var(--gray-20)", cursor: "pointer" }}
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
            {STR.garantiaFlujo.titulo}
          </h1>
        </div>
      </header>

      <FormularioDireccion
        titulo={STR.garantiaFlujo.p3AgregarDireccion}
        mensajeAyuda={STR.garantiaFlujo.p3MapaAyuda}
        onGuardar={(direccion) => {
          const guardada = guardarDireccionDeSesion(direccion);
          navigate("/garantia/revisar", {
            replace: true,
            state: { direccionId: guardada.id },
          });
        }}
      />
    </div>
  );
}
