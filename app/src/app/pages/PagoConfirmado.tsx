import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import {
  CalendarDays,
  Check,
  CreditCard,
  Hash,
  MapPin,
  Receipt,
  Wrench,
} from "lucide-react";
import { STR } from "../i18n/strings";
import { CURRENT_USER, nombreParaSaludo } from "../data/user";
import { exitoYaVisto, marcarExitoVisto, solicitudesDeLaSesion } from "../data/solicitudes";
import { etiquetaBloque } from "../logic/solicitudServicio";
import { formatearFecha } from "../logic/fechas";
import { AyudaSheet } from "../components/garantia/AyudaSheet";
import { TransicionExito } from "../components/pago/TransicionExito";

// Confirmación del pago de la reserva.
//
// ⚠️ El pago es SIMULADO (ver logic/pago.ts). La pantalla dice que el pago
// fue aprobado porque eso es lo que el prototipo simula, y aclara al pie
// que no se cobró nada. Lo que NO se afirma en ninguna parte es que se
// envió un comprobante por correo: está pendiente de validación con
// Gregorio y así figura en "¿Qué sigue tras el pago?".
//
// La pantalla abre con la transición de éxito: verde, check y el título.
// Corre SOLO si este comprobante no la mostró antes, así volver acá no la
// repite. Y corre solo con el pago aprobado: un rechazo o un error no pasan
// por acá.
//
// Composición: el monto es el protagonista y va en la misma columna que el
// título, sin encerrarlo en otra tarjeta. Debajo, "Tu reserva" con los
// datos en una sola columna, el valor abajo de su etiqueta, que es lo que
// deja respirar a la dirección y a los textos largos.
export function PagoConfirmado() {
  const navigate = useNavigate();
  const location = useLocation();
  const [queSigueAbierto, setQueSigueAbierto] = useState(false);

  const solicitudId = new URLSearchParams(location.search).get("id");
  const solicitud = solicitudId
    ? solicitudesDeLaSesion().find((s) => s.id === solicitudId) ?? null
    : null;

  const { pago } = solicitud ?? {};
  const aprobado = pago?.resultado === "aprobado";
  // Una sola vez por operación.
  const [mostrarExito, setMostrarExito] = useState(
    () => !!solicitudId && !!aprobado && !exitoYaVisto(solicitudId),
  );

  useEffect(() => {
    if (mostrarExito && solicitudId) marcarExitoVisto(solicitudId);
  }, [mostrarExito, solicitudId]);

  const meta = { fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif" } as const;

  if (!solicitud || !pago) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-6 py-20 gap-4">
        <p style={{ ...meta, fontSize: "14px", color: "var(--gray-60)", textAlign: "center" }}>
          {STR.agendar.noEncontrado}
        </p>
        <button
          onClick={() => navigate("/", { replace: true })}
          className="border-none"
          style={{
            height: "44px",
            padding: "0 20px",
            backgroundColor: "var(--primary-yellow)",
            borderRadius: "12px",
            ...meta,
            fontSize: "14px",
            fontWeight: "var(--font-weight-medium)",
            color: "var(--primary-black)",
            cursor: "pointer",
          }}
        >
          {STR.pago.volverInicio}
        </button>
      </div>
    );
  }

  const nombre = nombreParaSaludo(CURRENT_USER);
  // La fecha preferida es solo el día. Se le pone el mediodía antes de
  // formatearla: sin hora, `new Date` la lee en UTC y en Panamá (-05) o en
  // Buenos Aires (-03) se muestra el día anterior.
  const fechaPreferida = solicitud.fechaPreferida
    ? formatearFecha(`${solicitud.fechaPreferida}T12:00:00`)
    : null;
  const bloque = etiquetaBloque(solicitud.bloque);
  const fechaAgendada = fechaPreferida
    ? bloque
      ? `${fechaPreferida}, ${bloque.toLowerCase()}`
      : fechaPreferida
    : null;

  // Con el pago aprobado pero la reserva sin confirmar, no se afirma que la
  // cita quedó agendada.
  const reservaConfirmada = Boolean(solicitud.numeroReserva);
  const saludo = reservaConfirmada
    ? nombre
      ? STR.pago.exitoGracias(nombre)
      : STR.pago.exitoGraciasSinNombre
    : nombre
      ? STR.pago.exitoReservaEnCurso(nombre)
      : STR.pago.exitoReservaEnCursoSinNombre;

  // Una fila del detalle: la etiqueta arriba y el valor debajo, en una sola
  // columna. Sin dato no se dibuja: no se inventa ni queda un rótulo suelto.
  const dato = (Icono: typeof Wrench, etiqueta: string, valor?: string | null) =>
    valor ? (
      <div key={etiqueta} className="flex items-start" style={{ gap: "12px" }}>
        <Icono
          size={16}
          strokeWidth={2}
          color="var(--gray-40)"
          style={{ flexShrink: 0, marginTop: "2px" }}
          aria-hidden="true"
        />
        <div className="min-w-0 flex-1">
          <p style={{ ...meta, fontSize: "12px", lineHeight: "16px", color: "var(--gray-60)", margin: 0 }}>
            {etiqueta}
          </p>
          <p
            style={{
              ...meta,
              fontSize: "14px",
              lineHeight: "20px",
              color: "var(--primary-black)",
              margin: "2px 0 0",
            }}
          >
            {valor}
          </p>
        </div>
      </div>
    ) : null;

  if (mostrarExito) {
    return <TransicionExito onTerminar={() => setMostrarExito(false)} />;
  }

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: "var(--primary-white)" }}>
      <div className="flex-1 overflow-y-auto px-6 pt-8 pb-8 hogar-entrada">
        {/* El resultado y el monto, en la misma columna. */}
        <div className="flex flex-col items-center text-center">
          <span
            className="flex items-center justify-center"
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              backgroundColor: "rgba(88, 202, 138, 0.16)",
            }}
          >
            <Check size={22} strokeWidth={3} color="var(--success-green)" aria-hidden="true" />
          </span>

          <h1
            style={{
              ...meta,
              fontSize: "22px",
              lineHeight: "28px",
              fontWeight: "var(--font-weight-semibold)",
              color: "var(--primary-black)",
              margin: "14px 0 0",
            }}
          >
            {aprobado ? STR.pago.exitoTitulo : STR.pago.estadoSinDefinir}
          </h1>

          <p
            style={{ ...meta, fontSize: "14px", lineHeight: "20px", color: "var(--gray-80)", margin: "6px 0 0" }}
          >
            {saludo}
          </p>

          <p
            style={{
              ...meta,
              fontSize: "12px",
              lineHeight: "16px",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              color: "var(--gray-60)",
              margin: "26px 0 0",
            }}
          >
            {aprobado ? STR.pago.montoPagado : STR.pago.montoOperacion}
          </p>
          <p
            style={{
              ...meta,
              fontSize: "40px",
              lineHeight: "1.05",
              fontWeight: 700,
              color: "var(--primary-black)",
              margin: "4px 0 0",
            }}
          >
            {`$${pago.monto}`}
          </p>

          {/* El estado aprobado NO se repite acá: ya lo dice el título
              "¡Pago confirmado!". Dos marcas de éxito seguidas no agregan
              nada. El estado sigue estando para los casos que NO son
              aprobado, arriba, donde cambia el título. */}
        </div>

        {/* Tu reserva */}
        <div style={{ marginTop: "32px" }}>
          <h2
            style={{
              ...meta,
              fontSize: "13px",
              lineHeight: "18px",
              fontWeight: "var(--font-weight-medium)",
              color: "var(--gray-60)",
              margin: "0 0 12px",
            }}
          >
            {STR.pago.detalleTitulo}
          </h2>
          <div className="flex flex-col" style={{ gap: "14px" }}>
            {dato(Wrench, STR.pago.detalleServicio, solicitud.nombreServicio)}
            {dato(
              CreditCard,
              STR.pago.detalleMedio,
              // Con CMF, el medio solo no alcanza: va la tarjeta y sus cuotas.
              pago.detalleMedio ? `${pago.medio} · ${pago.detalleMedio}` : pago.medio,
            )}
            {dato(Receipt, STR.pago.detalleAutorizacion, pago.autorizacion)}
            {dato(CalendarDays, STR.pago.detalleFecha, fechaAgendada)}
            {dato(Hash, STR.pago.detalleReserva, solicitud.numeroReserva)}
            {dato(MapPin, STR.pago.detalleDireccion, solicitud.direccionTexto)}
          </div>
        </div>

        <button
          onClick={() => setQueSigueAbierto(true)}
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
            marginTop: "18px",
          }}
        >
          {STR.pago.queSigue}
        </button>

      </div>

      <div className="px-6 pt-3 pb-4 bg-white flex-shrink-0" style={{ borderTop: "1px solid var(--gray-8)" }}>
        <button
          onClick={() => navigate("/", { replace: true })}
          className="w-full transition-transform active:scale-[0.99] border-none"
          style={{
            height: "48px",
            backgroundColor: "var(--primary-yellow)",
            borderRadius: "12px",
            ...meta,
            fontSize: "16px",
            fontWeight: "var(--font-weight-medium)",
            color: "var(--primary-black)",
            cursor: "pointer",
          }}
        >
          {STR.pago.volverInicio}
        </button>
      </div>

      {/* Qué sigue: el sheet de ayuda de la app, que cierra con la X,
          tocando afuera y con su propio botón al pie. */}
      <AyudaSheet
        abierto={queSigueAbierto}
        onCerrar={() => setQueSigueAbierto(false)}
        titulo={STR.pago.queSigue}
      >
        <ol className="flex flex-col gap-3" style={{ margin: 0, padding: 0, listStyle: "none" }}>
          {[STR.pago.queSigue1, STR.pago.queSigue2, STR.pago.queSigue3].map((paso, i) => (
            <li key={i} className="flex items-start gap-3">
              <span
                className="flex items-center justify-center flex-shrink-0"
                style={{
                  width: "24px",
                  height: "24px",
                  borderRadius: "50%",
                  backgroundColor: "var(--primary-yellow)",
                  ...meta,
                  fontSize: "12px",
                  fontWeight: "var(--font-weight-medium)",
                  color: "var(--primary-black)",
                }}
              >
                {i + 1}
              </span>
              <span
                style={{ ...meta, fontSize: "13px", lineHeight: "19px", color: "var(--gray-80)", paddingTop: "2px" }}
              >
                {paso}
              </span>
            </li>
          ))}
        </ol>
      </AyudaSheet>
    </div>
  );
}
