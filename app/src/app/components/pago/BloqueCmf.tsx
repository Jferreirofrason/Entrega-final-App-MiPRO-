import { STR } from "../../i18n/strings";
import { ENLACE_SOLICITUD_CMF } from "../../data/enlaces";
import cmfLogoUrl from "../../../imports/cmf-logo.png";

// Bloque informativo de la tarjeta digital CMF.
//
// Acompaña a la opción de Crédito CMF: cuenta que se paga con la tarjeta
// digital y dónde pedirla si todavía no se tiene. Verde claro, compacto y
// de una sola idea.
//
// ⚠️ Dos cosas pendientes, y ninguna se inventa:
//   - La imagen es el LOGO de CMF, que es el recurso que hay en el
//     proyecto. La imagen de la tarjeta digital no la tenemos; cuando
//     llegue, se reemplaza acá.
//   - El enlace sale de data/enlaces.ts. Mientras no esté el destino
//     oficial, tocarlo avisa que falta configurarlo en vez de mandar a una
//     URL inventada. Abre en otra pestaña: el checkout no se pierde.
//
// ⚠️ Las cuotas NO se nombran. La referencia habla de hasta 36, pero no
// está confirmado para los servicios de MiPRO y no se presenta como un
// beneficio aprobado. Tampoco va una franja de logos: en MiPRO los medios
// habilitados son los que ya están en la lista de arriba.
export function BloqueCmf({ onEnlaceSinConfigurar }: { onEnlaceSinConfigurar: () => void }) {
  const meta = { fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif" } as const;

  const abrir = () => {
    if (!ENLACE_SOLICITUD_CMF) {
      onEnlaceSinConfigurar();
      return;
    }
    window.open(ENLACE_SOLICITUD_CMF, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      className="flex items-center"
      style={{
        gap: "12px",
        padding: "12px 14px",
        borderRadius: "16px",
        backgroundColor: "rgba(68, 158, 74, 0.10)",
      }}
    >
      <span
        className="flex shrink-0 items-center justify-center"
        style={{ width: "44px", height: "30px" }}
      >
        <img
          src={cmfLogoUrl}
          alt=""
          aria-hidden="true"
          style={{ width: "44px", height: "auto", display: "block" }}
        />
      </span>
      <p
        style={{
          ...meta,
          fontSize: "13px",
          lineHeight: "18px",
          color: "var(--primary-black)",
          margin: 0,
        }}
      >
        {STR.pago.cmfBloque}
        <button
          type="button"
          onClick={abrir}
          className="border-none bg-transparent p-0"
          style={{
            ...meta,
            fontSize: "13px",
            lineHeight: "18px",
            fontWeight: "var(--font-weight-medium)",
            color: "var(--info-blue)",
            textDecoration: "underline",
            cursor: "pointer",
          }}
        >
          {STR.pago.cmfBloqueEnlace}
        </button>
      </p>
    </div>
  );
}
