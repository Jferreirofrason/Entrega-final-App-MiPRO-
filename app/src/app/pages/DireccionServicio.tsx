import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import { Check, MapPin, Plus } from "lucide-react";
import { STR } from "../i18n/strings";
import { buscarServicioCatalogo } from "../data/catalogo";
import {
  leerBorradorServicio,
  guardarBorradorServicio,
} from "../data/borradorServicio";
import { todasLasDirecciones } from "../data/direcciones";
import {
  validarContacto,
  validarDireccion,
} from "../logic/solicitudServicio";
import { EncabezadoFlujo } from "../components/agendar/EncabezadoFlujo";
import { Campo, estiloInput } from "../components/garantia/Campo";

// Etapa 2 del agendamiento: dirección y contacto.
//
// Direcciones guardadas en la pantalla inicial; "Agregar otra dirección"
// abre una pantalla separada (AgregarDireccion) con búsqueda en el mapa.
// Al guardar, esa pantalla vuelve acá con la nueva dirección ya elegida
// (via location.state). El contacto alternativo es opcional.
export function DireccionServicio() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const estadoNav = location.state as { desdeRevision?: boolean; direccionId?: string } | null;
  const desdeRevision = Boolean(estadoNav?.desdeRevision);
  const servicio = id ? buscarServicioCatalogo(id) : null;
  const inicial = id ? leerBorradorServicio(id) : null;

  const [direcciones] = useState(todasLasDirecciones());
  const [seleccionada, setSeleccionada] = useState<string | null>(
    estadoNav?.direccionId ?? inicial?.direccionId ?? null,
  );
  const [contactoNombre, setContactoNombre] = useState(inicial?.contacto?.nombre ?? "");
  const [contactoTelefono, setContactoTelefono] = useState(inicial?.contacto?.telefono ?? "");
  const [error, setError] = useState<string | null>(null);

  const meta = { fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif" } as const;

  if (!servicio || !inicial) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-6 py-20">
        <p style={{ ...meta, fontSize: "14px", color: "var(--gray-60)" }}>
          {STR.agendar.noEncontrado}
        </p>
      </div>
    );
  }

  const continuar = () => {
    const contacto =
      contactoNombre.trim() || contactoTelefono.trim()
        ? { nombre: contactoNombre.trim(), telefono: contactoTelefono.trim() }
        : undefined;
    const borrador = {
      ...inicial,
      direccionId: seleccionada ?? undefined,
      direccionNueva: undefined,
      contacto,
    };
    const errores = [...validarDireccion(borrador), ...validarContacto(contacto)];
    if (errores.length > 0) {
      setError(errores[0]);
      return;
    }
    guardarBorradorServicio(borrador);
    if (desdeRevision) {
      navigate(-1);
      return;
    }
    navigate(`/catalogo/${servicio.id}/fecha`);
  };

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: "var(--primary-white)" }}>
      <EncabezadoFlujo
        titulo={servicio.nombre}
        etapa={2}
        onVolver={() => {
          if (desdeRevision) {
            // La edición se descarta: la revisión conserva lo confirmado.
            navigate(-1);
            return;
          }
          // Volver conserva lo elegido hasta ahora.
          const contacto =
            contactoNombre.trim() || contactoTelefono.trim()
              ? { nombre: contactoNombre.trim(), telefono: contactoTelefono.trim() }
              : undefined;
          guardarBorradorServicio({
            ...inicial,
            direccionId: seleccionada ?? undefined,
            contacto,
          });
          navigate(-1);
        }}
      />

      <div className="flex-1 overflow-y-auto px-6 pt-6 pb-8">
        <h2 style={{ ...meta, fontSize: "16px", fontWeight: "var(--font-weight-medium)", color: "var(--primary-black)", margin: 0 }}>
          {STR.agendar.direccionTitulo}
        </h2>

        <>
          <div className="flex flex-col gap-3 mt-4" role="radiogroup" aria-label={STR.agendar.direccionTitulo}>
              {direcciones.map((d) => {
                const elegida = seleccionada === d.id;
                return (
                  <button
                    key={d.id}
                    role="radio"
                    aria-checked={elegida}
                    onClick={() => {
                      setSeleccionada(d.id);
                      setError(null);
                    }}
                    className="w-full text-left border-2 transition-colors active:scale-[0.99]"
                    style={{
                      backgroundColor: elegida ? "rgba(255, 238, 0, 0.08)" : "var(--card)",
                      borderColor: elegida ? "var(--primary-yellow)" : "var(--gray-8)",
                      borderRadius: "12px",
                      padding: "16px",
                      cursor: "pointer",
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <MapPin size={18} strokeWidth={2} color="var(--primary-black)" style={{ flexShrink: 0, marginTop: "2px" }} aria-hidden="true" />
                      <div className="flex-1 min-w-0">
                        <p style={{ ...meta, fontSize: "14px", fontWeight: "var(--font-weight-medium)", color: "var(--primary-black)", margin: 0 }}>
                          {d.etiqueta}
                        </p>
                        <p style={{ ...meta, fontSize: "12px", lineHeight: "18px", color: "var(--gray-60)", margin: "2px 0 0" }}>
                          {d.direccion}
                        </p>
                        {d.referencia && (
                          <p style={{ ...meta, fontSize: "12px", lineHeight: "18px", color: "var(--gray-60)", margin: "2px 0 0" }}>
                            {d.referencia}
                          </p>
                        )}
                      </div>
                      {elegida && (
                        <span
                          className="flex items-center justify-center flex-shrink-0"
                          style={{ width: "22px", height: "22px", borderRadius: "50%", backgroundColor: "var(--primary-yellow)" }}
                        >
                          <Check size={14} strokeWidth={3} color="var(--primary-black)" aria-hidden="true" />
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => navigate(`/catalogo/${servicio.id}/direccion/nueva`)}
              className="w-full border flex items-center justify-center gap-2 mt-3 transition-all active:scale-[0.99]"
              style={{
                height: "44px",
                backgroundColor: "var(--primary-white)",
                borderColor: "var(--gray-20)",
                borderRadius: "12px",
                cursor: "pointer",
              }}
            >
              <Plus size={18} strokeWidth={2} color="var(--primary-black)" aria-hidden="true" />
              <span style={{ ...meta, fontSize: "14px", fontWeight: "var(--font-weight-medium)", color: "var(--primary-black)" }}>
                {STR.agendar.agregarDireccion}
              </span>
            </button>

            {/* Contacto alternativo (opcional) */}
            <div className="mt-6">
              <p style={{ ...meta, fontSize: "14px", fontWeight: "var(--font-weight-medium)", color: "var(--primary-black)", margin: 0 }}>
                {STR.agendar.contactoTitulo}
              </p>
              <p style={{ ...meta, fontSize: "12px", lineHeight: "18px", color: "var(--gray-60)", margin: "2px 0 0" }}>
                {STR.agendar.contactoAyuda}
              </p>
              <div className="flex flex-col gap-4 mt-3">
                <Campo id="contacto-nombre" etiqueta={STR.agendar.contactoNombre}>
                  <input
                    id="contacto-nombre"
                    type="text"
                    value={contactoNombre}
                    onChange={(e) => {
                      setContactoNombre(e.target.value);
                      setError(null);
                    }}
                    style={estiloInput()}
                  />
                </Campo>
                <Campo id="contacto-telefono" etiqueta={STR.agendar.contactoTelefono}>
                  <input
                    id="contacto-telefono"
                    type="tel"
                    value={contactoTelefono}
                    onChange={(e) => {
                      setContactoTelefono(e.target.value);
                      setError(null);
                    }}
                    style={estiloInput()}
                  />
                </Campo>
              </div>
            </div>
          </>

        {error && (
          <p role="alert" style={{ ...meta, fontSize: "12px", color: "var(--error-red)", margin: "10px 0 0" }}>
            {error}
          </p>
        )}
      </div>

      <div className="px-6 py-4 bg-white flex-shrink-0" style={{ borderTop: "1px solid var(--gray-8)" }}>
        <button
          onClick={continuar}
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
          {STR.agendar.continuar}
        </button>
      </div>
    </div>
  );
}
