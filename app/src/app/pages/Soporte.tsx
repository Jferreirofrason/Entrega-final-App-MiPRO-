import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, MessageCircle, Mail, Phone, ChevronRight } from "lucide-react";

const faqs = [
  {
    q: "¿Cómo agendo un servicio?",
    a: 'Ve a la pestaña "Servicios", elige el servicio que necesitas y sigue los pasos: cantidad, dirección y fecha preferida. Un agente confirmará contigo la visita y el pago.',
  },
  {
    q: "¿Puedo cambiar o cancelar una visita?",
    a: "Para cambiar o cancelar una visita, comunícate con nuestro equipo por WhatsApp o por teléfono y lo coordinamos contigo.",
  },
  {
    q: "¿Qué es el costo de inspección?",
    a: "Algunos servicios requieren una inspección previa de $20. Este monto se descuenta del costo total si decides continuar.",
  },
  {
    q: "¿Cómo funciona el pago?",
    a: "Aceptamos CMF y Yappy. El cobro se realiza al confirmar la cita. Para servicios con precio variable, se cobra después de la inspección.",
  },
];

export function Soporte() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const contactOptions = [
    {
      icon: MessageCircle,
      label: "WhatsApp",
      sub: "Respuesta inmediata",
      badge: "En línea",
      badgeColor: "var(--success-green)",
      action: () => {},
    },
    {
      icon: Phone,
      label: "Llámanos",
      sub: "+507 123-4567",
      badge: "Lun. a vie. · 8-18 h",
      badgeColor: "var(--gray-40)",
      action: () => {},
    },
    {
      icon: Mail,
      label: "Envíanos un email",
      sub: "soporte@mipro.app",
      badge: "Respuesta en 24 h",
      badgeColor: "var(--gray-40)",
      action: () => {},
    },
  ];

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: "var(--primary-white)" }}>
      {/* Header */}
      <header
        className="flex items-center gap-3 px-6 pt-[20px] pb-4 bg-white sticky top-0 z-20"
        style={{
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
        }}
      >
        <button
          onClick={() => navigate("/")}
          className="w-11 h-11 rounded-[10px] flex items-center justify-center transition-opacity hover:opacity-80 border flex-shrink-0"
          style={{
            backgroundColor: 'var(--primary-white)',
            borderColor: 'var(--gray-20)',
            cursor: 'pointer'
          }}
        >
          <ArrowLeft size={20} strokeWidth={2} color="var(--primary-black)" />
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
              textTransform: "uppercase",
            }}
          >
            Contactar soporte
          </h1>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto" style={{ backgroundColor: "var(--primary-white)" }}>
        {/* Hero banner */}
        <div
          className="mx-4 mt-4 rounded-xl px-5 py-5"
          style={{
            background: "linear-gradient(135deg, var(--primary-black) 0%, #2a2a2a 100%)",
          }}
        >
          <p
            style={{
              fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif",
              fontSize: "13px",
              color: "var(--primary-yellow)",
              margin: 0,
              marginBottom: "4px",
              fontWeight: "var(--font-weight-medium)" as any,
            }}
          >
            ¿Necesitas ayuda?
          </p>
          <h2
            style={{
              fontFamily: "'Bebas Neue', Arial, sans-serif",
              fontSize: "20px",
              letterSpacing: "1px",
              color: "var(--primary-white)",
              margin: 0,
              marginBottom: "6px",
              textTransform: "uppercase",
            }}
          >
            Estamos aquí para ti
          </h2>
          <p
            style={{
              fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif",
              fontSize: "13px",
              color: "var(--gray-40)",
              margin: 0,
              lineHeight: "1.5",
            }}
          >
            Elige el canal de atención de tu conveniencia y resolvemos tus dudas cuanto antes.
          </p>
        </div>

        {/* Contact options */}
        <div className="px-4 mt-4">
          <p
            style={{
              fontFamily: "'Bebas Neue', Arial, sans-serif",
              fontSize: "16px",
              letterSpacing: "1px",
              color: "var(--primary-black)",
              margin: 0,
              marginBottom: "10px",
              textTransform: "uppercase",
            }}
          >
            Canales de atención
          </p>
          <div className="flex flex-col gap-3">
            {contactOptions.map((opt, i) => (
              <button
                key={i}
                onClick={opt.action}
                className="w-full flex items-center justify-between px-4 py-4 transition-opacity hover:opacity-70 rounded-lg"
                style={{
                  backgroundColor: "var(--primary-white)",
                  border: "1px solid var(--gray-8)",
                  boxShadow: "var(--elevation-sm)",
                  cursor: "pointer",
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex items-center justify-center"
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "12px",
                      backgroundColor: "var(--gray-8)",
                      flexShrink: 0,
                    }}
                  >
                    <opt.icon size={20} strokeWidth={2} color="var(--primary-black)" />
                  </div>
                  <div className="text-left">
                    <p
                      style={{
                        fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif",
                        fontSize: "15px",
                        fontWeight: "var(--font-weight-medium)" as any,
                        color: "var(--primary-black)",
                        margin: 0,
                      }}
                    >
                      {opt.label}
                    </p>
                    <p
                      style={{
                        fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif",
                        fontSize: "13px",
                        color: "var(--gray-60)",
                        margin: 0,
                        marginTop: "2px",
                      }}
                    >
                      {opt.sub}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    style={{
                      fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif",
                      fontSize: "11px",
                      color: opt.badgeColor,
                      fontWeight: "var(--font-weight-medium)" as any,
                      backgroundColor: i === 0 ? "rgba(88,202,138,0.12)" : "var(--gray-8)",
                      borderRadius: "6px",
                      padding: "3px 7px",
                      whiteSpace: "nowrap" as const,
                    }}
                  >
                    {opt.badge}
                  </span>
                  <ChevronRight size={18} strokeWidth={2} color="var(--gray-40)" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="px-4 mt-5 pb-6">
          <p
            style={{
              fontFamily: "'Bebas Neue', Arial, sans-serif",
              fontSize: "16px",
              letterSpacing: "1px",
              color: "var(--primary-black)",
              margin: 0,
              marginBottom: "10px",
              textTransform: "uppercase",
            }}
          >
            Preguntas frecuentes
          </p>
          <div className="flex flex-col gap-3">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="rounded-lg overflow-hidden"
                style={{
                  backgroundColor: "var(--primary-white)",
                  border: "1px solid var(--gray-8)",
                  boxShadow: "var(--elevation-sm)",
                }}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-4 py-4 transition-opacity hover:opacity-70"
                  style={{ backgroundColor: "transparent", cursor: "pointer" }}
                >
                  <span
                    style={{
                      fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif",
                      fontSize: "14px",
                      fontWeight: "var(--font-weight-medium)" as any,
                      color: "var(--primary-black)",
                      textAlign: "left",
                      flex: 1,
                      paddingRight: "8px",
                    }}
                  >
                    {faq.q}
                  </span>
                  <div
                    style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      backgroundColor: openFaq === i ? "var(--primary-yellow)" : "var(--gray-8)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      transition: "background-color 0.2s",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif",
                        fontSize: "16px",
                        lineHeight: 1,
                        color: "var(--primary-black)",
                        fontWeight: "var(--font-weight-medium)" as any,
                      }}
                    >
                      {openFaq === i ? "−" : "+"}
                    </span>
                  </div>
                </button>
                {openFaq === i && (
                  <div
                    className="px-4 pb-4"
                    style={{ backgroundColor: "var(--gray-3)" }}
                  >
                    <p
                      style={{
                        fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif",
                        fontSize: "13px",
                        color: "var(--gray-60)",
                        margin: 0,
                        lineHeight: "1.6",
                      }}
                    >
                      {faq.a}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
