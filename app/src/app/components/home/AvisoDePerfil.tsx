import { useState } from "react";
import { X } from "lucide-react";
import { STR } from "../../i18n/strings";

const meta = { fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif" } as const;

const CLAVE = "mipro-aviso-perfil-visto";

/**
 * Si el aviso todavía tiene que mostrarse.
 *
 * Sin storage se muestra: es preferible avisar de más que dejar a alguien
 * sin encontrar su perfil. No es un tutorial de bienvenida, es el cartel de
 * "nos mudamos" de algo que antes estaba en la barra de abajo.
 */
function todaviaNoLoVio(): boolean {
  try {
    return localStorage.getItem(CLAVE) !== "1";
  } catch {
    return true;
  }
}

function marcarVisto(): void {
  try {
    localStorage.setItem(CLAVE, "1");
  } catch {
    // Sin storage vuelve a aparecer la próxima vez. Molesta menos que
    // perder el acceso al perfil.
  }
}

// Avisa dónde quedó el perfil, una sola vez.
//
// Perfil salió de la barra inferior y ahora se entra por la foto del
// encabezado. Un cambio de lugar que nadie anuncia se vive como una
// función que desapareció, así que el aviso aparece una vez, apunta a la
// foto y se cierra.
//
// Va DEBAJO del encabezado y no flotando encima: un globo sobre el header
// sticky tapa el saludo y las notificaciones, que es justo lo que la
// persona vino a mirar.
export function AvisoDePerfil({ className, style }: { className?: string; style?: React.CSSProperties }) {
  const [visible, setVisible] = useState(todaviaNoLoVio);

  if (!visible) return null;

  const cerrar = () => {
    marcarVisto();
    setVisible(false);
  };

  return (
    <div
      role="status"
      className={`relative flex items-start ${className ?? ""}`}
      style={{
        ...style,
        gap: "10px",
        padding: "12px 12px 12px 14px",
        borderRadius: "12px",
        border: "1px solid var(--gray-8)",
        backgroundColor: "var(--gray-3)",
      }}
    >
      {/* La puntita apunta a la foto del encabezado, que está arriba a la
          izquierda. Es una forma, no un carácter: no hay flechas en el
          texto. */}
      <span
        aria-hidden="true"
        className="absolute"
        style={{
          top: "-6px",
          left: "16px",
          width: "11px",
          height: "11px",
          backgroundColor: "var(--gray-3)",
          borderLeft: "1px solid var(--gray-8)",
          borderTop: "1px solid var(--gray-8)",
          transform: "rotate(45deg)",
        }}
      />

      <div className="flex flex-col min-w-0" style={{ gap: "2px" }}>
        <p
          style={{
            ...meta,
            fontSize: "14px",
            lineHeight: "20px",
            fontWeight: "var(--font-weight-medium)",
            color: "var(--primary-black)",
            margin: 0,
          }}
        >
          {STR.home.avisoPerfilTitulo}
        </p>
        <p style={{ ...meta, fontSize: "13px", lineHeight: "19px", color: "var(--gray-60)", margin: 0 }}>
          {STR.home.avisoPerfilTexto}
        </p>
      </div>

      <button
        type="button"
        onClick={cerrar}
        aria-label={STR.home.avisoPerfilCerrar}
        className="flex items-center justify-center border-none bg-transparent shrink-0"
        style={{ width: "32px", height: "32px", marginTop: "-4px", marginRight: "-4px", cursor: "pointer" }}
      >
        <X size={16} strokeWidth={2.2} color="var(--gray-60)" aria-hidden="true" />
      </button>
    </div>
  );
}
