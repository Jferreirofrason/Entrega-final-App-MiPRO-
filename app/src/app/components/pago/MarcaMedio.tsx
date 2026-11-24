import { CreditCard, Gift } from "lucide-react";
import cmfLogoUrl from "../../../imports/cmf-logo.png";
import mastercardSimboloUrl from "../../../imports/mastercard-simbolo.png";
import visaLogoUrl from "../../../imports/visa-logo.png";
import visaLogoBlancoUrl from "../../../imports/visa-logo-blanco.png";
import yappySimboloUrl from "../../../imports/yappy-simbolo.png";
import type { MedioPago } from "../../logic/pago";
import { esTarjeta } from "../../logic/pago";

// La marca que va en la caja de logo de cada método.
//
// Lo que hay, y lo que falta:
//
//   Visa          su logo oficial, el logotipo. Visa no tiene símbolo
//                 aparte, así que va la palabra: es un logotipo ancho y
//                 queda más bajo que los demás, como se ve en cualquier
//                 checkout. Hay dos versiones: la azul y la blanca, que es
//                 la que va sobre una cara oscura (`sobreOscuro`), sin
//                 recuadro claro detrás.
//   Mastercard    su logo oficial, el símbolo de los dos círculos.
//   Yappy         su logo oficial. Va el SÍMBOLO (los dos globos), no el
//                 lockup completo: a 40×28 la palabra "yappy" queda de
//                 cuatro píxeles de alto y no se lee, y el nombre ya es el
//                 texto principal de la fila. El lockup entero quedó en
//                 imports/yappy-logo.png para donde haga falta.
//   Crédito CMF   el logo de CMF, que es quien da la línea de crédito. Es
//                 el mismo archivo que usaba el Figma original. El texto de
//                 la fila aclara que el financiamiento es directo de Cochez.
//   Regalo        un ícono genérico de regalo. NO lleva marca: la tarjeta
//                 de regalo es de MiPRO y no de un tercero, así que no hay
//                 logo que poner.
//
// ⚠️ Una marca nueva necesita su archivo autorizado. No se dibuja ni se
// aproxima: poner un logo parecido es peor que no ponerlo. Sin archivo, la
// fila cae en el glifo genérico de tarjeta.
//
// Los logos se guardan a 256 px de ancho y se bajan por CSS al ancho que
// pida cada lugar: así se ven nítidos en pantallas de mayor densidad.
export function MarcaMedio({
  medio,
  ancho = 32,
  sobreOscuro = false,
}: {
  medio: MedioPago;
  /** Ancho del logo en píxeles. El alto sale de su proporción. */
  ancho?: number;
  /** true = la versión clara del logo, para fondos oscuros. */
  sobreOscuro?: boolean;
}) {
  if (esTarjeta(medio)) {
    const logos: Record<string, string> = {
      Visa: sobreOscuro ? visaLogoBlancoUrl : visaLogoUrl,
      Mastercard: mastercardSimboloUrl,
    };
    const logo = logos[medio.marca];
    return logo ? <Logo src={logo} ancho={ancho} /> : <TarjetaSinMarca />;
  }

  if (medio.tipo === "credito-cmf") {
    return <Logo src={cmfLogoUrl} ancho={ancho} />;
  }

  if (medio.tipo === "tarjeta-regalo") {
    return (
      <Gift
        size={Math.round(ancho * 0.6)}
        strokeWidth={1.8}
        color="var(--primary-black)"
        aria-hidden="true"
      />
    );
  }

  return <Logo src={yappySimboloUrl} ancho={ancho} />;
}

// La tarjeta de la que no tenemos logo.
function TarjetaSinMarca() {
  return (
    <CreditCard size={18} strokeWidth={2} color="var(--gray-80)" aria-hidden="true" />
  );
}

// Mismo ancho para todas las marcas: la columna se lee como un sistema y no
// como tres logos de tamaños distintos. El alto lo define cada logo.
function Logo({ src, ancho }: { src: string; ancho: number }) {
  return (
    <img
      src={src}
      alt=""
      aria-hidden="true"
      style={{ width: `${ancho}px`, height: "auto", display: "block" }}
    />
  );
}
