import { useNavigate } from "react-router";
import { Bell } from "lucide-react";
import { CURRENT_USER, nombreParaSaludo } from "../data/user";
import { etiquetaDePerfil } from "../logic/perfil";
import { STR } from "../i18n/strings";
import { AvatarDePerfil } from "../components/perfil/AvatarDePerfil";
import { AvisoDePerfil } from "../components/home/AvisoDePerfil";
import { BuscadorServicios } from "../components/home/BuscadorServicios";
import { SeccionServicios } from "../components/home/SeccionServicios";
import { AvisoProximaVisita } from "../components/home/AvisoProximaVisita";
import { SeccionPromociones } from "../components/home/SeccionPromociones";
import { SeccionGarantia } from "../components/reclamos/SeccionGarantia";
import { cantidadNoLeidas } from "../data/notificaciones";

// Home del cliente, orientado al descubrimiento: saludo, buscador,
// "Servicios para tu hogar" (destacados), aviso compacto de próxima visita
// SOLO cuando hay algo relevante, Promociones y Garantía y reclamos.
// CAMBIO DE ALCANCE (HU-07): la sección extensa "Mis Citas" se reemplazó
// por servicios destacados y el aviso contextual; el seguimiento completo
// vive en la pestaña Citas. SeccionMisCitas queda en el código por si el
// PO revierte la decisión.
export function Home() {
  const navigate = useNavigate();
  const sinLeer = cantidadNoLeidas();

  // El Home es siempre el mismo: el caso "usuario nuevo" se representa con
  // datos (sin servicios), no con una pantalla aparte. EmptyHome quedó fuera
  // del recorrido.
  return (
    <div className="flex flex-col bg-white">
      {/* Header: saludo personalizado */}
      <header
        className="flex items-center gap-3 px-6 py-4 bg-white sticky top-0 z-30"
        style={{
          boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
        }}
      >
        {/* La persona junto a su saludo: el avatar abre el perfil. Es la
            inicial sobre amarillo, no una foto. */}
        <button
          onClick={() => navigate("/perfil")}
          aria-label={etiquetaDePerfil(CURRENT_USER.firstName)}
          className="flex-shrink-0 transition-transform hover:scale-105 active:scale-95"
          style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}
        >
          <AvatarDePerfil tamano={44} />
        </button>
        <div className="flex-1 min-w-0">
          <h1
            className="truncate"
            style={{
              fontFamily: "'Bebas Neue', Arial, sans-serif",
              fontSize: "20px",
              fontWeight: "var(--font-weight-normal)",
              letterSpacing: "1px",
              color: "var(--primary-black)",
              margin: 0,
              lineHeight: "1.05",
              textTransform: "uppercase",
            }}
          >
            {(() => {
              const nombre = nombreParaSaludo(CURRENT_USER);
              return nombre ? STR.home.saludo(nombre) : STR.home.saludoSinNombre;
            })()}
          </h1>
          <p
            className="truncate"
            style={{
              fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif",
              fontSize: "12px",
              color: "var(--gray-60)",
              margin: "2px 0 0",
            }}
          >
            {STR.home.subtitulo}
          </p>
        </div>
        {/* Campana: notificaciones de los servicios y las garantías */}
        <button
          onClick={() => navigate("/notificaciones")}
          aria-label={STR.notificaciones.abrir(sinLeer)}
          className="relative flex-shrink-0 flex items-center justify-center transition-opacity hover:opacity-80"
          style={{
            width: "44px",
            height: "44px",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
          }}
        >
          <Bell size={22} strokeWidth={2} color="var(--primary-black)" aria-hidden="true" />
          {sinLeer > 0 && (
            <span
              aria-hidden="true"
              className="absolute flex items-center justify-center"
              style={{
                top: "5px",
                right: "5px",
                minWidth: "16px",
                height: "16px",
                padding: "0 3px",
                borderRadius: "4px",
                backgroundColor: "var(--error-red)",
                fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif",
                fontSize: "10px",
                fontWeight: "var(--font-weight-medium)",
                color: "var(--primary-white)",
              }}
            >
              {sinLeer}
            </span>
          )}
        </button>

      </header>

      {/* Contenido: Auto Layout real, con la escala de la app y sin un solo
          margen manual. La columna de primer nivel separa grupos con 24; los
          bordes que piden otra distancia se resuelven agrupando, no con
          márgenes propios de cada sección:

            16  buscador y "Mis servicios", que se leen juntos
            24  entre grupos
            32  entre Promociones y Garantía, el corte más fuerte del Home

          Arriba 16 desde el header y abajo 16, que sumados al alto de la
          barra que reserva Layout dejan el contenido scrolleando por detrás
          sin espacio sobrante. Una sección que no se muestra devuelve null y
          no deja un nodo vacío que duplique el gap. */}
      <div className="flex flex-col gap-6 px-6 pt-4 pb-4">
        {/* Perfil salió de la barra de abajo y ahora se entra por la foto.
            El aviso lo dice una sola vez y después no vuelve. */}
        <AvisoDePerfil className="hogar-entrada" />
        <div className="flex flex-col gap-4">
          <BuscadorServicios className="hogar-entrada" style={{ animationDelay: "0ms" }} />
          <AvisoProximaVisita prioridad="alta" className="hogar-entrada" style={{ animationDelay: "60ms" }} />
        </div>
        <AvisoProximaVisita prioridad="media" className="hogar-entrada" style={{ animationDelay: "120ms" }} />
        <SeccionServicios className="hogar-entrada" style={{ animationDelay: "180ms" }} />
        <div className="flex flex-col gap-8">
          <SeccionPromociones className="hogar-entrada" style={{ animationDelay: "240ms" }} />
          <SeccionGarantia className="hogar-entrada" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    </div>
  );
}
