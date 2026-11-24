import { Outlet, useLocation } from "react-router";
import { TabBar, TABBAR_HEIGHT } from "./TabBar";
import { useCampoVisibleConTeclado } from "../lib/campoVisibleConTeclado";

// Durante el flujo de agendamiento (cuestionario + 4 pasos) la barra
// inferior se oculta: en un flujo de varios pasos invita a salir por
// accidente y perder contexto. La única salida es la flecha del header.
// Notificaciones también va sin tab bar: es una pantalla GLOBAL, no una
// sección, y mostrar la barra haría parecer activa una sección por error.
//
// La excepción es Método de pago: la HU del pago pide que la navegación
// principal quede accesible ahí. El contenido reserva el alto de la barra,
// así el pie con el total y el botón no se superponen con ella.
const RUTAS_SIN_TABBAR =
  /^\/(notificaciones$|catalogo\/[^/]+\/(revisar-lugar|configurar|direccion|fecha|resumen)$)/;

export function Layout() {
  const location = useLocation();
  const conTabBar = !RUTAS_SIN_TABBAR.test(location.pathname);
  // Vale para todas las pantallas del shell: escribir en cualquier
  // formulario no puede dejar el campo debajo del teclado.
  useCampoVisibleConTeclado();
  return (
    <div className="h-full relative" style={{ backgroundColor: 'var(--primary-white)' }}>
      {/* El contenido ocupa SIEMPRE el 100% del marco (no se achica con poco
          contenido) y es el único que scrollea. La barra es position:absolute
          (ver TabBar.tsx) y queda flotando sobre este contenedor, anclada al
          borde inferior pase lo que pase — por eso el contenido reserva ese
          mismo alto como padding-bottom (TABBAR_HEIGHT): así el último
          elemento nunca queda tapado detrás de la barra. */}
      <div
        className="overflow-y-auto overflow-x-hidden relative"
        style={{ height: "100%", paddingBottom: conTabBar ? TABBAR_HEIGHT : 0 }}
      >
        <Outlet />
      </div>
      {conTabBar && <TabBar />}
    </div>
  );
}
