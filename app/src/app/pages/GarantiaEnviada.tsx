import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { CalendarDays, Copy, Star } from "lucide-react";
import { ManoMiPRO } from "../components/ManoMiPRO";
import { STR } from "../i18n/strings";

// Confirmación con la presentación original de la marca (fondo oscuro con
// la mano de miPRO y panel blanco redondeado), y el contenido honesto del
// flujo nuevo: qué guardamos y qué sigue, sin promesas de plazos ni de
// cobertura. La solicitud queda consultable en "Garantía y reclamos".
export function GarantiaEnviada() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const numero = params.get("num") ?? "";
  const idReclamo = params.get("id") ?? "";
  const producto = params.get("producto") ?? "";
  const [copiado, setCopiado] = useState(false);

  const meta = { fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif" } as const;
  const etiquetaFila = {
    ...meta,
    fontSize: "11px",
    color: "var(--gray-40)",
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px",
  };
  const valorFila = {
    ...meta,
    fontSize: "14px",
    fontWeight: "var(--font-weight-medium)",
    color: "var(--primary-black)",
    marginTop: "2px",
  };

  const fechaEnvio = new Intl.DateTimeFormat("es", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(numero);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // Sin permiso de portapapeles: el número queda visible igual.
    }
  };

  return (
    <div
      className="h-full auth-gradient flex flex-col animate-in fade-in duration-500"
      style={{ overflow: "hidden", overscrollBehavior: "none" }}
    >
      {/* Zona superior: la mano de miPRO y el título */}
      <div className="flex flex-col items-center pt-10 pb-6 relative z-20 flex-shrink-0">
        <div className="flex items-center justify-center mb-4" style={{ width: "64px", height: "64px" }}>
          <ManoMiPRO />
        </div>
        <h1
          style={{
            fontFamily: "'Bebas Neue', Arial, sans-serif",
            fontSize: "20px",
            letterSpacing: "1px",
            textTransform: "uppercase",
            color: "var(--primary-white)",
            margin: 0,
            lineHeight: "1",
          }}
        >
          {STR.garantiaFlujo.cTitulo}
        </h1>
      </div>

      {/* Panel blanco redondeado, al ras del fondo */}
      <div
        className="flex-1 flex flex-col relative z-10"
        style={{
          backgroundColor: "var(--primary-white)",
          borderTopLeftRadius: "24px",
          borderTopRightRadius: "24px",
          minHeight: 0,
          overflow: "hidden",
        }}
      >
        <div className="flex-1 overflow-y-auto px-6 pt-6 pb-6">
          <div className="w-full flex flex-col">
            <div className="w-full flex flex-col gap-3 text-left">
              <p
                className="mb-1"
                style={{ ...meta, fontSize: "14px", lineHeight: "1.5", color: "var(--gray-60)" }}
              >
                {STR.garantiaFlujo.cDetalle}
              </p>

              {producto && (
                <div className="flex items-start gap-3">
                  <Star size={16} strokeWidth={2} color="var(--gray-60)" className="mt-0.5 flex-shrink-0" aria-hidden="true" />
                  <div>
                    <span style={etiquetaFila}>{STR.garantiaFlujo.cProducto}</span>
                    <p style={valorFila}>{producto}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5" style={{ width: "16px", height: "16px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--gray-60)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <span style={etiquetaFila}>{STR.garantiaFlujo.cSolicitud}</span>
                  <div className="flex items-center justify-between gap-2">
                    <p style={valorFila}>{numero}</p>
                    <button
                      onClick={copiar}
                      className="flex items-center gap-1 flex-shrink-0"
                      style={{
                        ...meta,
                        fontSize: "12px",
                        fontWeight: "var(--font-weight-medium)",
                        color: copiado ? "var(--success-green)" : "var(--info-blue)",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        minHeight: "44px",
                      }}
                    >
                      <Copy size={14} strokeWidth={2.5} aria-hidden="true" />
                      {copiado ? STR.garantiaFlujo.cCopiado : STR.garantiaFlujo.cCopiar}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CalendarDays size={16} strokeWidth={2} color="var(--gray-60)" className="mt-0.5 flex-shrink-0" aria-hidden="true" />
                <div>
                  <span style={etiquetaFila}>{STR.garantiaFlujo.cFechaEnvio}</span>
                  <p style={valorFila}>{fechaEnvio}</p>
                </div>
              </div>

              {/* Qué sigue */}
              <div className="mt-3">
                <h2 style={{ ...meta, fontSize: "14px", fontWeight: "var(--font-weight-medium)", color: "var(--primary-black)", margin: "0 0 10px" }}>
                  {STR.garantiaFlujo.cQueSigue}
                </h2>
                <ol className="flex flex-col gap-2.5" style={{ margin: 0, padding: 0, listStyle: "none" }}>
                  {[STR.garantiaFlujo.cPaso1, STR.garantiaFlujo.cPaso2, STR.garantiaFlujo.cPaso3].map((texto, i) => (
                    <li key={texto} className="flex items-start gap-2.5">
                      <span
                        className="flex items-center justify-center flex-shrink-0"
                        style={{
                          width: "22px",
                          height: "22px",
                          borderRadius: "50%",
                          backgroundColor: "var(--gray-3)",
                          ...meta,
                          fontSize: "12px",
                          fontWeight: "var(--font-weight-medium)",
                          color: "var(--primary-black)",
                        }}
                      >
                        {i + 1}
                      </span>
                      <span style={{ ...meta, fontSize: "13px", lineHeight: "20px", color: "var(--gray-80)" }}>
                        {texto}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="px-6 py-4 flex-shrink-0 flex flex-col gap-3" style={{ borderTop: "1px solid var(--gray-8)" }}>
          <button
            onClick={() => navigate(idReclamo ? `/reclamos/${idReclamo}` : "/reclamos")}
            className="w-full transition-transform hover:scale-[1.01] active:scale-[0.99] border-none"
            style={{
              height: "44px",
              backgroundColor: "var(--primary-yellow)",
              borderRadius: "12px",
              boxShadow: "0 10px 30px -5px rgba(0,0,0,0.08)",
              ...meta,
              fontSize: "14px",
              fontWeight: "var(--font-weight-medium)",
              color: "var(--primary-black)",
              cursor: "pointer",
            }}
          >
            {STR.garantiaFlujo.cVerSolicitud}
          </button>
          <button
            onClick={() => navigate("/")}
            className="w-full border transition-transform hover:scale-[1.01] active:scale-[0.99]"
            style={{
              height: "44px",
              backgroundColor: "var(--primary-white)",
              borderColor: "var(--gray-20)",
              borderRadius: "12px",
              ...meta,
              fontSize: "14px",
              fontWeight: "var(--font-weight-medium)",
              color: "var(--primary-black)",
              cursor: "pointer",
            }}
          >
            {STR.garantiaFlujo.cVolverInicio}
          </button>
        </div>
      </div>
    </div>
  );
}
