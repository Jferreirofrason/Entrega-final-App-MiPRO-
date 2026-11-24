import { useId } from "react";
import svgPaths from "../../imports/svg-0uyjwt8dfn";

// La mano de miPRO.
//
// REGLA DE MARCA: la palma NUNCA va oscura. El isotipo vive siempre sobre
// el gradiente oscuro de la app, así que la palma va en blanco y los rayos
// en amarillo; pintada de negro desaparece contra el fondo y se lee como
// una mancha. Pasó exactamente eso en la confirmación de una solicitud de
// servicio, que era la única de las cuatro pantallas que la dibujaba con
// `var(--primary-black)`.
//
// Por eso el color no es un parámetro: es una sola implementación, la usan
// las cuatro pantallas y no hay forma de que una se separe de las otras.
// Si alguna vez hiciera falta la versión sobre fondo claro, se agrega acá
// con su propio nombre y su propia regla, no cambiando este fill.
export function ManoMiPRO({
  ancho = 40,
  alto = 60,
  className,
}: {
  ancho?: number;
  alto?: number;
  className?: string;
}) {
  // Cada instancia necesita su propio clipPath: con un id repetido, dos
  // manos en la misma pantalla comparten recorte y una se ve cortada.
  const clip = `mano-mipro-${useId()}`;

  return (
    <div aria-hidden="true" className={className} style={{ width: `${ancho}px`, height: `${alto}px` }}>
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24.0707 36.6186">
        <g clipPath={`url(#${clip})`}>
          {/* La palma: siempre clara */}
          <path d={svgPaths.p1a9ce580} fill="var(--primary-white)" />
          {/* Los rayos: siempre amarillo de marca */}
          <path d={svgPaths.p11b6c000} fill="var(--primary-yellow)" />
          <path d={svgPaths.p1c19c880} fill="var(--primary-yellow)" />
          <path d={svgPaths.p1f4fce00} fill="var(--primary-yellow)" />
        </g>
        <defs>
          <clipPath id={clip}>
            <rect fill="white" height="36.6186" width="24.0707" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}
