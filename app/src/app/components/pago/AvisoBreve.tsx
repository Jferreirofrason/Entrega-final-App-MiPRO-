import { useEffect } from "react";

// Confirmación breve de una acción que no cambia de pantalla.
//
// Aparece sobre el contenido, se va sola y no pide que la cierren: lo que
// confirma ya se ve en la pantalla (la etiqueta que cambió de tarjeta), así
// que el aviso solo avisa. Es `role="status"`, no `alert`: no interrumpe a
// un lector de pantalla a mitad de otra cosa.
//
// Se apoya arriba del pie fijo, que es alto y cambia de alto: por eso la
// pantalla le pasa cuánto mide (`offsetInferior`) en vez de tener acá un
// número fijo. Así no tapa el total ni el botón, y queda muy por encima de
// la barra de navegación, que vive afuera de esta pantalla y la taparía.
export function AvisoBreve({
  texto,
  onCerrar,
  /** Alto del pie fijo que tiene debajo, en píxeles. */
  offsetInferior = 0,
  /** Cuánto queda a la vista. */
  duracionMs = 2600,
}: {
  texto: string | null;
  onCerrar: () => void;
  offsetInferior?: number;
  duracionMs?: number;
}) {
  useEffect(() => {
    if (!texto) return;
    const t = window.setTimeout(onCerrar, duracionMs);
    return () => window.clearTimeout(t);
  }, [texto, duracionMs, onCerrar]);

  if (!texto) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="absolute left-0 right-0 z-40 flex justify-center px-4"
      style={{ bottom: `${offsetInferior + 12}px`, pointerEvents: "none" }}
    >
      <p
        style={{
          fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif",
          fontSize: "13px",
          lineHeight: "19px",
          fontWeight: "var(--font-weight-medium)",
          color: "var(--primary-white)",
          backgroundColor: "var(--primary-black)",
          borderRadius: "10px",
          padding: "10px 16px",
          margin: 0,
          maxWidth: "100%",
          textAlign: "center",
          boxShadow: "0 6px 20px rgba(0, 0, 0, 0.18)",
        }}
      >
        {texto}
      </p>
    </div>
  );
}
