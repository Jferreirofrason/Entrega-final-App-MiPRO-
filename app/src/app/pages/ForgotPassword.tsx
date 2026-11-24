import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Mail, Phone, CheckCircle2, ChevronDown, Eye, EyeOff } from "lucide-react";
import logoUrl from "../../imports/logo.svg";

const COUNTRY_CODES = [
  { code: "+507", flag: "🇵🇦", name: "Panamá" },
  { code: "+1",   flag: "🇺🇸", name: "EE.UU." },
  { code: "+506", flag: "🇨🇷", name: "Costa Rica" },
  { code: "+57",  flag: "🇨🇴", name: "Colombia" },
  { code: "+52",  flag: "🇲🇽", name: "México" },
];

type VerifyMethod = "correo" | "celular";
type Step = "method" | "code" | "newPassword" | "success";

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
  color: "var(--primary-black)",
};

const errorStyle: React.CSSProperties = {
  fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif",
  fontSize: "12px",
  color: "var(--error-red)",
};

export function ForgotPassword() {
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>("method");
  const [verifyMethod, setVerifyMethod] = useState<VerifyMethod>("correo");

  // Method step
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState(COUNTRY_CODES[0]);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);

  // Code step
  const [code, setCode] = useState(["", "", "", "", "", ""]);

  // New password step
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>, field: string) => {
    if (!errors[field]) e.currentTarget.style.borderColor = "var(--primary-yellow)";
  };
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>, field: string) => {
    if (!errors[field]) e.currentTarget.style.borderColor = "var(--gray-20)";
  };

  const handleSendCode = () => {
    const e: Record<string, string> = {};
    if (verifyMethod === "correo") {
      if (!email.trim()) e.email = "Ingresa tu correo";
      else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Correo inválido";
    } else {
      if (!phone.trim()) e.phone = "Ingresa tu número";
    }
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    setIsLoading(true);
    setTimeout(() => { setIsLoading(false); setStep("code"); }, 1000);
  };

  const handleVerifyCode = () => {
    const fullCode = code.join("");
    if (fullCode.length < 6) {
      setErrors({ code: "Ingresa el código de 6 dígitos" });
      return;
    }
    setErrors({});
    setIsLoading(true);
    setTimeout(() => { setIsLoading(false); setStep("newPassword"); }, 1000);
  };

  const handleCodeInput = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);
    setErrors({});
    if (value && index < 5) {
      const next = document.getElementById(`otp-${index + 1}`);
      next?.focus();
    }
  };

  const handleCodeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      const prev = document.getElementById(`otp-${index - 1}`);
      prev?.focus();
    }
  };

  const handleSetNewPassword = () => {
    const e: Record<string, string> = {};
    if (!newPassword) e.newPassword = "Obligatorio";
    else if (newPassword.length < 8) e.newPassword = "Mín. 8 caracteres";
    if (newPassword !== confirmPassword) e.confirmPassword = "Las contraseñas no coinciden";
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    setIsLoading(true);
    setTimeout(() => { setIsLoading(false); setStep("success"); }, 1000);
  };

  const maskedDestination = verifyMethod === "correo"
    ? email.replace(/(.{2})(.*)(@.*)/, "$1***$3")
    : `${countryCode.code} *** ${phone.slice(-4)}`;

  return (
    <div className="flex flex-col h-full relative auth-gradient !overflow-y-auto overflow-x-hidden">
      {/* Header */}
      <div className="relative z-20 flex items-center justify-between px-6 pt-12 pb-6">
        <button aria-label="Volver"
          onClick={() => step === "method" ? navigate("/login") : setStep(step === "code" ? "method" : step === "newPassword" ? "code" : "method")}
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
        <div className="w-full flex flex-col gap-6">

          {/* ── STEP 1: Method ── */}
          {step === "method" && (
            <>
              <div>
                <h1 style={{ fontFamily: "'Bebas Neue', Arial, sans-serif", fontSize: "32px", fontWeight: "var(--font-weight-normal)" as any, letterSpacing: "1px", color: "var(--primary-black)", lineHeight: "1.1", margin: 0 }}>
                  Olvidaste tu contraseña
                </h1>
                <p style={{ fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif", fontSize: "15px", color: "var(--gray-60)", marginTop: "6px", marginBottom: 0 }}>
                  Selecciona cómo quieres verificar tu identidad
                </p>
              </div>

              {/* Method Cards */}
              <div className="flex flex-col gap-3">
                {/* Email Option */}
                <button
                  type="button"
                  onClick={() => setVerifyMethod("correo")}
                  className="w-full flex items-center gap-4 transition-all"
                  style={{
                    padding: "16px",
                    borderRadius: "var(--radius)",
                    border: verifyMethod === "correo" ? "2px solid var(--primary-yellow)" : "1px solid var(--gray-20)",
                    backgroundColor: verifyMethod === "correo" ? "rgba(255,238,0,0.05)" : "var(--primary-white)",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <div
                    className="flex items-center justify-center flex-shrink-0"
                    style={{
                      width: "40px", height: "40px",
                      borderRadius: "50%",
                      backgroundColor: verifyMethod === "correo" ? "var(--primary-yellow)" : "var(--gray-8)",
                    }}
                  >
                    <Mail size={20} strokeWidth={2} color={verifyMethod === "correo" ? "var(--primary-black)" : "var(--gray-60)"} />
                  </div>
                  <div>
                    <p style={{ fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif", fontSize: "14px", fontWeight: "var(--font-weight-medium)" as any, color: "var(--primary-black)", margin: 0 }}>
                      Correo electrónico
                    </p>
                    <p style={{ fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif", fontSize: "12px", color: "var(--gray-60)", margin: "2px 0 0" }}>
                      Te enviaremos un código de verificación
                    </p>
                  </div>
                </button>

                {/* Phone Option */}
                <button
                  type="button"
                  onClick={() => setVerifyMethod("celular")}
                  className="w-full flex items-center gap-4 transition-all"
                  style={{
                    padding: "16px",
                    borderRadius: "var(--radius)",
                    border: verifyMethod === "celular" ? "2px solid var(--primary-yellow)" : "1px solid var(--gray-20)",
                    backgroundColor: verifyMethod === "celular" ? "rgba(255,238,0,0.05)" : "var(--primary-white)",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <div
                    className="flex items-center justify-center flex-shrink-0"
                    style={{
                      width: "40px", height: "40px",
                      borderRadius: "50%",
                      backgroundColor: verifyMethod === "celular" ? "var(--primary-yellow)" : "var(--gray-8)",
                    }}
                  >
                    <Phone size={20} strokeWidth={2} color={verifyMethod === "celular" ? "var(--primary-black)" : "var(--gray-60)"} />
                  </div>
                  <div>
                    <p style={{ fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif", fontSize: "14px", fontWeight: "var(--font-weight-medium)" as any, color: "var(--primary-black)", margin: 0 }}>
                      Número de celular
                    </p>
                    <p style={{ fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif", fontSize: "12px", color: "var(--gray-60)", margin: "2px 0 0" }}>
                      Recibirás un SMS con tu código
                    </p>
                  </div>
                </button>
              </div>

              {/* Dynamic Input */}
              {verifyMethod === "correo" ? (
                <div className="flex flex-col gap-[6px]">
                  <label style={labelStyle}>Correo electrónico</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setErrors({}); }}
                    placeholder="tu@correo.com"
                    style={inputStyle(!!errors.email)}
                    onFocus={(e) => handleFocus(e, "email")}
                    onBlur={(e) => handleBlur(e, "email")}
                  />
                  {errors.email && <span style={errorStyle}>{errors.email}</span>}
                </div>
              ) : (
                <div className="flex flex-col gap-[6px]">
                  <label style={labelStyle}>Número de celular</label>
                  <div className="flex gap-2">
                    <div className="relative" style={{ flexShrink: 0 }}>
                      <button
                        type="button"
                        onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                        className="flex items-center"
                        style={{
                          height: "38px",
                          borderRadius: "var(--radius)",
                          padding: "8px 10px",
                          border: "1px solid var(--gray-20)",
                          backgroundColor: "var(--primary-white)",
                          cursor: "pointer",
                          gap: "4px",
                        }}
                      >
                        <span style={{ fontSize: "16px" }}>{countryCode.flag}</span>
                        <span style={{ fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif", fontSize: "13px", color: "var(--primary-black)" }}>{countryCode.code}</span>
                        <ChevronDown size={14} color="var(--gray-60)" />
                      </button>
                      {showCountryDropdown && (
                        <div
                          className="absolute top-full left-0 mt-1 z-50"
                          style={{
                            backgroundColor: "var(--primary-white)",
                            border: "1px solid var(--gray-20)",
                            borderRadius: "var(--radius)",
                            boxShadow: "var(--elevation-sm)",
                            minWidth: "180px",
                            maxHeight: "200px",
                            overflowY: "auto",
                          }}
                        >
                          {COUNTRY_CODES.map((c) => (
                            <button
                              key={c.code + c.name}
                              type="button"
                              onClick={() => { setCountryCode(c); setShowCountryDropdown(false); }}
                              className="w-full"
                              style={{
                                padding: "10px 12px",
                                fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif",
                                fontSize: "13px",
                                color: "var(--primary-black)",
                                backgroundColor: countryCode.code === c.code ? "var(--gray-3)" : "transparent",
                                border: "none",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                              }}
                            >
                              <span style={{ fontSize: "16px" }}>{c.flag}</span>
                              <span style={{ color: "var(--gray-60)" }}>{c.code}</span>
                              <span>{c.name}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => { setPhone(e.target.value); setErrors({}); }}
                      placeholder="6000-0000"
                      style={{ ...inputStyle(!!errors.phone), flex: 1 }}
                      onFocus={(e) => handleFocus(e, "phone")}
                      onBlur={(e) => handleBlur(e, "phone")}
                    />
                  </div>
                  {errors.phone && <span style={errorStyle}>{errors.phone}</span>}
                </div>
              )}

              <button
                onClick={handleSendCode}
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
                  {isLoading ? "Enviando..." : "Enviar código"}
                </span>
              </button>

              <div className="flex items-center justify-center">
                <button
                  onClick={() => navigate("/login")}
                  style={{
                    fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif",
                    fontSize: "14px",
                    color: "var(--gray-60)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    textDecoration: "underline",
                    textUnderlineOffset: "2px",
                  }}
                >
                  Volver al inicio de sesión
                </button>
              </div>
            </>
          )}

          {/* ── STEP 2: Code Verification ── */}
          {step === "code" && (
            <>
              <div>
                <h1 style={{ fontFamily: "'Bebas Neue', Arial, sans-serif", fontSize: "32px", fontWeight: "var(--font-weight-normal)" as any, letterSpacing: "1px", color: "var(--primary-black)", lineHeight: "1.1", margin: 0 }}>
                  Ingresa el código
                </h1>
                <p style={{ fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif", fontSize: "15px", color: "var(--gray-60)", marginTop: "6px", marginBottom: 0 }}>
                  Enviamos un código de 6 dígitos a{" "}
                  <span style={{ color: "var(--primary-black)", fontWeight: "var(--font-weight-medium)" as any }}>{maskedDestination}</span>
                </p>
              </div>

              {/* OTP Inputs */}
              <div className="flex gap-2 justify-center">
                {code.map((digit, i) => (
                  <input
                    key={i}
                    id={`otp-${i}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleCodeInput(e.target.value, i)}
                    onKeyDown={(e) => handleCodeKeyDown(e, i)}
                    style={{
                      width: "46px",
                      height: "54px",
                      borderRadius: "var(--radius)",
                      border: errors.code ? "1px solid var(--error-red)" : digit ? "2px solid var(--primary-yellow)" : "1px solid var(--gray-20)",
                      fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif",
                      fontSize: "20px",
                      fontWeight: "var(--font-weight-medium)" as any,
                      color: "var(--primary-black)",
                      backgroundColor: "var(--primary-white)",
                      outline: "none",
                      textAlign: "center",
                    }}
                    onFocus={(e) => { if (!digit) e.currentTarget.style.borderColor = "var(--primary-yellow)"; }}
                    onBlur={(e) => { if (!digit) e.currentTarget.style.borderColor = "var(--gray-20)"; }}
                  />
                ))}
              </div>
              {errors.code && <p style={{ ...errorStyle, textAlign: "center" }}>{errors.code}</p>}

              <button
                onClick={handleVerifyCode}
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
                  {isLoading ? "Verificando..." : "Verificar código"}
                </span>
              </button>

              <div className="flex items-center justify-center gap-1">
                <span style={{ fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif", fontSize: "14px", color: "var(--gray-60)" }}>¿No recibiste el código?</span>
                <button
                  onClick={() => handleSendCode()}
                  style={{
                    fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif",
                    fontSize: "14px",
                    fontWeight: "var(--font-weight-medium)" as any,
                    color: "var(--info-blue)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  Reenviar
                </button>
              </div>
            </>
          )}

          {/* ── STEP 3: New Password ── */}
          {step === "newPassword" && (
            <>
              <div>
                <h1 style={{ fontFamily: "'Bebas Neue', Arial, sans-serif", fontSize: "32px", fontWeight: "var(--font-weight-normal)" as any, letterSpacing: "1px", color: "var(--primary-black)", lineHeight: "1.1", margin: 0 }}>
                  Nueva contraseña
                </h1>
                <p style={{ fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif", fontSize: "15px", color: "var(--gray-60)", marginTop: "6px", marginBottom: 0 }}>
                  Crea una contraseña segura para tu cuenta
                </p>
              </div>

              <div className="flex flex-col gap-4">
                {/* New Password */}
                <div className="flex flex-col gap-[6px]">
                  <label style={labelStyle}>Nueva contraseña</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => { setNewPassword(e.target.value); setErrors(prev => ({ ...prev, newPassword: undefined as any })); }}
                      placeholder="Mín. 8 caracteres"
                      style={{ ...inputStyle(!!errors.newPassword), paddingRight: "44px" }}
                      onFocus={(e) => handleFocus(e, "newPassword")}
                      onBlur={(e) => handleBlur(e, "newPassword")}
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
                  {errors.newPassword && <span style={errorStyle}>{errors.newPassword}</span>}
                </div>

                {/* Confirm Password */}
                <div className="flex flex-col gap-[6px]">
                  <label style={labelStyle}>Confirmar contraseña</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); setErrors(prev => ({ ...prev, confirmPassword: undefined as any })); }}
                    placeholder="Repite tu contraseña"
                    style={inputStyle(!!errors.confirmPassword)}
                    onFocus={(e) => handleFocus(e, "confirmPassword")}
                    onBlur={(e) => handleBlur(e, "confirmPassword")}
                  />
                  {errors.confirmPassword && <span style={errorStyle}>{errors.confirmPassword}</span>}
                </div>
              </div>

              <button
                onClick={handleSetNewPassword}
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
                  {isLoading ? "Guardando..." : "Guardar nueva contraseña"}
                </span>
              </button>
            </>
          )}

          {/* ── STEP 4: Success ── */}
          {step === "success" && (
            <div className="flex flex-col items-center gap-6 py-8">
              <div
                className="flex items-center justify-center"
                style={{
                  width: "80px", height: "80px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(88,202,138,0.12)",
                }}
              >
                <CheckCircle2 size={40} strokeWidth={2} color="var(--success-green)" />
              </div>
              <div className="text-center">
                <h1 style={{ fontFamily: "'Bebas Neue', Arial, sans-serif", fontSize: "32px", fontWeight: "var(--font-weight-normal)" as any, letterSpacing: "1px", color: "var(--primary-black)", lineHeight: "1.1", margin: 0 }}>
                  ¡Contraseña actualizada!
                </h1>
                <p style={{ fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif", fontSize: "15px", color: "var(--gray-60)", marginTop: "8px" }}>
                  Tu contraseña fue cambiada exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.
                </p>
              </div>
              <button
                onClick={() => navigate("/login")}
                className="w-full flex items-center justify-center transition-transform hover:scale-[1.01] active:scale-[0.99]"
                style={{
                  height: "44px",
                  borderRadius: "var(--radius)",
                  backgroundColor: "var(--primary-yellow)",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <span style={{ fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif", fontSize: "14px", fontWeight: "var(--font-weight-medium)" as any, color: "var(--primary-black)" }}>
                  Iniciar sesión
                </span>
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
