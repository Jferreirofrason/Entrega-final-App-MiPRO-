import { useNavigate } from "react-router";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { STR } from "../i18n/strings";

// Introducción del flujo de garantía: qué vamos a hacer y qué esperar.
// Sin estimación de tiempo: no hay datos que la respalden.
export function GarantiaIntro() {
  const navigate = useNavigate();
  const meta = { fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif" } as const;

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: "var(--primary-white)" }}>
      <header
        className="flex items-center gap-3 px-6 pt-[20px] pb-4 bg-white sticky top-0 z-20"
        style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}
      >
        <button
          onClick={() => navigate(-1)}
          aria-label={STR.garantiaFlujo.volver}
          className="w-11 h-11 rounded-[10px] flex items-center justify-center transition-opacity hover:opacity-80 border flex-shrink-0"
          style={{ backgroundColor: "var(--primary-white)", borderColor: "var(--gray-20)", cursor: "pointer" }}
        >
          <ArrowLeft size={20} strokeWidth={2} color="var(--primary-black)" aria-hidden="true" />
        </button>
        <h1
          className="truncate flex-1"
          style={{
            fontFamily: "'Bebas Neue', Arial, sans-serif",
            fontSize: "20px",
            fontWeight: "var(--font-weight-normal)",
            letterSpacing: "1px",
            color: "var(--primary-black)",
            margin: 0,
            textTransform: "uppercase",
          }}
        >
          {STR.garantiaFlujo.titulo}
        </h1>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div
          className="flex items-center justify-center"
          style={{ width: "56px", height: "56px", borderRadius: "14px", backgroundColor: "var(--gray-3)" }}
        >
          <ShieldCheck size={28} strokeWidth={2} color="var(--primary-black)" aria-hidden="true" />
        </div>
        <p style={{ ...meta, fontSize: "15px", lineHeight: "22px", color: "var(--primary-black)", margin: "16px 0 0" }}>
          {STR.garantiaFlujo.intro}
        </p>
      </div>

      <div className="px-6 py-4 bg-white flex-shrink-0" style={{ borderTop: "1px solid var(--gray-8)" }}>
        <button
          onClick={() => navigate("/garantia/producto")}
          className="w-full transition-transform hover:scale-[1.01] active:scale-[0.99] border-none"
          style={{
            height: "44px",
            backgroundColor: "var(--primary-yellow)",
            borderRadius: "12px",
            ...meta,
            fontSize: "14px",
            fontWeight: "var(--font-weight-medium)",
            color: "var(--primary-black)",
            cursor: "pointer",
          }}
        >
          {STR.garantiaFlujo.comenzar}
        </button>
      </div>
    </div>
  );
}
