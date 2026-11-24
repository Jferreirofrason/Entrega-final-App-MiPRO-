import { MoreVertical } from "lucide-react";
import { STR } from "../../i18n/strings";
import { enmascararTarjeta, type MedioPagoTarjeta } from "../../logic/pago";
import { MarcaMedio } from "./MarcaMedio";

/**
 * La cara de la tarjeta según su marca.
 *
 * No va el negro y amarillo de la casa: una tarjeta guardada es de su
 * banco, no de MiPRO, y pintarlas todas iguales las volvía a leer como
 * cajas de la app.
 *
 * Cada cara es UN color con una faceta apenas más oscura en diagonal, que
 * es lo que hace que se lea como una tarjeta sin degradés ni brillos. Visa
 * en su azul con el texto en blanco; Mastercard en gris muy claro con el
 * texto en negro.
 *
 * El logo va directo sobre la cara, sin recuadro: para el azul de Visa se
 * usa la versión blanca del logo, y el de Mastercard son dos círculos de
 * color que sobre gris claro se leen solos.
 *
 * La selección se dice con el borde de la cara y la etiqueta de
 * predeterminada con su contraste: blanco translúcido sobre el azul, gris
 * suave sobre el gris claro. El amarillo de la casa no entra en la
 * tarjeta; queda para el botón de pagar.
 */
const PALETAS = {
  Visa: {
    fondo: "linear-gradient(107deg, #1434CB 0%, #1434CB 56%, #0E27A4 56%, #0E27A4 100%)",
    texto: "var(--primary-white)",
    tenue: "rgba(255, 255, 255, 0.78)",
    borde: "transparent",
    menu: "rgba(255, 255, 255, 0.78)",
    seleccion: "#FFFFFF",
    // La etiqueta, discreta sobre la cara oscura.
    etiquetaFondo: "rgba(255, 255, 255, 0.18)",
    etiquetaTexto: "#FFFFFF",
    logoClaro: true,
    anchoLogo: 50,
  },
  Mastercard: {
    fondo: "linear-gradient(107deg, #E8E8EA 0%, #E8E8EA 56%, #DADADE 56%, #DADADE 100%)",
    texto: "var(--primary-black)",
    tenue: "var(--gray-60)",
    borde: "transparent",
    menu: "var(--gray-60)",
    seleccion: "#141414",
    // Sobre la cara clara, un gris suave con el texto oscuro.
    etiquetaFondo: "rgba(0, 0, 0, 0.07)",
    etiquetaTexto: "var(--primary-black)",
    logoClaro: false,
    anchoLogo: 42,
  },
} as const;

// Una tarjeta guardada, dibujada como la tarjeta que es.
//
// La misma distribución para TODAS, con cada dato en su lugar:
//
//   arriba izquierda   el banco emisor
//   arriba derecha     la etiqueta de predeterminada y el menú
//   abajo izquierda    el número enmascarado, el titular y el vencimiento
//   abajo derecha      la marca y, debajo, crédito o débito
//
// ⚠️ Los cuatro datos son INDEPENDIENTES y ninguno reemplaza a otro:
//   - sin banco se nombra la tarjeta por su marca ("Tarjeta Visa"), nunca
//     con el titular ni con un emisor inventado;
//   - crédito o débito sale del dato de la tarjeta, no de la marca: Visa y
//     Mastercard emiten las dos, así que sin el dato no se dice nada.
//
// El número nunca está completo: solo los cuatro últimos.
//
// Dos estados DISTINTOS conviven y no se confunden:
//   elegida para este pago   el borde de la cara, y el radio lo canta para
//                            quien usa lector de pantalla
//   predeterminada           su etiqueta arriba a la derecha, al lado del
//                            menú, donde antes iba el tilde de la elegida
//
// El menú es un botón HERMANO del radio, no está adentro: abrirlo no elige
// la tarjeta ni dispara el pago.
export function TarjetaBancaria({
  tarjeta,
  elegida,
  onElegir,
  onAbrirMenu,
}: {
  tarjeta: MedioPagoTarjeta;
  elegida: boolean;
  onElegir: () => void;
  onAbrirMenu: () => void;
}) {
  const meta = { fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif" } as const;
  const nombre = `${tarjeta.marca} ${enmascararTarjeta(tarjeta.ultimos)}`;
  const emisor = tarjeta.banco ?? STR.pago.tarjetaDeMarca(tarjeta.marca);
  const producto =
    tarjeta.producto === "credito"
      ? STR.pago.tarjetaCredito
      : tarjeta.producto === "debito"
        ? STR.pago.tarjetaDebito
        : null;
  const paleta = PALETAS[tarjeta.marca] ?? PALETAS.Mastercard;

  return (
    <div className="relative flex" style={{ width: "100%" }}>
      <button
        type="button"
        role="radio"
        aria-checked={elegida}
        aria-label={nombre}
        onClick={onElegir}
        className="flex w-full flex-col justify-between text-left"
        style={{
          // La proporción es el piso; si el contenido pide más alto, crece,
          // y la tira iguala a las demás.
          aspectRatio: "1.95",
          padding: "14px",
          borderRadius: "14px",
          background: paleta.fondo,
          border: "1.5px solid",
          borderColor: elegida ? paleta.seleccion : paleta.borde,
          cursor: "pointer",
        }}
      >
        {/* El banco a la izquierda y la etiqueta arriba a la derecha, en el
            lugar fijo que antes ocupaba el tilde, con el hueco del menú
            siempre reservado. Si el nombre del banco es largo se acomoda en
            dos líneas: no se achica la tipografía ni se comprime la
            etiqueta. */}
        <span
          className="flex items-start justify-between"
          style={{
            gap: "12px",
            paddingRight: tarjeta.predeterminada ? "0" : "34px",
          }}
        >
          <span
            className="min-w-0 line-clamp-2"
            style={{
              ...meta,
              fontSize: "13px",
              lineHeight: "17px",
              fontWeight: "var(--font-weight-semibold)",
              letterSpacing: "0.3px",
              textTransform: "uppercase",
              color: paleta.texto,
            }}
          >
            {emisor}
          </span>
          {tarjeta.predeterminada && (
            <span
              className="shrink-0"
              style={{
                ...meta,
                // Termina donde terminaba el tilde, para dejarle al menú su
                // espacio propio.
                marginRight: "26px",
                fontSize: "11px",
                lineHeight: "15px",
                fontWeight: "var(--font-weight-medium)",
                textTransform: "none",
                color: paleta.etiquetaTexto,
                backgroundColor: paleta.etiquetaFondo,
                borderRadius: "6px",
                padding: "4px 8px",
              }}
            >
              {STR.pago.predeterminada}
            </span>
          )}
        </span>

        {/* Abajo: a la izquierda el número, el titular y el vencimiento; a
            la derecha la marca y su tipo. */}
        <span className="flex items-end justify-between" style={{ gap: "12px" }}>
          <span className="min-w-0 flex-1">
            <span
              className="block"
              style={{
                ...meta,
                fontSize: "19px",
                lineHeight: "24px",
                fontWeight: "var(--font-weight-medium)",
                letterSpacing: "1.5px",
                color: paleta.texto,
              }}
            >
              {enmascararTarjeta(tarjeta.ultimos)}
            </span>
            {tarjeta.titular && (
              <span
                className="block line-clamp-2"
                style={{
                  ...meta,
                  fontSize: "12px",
                  lineHeight: "16px",
                  letterSpacing: "0.3px",
                  textTransform: "uppercase",
                  color: paleta.texto,
                  margin: "4px 0 0",
                }}
              >
                {tarjeta.titular}
              </span>
            )}
            <span
              className="block"
              style={{
                ...meta,
                fontSize: "11px",
                lineHeight: "15px",
                color: paleta.tenue,
                margin: "6px 0 0",
              }}
            >
              {STR.pago.vence(tarjeta.vence)}
            </span>
          </span>

          <span className="flex shrink-0 flex-col items-end" style={{ gap: "2px" }}>
            <span className="flex items-center justify-end" style={{ height: "30px" }}>
              <MarcaMedio
                medio={tarjeta}
                ancho={paleta.anchoLogo}
                sobreOscuro={paleta.logoClaro}
              />
            </span>
            {producto && (
              <span
                style={{
                  ...meta,
                  fontSize: "11px",
                  lineHeight: "15px",
                  color: paleta.tenue,
                }}
              >
                {producto}
              </span>
            )}
          </span>
        </span>
      </button>

      <button
        type="button"
        onClick={onAbrirMenu}
        aria-label={STR.pago.accionesDeLaTarjeta(nombre)}
        className="absolute flex items-center justify-center border-none bg-transparent"
        style={{ top: "6px", right: "6px", width: "38px", height: "38px", cursor: "pointer" }}
      >
        <MoreVertical size={18} strokeWidth={2} color={paleta.menu} aria-hidden="true" />
      </button>
    </div>
  );
}
