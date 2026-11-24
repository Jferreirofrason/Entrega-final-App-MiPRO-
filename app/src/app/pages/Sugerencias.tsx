import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Star, Send, Check } from "lucide-react";

export function Sugerencias() {
  const navigate = useNavigate();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<{ rating?: string; message?: string }>({});

  const validate = () => {
    const e: typeof errors = {};
    if (!rating) e.rating = "Por favor califica tu experiencia.";
    if (message.trim().length < 10) e.message = "Escribe al menos 10 caracteres.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    setSubmitted(true);
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif",
    fontSize: "13px",
    fontWeight: "var(--font-weight-medium)" as any,
    color: "var(--gray-60)",
    marginBottom: "8px",
    display: "block",
  };

  const errorStyle: React.CSSProperties = {
    fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif",
    fontSize: "12px",
    color: "var(--error-red)",
    marginTop: "4px",
  };

  if (submitted) {
    return (
      <div className="flex flex-col h-full" style={{ backgroundColor: "var(--primary-white)" }}>
        <header
          className="flex items-center gap-3 px-6 pt-[20px] pb-4 bg-white sticky top-0 z-20"
          style={{
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
          }}
        >
          <div className="w-10 flex-shrink-0" />
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
              Sugerencias
            </h1>
          </div>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <div
            className="flex items-center justify-center mb-5"
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "50%",
              backgroundColor: "var(--primary-yellow)",
            }}
          >
            <Check size={32} strokeWidth={2.5} color="var(--primary-black)" />
          </div>
          <h2
            style={{
              fontFamily: "'Bebas Neue', Arial, sans-serif",
              fontSize: "20px",
              letterSpacing: "1px",
              color: "var(--primary-black)",
              textTransform: "uppercase",
              textAlign: "center",
              margin: 0,
              marginBottom: "8px",
            }}
          >
            ¡Gracias por tu sugerencia!
          </h2>
          <p
            style={{
              fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif",
              fontSize: "14px",
              color: "var(--gray-60)",
              textAlign: "center",
              lineHeight: "1.5",
              margin: 0,
              marginBottom: "32px",
              maxWidth: "260px",
            }}
          >
            Tu opinión nos ayuda a mejorar MiPRO para todos los usuarios.
          </p>
          <button
            onClick={() => navigate("/")}
            className="w-full py-3 rounded-lg transition-opacity hover:opacity-90"
            style={{
              height: "44px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "var(--primary-yellow)",
              fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif",
              fontSize: "16px",
              fontWeight: "var(--font-weight-medium)",
              color: "var(--primary-black)",
              border: "none",
            }}
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: "var(--gray-3)" }}>
      <header className="flex items-center gap-3 px-6 pt-[20px] pb-4 bg-white sticky top-0 z-20" style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
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
            Enviar sugerencia
          </h1>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4" style={{ backgroundColor: "var(--primary-white)" }}>
        {/* Rating */}
        <div
          className="rounded-lg p-4 mb-3"
          style={{ backgroundColor: "var(--primary-white)", border: "1px solid var(--gray-8)", boxShadow: "var(--elevation-sm)" }}
        >
          <label style={labelStyle}>¿Cómo calificarías tu experiencia?</label>
          <div className="flex items-center gap-2 mt-1" role="radiogroup" aria-label="Calificación de 1 a 5 estrellas">
            {[1, 2, 3, 4, 5].map(s => (
              <button
                key={s}
                role="radio"
                aria-checked={rating === s}
                aria-label={s === 1 ? "1 estrella" : `${s} estrellas`}
                onClick={() => setRating(s)}
                onMouseEnter={() => setHoverRating(s)}
                onMouseLeave={() => setHoverRating(0)}
                style={{ background: "none", border: "none", cursor: "pointer", padding: "6px", minWidth: "44px", minHeight: "44px" }}
              >
                <Star
                  size={32}
                  strokeWidth={2}
                  color={s <= (hoverRating || rating) ? "var(--primary-yellow)" : "var(--gray-20)"}
                  fill={s <= (hoverRating || rating) ? "var(--primary-yellow)" : "transparent"}
                />
              </button>
            ))}
          </div>
          {errors.rating && <div style={errorStyle}>{errors.rating}</div>}
        </div>

        {/* Message */}
        <div
          className="rounded-lg p-4"
          style={{ backgroundColor: "var(--primary-white)", border: "1px solid var(--gray-8)", boxShadow: "var(--elevation-sm)" }}
        >
          <label style={labelStyle}>¿En qué podemos mejorar?</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Comparte tus comentarios o cualquier detalle sobre tu experiencia…"
            rows={6}
            style={{
              width: "100%",
              border: `1px solid ${errors.message ? "var(--error-red)" : "var(--gray-20)"}`,
              borderRadius: "var(--radius)",
              padding: "12px",
              fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif",
              fontSize: "14px",
              color: "var(--primary-black)",
              outline: "none",
              resize: "vertical" as const,
              backgroundColor: "var(--primary-white)",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "var(--primary-yellow)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = errors.message ? "var(--error-red)" : "var(--gray-20)";
            }}
          />
          {errors.message && <div style={errorStyle}>{errors.message}</div>}
          <div
            style={{
              fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif",
              fontSize: "12px",
              color: "var(--gray-40)",
              marginTop: "6px",
              textAlign: "right",
            }}
          >
            {message.length} caracteres
          </div>
        </div>
      </div>

      {/* Bottom action bar */}
      <div
        style={{
          backgroundColor: "var(--primary-white)",
          borderTop: "1px solid var(--gray-8)",
          padding: "16px",
          boxShadow: "0 -4px 12px rgba(0, 0, 0, 0.05)",
        }}
      >
        <button
          onClick={handleSubmit}
          className="w-full flex items-center justify-center gap-2 transition-opacity hover:opacity-90 active:scale-[0.98]"
          style={{
            height: "44px",
            borderRadius: "12px",
            backgroundColor: "var(--primary-yellow)",
            border: "none",
            cursor: "pointer",
          }}
        >
          <Send size={18} strokeWidth={2} color="var(--primary-black)" />
          <span
            style={{
              fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif",
              fontSize: "15px",
              fontWeight: "var(--font-weight-medium)" as any,
              color: "var(--primary-black)",
            }}
          >
            Enviar
          </span>
        </button>
      </div>
    </div>
  );
}
