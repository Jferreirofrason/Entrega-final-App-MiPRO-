import { useNavigate } from "react-router";
import { Search } from "lucide-react";
import { STR } from "../../i18n/strings";

// Acceso a la búsqueda desde el Home (MIPRO-1471).
//
// Decisión de UX: la búsqueda vive en UN solo lugar. Tocar esta barra abre
// el catálogo con el teclado listo y resultados en vivo al escribir; acá no
// se tipea "a ciegas". Visualmente es idéntica a un buscador para que la
// intención sea obvia.
export function BuscadorServicios({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate("/catalogo?enfocar=1")}
      aria-label={STR.buscador.etiqueta}
      className={`flex items-center gap-2 w-full text-left transition-all active:scale-[0.99] ${className ?? ""}`}
      style={{
        ...style,
        height: "44px",
        borderRadius: "10px",
        border: "1px solid var(--gray-8)",
        backgroundColor: "var(--gray-3)",
        padding: "8px 14px",
        cursor: "pointer",
      }}
    >
      <Search
        size={18}
        strokeWidth={2}
        color="var(--gray-60)"
        style={{ flexShrink: 0 }}
        aria-hidden="true"
      />
      <span
        style={{
          fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif",
          fontSize: "14px",
          color: "var(--gray-60)",
        }}
      >
        {STR.buscador.placeholder}
      </span>
    </button>
  );
}
