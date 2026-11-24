import { Link, useLocation } from "react-router";
import { Home, Wrench, Package, ShieldCheck, type LucideIcon } from "lucide-react";
import { seccionActiva, TABS } from "../logic/tabs.ts";
import type { SeccionTab } from "../logic/tabs.ts";

// Altura total de la barra, incluida la safe area inferior de iOS. Se
// exporta para que Layout.tsx reserve exactamente ese espacio al final del
// contenido (con padding-bottom) y así nada quede tapado detrás de la
// barra, que ahora es position:fixed (ver comentario en el propio nav).
export const TABBAR_HEIGHT = "calc(64px + env(safe-area-inset-bottom))";

// Navegación principal, persistente en la parte inferior.
//
// Patrón minimalista: fondo blanco, borde superior sutil, cuatro items
// equitativos con ícono arriba y label debajo. El ACTIVO se marca solo por
// color y peso: mismo ícono outline en ambos estados (la forma nunca
// cambia al seleccionar), negro + label semibold; inactivos en gris con
// peso regular. Sin contenedores ni indicadores extra.
//
// La sección activa se calcula por PANTALLA (logic/tabs.ts): el detalle de
// un servicio enciende Servicios y un reclamo enciende Garantía. Nunca hay
// dos tabs activos; Notificaciones es una pantalla global y se abre SIN
// tab bar (Layout la oculta).
//
// PERFIL NO ES UN TAB. Se entra por la foto del Inicio. Estando en Perfil
// la barra se sigue viendo, sin ninguna entrada encendida: es la forma de
// salir, y encender una sección en la que no estás sería mentir.

export function TabBar() {
  const location = useLocation();
  const activa = seccionActiva(location.pathname, location.search);

  // La lista vive en el dominio (logic/tabs.ts) para que una prueba pueda
  // afirmar qué entradas tiene la barra. Acá solo se le pone el ícono.
  const ICONO: Record<string, LucideIcon> = {
    inicio: Home,
    servicios: Wrench,
    productos: Package,
    garantia: ShieldCheck,
  };

  return (
    // position:absolute (no flex sibling ni sticky): el padre directo es
    // Layout.tsx, que tiene position:relative y h-full (el alto real del
    // marco de la app, tanto en el modo móvil fluido como en el marco fijo
    // de escritorio). Por eso la barra queda anclada al borde inferior de
    // la pantalla SIEMPRE, tenga o no contenido suficiente para llenarla.
    // Layout.tsx reserva este mismo alto como padding-bottom del contenido
    // (TABBAR_HEIGHT) para que nada quede tapado detrás.
    <nav
      aria-label="Navegación principal"
      className="border-t flex items-stretch flex-shrink-0"
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: TABBAR_HEIGHT,
        paddingBottom: 'env(safe-area-inset-bottom)',
        backgroundColor: 'var(--card)',
        borderTopColor: 'var(--gray-8)',
        zIndex: 30,
      }}
    >
      {TABS.map((tab) => {
        const isActive = activa === tab.seccion;
        const Icono = ICONO[tab.seccion] ?? Home;
        return (
          <Link
            key={tab.path}
            to={tab.path}
            aria-current={isActive ? "page" : undefined}
            className="flex flex-col items-center justify-center flex-1 min-w-0"
            style={{ minHeight: '44px', gap: '4px', paddingInline: '2px' }}
          >
            {/* El ícono NUNCA cambia de forma al seleccionar: mismo outline
                en ambos estados, solo cambia el color (negro/gris). */}
            <Icono
              size={24}
              strokeWidth={2}
              aria-hidden="true"
              className="transition-colors duration-200"
              style={{ color: isActive ? 'var(--primary-black)' : 'var(--gray-60)' }}
            />
            <span
              className="transition-colors duration-200 whitespace-nowrap"
              style={{
                fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif",
                fontSize: '11px',
                fontWeight: isActive ? 'var(--font-weight-semibold)' : 'var(--font-weight-normal)',
                color: isActive ? 'var(--primary-black)' : 'var(--gray-60)',
              }}
            >
              {tab.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
