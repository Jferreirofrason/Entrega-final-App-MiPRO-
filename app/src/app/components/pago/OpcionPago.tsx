import { ReactNode } from "react";
import { STR } from "../../i18n/strings";

/**
 * La etiqueta de la tarjeta predeterminada.
 *
 * Fondo amarillo suave, el mismo `rgba(255, 238, 0, 0.2)` que ya usan los
 * chips de estado de la app, y texto negro en semibold. Compacta: se
 * distingue del banco y del vencimiento sin pelearle el peso al nombre de
 * la tarjeta, que sigue siendo lo primero que se lee.
 */
export function EtiquetaPredeterminada() {
  return (
    <span
      className="inline-block"
      style={{
        fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif",
        fontSize: "11px",
        lineHeight: "15px",
        fontWeight: "var(--font-weight-semibold)",
        color: "var(--primary-black)",
        backgroundColor: "rgba(255, 238, 0, 0.2)",
        borderRadius: "6px",
        padding: "2px 8px",
      }}
    >
      {STR.pago.predeterminada}
    </span>
  );
}

// Una tarjeta de método de pago.
//
// Composición, de izquierda a derecha: el radio, el logo del medio y los
// datos. El radio va primero porque es lo que se está eligiendo; el logo
// identifica, y el texto detalla.
//
// El radio y el logo se centran contra el bloque de texto completo, no
// contra su primera línea: con `items-center` el centrado lo calcula el
// navegador, así que sigue valiendo con dos o tres líneas sin medidas fijas
// ni corrimientos a mano.
//
// Jerarquía dentro de la tarjeta, tres niveles y nada más:
//   principal   "Visa •••• 4242"                  14px, medium, negro
//   secundario  el banco y el vencimiento         13px, gris 60
//   discreto    la etiqueta, o la aclaración      11-12px
//
// La selección se nota por el radio marcado y por un borde fino de énfasis.
// Nada de franjas de color ni de fondos: la tarjeta sigue blanca.
//
// ⚠️ Dos acciones distintas conviven acá y NO se pueden confundir:
//   - el radio elige con qué se paga ESTA vez;
//   - `accionSecundaria` ("Usar como predeterminada") cambia la preferencia
//     para los PRÓXIMOS pagos.
// Por eso la acción secundaria es un botón hermano del radio, afuera de él:
// tocarla no cambia la selección, y elegir otro medio para esta compra no
// cambia la preferencia.
export function OpcionPago({
  logo,
  principal,
  secundario,
  discreto,
  etiqueta,
  elegida,
  disponible = true,
  onElegir,
  accionSecundaria,
}: {
  /** La marca del medio: su logo cuando existe, su nombre en texto si no. */
  logo: ReactNode;
  principal: string;
  secundario?: string;
  /** Tercera línea, para la aclaración de CMF. */
  discreto?: string;
  /** Chip de la tercera línea, para la tarjeta predeterminada. */
  etiqueta?: ReactNode;
  elegida: boolean;
  disponible?: boolean;
  onElegir: () => void;
  /** Acción de preferencia, independiente de la selección. */
  accionSecundaria?: { texto: string; onAccion: () => void };
}) {
  const meta = { fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif" } as const;

  const cuerpo = (
    <>
      {disponible && (
        <span
          aria-hidden="true"
          className="flex shrink-0 items-center justify-center"
          style={{
            width: "20px",
            height: "20px",
            borderRadius: "50%",
            border: `1.5px solid ${elegida ? "var(--primary-black)" : "var(--gray-20)"}`,
            backgroundColor: "var(--primary-white)",
          }}
        >
          {elegida && (
            <span
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                backgroundColor: "var(--primary-black)",
              }}
            />
          )}
        </span>
      )}

      {/* Caja del logo, misma medida para todos los medios: la columna de
          marcas queda alineada aunque el contenido de cada una sea distinto. */}
      <span
        className="flex shrink-0 items-center justify-center overflow-hidden"
        style={{
          width: "40px",
          height: "28px",
          borderRadius: "4px",
          border: "1px solid var(--gray-8)",
          backgroundColor: "var(--primary-white)",
        }}
      >
        {logo}
      </span>

      <span className="min-w-0 flex-1 text-left">
        <span
          className="block"
          style={{
            ...meta,
            fontSize: "14px",
            lineHeight: "20px",
            fontWeight: "var(--font-weight-medium)",
            color: disponible ? "var(--primary-black)" : "var(--gray-60)",
          }}
        >
          {principal}
        </span>
        {secundario && (
          <span
            className="block"
            style={{ ...meta, fontSize: "13px", lineHeight: "18px", color: "var(--gray-60)" }}
          >
            {secundario}
          </span>
        )}
        {etiqueta && <span className="block" style={{ marginTop: "4px" }}>{etiqueta}</span>}
        {(discreto || !disponible) && (
          <span
            className="block"
            style={{
              ...meta,
              fontSize: "12px",
              lineHeight: "17px",
              color: "var(--gray-40)",
              marginTop: "1px",
            }}
          >
            {disponible ? discreto : STR.pago.noDisponible}
          </span>
        )}
      </span>
    </>
  );

  const caja = {
    padding: "14px",
    borderRadius: "12px",
    backgroundColor: "var(--primary-white)",
    border: elegida ? "1.5px solid var(--primary-black)" : "1px solid var(--gray-20)",
    // El borde pasa de 1 a 1.5: se compensa para que la tarjeta no se mueva
    // medio píxel al elegirla.
    paddingLeft: elegida ? "13.5px" : "14px",
    paddingRight: elegida ? "13.5px" : "14px",
  } as const;

  // Un medio no disponible no es un control: se dibuja como tarjeta apagada,
  // sin radio y sin estado de foco.
  if (!disponible) {
    return (
      <div
        className="flex items-center gap-3"
        style={{ ...caja, borderColor: "var(--gray-8)", paddingLeft: "14px", paddingRight: "14px" }}
      >
        {cuerpo}
      </div>
    );
  }

  return (
    <div style={caja}>
      <button
        type="button"
        role="radio"
        aria-checked={elegida}
        onClick={onElegir}
        className="flex w-full items-center gap-3 border-none bg-transparent p-0 transition-colors duration-150"
        style={{ minHeight: "36px", cursor: "pointer" }}
      >
        {cuerpo}
      </button>

      {accionSecundaria && (
        <button
          type="button"
          onClick={accionSecundaria.onAccion}
          className="flex w-full items-center border-none bg-transparent p-0"
          style={{
            minHeight: "44px",
            marginTop: "8px",
            borderTop: "1px solid var(--gray-8)",
            ...meta,
            fontSize: "13px",
            fontWeight: "var(--font-weight-medium)",
            color: "var(--info-blue)",
            cursor: "pointer",
          }}
        >
          {accionSecundaria.texto}
        </button>
      )}
    </div>
  );
}
