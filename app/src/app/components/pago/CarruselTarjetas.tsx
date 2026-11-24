import { useEffect, useRef, useState } from "react";
import { STR } from "../../i18n/strings";
import type { MedioPagoTarjeta } from "../../logic/pago";
import { TarjetaBancaria } from "./TarjetaBancaria";

/** Margen lateral de la pantalla, el mismo que el resto del contenido. */
const MARGEN = 16;

// Las tarjetas guardadas, en una tira horizontal que se desliza.
//
// Mismo patrón de carrusel que el Home (`SeccionServicios`): la tira se
// sale de los márgenes con `-mx-4 px-4`, scroll-snap alinea cada tarjeta al
// margen izquierdo y el asomo de la siguiente es intencional, es lo que
// cuenta que hay más.
//
// Tres cosas que importan y están resueltas acá:
//   - al entrar, la tarjeta elegida se muestra COMPLETA (si no hay
//     elegida, la primera);
//   - `scroll-snap-stop: always` evita que un swiperazo deje una tarjeta a
//     mitad de camino;
//   - con UNA sola tarjeta no hay asomo, ni snap, ni puntos: ocupa el ancho
//     completo y no insinúa que haya algo más.
//
// Deslizar NO cambia la selección: la selección se toca. Por eso cada
// tarjeta es su propio radio y el scroll no dispara nada.
export function CarruselTarjetas({
  tarjetas,
  elegidaId,
  onElegir,
  onAbrirMenu,
}: {
  tarjetas: MedioPagoTarjeta[];
  elegidaId?: string | null;
  onElegir: (tarjeta: MedioPagoTarjeta) => void;
  onAbrirMenu: (tarjeta: MedioPagoTarjeta) => void;
}) {
  const varias = tarjetas.length > 1;
  const tira = useRef<HTMLDivElement>(null);
  const [indice, setIndice] = useState(0);

  // Al entrar, la elegida tiene que estar entera a la vista. Se calcula con
  // la posición real de la tarjeta, no con el ancho teórico: así vale en
  // cualquier ancho de pantalla.
  useEffect(() => {
    const cont = tira.current;
    if (!cont) return;
    const i = Math.max(
      0,
      tarjetas.findIndex((t) => t.id === elegidaId),
    );
    const item = cont.children[i] as HTMLElement | undefined;
    if (!item) return;
    const corrimiento =
      item.getBoundingClientRect().left - cont.getBoundingClientRect().left - MARGEN;
    cont.scrollLeft += corrimiento;
    setIndice(i);
    // Solo al montar: después, la posición es de quien desliza.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Qué tarjeta está acomodada, para los puntos.
  const alDeslizar = () => {
    const cont = tira.current;
    if (!cont) return;
    const borde = cont.getBoundingClientRect().left + MARGEN;
    let cerca = 0;
    let menor = Infinity;
    Array.from(cont.children).forEach((hijo, i) => {
      if (i >= tarjetas.length) return;
      const d = Math.abs((hijo as HTMLElement).getBoundingClientRect().left - borde);
      if (d < menor) {
        menor = d;
        cerca = i;
      }
    });
    setIndice(cerca);
  };

  return (
    <div>
      <div
        ref={tira}
        onScroll={alDeslizar}
        className="flex gap-3 overflow-x-auto -mx-4 px-4"
        style={{
          scrollbarWidth: "none",
          scrollSnapType: varias ? "x mandatory" : undefined,
          scrollPaddingLeft: `${MARGEN}px`,
          // El borde de 2px de la elegida necesita aire para no recortarse.
          padding: `2px ${MARGEN}px`,
        }}
        aria-label={STR.pago.tusTarjetas}
      >
        {tarjetas.map((tarjeta) => (
          <div
            key={tarjeta.id}
            // `flex` para que, si una tarjeta crece (un nombre de banco
            // largo empuja la etiqueta a otra línea), TODAS tomen ese alto
            // y la tira no quede despareja.
            className="flex flex-shrink-0"
            style={{
              // 84% del ancho disponible: entra una entera y asoma la
              // siguiente. Con una sola, ancho completo.
              width: varias ? "84%" : "100%",
              scrollSnapAlign: varias ? "start" : undefined,
              // Un swipe fuerte no puede saltear una tarjeta ni quedar a
              // mitad de camino.
              scrollSnapStop: varias ? "always" : undefined,
            }}
          >
            <TarjetaBancaria
              tarjeta={tarjeta}
              elegida={elegidaId === tarjeta.id}
              onElegir={() => onElegir(tarjeta)}
              onAbrirMenu={() => onAbrirMenu(tarjeta)}
            />
          </div>
        ))}

        {/* Aire al final para que la ÚLTIMA tarjeta también pueda acomodarse
            contra el margen izquierdo: sin esto el scroll se termina antes y
            queda a mitad de camino. Va como separador y no como padding del
            contenedor, porque el ancho de las tarjetas es un porcentaje de
            ese contenedor y el padding se lo comería. */}
        {varias && <div aria-hidden="true" className="flex-shrink-0" style={{ width: "52px" }} />}
      </div>

      {/* Indicador de posición, discreto. */}
      {varias && (
        <div
          className="flex items-center justify-center"
          style={{ gap: "6px", marginTop: "10px" }}
          aria-label={STR.pago.posicionTarjeta(indice + 1, tarjetas.length)}
        >
          {tarjetas.map((t, i) => (
            <span
              key={t.id}
              aria-hidden="true"
              style={{
                width: i === indice ? "18px" : "6px",
                height: "6px",
                borderRadius: "999px",
                backgroundColor: i === indice ? "var(--primary-black)" : "var(--gray-20)",
                transition: "width 150ms ease",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
