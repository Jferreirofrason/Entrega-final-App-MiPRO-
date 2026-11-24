import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { ArrowLeft, Check, Info, Plus } from "lucide-react";
import { STR } from "../i18n/strings";
import { CURRENT_USER } from "../data/user";
import { todasLasDirecciones } from "../data/direcciones";
import { leerBorrador, guardarBorrador } from "../data/borradorGarantia";
import { validarPaso3 } from "../logic/solicitudGarantia";
import { ProgresoPasos } from "../components/garantia/ProgresoPasos";
import { Campo, estiloInput } from "../components/garantia/Campo";

// Paso 3: contacto conocido (sin volver a pedirlo) y dónde está el
// producto. "Agregar otra dirección" abre una pantalla separada
// (GarantiaAgregarDireccion) con búsqueda en el mapa, igual que en el
// agendamiento de un servicio; al guardar, esa pantalla vuelve acá con la
// nueva dirección ya elegida (via location.state). Este paso ya no envía
// la solicitud: "Revisar solicitud" lleva a la revisión final (paso 4),
// que es la única pantalla desde donde se envía.
export function GarantiaRevisar() {
  const navigate = useNavigate();
  const location = useLocation();
  const estadoNav = location.state as { desdeRevision?: boolean; direccionId?: string } | null;
  const desdeRevision = Boolean(estadoNav?.desdeRevision);
  const borrador = leerBorrador();

  const nombreInicial =
    borrador.contacto?.nombre ??
    [CURRENT_USER.firstName, CURRENT_USER.lastName].filter(Boolean).join(" ");
  const telefonoInicial = borrador.contacto?.telefono ?? CURRENT_USER.telefono ?? "";

  const [nombre, setNombre] = useState(nombreInicial);
  const [telefono, setTelefono] = useState(telefonoInicial);
  const [editandoContacto, setEditandoContacto] = useState(false);
  const [altNombre, setAltNombre] = useState(borrador.contactoAlternativo?.nombre ?? "");
  const [altTelefono, setAltTelefono] = useState(borrador.contactoAlternativo?.telefono ?? "");
  const [direcciones] = useState(todasLasDirecciones());
  const [direccionId, setDireccionId] = useState<string | null>(
    estadoNav?.direccionId ?? borrador.direccion?.id ?? null,
  );
  const [error, setError] = useState<string | null>(null);

  const meta = { fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif" } as const;

  const cardBase = {
    backgroundColor: "var(--card)",
    borderRadius: "12px",
    padding: "16px",
  } as const;

  const seccionTitulo = (texto: string) => (
    <p style={{ ...meta, fontSize: "11px", color: "var(--gray-60)", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 8px" }}>
      {texto}
    </p>
  );

  const continuar = () => {
    const contacto = { nombre: nombre.trim(), telefono: telefono.trim() };
    const contactoAlternativo =
      altNombre.trim() || altTelefono.trim()
        ? { nombre: altNombre.trim(), telefono: altTelefono.trim() }
        : undefined;
    const direccion = direcciones.find((d) => d.id === direccionId) ?? undefined;
    const completo = { ...borrador, contacto, contactoAlternativo, direccion };

    const errores = validarPaso3(completo);
    if (errores.length > 0) {
      setError(errores[0]);
      return;
    }
    guardarBorrador({ contacto, contactoAlternativo, direccion });
    setError(null);
    if (desdeRevision) {
      navigate(-1);
      return;
    }
    navigate("/garantia/confirmar");
  };

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: "var(--primary-white)" }}>
      <header className="px-6 pt-[20px] pb-2 bg-white sticky top-0 z-20" style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
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
        <ProgresoPasos paso={3} />
      </header>

      <div className="flex-1 overflow-y-auto px-6 pt-6 pb-8">
        {/* Contacto */}
        {seccionTitulo(STR.garantiaFlujo.p3Contacto)}
        <div className="border" style={{ ...cardBase, borderColor: "var(--gray-8)" }}>
          {!editandoContacto ? (
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p style={{ ...meta, fontSize: "14px", fontWeight: "var(--font-weight-medium)", color: "var(--primary-black)", margin: 0 }}>
                  {nombre}
                </p>
                <p style={{ ...meta, fontSize: "13px", color: "var(--gray-80)", margin: "2px 0 0" }}>
                  {telefono}
                </p>
              </div>
              <button
                onClick={() => setEditandoContacto(true)}
                style={{ ...meta, fontSize: "13px", fontWeight: "var(--font-weight-medium)", color: "var(--info-blue)", background: "none", border: "none", cursor: "pointer", minHeight: "44px" }}
              >
                {STR.garantiaFlujo.p3Editar}
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <Campo id="contacto-nombre" etiqueta={STR.garantiaFlujo.p3Nombre} obligatorio>
                <input id="contacto-nombre" type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} style={estiloInput()} />
              </Campo>
              <Campo id="contacto-telefono" etiqueta={STR.garantiaFlujo.p3Telefono} obligatorio>
                <input id="contacto-telefono" type="tel" inputMode="tel" value={telefono} onChange={(e) => setTelefono(e.target.value)} style={estiloInput()} />
              </Campo>
              <button
                onClick={() => setEditandoContacto(false)}
                className="self-start"
                style={{ ...meta, fontSize: "13px", fontWeight: "var(--font-weight-medium)", color: "var(--info-blue)", background: "none", border: "none", cursor: "pointer", minHeight: "44px" }}
              >
                {STR.garantiaFlujo.p2Listo}
              </button>
            </div>
          )}
        </div>

        {/* Contacto alternativo: por si el titular no puede atender */}
        <div className="mt-6">
          {seccionTitulo(STR.garantiaFlujo.p3Alternativo)}
          <p style={{ ...meta, fontSize: "12px", lineHeight: "18px", color: "var(--gray-60)", margin: "-4px 0 10px" }}>
            {STR.garantiaFlujo.p3AlternativoAyuda}
          </p>
          <div className="flex flex-col gap-4">
            <Campo id="alt-nombre" etiqueta={STR.garantiaFlujo.p3Nombre}>
              <input
                id="alt-nombre"
                type="text"
                value={altNombre}
                onChange={(e) => {
                  setAltNombre(e.target.value);
                  setError(null);
                }}
                style={estiloInput()}
              />
            </Campo>
            <Campo id="alt-telefono" etiqueta={STR.garantiaFlujo.p3Telefono}>
              <input
                id="alt-telefono"
                type="tel"
                inputMode="tel"
                value={altTelefono}
                onChange={(e) => {
                  setAltTelefono(e.target.value);
                  setError(null);
                }}
                style={estiloInput()}
              />
            </Campo>
          </div>
        </div>

        {/* Ubicación */}
        <div className="mt-6">
          {seccionTitulo(STR.garantiaFlujo.p3Ubicacion)}
          <div className="flex flex-col gap-3" role="radiogroup" aria-label={STR.garantiaFlujo.p3Ubicacion}>
            {direcciones.map((d) => {
              const elegida = direccionId === d.id;
              return (
                <button
                  key={d.id}
                  role="radio"
                  aria-checked={elegida}
                  onClick={() => {
                    setDireccionId(d.id);
                    setError(null);
                  }}
                  className="border text-left transition-all active:scale-[0.99] w-full"
                  style={{
                    ...cardBase,
                    borderColor: elegida ? "var(--primary-yellow)" : "var(--gray-8)",
                    borderWidth: elegida ? "2px" : "1px",
                    cursor: "pointer",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p style={{ ...meta, fontSize: "14px", fontWeight: "var(--font-weight-medium)", color: "var(--primary-black)", margin: 0 }}>
                        {d.etiqueta}
                      </p>
                      <p style={{ ...meta, fontSize: "13px", lineHeight: "19px", color: "var(--gray-80)", margin: "2px 0 0" }}>
                        {d.direccion}
                      </p>
                    </div>
                    {elegida && (
                      <span className="flex items-center justify-center flex-shrink-0" style={{ width: "22px", height: "22px", borderRadius: "50%", backgroundColor: "var(--primary-yellow)" }}>
                        <Check size={14} strokeWidth={3} color="var(--primary-black)" aria-hidden="true" />
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => navigate("/garantia/direccion/nueva")}
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
              {STR.garantiaFlujo.p3AgregarDireccion}
            </span>
          </button>

          <p className="flex items-start gap-1.5" style={{ ...meta, fontSize: "12px", lineHeight: "18px", color: "var(--gray-60)", margin: "10px 0 0" }}>
            <Info size={14} strokeWidth={2} style={{ flexShrink: 0, marginTop: "2px" }} aria-hidden="true" />
            {STR.garantiaFlujo.p3Privacidad}
          </p>
        </div>

        {error && (
          <p role="alert" style={{ ...meta, fontSize: "12px", lineHeight: "18px", color: "var(--error-red)", margin: "16px 0 0" }}>
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
          {STR.garantiaFlujo.p3RevisarSolicitud}
        </button>
      </div>
    </div>
  );
}
