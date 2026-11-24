import { useNavigate } from "react-router";
import { ShieldCheck, CalendarDays, Plus, User, Info } from "lucide-react";
import { CURRENT_USER } from "../data/user";

export function EmptyHome() {
  const navigate = useNavigate();
  const userName = CURRENT_USER.firstName;

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white">
      {/* Header */}
      <header
        className="flex items-center gap-3 px-6 pt-[20px] pb-2 bg-white sticky top-0 z-30"
        style={{
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
        }}
      >
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
              textTransform: "uppercase",
            }}
          >
            Hola, {userName}
          </h1>
        </div>
        <button
          onClick={() => navigate("/perfil")}
          className="w-11 h-11 rounded-[10px] flex items-center justify-center transition-all hover:scale-105 active:scale-95 border flex-shrink-0"
          style={{
            backgroundColor: "var(--primary-white)",
            borderColor: "var(--gray-20)",
            cursor: "pointer",
          }}
        >
          <User size={20} strokeWidth={2} color="var(--primary-black)" />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-6 animate-in fade-in duration-700 pt-2 pb-8">
          {/* ── Garantías ── */}
          <section className="px-6">
            <div className="flex items-center justify-between mb-3">
              <h3
                style={{
                  fontFamily: "'Bebas Neue', Arial, sans-serif",
                  fontSize: "18px",
                  fontWeight: "var(--font-weight-normal)",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  color: "var(--primary-black)",
                  margin: 0,
                }}
              >
                Gestión de garantía
              </h3>
            </div>

            <div className="flex flex-col gap-4">
              <div 
                className="p-5 rounded-2xl flex flex-col gap-4" 
                style={{ 
                  backgroundColor: "var(--card)", 
                  border: "1px solid var(--gray-8)", 
                  borderRadius: "20px", 
                  boxShadow: "0 10px 30px -10px rgba(0,0,0,0.08)"
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-[10px] flex items-center justify-center" style={{ backgroundColor: 'rgba(255, 204, 0, 0.1)' }}>
                    <ShieldCheck size={20} color="var(--primary-yellow)" />
                  </div>
                  <p 
                    style={{ 
                      fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif", 
                      fontSize: '14px', 
                      fontWeight: 'var(--font-weight-medium)', 
                      color: 'var(--primary-black)' 
                    }}
                  >
                    Gestiona la garantía de tu producto
                  </p>
                </div>

                <div className="h-[1px] w-full bg-gray-100" />

                <div className="flex flex-col gap-3">
                  <div>
                    <h4 className="font-bebas text-xs tracking-wide text-primary-black uppercase mb-1">¿Cómo funciona el proceso?</h4>
                    <div className="space-y-2">
                        <p className="text-[11px] text-gray-500 leading-relaxed">
                          1. <b>Reporte</b>: Al enviar el formulario, validaremos la información de tu equipo.
                        </p>
                        <p className="text-[11px] text-gray-500 leading-relaxed">
                          2. <b>Validación</b>: Un asesor técnico revisará tu caso en <b>24 a 48 horas</b> hábiles.
                        </p>
                        <p className="text-[11px] text-gray-500 leading-relaxed">
                          3. <b>Seguimiento</b>: Te contactaremos vía WhatsApp o llamada para coordinar la visita o retiro.
                        </p>
                      </div>
                    </div>
                  
                  <div className="mt-1 p-3 rounded-lg bg-gray-50 border border-gray-100">
                    <p className="text-[10px] text-gray-600 leading-tight italic">
                      <b>Nota:</b> Asegúrate de que el equipo no haya sido manipulado por personal no autorizado para mantener la validez de la garantía.
                    </p>
                  </div>

                  {/* CTA dentro de la sección (el botón fijo del Home se eliminó) */}
                  <button
                    onClick={() => navigate('/garantia')}
                    className="w-full h-11 flex items-center justify-center gap-2 transition-transform hover:scale-[1.01] active:scale-[0.99] border-none mt-2"
                    style={{
                      backgroundColor: 'var(--primary-yellow)',
                      borderRadius: '12px',
                      fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif",
                      fontSize: '14px',
                      fontWeight: 'var(--font-weight-medium)',
                      color: 'var(--primary-black)',
                      cursor: 'pointer'
                    }}
                  >
                    <ShieldCheck size={20} strokeWidth={2} aria-hidden="true" />
                    Solicitar ayuda por garantía
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );

}
