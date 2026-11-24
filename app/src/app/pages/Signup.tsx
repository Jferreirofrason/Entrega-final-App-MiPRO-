import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Eye, EyeOff, CheckCircle2, ChevronDown } from "lucide-react";
import logoUrl from "../../imports/logo.svg";
import { LegalSheet } from "../components/LegalSheet";

const COUNTRY_CODES = [
  { code: "+507", flag: "🇵🇦", name: "Panamá" },
  { code: "+1",   flag: "🇺🇸", name: "EE.UU." },
  { code: "+506", flag: "🇨🇷", name: "Costa Rica" },
  { code: "+57",  flag: "🇨🇴", name: "Colombia" },
  { code: "+52",  flag: "🇲🇽", name: "México" },
  { code: "+58",  flag: "🇻🇪", name: "Venezuela" },
  { code: "+34",  flag: "🇪🇸", name: "España" },
];

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
  boxSizing: "border-box",
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

export function Signup() {
  const navigate = useNavigate();

  // Personal info
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");

  // Legal Acceptance State
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isLegalSheetOpen, setIsLegalSheetOpen] = useState(false);
  const [legalSheetType, setLegalSheetType] = useState<"terms" | "privacy">("terms");

  // ID
  const [idType, setIdType] = useState<"cedula" | "pasaporte">("cedula");
  const [idNumber, setIdNumber] = useState("");
  const [showIdDropdown, setShowIdDropdown] = useState(false);

  // Phone
  const [countryCode, setCountryCode] = useState(COUNTRY_CODES[0]);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [phone, setPhone] = useState("");

  // Auth
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const passwordChecks = [
    { label: "Mínimo 8 caracteres", valid: password.length >= 8 },
    { label: "Al menos una mayúscula", valid: /[A-Z]/.test(password) },
    { label: "Al menos un número", valid: /[0-9]/.test(password) },
  ];

  const validate = () => {
    const e: Record<string, string> = {};
    if (!nombre.trim()) e.nombre = "Obligatorio";
    if (!apellido.trim()) e.apellido = "Obligatorio";
    if (!idNumber.trim()) e.idNumber = "Obligatorio";
    if (!phone.trim()) e.phone = "Obligatorio";
    if (!email.trim()) e.email = "Obligatorio";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Correo inválido";
    if (!password) e.password = "Obligatorio";
    else if (password.length < 8) e.password = "Mín. 8 caracteres";
    if (password !== confirmPassword) e.confirmPassword = "Las contraseñas no coinciden";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSignup = () => {
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
        <div className="w-full flex flex-col gap-6">
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
              Crea tu cuenta
            </h1>
            <p
              style={{
                fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif",
                fontSize: "15px",
                color: "var(--gray-60)",
                marginTop: "6px",
                marginBottom: 0,
              }}
            >
              Contrata a los mejores profesionales en minutos
            </p>
          </div>



          {/* Form Fields */}
          <div className="flex flex-col gap-4">

            {/* Nombre + Apellido */}
            <div className="flex gap-3">
              <div className="flex flex-col gap-[6px] flex-1">
                <label style={labelStyle}>Nombre</label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => { setNombre(e.target.value); setErrors(prev => ({ ...prev, nombre: undefined as any })); }}
                  placeholder="Juan"
                  style={inputStyle(!!errors.nombre)}
                  onFocus={(e) => handleFocus(e, "nombre")}
                  onBlur={(e) => handleBlur(e, "nombre")}
                />
                {errors.nombre && <span style={errorStyle}>{errors.nombre}</span>}
              </div>
              <div className="flex flex-col gap-[6px] flex-1">
                <label style={labelStyle}>Apellido</label>
                <input
                  type="text"
                  value={apellido}
                  onChange={(e) => { setApellido(e.target.value); setErrors(prev => ({ ...prev, apellido: undefined as any })); }}
                  placeholder="Pérez"
                  style={inputStyle(!!errors.apellido)}
                  onFocus={(e) => handleFocus(e, "apellido")}
                  onBlur={(e) => handleBlur(e, "apellido")}
                />
                {errors.apellido && <span style={errorStyle}>{errors.apellido}</span>}
              </div>
            </div>

            {/* ID Type + Number */}
            <div className="flex flex-col gap-[6px]">
              <label style={labelStyle}>Número de identificación</label>
              <div className="flex gap-2">
                {/* ID Type Dropdown */}
                <div className="relative" style={{ flexShrink: 0 }}>
                  <button
                    type="button"
                    onClick={() => setShowIdDropdown(!showIdDropdown)}
                    className="flex items-center gap-1"
                    style={{
                      height: "38px",
                      borderRadius: "var(--radius)",
                      padding: "8px 10px",
                      border: "1px solid var(--gray-20)",
                      backgroundColor: "var(--primary-white)",
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                      gap: "4px",
                    }}
                  >
                    <span style={{ fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif", fontSize: "13px", color: "var(--primary-black)" }}>
                      {idType === "cedula" ? "Cédula" : "Pasaporte"}
                    </span>
                    <ChevronDown size={14} color="var(--gray-60)" />
                  </button>
                  {showIdDropdown && (
                    <div
                      className="absolute top-full left-0 mt-1 z-50"
                      style={{
                        backgroundColor: "var(--primary-white)",
                        border: "1px solid var(--gray-20)",
                        borderRadius: "var(--radius)",
                        boxShadow: "var(--elevation-sm)",
                        minWidth: "120px",
                        overflow: "hidden",
                      }}
                    >
                      {(["cedula", "pasaporte"] as const).map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => { setIdType(type); setShowIdDropdown(false); }}
                          className="w-full text-left"
                          style={{
                            padding: "10px 12px",
                            fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif",
                            fontSize: "13px",
                            color: idType === type ? "var(--primary-black)" : "var(--gray-60)",
                            backgroundColor: idType === type ? "var(--gray-3)" : "transparent",
                            border: "none",
                            cursor: "pointer",
                            display: "block",
                            width: "100%",
                          }}
                        >
                          {type === "cedula" ? "Cédula" : "Pasaporte"}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* ID Number Input */}
                <input
                  type="text"
                  value={idNumber}
                  onChange={(e) => { setIdNumber(e.target.value); setErrors(prev => ({ ...prev, idNumber: undefined as any })); }}
                  placeholder={idType === "cedula" ? "8-888-8888" : "A12345678"}
                  style={{ ...inputStyle(!!errors.idNumber), flex: 1 }}
                  onFocus={(e) => handleFocus(e, "idNumber")}
                  onBlur={(e) => handleBlur(e, "idNumber")}
                />
              </div>
              {errors.idNumber && <span style={errorStyle}>{errors.idNumber}</span>}
            </div>

            {/* Phone */}
            <div className="flex flex-col gap-[6px]">
              <label style={labelStyle}>Número de celular</label>
              <div className="flex gap-2">
                {/* Country Code Dropdown */}
                <div className="relative" style={{ flexShrink: 0 }}>
                  <button
                    type="button"
                    onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                    className="flex items-center gap-1"
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
                    <span style={{ fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif", fontSize: "13px", color: "var(--primary-black)" }}>
                      {countryCode.code}
                    </span>
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
                        overflow: "hidden",
                        maxHeight: "220px",
                        overflowY: "auto",
                      }}
                    >
                      {COUNTRY_CODES.map((c) => (
                        <button
                          key={c.code + c.name}
                          type="button"
                          onClick={() => { setCountryCode(c); setShowCountryDropdown(false); }}
                          className="w-full flex items-center gap-2 text-left"
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

                {/* Phone Number Input */}
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => { setPhone(e.target.value); setErrors(prev => ({ ...prev, phone: undefined as any })); }}
                  placeholder="6000-0000"
                  style={{ ...inputStyle(!!errors.phone), flex: 1 }}
                  onFocus={(e) => handleFocus(e, "phone")}
                  onBlur={(e) => handleBlur(e, "phone")}
                />
              </div>
              {errors.phone && <span style={errorStyle}>{errors.phone}</span>}
            </div>

            {/* Email */}
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
              <label style={labelStyle}>Contraseña</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrors(prev => ({ ...prev, password: undefined as any })); }}
                  placeholder="Crea una contraseña segura"
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
              {password.length > 0 && (
                <div className="flex flex-col gap-2 mt-1">
                  {passwordChecks.map((check, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <CheckCircle2 size={13} strokeWidth={2} color={check.valid ? "var(--success-green)" : "var(--gray-20)"} />
                      <span style={{ fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif", fontSize: "12px", color: check.valid ? "var(--success-green)" : "var(--gray-40)" }}>
                        {check.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
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

            {/* C1.1, C1.2, C1.3: Checkbox para Términos y Condiciones */}
            <div className="flex items-start gap-2.5 mt-2 mb-1">
              <input
                id="accept-terms-checkbox"
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-0.5 h-4 w-4 bg-white accent-[#FFEE00] rounded border-gray-300 focus:ring-[#FFEE00] cursor-pointer shrink-0"
              />
              <label 
                htmlFor="accept-terms-checkbox"
                className="text-[12px] text-gray-600 leading-tight select-none cursor-pointer"
                style={{ fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif" }}
              >
                Acepto los{" "}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setLegalSheetType("terms");
                    setIsLegalSheetOpen(true);
                  }}
                  className="text-blue-600 underline font-semibold bg-transparent border-none p-0 cursor-pointer inline hover:text-blue-800 transition-colors"
                >
                  Términos y condiciones
                </button>
                {" "}y las{" "}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setLegalSheetType("privacy");
                    setIsLegalSheetOpen(true);
                  }}
                  className="text-blue-600 underline font-semibold bg-transparent border-none p-0 cursor-pointer inline hover:text-blue-800 transition-colors"
                >
                  Políticas de privacidad
                </button>
                .
              </label>
            </div>
          </div>

          {/* Submit */}
          <button
            onClick={handleSignup}
            disabled={isLoading || !acceptedTerms}
            className="w-full flex items-center justify-center transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
            style={{
              height: "44px",
              borderRadius: "var(--radius)",
              backgroundColor: "var(--primary-yellow)",
              border: "none",
              cursor: (isLoading || !acceptedTerms) ? "not-allowed" : "pointer",
              marginTop: "4px",
            }}
          >
            <span style={{ fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif", fontSize: "14px", fontWeight: "var(--font-weight-medium)" as any, color: "var(--primary-black)" }}>
              {isLoading ? "Creando cuenta..." : "Crear cuenta"}
            </span>
          </button>

          {/* Bottom Link */}
          <div className="flex items-center justify-center pb-4">
            <span style={{ fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif", fontSize: "14px", color: "var(--gray-60)" }}>
              ¿Ya tienes cuenta?{" "}
            </span>
            <button
              onClick={() => navigate("/login")}
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
              Inicia sesión aquí
            </button>
          </div>
        </div>
      </div>

      {/* C2.1, C2.2, C2.3, C2.4: Modales inferior para documentos legales */}
      <LegalSheet 
        isOpen={isLegalSheetOpen}
        onClose={() => setIsLegalSheetOpen(false)}
        type={legalSheetType}
      />
    </div>
  );
}
