import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import logoUrl from "../../imports/logo.svg";

const inputStyle = (hasError: boolean): React.CSSProperties => ({
  width: "100%",
  height: "38px",
  borderRadius: "var(--radius)",
  padding: "8px 12px",
  border: hasError ? "1px solid var(--error-red)" : "1px solid var(--gray-20)",
  fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif",
  fontSize: "14px",
  color: "var(--primary-black)",
  backgroundColor: "var(--primary-white)",
  outline: "none",
  boxSizing: "border-box" as const,
});

const labelStyle: React.CSSProperties = {
  fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif",
  fontSize: "13px",
  lineHeight: "19px",
  fontWeight: "var(--font-weight-medium)" as any,
  color: "var(--gray-60)",
};

const errorStyle: React.CSSProperties = {
  fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif",
  fontSize: "12px",
  color: "var(--error-red)",
};

export function Login() {
  const navigate = useNavigate();

  // El inicio de sesión es únicamente con correo electrónico.
  const [email, setEmail] = useState("");

  // Password
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!email.trim()) e.email = "Ingresa tu correo electrónico";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Correo inválido";
    if (!password) e.password = "Ingresa tu contraseña";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = () => {
    if (!validate()) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      navigate("/?servicios=vacio");
    }, 1200);
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>, field: string) => {
    if (!errors[field]) e.currentTarget.style.borderColor = "var(--primary-yellow)";
  };
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>, field: string) => {
    if (!errors[field]) e.currentTarget.style.borderColor = "var(--gray-20)";
  };

  return (
    <div className="flex flex-col h-full relative auth-gradient !overflow-y-auto overflow-x-hidden">
      {/* Header */}
      <div className="relative z-20 flex items-center justify-between px-6 pt-12 pb-6">
        <button aria-label="Volver"
          onClick={() => navigate(-1)}
          className="w-11 h-11 rounded-[10px] flex items-center justify-center transition-opacity hover:opacity-80 border flex-shrink-0"
          style={{
            backgroundColor: 'var(--primary-white)',
            borderColor: 'var(--gray-20)',
          }}
        >
          <ArrowLeft size={20} strokeWidth={2} color="var(--primary-black)" />
        </button>
        <img src={logoUrl} alt="MiPRO" style={{ height: "36px", width: "auto" }} />
      </div>

      {/* White card */}
      <div
        className="flex-1 flex flex-col relative z-10 px-6 pt-8 pb-10"
        style={{
          backgroundColor: "var(--primary-white)",
          borderTopLeftRadius: "24px",
          borderTopRightRadius: "24px",
          marginTop: "20px",
        }}
      >
        <div className="w-full flex-1 flex flex-col gap-6">
          {/* Title */}
          <div>
            <h1
              style={{
                fontFamily: "'Bebas Neue', Arial, sans-serif",
                fontSize: "32px",
                fontWeight: "var(--font-weight-normal)" as any,
                letterSpacing: "1px",
                color: "var(--primary-black)",
                lineHeight: "1.1",
                margin: 0,
              }}
            >
              Bienvenido de vuelta
            </h1>
            <p style={{ fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif", fontSize: "15px", color: "var(--gray-60)", marginTop: "6px", marginBottom: 0 }}>
              Inicia sesión para continuar
            </p>
          </div>

          {/* Correo y contraseña */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-[6px]">
              <label style={labelStyle}>Correo electrónico</label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrors(prev => ({ ...prev, email: undefined as any })); }}
                placeholder="tu@correo.com"
                style={inputStyle(!!errors.email)}
                onFocus={(e) => handleFocus(e, "email")}
                onBlur={(e) => handleBlur(e, "email")}
              />
              {errors.email && <span style={errorStyle}>{errors.email}</span>}
            </div>

            {/* Password */}
            <div className="flex flex-col gap-[6px]">
              <div className="flex items-center justify-between">
                <label style={labelStyle}>Contraseña</label>
                <button
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                  style={{
                    fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif",
                    fontSize: "12px",
                    color: "var(--info-blue)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrors(prev => ({ ...prev, password: undefined as any })); }}
                  placeholder="Ingresa tu contraseña"
                  style={{ ...inputStyle(!!errors.password), paddingRight: "44px" }}
                  onFocus={(e) => handleFocus(e, "password")}
                  onBlur={(e) => handleBlur(e, "password")}
                />
                <button aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-0 h-full w-[44px] flex items-center justify-center"
                  style={{ background: "none", border: "none", cursor: "pointer" }}
                >
                  {showPassword ? <EyeOff size={18} strokeWidth={2} color="var(--gray-60)" /> : <Eye size={18} strokeWidth={2} color="var(--gray-60)" />}
                </button>
              </div>
              {errors.password && <span style={errorStyle}>{errors.password}</span>}
            </div>
          </div>

          {/* Login Button */}
          <button
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
            style={{
              height: "44px",
              borderRadius: "var(--radius)",
              backgroundColor: "var(--primary-yellow)",
              border: "none",
              cursor: isLoading ? "default" : "pointer",
            }}
          >
            <span style={{ fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif", fontSize: "14px", fontWeight: "var(--font-weight-medium)" as any, color: "var(--primary-black)" }}>
              {isLoading ? "Ingresando..." : "Iniciar sesión"}
            </span>
          </button>



          {/* Bottom Link */}
          <div className="mt-auto flex items-center justify-center pt-4 pb-2">
            <span style={{ fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif", fontSize: "14px", color: "var(--gray-60)" }}>
              ¿No tienes cuenta?{" "}
            </span>
            <button
              onClick={() => navigate("/signup")}
              style={{
                fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif",
                fontSize: "14px",
                fontWeight: "var(--font-weight-medium)" as any,
                color: "var(--primary-black)",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
                marginLeft: "4px",
                textDecoration: "underline",
                textUnderlineOffset: "2px",
              }}
            >
              Regístrate aquí
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
