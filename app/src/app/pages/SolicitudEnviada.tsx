import { useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { ManoMiPRO } from "../components/ManoMiPRO";
import { STR } from "../i18n/strings";
import { CURRENT_USER, nombreParaSaludo } from "../data/user";
import { solicitudesDeLaSesion } from "../data/solicitudes";
import { etiquetaBloque } from "../logic/solicitudServicio";
import { formatearFecha } from "../logic/fechas";

// Confirmación de la solicitud, con el lenguaje de la marca: gradiente de
// autenticación, la mano de miPRO y "Gracias, {nombre}", el panel blanco
// con los datos de la reserva, el enlace "¿Qué sigue?" que abre los
// siguientes pasos, y las acciones para volver al inicio o ver el progreso.
export function SolicitudEnviada() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const procesando = useRef(false);

  // La solicitud recién creada se lee completa de la sesión; los parámetros
  // sueltos quedan como respaldo de enlaces viejos.
  const solicitudId = params.get("id");
  const solicitud = solicitudId
    ? solicitudesDeLaSesion().find((s) => s.id === solicitudId) ?? null
    : null;
  const servicio = solicitud?.nombreServicio ?? params.get("servicio") ?? "";
  const numeroReserva = solicitud?.numeroReserva ?? params.get("num") ?? "";
  const condiciones = solicitud?.condiciones ?? params.get("condiciones");
  const incluyeDesinstalacion =
    solicitud?.incluyeDesinstalacion ?? params.get("des") === "1";
  const [pasosAbiertos, setPasosAbiertos] = useState(false);

  const meta = { fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif" } as const;
  const etiquetaFila = {
    ...meta,
    fontSize: "11px",
    color: "var(--gray-40)",
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px",
  };
  const valorFila = {
    ...meta,
    fontSize: "14px",
    fontWeight: "var(--font-weight-medium)",
    color: "var(--primary-black)",
    marginTop: "2px",
  };

  const nombre = nombreParaSaludo(CURRENT_USER);
  const fechaSolicitud = new Intl.DateTimeFormat("es", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  const textoCondiciones = condiciones
    ? [
        condiciones === "inspeccion" ? STR.lugar.condInspeccion : STR.lugar.condEstandar,
        incluyeDesinstalacion ? STR.lugar.condDesinstalacion : null,
      ]
        .filter(Boolean)
        .join(" · ")
    : null;

  const fechaPreferida = formatearFecha(solicitud?.fechaPreferida);
  const bloque = etiquetaBloque(solicitud?.bloque);

  const volverInicio = () => {
    if (procesando.current) return;
    procesando.current = true;
    navigate("/", { replace: true });
  };

  const verProgreso = () => {
    if (procesando.current) return;
    procesando.current = true;
    navigate(solicitud ? `/servicios/${solicitud.id}` : "/historial?tipo=servicios", {
      replace: true,
    });
  };

  const fila = (etiqueta: string, valor: string) => (
    <div>
      <span style={etiquetaFila}>{etiqueta}</span>
      <p style={valorFila}>{valor}</p>
    </div>
  );

  return (
    <div className="h-full auth-gradient flex flex-col animate-in fade-in duration-500">
      {/* Cabecera de marca: la mano, el gracias y el estado */}
      <div className="flex flex-col items-center px-6 pt-10 pb-6 relative z-20 flex-shrink-0">
        <ManoMiPRO ancho={34} alto={52} />
        <h1
          style={{
            fontFamily: "'Bebas Neue', Arial, sans-serif",
            fontSize: "28px",
            fontWeight: "var(--font-weight-normal)",
            letterSpacing: "1px",
            textTransform: "uppercase",
            color: "var(--primary-white)",
            margin: "12px 0 0",
            textAlign: "center",
          }}
        >
          {nombre ? STR.solicitud.gracias(nombre) : STR.solicitud.graciasSinNombre}
        </h1>
        <span className="inline-flex items-center gap-1.5" style={{ marginTop: "8px" }}>
          <span
            aria-hidden="true"
            className="inline-block"
            style={{ width: "7px", height: "7px", borderRadius: "2px", backgroundColor: "var(--primary-yellow)" }}
          />
          <span
            style={{
              ...meta,
              fontSize: "12px",
              fontWeight: "var(--font-weight-medium)",
              color: "var(--primary-yellow)",
              textTransform: "uppercase",
              letterSpacing: "1px",
            }}
          >
            {STR.solicitud.estadoRecibida}
          </span>
        </span>
      </div>

      {/* Panel blanco con los datos de la reserva */}
      <div
        className="flex-1 flex flex-col relative z-10 overflow-hidden"
        style={{
          backgroundColor: "var(--primary-white)",
          borderTopLeftRadius: "24px",
          borderTopRightRadius: "24px",
        }}
      >
        <div className="flex-1 overflow-y-auto px-6 pt-6 pb-6">
          <div className="w-full flex flex-col gap-3 text-left">
            {servicio && fila(STR.solicitud.servicio, servicio)}
            {numeroReserva && fila(STR.solicitud.numeroReserva, numeroReserva)}
            {fila(STR.solicitud.fechaSolicitud, fechaSolicitud)}
            {textoCondiciones && fila(STR.solicitud.condiciones, textoCondiciones)}
            {solicitud?.direccionTexto && fila(STR.solicitud.direccion, solicitud.direccionTexto)}
            {fechaPreferida &&
              fila(
                STR.solicitud.fechaPreferida,
                bloque ? `${fechaPreferida} · ${bloque}` : fechaPreferida,
              )}
            {solicitud?.totalEstimado !== undefined &&
              fila(STR.solicitud.totalEstimado, `$${solicitud.totalEstimado}`)}
          </div>

          {/* Qué sigue */}
          <button
            onClick={() => setPasosAbiertos(true)}
            className="px-0"
            style={{
              ...meta,
              fontSize: "14px",
              fontWeight: "var(--font-weight-medium)",
              color: "var(--info-blue)",
              background: "none",
              border: "none",
              cursor: "pointer",
              minHeight: "44px",
            }}
          >
            {STR.solicitud.queSigueLink}
          </button>
        </div>

        {/* Acciones */}
        <div className="px-6 py-4 flex-shrink-0 flex flex-col gap-2">
          <button
            onClick={volverInicio}
            className="w-full transition-transform hover:scale-[1.01] active:scale-[0.99] border-none"
            style={{
              height: "48px",
              backgroundColor: "var(--primary-yellow)",
              borderRadius: "12px",
              ...meta,
              fontSize: "14px",
              fontWeight: "var(--font-weight-medium)",
              color: "var(--primary-black)",
              cursor: "pointer",
            }}
          >
            {STR.solicitud.volverInicio}
          </button>
          <button
            onClick={verProgreso}
            className="w-full border-none"
            style={{
              minHeight: "44px",
              background: "none",
              ...meta,
              fontSize: "13px",
              fontWeight: "var(--font-weight-medium)",
              color: "var(--primary-black)",
              cursor: "pointer",
            }}
          >
            {STR.solicitud.verProgreso}
          </button>
        </div>
      </div>

      {/* Siguientes pasos */}
      {pasosAbiertos && (
        <div
          className="absolute inset-0 z-50 flex items-end animate-in fade-in duration-300"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.72)" }}
          onClick={() => setPasosAbiertos(false)}
        >
          <div
            role="dialog"
            aria-label={STR.solicitud.pasosTitulo}
            className="w-full"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "var(--primary-white)",
              borderTopLeftRadius: "24px",
              borderTopRightRadius: "24px",
              borderBottom: "4px solid var(--primary-yellow)",
              padding: "24px",
            }}
          >
            <h2
              style={{
                fontFamily: "'Bebas Neue', Arial, sans-serif",
                fontSize: "20px",
                fontWeight: "var(--font-weight-normal)",
                letterSpacing: "1px",
                textTransform: "uppercase",
                color: "var(--primary-black)",
                margin: 0,
              }}
            >
              {STR.solicitud.pasosTitulo}
            </h2>
            <ol className="flex flex-col gap-4 mt-4" style={{ margin: "16px 0 0", padding: 0, listStyle: "none" }}>
              {[STR.solicitud.paso1, STR.solicitud.paso2, STR.solicitud.paso3, STR.solicitud.paso4].map(
                (paso, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span
                      className="flex items-center justify-center flex-shrink-0"
                      style={{
                        width: "28px",
                        height: "28px",
                        borderRadius: "50%",
                        backgroundColor: "var(--primary-yellow)",
                        ...meta,
                        fontSize: "13px",
                        fontWeight: "var(--font-weight-medium)",
                        color: "var(--primary-black)",
                      }}
                    >
                      {i + 1}
                    </span>
                    <span style={{ ...meta, fontSize: "14px", lineHeight: "20px", color: "var(--gray-80)", paddingTop: "4px" }}>
                      {paso}
                    </span>
                  </li>
                ),
              )}
            </ol>
            <button
              onClick={() => setPasosAbiertos(false)}
              className="w-full border transition-all active:scale-[0.99] mt-5"
              style={{
                height: "44px",
                backgroundColor: "var(--primary-white)",
                borderColor: "var(--gray-20)",
                borderRadius: "12px",
                ...meta,
                fontSize: "14px",
                fontWeight: "var(--font-weight-medium)",
                color: "var(--primary-black)",
                cursor: "pointer",
              }}
            >
              {STR.solicitud.pasosCerrar}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
