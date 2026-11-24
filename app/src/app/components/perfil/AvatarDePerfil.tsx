import { User } from "lucide-react";
import { CURRENT_USER } from "../../data/user";
import { inicialDePerfil } from "../../logic/perfil";

// El avatar de la persona: su inicial sobre el amarillo de la marca.
//
// NO es una foto. La app no pide ni guarda la foto de nadie: un avatar con
// la inicial identifica igual de bien en una lista o en un encabezado, no
// necesita permisos y no deja la imagen de una persona real dando vueltas
// en un prototipo.
//
// Es UN componente para los dos lugares donde aparece (el encabezado del
// Inicio y la pantalla de Perfil): si cambia la forma o el color, cambia en
// los dos a la vez.
//
// Sin un nombre con el que armar la inicial cae al ícono genérico de
// perfil, el mismo de lucide que usa el resto de la app. Una letra
// inventada o un signo adentro del círculo no identifican a nadie.
export function AvatarDePerfil({
  tamano = 44,
  className,
}: {
  /** El lado del círculo, en píxeles. */
  tamano?: number;
  className?: string;
}) {
  const inicial = inicialDePerfil(CURRENT_USER.firstName);

  return (
    <span
      aria-hidden="true"
      className={`flex items-center justify-center border ${className ?? ""}`}
      style={{
        width: `${tamano}px`,
        height: `${tamano}px`,
        borderRadius: "50%",
        borderColor: "var(--gray-20)",
        backgroundColor: "var(--primary-yellow)",
        flexShrink: 0,
      }}
    >
      {inicial ? (
        <span
          style={{
            // Helvetica y no Bebas: es una letra suelta, no un título. A
            // este tamaño Bebas se lee como un logotipo.
            fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif",
            // El cuerpo acompaña al círculo en vez de tener un número por
            // cada uso.
            fontSize: `${Math.round(tamano * 0.41)}px`,
            fontWeight: 600,
            lineHeight: 1,
            color: "var(--primary-black)",
          }}
        >
          {inicial}
        </span>
      ) : (
        <User
          size={Math.round(tamano * 0.5)}
          strokeWidth={2}
          color="var(--primary-black)"
        />
      )}
    </span>
  );
}
