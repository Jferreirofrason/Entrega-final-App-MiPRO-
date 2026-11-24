import { useEffect } from "react";

/**
 * Mantiene visible el campo que se está completando cuando aparece el
 * teclado.
 *
 * El navegador desplaza el campo al enfocarlo, pero el teclado aparece
 * DESPUÉS: el alto visible se achica y nadie vuelve a desplazar nada, así
 * que el campo puede quedar debajo del botón fijo del flujo o de la barra
 * de navegación. Eso es lo que pasaba al escribir en los formularios.
 *
 * Acá se escucha el cambio de alto visible y, si hay un campo enfocado, se
 * lo vuelve a traer al centro de lo que queda a la vista. El desplazamiento
 * lo resuelve el propio contenedor que scrollea, sea cual sea la pantalla.
 *
 * Los dos navegadores avisan distinto: en iOS el teclado achica el
 * `visualViewport` sin tocar el layout, y en Android suele achicar la
 * ventana entera. Se escuchan los dos eventos.
 */
export function useCampoVisibleConTeclado() {
  useEffect(() => {
    let pendiente = 0;

    const esEditable = (el: Element | null): el is HTMLElement =>
      el instanceof HTMLElement &&
      (el.tagName === "INPUT" ||
        el.tagName === "TEXTAREA" ||
        el.tagName === "SELECT" ||
        el.isContentEditable);

    const acomodar = () => {
      window.clearTimeout(pendiente);
      // Un respiro: el teclado se anima y el alto llega en varios pasos.
      pendiente = window.setTimeout(() => {
        const campo = document.activeElement;
        if (!esEditable(campo)) return;
        campo.scrollIntoView({ block: "center", behavior: "smooth" });
      }, 150);
    };

    const vv = window.visualViewport;
    vv?.addEventListener("resize", acomodar);
    window.addEventListener("resize", acomodar);

    return () => {
      window.clearTimeout(pendiente);
      vv?.removeEventListener("resize", acomodar);
      window.removeEventListener("resize", acomodar);
    };
  }, []);
}
