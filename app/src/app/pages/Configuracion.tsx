import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, User, Mail, Phone, MapPin, Lock, ChevronRight, Check, Eye, EyeOff, CreditCard, IdCard, Plus, Edit, X, Search } from "lucide-react";
import { searchAddresses, AddressResult } from "../../services/mapsService";

type Section = "main" | "personal" | "direcciones" | "password";

export function Configuracion() {
  const navigate = useNavigate();
  const [section, setSection] = useState<Section>("main");
  const [saved, setSaved] = useState(false);
  // Información personal abre en SOLO LECTURA. Entrar a mirar un dato y
  // encontrarse el formulario abierto invita a cambiarlo sin querer, y no
  // da ninguna señal de que algo quedó modificado.
  const [editandoPersonal, setEditandoPersonal] = useState(false);
  // Lo que había antes de editar, para que "Cancelar" vuelva de verdad.
  const [respaldoPersonal, setRespaldoPersonal] = useState<{
    firstName: string; lastName: string; countryCode: string;
    phone: string; docType: "cedula" | "pasaporte"; docNumber: string;
  } | null>(null);

  // Personal info state
  const [firstName, setFirstName] = useState("María");
  const [lastName, setLastName] = useState("González");
  const [countryCode, setCountryCode] = useState("+507");
  const [phone, setPhone] = useState("6123-4567");
  const [docType, setDocType] = useState<"cedula" | "pasaporte">("cedula");
  const [docNumber, setDocNumber] = useState("8-123-4567");

  // Saved addresses
  const [addresses, setAddresses] = useState([
    {
      id: 1,
      label: "Casa",
      address: "Av. Siempre Viva 742, Colonia Centro",
      details: "Casa amarilla, portón negro",
    },
    {
      id: 2,
      label: "Trabajo",
      address: "Calle 50, Torre Global Bank, Piso 8",
      details: "Oficina 805",
    },
  ]);

  // New address form state
  const [showAddAddressForm, setShowAddAddressForm] = useState(false);
  const [addressSearch, setAddressSearch] = useState('');
  const [searchResults, setSearchResults] = useState<AddressResult[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<string | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [addressDetails, setAddressDetails] = useState('');
  const [addressDistrito, setAddressDistrito] = useState('');
  const [addressCorregimiento, setAddressCorregimiento] = useState('');
  const [addressBarrio, setAddressBarrio] = useState('');
  const [addressCalle, setAddressCalle] = useState('');
  const [addressPiso, setAddressPiso] = useState('');
  const [addressIsBuilding, setAddressIsBuilding] = useState(false);
  const [addressHasElevator, setAddressHasElevator] = useState(false);
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (addressSearch.length > 2) {
        setIsSearchingAddress(true);
        const results = await searchAddresses(addressSearch);
        setSearchResults(results);
        setIsSearchingAddress(false);
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [addressSearch]);

  // Password state
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwError, setPwError] = useState("");

  const handleSave = () => {
    if (section === "password") {
      if (!currentPw || !newPw || !confirmPw) {
        setPwError("Completa todos los campos.");
        return;
      }
      if (newPw.length < 6) {
        setPwError("La contraseña debe tener al menos 6 caracteres.");
        return;
      }
      if (newPw !== confirmPw) {
        setPwError("Las contraseñas no coinciden.");
        return;
      }
      setPwError("");
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
    }
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setSection("main");
    }, 1200);
  };

  const settingRows = [
    { icon: User, label: "Información personal", sub: `${firstName} ${lastName}`, section: "personal" as Section },
    { icon: MapPin, label: "Direcciones", sub: `${addresses.length} direcciones guardadas`, section: "direcciones" as Section },
    { icon: Lock, label: "Cambiar contraseña", sub: "••••••••", section: "password" as Section },
  ];

  const empezarAEditar = () => {
    setRespaldoPersonal({ firstName, lastName, countryCode, phone, docType, docNumber });
    setEditandoPersonal(true);
  };

  const cancelarEdicion = () => {
    if (respaldoPersonal) {
      setFirstName(respaldoPersonal.firstName);
      setLastName(respaldoPersonal.lastName);
      setCountryCode(respaldoPersonal.countryCode);
      setPhone(respaldoPersonal.phone);
      setDocType(respaldoPersonal.docType);
      setDocNumber(respaldoPersonal.docNumber);
    }
    setEditandoPersonal(false);
  };

  const inputStyle = (focused = false): React.CSSProperties => ({
    height: "38px",
    borderRadius: "8px",
    border: focused ? "1px solid var(--primary-yellow)" : "1px solid var(--gray-20)",
    backgroundColor: "var(--primary-white)",
    padding: "8px 12px",
    fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif",
    fontSize: "14px",
    color: "var(--primary-black)",
    width: "100%",
    outline: "none",
    boxSizing: "border-box" as const,
  });

  const labelStyle: React.CSSProperties = {
    fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif",
    fontSize: "13px",
    fontWeight: "var(--font-weight-medium)" as any,
    color: "var(--gray-60)",
    marginBottom: "6px",
    display: "block",
  };

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
          onClick={() => {
            if (section === "main") return navigate("/");
            setEditandoPersonal(false);
            setSection("main");
          }}
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
            {section === "main" && "Configuración"}
            {section === "personal" && "Información personal"}
            {section === "direcciones" && "Direcciones"}
            {section === "password" && "Cambiar contraseña"}
          </h1>
        </div>
      </header>

      {/* Main list */}
      {section === "main" && (
        <div className="flex-1 overflow-y-auto px-4 py-4" style={{ backgroundColor: "var(--primary-white)" }}>
          <div className="flex flex-col gap-3">
            {settingRows.map((row) => (
              <button
                key={row.section}
                onClick={() => {
                  setEditandoPersonal(false);
                  setSection(row.section);
                }}
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
                      width: "36px",
                      height: "36px",
                      borderRadius: "12px",
                      backgroundColor: "var(--gray-8)",
                      flexShrink: 0,
                    }}
                  >
                    <row.icon size={18} strokeWidth={2} color="var(--primary-black)" />
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
                      {row.label}
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
                      {row.sub}
                    </p>
                  </div>
                </div>
                <ChevronRight size={20} strokeWidth={2} color="var(--gray-40)" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Información personal, EN LECTURA: los datos como datos y un botón
          para editarlos. Es el estado por defecto. */}
      {section === "personal" && !editandoPersonal && (
        <div className="flex-1 overflow-y-auto px-4 py-4" style={{ backgroundColor: "var(--primary-white)" }}>
          <div
            className="rounded-lg"
            style={{
              backgroundColor: "var(--primary-white)",
              border: "1px solid var(--gray-8)",
              boxShadow: "var(--elevation-sm)",
              padding: "4px 16px",
            }}
          >
            {[
              { etiqueta: "Nombre", valor: `${firstName} ${lastName}`.trim() },
              { etiqueta: "Teléfono", valor: `${countryCode} ${phone}`.trim() },
              {
                etiqueta: docType === "cedula" ? "Cédula" : "Pasaporte",
                valor: docNumber,
              },
            ].map((d, i) => (
              <div
                key={d.etiqueta}
                className="flex items-baseline justify-between"
                style={{
                  gap: "16px",
                  padding: "13px 0",
                  borderTop: i === 0 ? "none" : "1px solid var(--gray-8)",
                }}
              >
                <span
                  style={{
                    fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif",
                    fontSize: "13px",
                    color: "var(--gray-60)",
                    flexShrink: 0,
                  }}
                >
                  {d.etiqueta}
                </span>
                <span
                  className="text-right min-w-0"
                  style={{
                    fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif",
                    fontSize: "14px",
                    fontWeight: d.valor ? ("var(--font-weight-medium)" as any) : "var(--font-weight-normal)",
                    color: d.valor ? "var(--primary-black)" : "var(--gray-40)",
                  }}
                >
                  {d.valor || "Sin cargar"}
                </span>
              </div>
            ))}
          </div>

          <button
            onClick={empezarAEditar}
            className="w-full flex items-center justify-center gap-2 transition-opacity hover:opacity-90 active:scale-[0.99]"
            style={{
              marginTop: "16px",
              height: "44px",
              borderRadius: "12px",
              border: "1px solid var(--gray-20)",
              backgroundColor: "var(--primary-white)",
              cursor: "pointer",
            }}
          >
            <Edit size={16} strokeWidth={2} color="var(--primary-black)" />
            <span
              style={{
                fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif",
                fontSize: "15px",
                fontWeight: "var(--font-weight-medium)" as any,
                color: "var(--primary-black)",
              }}
            >
              Editar
            </span>
          </button>
        </div>
      )}

      {/* Personal info form */}
      {section === "personal" && editandoPersonal && (
        <div className="flex-1 overflow-y-auto px-4 py-4" style={{ backgroundColor: "var(--primary-white)" }}>
          <div
            className="rounded-lg p-4"
            style={{ backgroundColor: "var(--primary-white)", border: "1px solid var(--gray-8)", boxShadow: "var(--elevation-sm)", display: "flex", flexDirection: "column", gap: "16px" }}
          >
            <div>
              <label style={labelStyle}>Nombre</label>
              <div className="relative flex items-center">
                <User size={16} strokeWidth={2} color="var(--gray-40)" style={{ position: "absolute", left: "12px" }} />
                <input
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  style={{ ...inputStyle(), paddingLeft: "36px" }}
                  placeholder="Nombre"
                />
              </div>
            </div>
            
            <div>
              <label style={labelStyle}>Apellido</label>
              <div className="relative flex items-center">
                <User size={16} strokeWidth={2} color="var(--gray-40)" style={{ position: "absolute", left: "12px" }} />
                <input
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  style={{ ...inputStyle(), paddingLeft: "36px" }}
                  placeholder="Apellido"
                />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Teléfono</label>
              <div className="flex gap-2">
                <select
                  value={countryCode}
                  onChange={e => setCountryCode(e.target.value)}
                  style={{
                    ...inputStyle(),
                    width: "100px",
                    flexShrink: 0,
                  }}
                >
                  <option value="+507">🇵🇦 +507</option>
                  <option value="+52">🇲🇽 +52</option>
                  <option value="+1">🇺🇸 +1</option>
                  <option value="+34">🇪🇸 +34</option>
                </select>
                <div className="relative flex items-center flex-1">
                  <Phone size={16} strokeWidth={2} color="var(--gray-40)" style={{ position: "absolute", left: "12px" }} />
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    style={{ ...inputStyle(), paddingLeft: "36px" }}
                    placeholder="6123-4567"
                  />
                </div>
              </div>
            </div>

            <div>
              <label style={labelStyle}>Documento de identidad</label>
              <div className="flex gap-2 mb-2">
                <button
                  onClick={() => setDocType("cedula")}
                  style={{
                    flex: 1,
                    height: "38px",
                    borderRadius: "8px",
                    border: docType === "cedula" ? "2px solid var(--primary-yellow)" : "1px solid var(--gray-20)",
                    backgroundColor: docType === "cedula" ? "rgba(255, 238, 0, 0.1)" : "var(--primary-white)",
                    fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif",
                    fontSize: "14px",
                    fontWeight: docType === "cedula" ? "var(--font-weight-medium)" as any : "var(--font-weight-normal)",
                    color: "var(--primary-black)",
                    cursor: "pointer",
                  }}
                >
                  Cédula
                </button>
                <button
                  onClick={() => setDocType("pasaporte")}
                  style={{
                    flex: 1,
                    height: "38px",
                    borderRadius: "8px",
                    border: docType === "pasaporte" ? "2px solid var(--primary-yellow)" : "1px solid var(--gray-20)",
                    backgroundColor: docType === "pasaporte" ? "rgba(255, 238, 0, 0.1)" : "var(--primary-white)",
                    fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif",
                    fontSize: "14px",
                    fontWeight: docType === "pasaporte" ? "var(--font-weight-medium)" as any : "var(--font-weight-normal)",
                    color: "var(--primary-black)",
                    cursor: "pointer",
                  }}
                >
                  Pasaporte
                </button>
              </div>
              <div className="relative flex items-center">
                <IdCard size={16} strokeWidth={2} color="var(--gray-40)" style={{ position: "absolute", left: "12px" }} />
                <input
                  value={docNumber}
                  onChange={e => setDocNumber(e.target.value)}
                  style={{ ...inputStyle(), paddingLeft: "36px" }}
                  placeholder={docType === "cedula" ? "8-123-4567" : "AA123456"}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Addresses section */}
      {section === "direcciones" && (
        <div className="flex-1 overflow-y-auto px-4 py-4" style={{ backgroundColor: "var(--primary-white)" }}>
          <div className="flex flex-col gap-3 mb-4">
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className="rounded-lg p-4"
                style={{
                  backgroundColor: "var(--primary-white)",
                  border: "1px solid var(--gray-8)",
                  boxShadow: "var(--elevation-sm)",
                }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <MapPin size={16} color="var(--gray-60)" />
                    <span
                      style={{
                        fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif",
                        fontSize: "14px",
                        fontWeight: "var(--font-weight-medium)" as any,
                        color: "var(--primary-black)",
                      }}
                    >
                      {addr.label}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      // Handle edit
                    }}
                    className="flex items-center justify-center transition-opacity hover:opacity-70"
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "50%",
                      backgroundColor: "var(--gray-8)",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    <Edit size={14} color="var(--primary-black)" />
                  </button>
                </div>
                <p
                  style={{
                    fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif",
                    fontSize: "13px",
                    color: "var(--gray-60)",
                    margin: 0,
                    marginBottom: "4px",
                  }}
                >
                  {addr.address}
                </p>
                {addr.details && (
                  <p
                    style={{
                      fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif",
                      fontSize: "12px",
                      color: "var(--gray-40)",
                      margin: 0,
                    }}
                  >
                    {addr.details}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Add new address form or button */}
          {showAddAddressForm ? (
            <div
              className="rounded-lg p-4"
              style={{
                backgroundColor: "var(--primary-white)",
                border: "1px solid var(--gray-20)",
                boxShadow: "var(--elevation-sm)",
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <h4 style={{ fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif", fontSize: '14px', fontWeight: 'var(--font-weight-medium)', color: 'var(--primary-black)', margin: 0 }}>
                  Nueva dirección
                </h4>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddAddressForm(false);
                    setAddressSearch('');
                    setSearchResults([]);
                    setSelectedPlace(null);
                    setShowMap(false);
                    setAddressDetails('');
                    setAddressDistrito('');
                    setAddressCorregimiento('');
                    setAddressBarrio('');
                    setAddressCalle('');
                    setAddressPiso('');
                    setAddressIsBuilding(false);
                    setAddressHasElevator(false);
                  }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}
                >
                  <X size={18} color="var(--gray-60)" />
                </button>
              </div>

              <div className="flex flex-col" style={{ gap: '12px' }}>
                {/* Mi ubicación actual button */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPlace('Mi ubicación actual');
                    setShowMap(true);
                    setAddressSearch('');
                    setSearchResults([]);
                  }}
                  className="w-full flex items-center gap-3 rounded-lg transition-all hover:opacity-80"
                  style={{
                    padding: '10px 12px',
                    border: selectedPlace === 'Mi ubicación actual' ? '2px solid var(--primary-yellow)' : '1px solid var(--gray-20)',
                    backgroundColor: selectedPlace === 'Mi ubicación actual' ? 'rgba(255,238,0,0.08)' : 'var(--primary-white)',
                    cursor: 'pointer'
                  }}
                >
                  <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--primary-yellow)' }}>
                    <MapPin size={18} color="var(--primary-black)" />
                  </div>
                  <span style={{ fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif", fontSize: '14px', fontWeight: 'var(--font-weight-medium)', color: 'var(--primary-black)' }}>
                    Usar mi ubicación actual
                  </span>
                </button>

                {/* Search input */}
                <div className="flex flex-col" style={{ gap: '6px' }}>
                  <label style={{ fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif", fontSize: '13px', lineHeight: '19px', fontWeight: 'var(--font-weight-medium)', color: 'var(--primary-black)' }}>
                    Buscar dirección o punto de referencia
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Ej. Multiplaza, Av. Balboa, Albrook..."
                      value={addressSearch}
                      onChange={(e) => {
                        setAddressSearch(e.target.value);
                      }}
                      onFocus={(e) => { e.target.style.border = '2px solid var(--primary-yellow)'; e.target.style.outline = 'none'; }}
                      onBlur={(e) => { if (!addressSearch) e.target.style.border = '1px solid var(--gray-20)'; }}
                      style={{ height: '38px', borderRadius: '8px', padding: '8px 36px 8px 12px', border: addressSearch ? '2px solid var(--primary-yellow)' : '1px solid var(--gray-20)', fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif", fontSize: '14px', color: 'var(--primary-black)', backgroundColor: 'var(--primary-white)', outline: 'none', width: '100%' }}
                    />
                    <Search size={16} color="var(--gray-60)" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                  </div>
                </div>

                {/* Search results */}
                {isSearchingAddress && (
                  <div className="flex justify-center py-4">
                    <span style={{ fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif", fontSize: '14px', color: 'var(--gray-60)' }}>Buscando...</span>
                  </div>
                )}
                {!isSearchingAddress && searchResults.length > 0 && (
                  <div className="flex flex-col rounded-lg overflow-hidden" style={{ border: '1px solid var(--gray-20)', backgroundColor: 'var(--primary-white)' }}>
                    {searchResults.map((result, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setSelectedPlace(result.title);
                          setShowMap(true);
                          setSearchResults([]);
                          setAddressSearch('');
                        }}
                        className="w-full flex items-center gap-3 transition-colors hover:bg-gray-3"
                        style={{ padding: '10px 12px', borderTop: idx === 0 ? 'none' : '1px solid var(--gray-8)', textAlign: 'left', backgroundColor: 'transparent', border: 'none', cursor: 'pointer' }}
                      >
                        <MapPin size={16} color="var(--gray-60)" style={{ flexShrink: 0 }} />
                        <div className="flex flex-col">
                          <span style={{ fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif", fontSize: '14px', color: 'var(--primary-black)' }}>{result.title}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Map when place is selected */}
                {showMap && selectedPlace && (
                  <div className="flex flex-col" style={{ gap: '8px' }}>
                    <div className="w-full rounded-lg overflow-hidden" style={{ height: '200px', backgroundColor: 'var(--gray-8)', position: 'relative', border: '1px solid var(--gray-20)' }}>
                      <div style={{ width: '100%', height: '100%', backgroundColor: '#e5e3df', position: 'relative', backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 35px, rgba(0,0,0,0.03) 35px, rgba(0,0,0,0.03) 36px), repeating-linear-gradient(90deg, transparent, transparent 35px, rgba(0,0,0,0.03) 35px, rgba(0,0,0,0.03) 36px)' }}>
                        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -100%)' }}>
                          <MapPin size={32} color="var(--error-red)" fill="var(--error-red)" />
                        </div>
                        <div className="absolute top-3 left-3 right-3 px-3 py-2 rounded-lg" style={{ backgroundColor: 'var(--primary-white)', boxShadow: 'var(--elevation-sm)' }}>
                          <p style={{ fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif", fontSize: '12px', fontWeight: 'var(--font-weight-medium)', color: 'var(--primary-black)', margin: 0 }}>{selectedPlace}</p>
                        </div>
                      </div>
                    </div>
                    <p style={{ fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif", fontSize: '12px', color: 'var(--gray-60)', margin: 0 }}>
                      Puedes ajustar el pin arrastrándolo en el mapa
                    </p>
                  </div>
                )}

                {/* Detalles de la dirección */}
                {selectedPlace && (
                  <div className="flex flex-col" style={{ gap: '12px' }}>
                    <div className="flex flex-col" style={{ gap: '6px' }}>
                      <label style={{ fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif", fontSize: '13px', lineHeight: '19px', fontWeight: 'var(--font-weight-medium)', color: 'var(--primary-black)' }}>
                        Distrito
                      </label>
                      <input
                        type="text"
                        placeholder="Ej. Panamá"
                        value={addressDistrito}
                        onChange={(e) => setAddressDistrito(e.target.value)}
                        onFocus={(e) => { e.target.style.border = '2px solid var(--primary-yellow)'; e.target.style.outline = 'none'; }}
                        onBlur={(e) => { if (!addressDistrito) e.target.style.border = '1px solid var(--gray-20)'; }}
                        style={{ height: '38px', borderRadius: '8px', padding: '8px 12px', border: addressDistrito ? '2px solid var(--primary-yellow)' : '1px solid var(--gray-20)', fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif", fontSize: '14px', color: 'var(--primary-black)', backgroundColor: 'var(--primary-white)', outline: 'none' }}
                      />
                    </div>

                    <div className="flex flex-col" style={{ gap: '6px' }}>
                      <label style={{ fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif", fontSize: '13px', lineHeight: '19px', fontWeight: 'var(--font-weight-medium)', color: 'var(--primary-black)' }}>
                        Corregimiento
                      </label>
                      <input
                        type="text"
                        placeholder="Ej. San Francisco"
                        value={addressCorregimiento}
                        onChange={(e) => setAddressCorregimiento(e.target.value)}
                        onFocus={(e) => { e.target.style.border = '2px solid var(--primary-yellow)'; e.target.style.outline = 'none'; }}
                        onBlur={(e) => { if (!addressCorregimiento) e.target.style.border = '1px solid var(--gray-20)'; }}
                        style={{ height: '38px', borderRadius: '8px', padding: '8px 12px', border: addressCorregimiento ? '2px solid var(--primary-yellow)' : '1px solid var(--gray-20)', fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif", fontSize: '14px', color: 'var(--primary-black)', backgroundColor: 'var(--primary-white)', outline: 'none' }}
                      />
                    </div>

                    <div className="flex flex-col" style={{ gap: '6px' }}>
                      <label style={{ fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif", fontSize: '13px', lineHeight: '19px', fontWeight: 'var(--font-weight-medium)', color: 'var(--primary-black)' }}>
                        Barrio
                      </label>
                      <input
                        type="text"
                        placeholder="Ej. Coco del Mar"
                        value={addressBarrio}
                        onChange={(e) => setAddressBarrio(e.target.value)}
                        onFocus={(e) => { e.target.style.border = '2px solid var(--primary-yellow)'; e.target.style.outline = 'none'; }}
                        onBlur={(e) => { if (!addressBarrio) e.target.style.border = '1px solid var(--gray-20)'; }}
                        style={{ height: '38px', borderRadius: '8px', padding: '8px 12px', border: addressBarrio ? '2px solid var(--primary-yellow)' : '1px solid var(--gray-20)', fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif", fontSize: '14px', color: 'var(--primary-black)', backgroundColor: 'var(--primary-white)', outline: 'none' }}
                      />
                    </div>

                    <div className="flex flex-col" style={{ gap: '6px' }}>
                      <label style={{ fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif", fontSize: '13px', lineHeight: '19px', fontWeight: 'var(--font-weight-medium)', color: 'var(--primary-black)' }}>
                        Calle
                      </label>
                      <input
                        type="text"
                        placeholder="Ej. Calle 50"
                        value={addressCalle}
                        onChange={(e) => setAddressCalle(e.target.value)}
                        onFocus={(e) => { e.target.style.border = '2px solid var(--primary-yellow)'; e.target.style.outline = 'none'; }}
                        onBlur={(e) => { if (!addressCalle) e.target.style.border = '1px solid var(--gray-20)'; }}
                        style={{ height: '38px', borderRadius: '8px', padding: '8px 12px', border: addressCalle ? '2px solid var(--primary-yellow)' : '1px solid var(--gray-20)', fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif", fontSize: '14px', color: 'var(--primary-black)', backgroundColor: 'var(--primary-white)', outline: 'none' }}
                      />
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <label style={{ fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif", fontSize: '14px', color: 'var(--primary-black)' }}>
                        ¿Es edificio?
                      </label>
                      <button
                        type="button"
                        onClick={() => setAddressIsBuilding(!addressIsBuilding)}
                        className="w-11 h-6 rounded-full relative transition-colors"
                        style={{ backgroundColor: addressIsBuilding ? 'var(--primary-yellow)' : 'var(--gray-20)' }}
                      >
                        <div
                          className="absolute top-1 w-4 h-4 rounded-full bg-white transition-transform"
                          style={{ left: addressIsBuilding ? 'calc(100% - 20px)' : '4px' }}
                        />
                      </button>
                    </div>

                    {addressIsBuilding && (
                      <>
                        <div className="flex flex-col" style={{ gap: '6px' }}>
                          <label style={{ fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif", fontSize: '13px', lineHeight: '19px', fontWeight: 'var(--font-weight-medium)', color: 'var(--primary-black)' }}>
                            Piso / Apartamento
                          </label>
                          <input
                            type="text"
                            placeholder="Ej. Piso 4, Apto 4B"
                            value={addressPiso}
                            onChange={(e) => setAddressPiso(e.target.value)}
                            onFocus={(e) => { e.target.style.border = '2px solid var(--primary-yellow)'; e.target.style.outline = 'none'; }}
                            onBlur={(e) => { if (!addressPiso) e.target.style.border = '1px solid var(--gray-20)'; }}
                            style={{ height: '38px', borderRadius: '8px', padding: '8px 12px', border: addressPiso ? '2px solid var(--primary-yellow)' : '1px solid var(--gray-20)', fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif", fontSize: '14px', color: 'var(--primary-black)', backgroundColor: 'var(--primary-white)', outline: 'none' }}
                          />
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <label style={{ fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif", fontSize: '14px', color: 'var(--primary-black)' }}>
                            ¿Tiene elevador?
                          </label>
                          <button
                            type="button"
                            onClick={() => setAddressHasElevator(!addressHasElevator)}
                            className="w-11 h-6 rounded-full relative transition-colors"
                            style={{ backgroundColor: addressHasElevator ? 'var(--primary-yellow)' : 'var(--gray-20)' }}
                          >
                            <div
                              className="absolute top-1 w-4 h-4 rounded-full bg-white transition-transform"
                              style={{ left: addressHasElevator ? 'calc(100% - 20px)' : '4px' }}
                            />
                          </button>
                        </div>
                      </>
                    )}

                    <div className="flex flex-col mt-2" style={{ gap: '6px' }}>
                      <label style={{ fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif", fontSize: '13px', lineHeight: '19px', fontWeight: 'var(--font-weight-medium)', color: 'var(--primary-black)' }}>
                        Detalles adicionales <span style={{ color: 'var(--gray-40)', fontWeight: 'normal' }}>(Opcional)</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Ej. Puerta amarilla, frente al parque"
                        value={addressDetails}
                        onChange={(e) => setAddressDetails(e.target.value)}
                        onFocus={(e) => { e.target.style.border = '2px solid var(--primary-yellow)'; e.target.style.outline = 'none'; }}
                        onBlur={(e) => { if (!addressDetails) e.target.style.border = '1px solid var(--gray-20)'; }}
                        style={{ height: '38px', borderRadius: '8px', padding: '8px 12px', border: addressDetails ? '2px solid var(--primary-yellow)' : '1px solid var(--gray-20)', fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif", fontSize: '14px', color: 'var(--primary-black)', backgroundColor: 'var(--primary-white)', outline: 'none' }}
                      />
                    </div>
                  </div>
                )}

                {/* Save button */}
                {selectedPlace && (
                  <button
                    type="button"
                    onClick={() => {
                      const parts = [
                        selectedPlace,
                        addressDistrito && `Distrito: ${addressDistrito}`,
                        addressCorregimiento && `Corregimiento: ${addressCorregimiento}`,
                        addressBarrio && `Barrio: ${addressBarrio}`,
                        addressCalle && `Calle: ${addressCalle}`,
                        addressIsBuilding && `Edificio`,
                        addressIsBuilding && addressPiso && `Piso/Apto: ${addressPiso}`,
                        addressIsBuilding && addressHasElevator && `Con elevador`,
                        addressDetails
                      ].filter(Boolean);
                      
                      const composed = parts.join(', ');
                      
                      setAddresses(prev => [...prev, {
                        id: prev.length + 1,
                        label: "Nueva dirección",
                        address: composed,
                        details: addressDetails
                      }]);
                      setShowAddAddressForm(false);
                      setAddressSearch('');
                      setSearchResults([]);
                      setSelectedPlace(null);
                      setShowMap(false);
                      setAddressDetails('');
                      setAddressDistrito('');
                      setAddressCorregimiento('');
                      setAddressBarrio('');
                      setAddressCalle('');
                      setAddressPiso('');
                      setAddressIsBuilding(false);
                      setAddressHasElevator(false);
                    }}
                    className="w-full h-[38px] rounded-lg flex items-center justify-center transition-all hover:opacity-90"
                    style={{ backgroundColor: 'var(--primary-yellow)', border: 'none', cursor: 'pointer', fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif", fontSize: '14px', fontWeight: 'var(--font-weight-medium)', color: 'var(--primary-black)' }}
                  >
                    Guardar y usar esta dirección
                  </button>
                )}
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowAddAddressForm(true)}
              className="w-full flex items-center justify-center gap-2 rounded-lg transition-opacity hover:opacity-80"
              style={{
                height: "52px",
                backgroundColor: "var(--primary-white)",
                border: "2px dashed var(--gray-20)",
                cursor: "pointer",
              }}
            >
              <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--primary-yellow)' }}>
                <Plus size={14} color="var(--primary-black)" />
              </div>
              <span
                style={{
                  fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif",
                  fontSize: "14px",
                  fontWeight: "var(--font-weight-medium)" as any,
                  color: "var(--primary-black)",
                }}
              >
                Agregar nueva dirección
              </span>
            </button>
          )}
        </div>
      )}

      {/* Password form */}
      {section === "password" && (
        <div className="flex-1 overflow-y-auto px-4 py-4" style={{ backgroundColor: "var(--primary-white)" }}>
          <div
            className="rounded-lg p-4"
            style={{ backgroundColor: "var(--primary-white)", border: "1px solid var(--gray-8)", boxShadow: "var(--elevation-sm)", display: "flex", flexDirection: "column", gap: "16px" }}
          >
            {[
              { label: "Contraseña actual", val: currentPw, set: setCurrentPw, show: showCurrent, toggle: () => setShowCurrent(p => !p) },
              { label: "Nueva contraseña", val: newPw, set: setNewPw, show: showNew, toggle: () => setShowNew(p => !p) },
              { label: "Confirmar nueva contraseña", val: confirmPw, set: setConfirmPw, show: showConfirm, toggle: () => setShowConfirm(p => !p) },
            ].map((f, i) => (
              <div key={i}>
                <label style={labelStyle}>{f.label}</label>
                <div className="relative flex items-center">
                  <input
                    type={f.show ? "text" : "password"}
                    value={f.val}
                    onChange={e => f.set(e.target.value)}
                    style={{ ...inputStyle(), paddingRight: "40px" }}
                    placeholder="••••••••"
                  />
                  <button
                    onClick={f.toggle}
                    style={{
                      position: "absolute",
                      right: "12px",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    {f.show ? <EyeOff size={16} color="var(--gray-40)" /> : <Eye size={16} color="var(--gray-40)" />}
                  </button>
                </div>
              </div>
            ))}
            {pwError && (
              <p
                style={{
                  fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif",
                  fontSize: "12px",
                  color: "var(--error-red)",
                  margin: 0,
                }}
              >
                {pwError}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Pie de acción. En Información personal solo existe mientras se
          edita: en lectura no hay nada que guardar. */}
      {section !== "main" && (section !== "personal" || editandoPersonal) && (
        <div
          style={{
            backgroundColor: "var(--primary-white)",
            borderTop: "1px solid var(--gray-8)",
            padding: "16px",
            boxShadow: "0 -4px 12px rgba(0, 0, 0, 0.05)",
          }}
        >
          {editandoPersonal && !saved && (
            <button
              onClick={cancelarEdicion}
              className="w-full transition-opacity hover:opacity-90 active:scale-[0.98]"
              style={{
                height: "44px",
                marginBottom: "8px",
                borderRadius: "12px",
                border: "1px solid var(--gray-20)",
                backgroundColor: "var(--primary-white)",
                fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif",
                fontSize: "15px",
                fontWeight: "var(--font-weight-medium)" as any,
                color: "var(--primary-black)",
                cursor: "pointer",
              }}
            >
              Cancelar
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={saved}
            className="w-full flex items-center justify-center gap-2 transition-opacity hover:opacity-90 active:scale-[0.98]"
            style={{
              height: "44px",
              borderRadius: "12px",
              backgroundColor: saved ? "var(--success-green)" : "var(--primary-yellow)",
              border: "none",
              cursor: saved ? "default" : "pointer",
            }}
          >
            {saved ? (
              <>
                <Check size={18} strokeWidth={2.5} color="var(--primary-white)" />
                <span
                  style={{
                    fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif",
                    fontSize: "15px",
                    fontWeight: "var(--font-weight-medium)" as any,
                    color: "var(--primary-white)",
                  }}
                >
                  Guardado
                </span>
              </>
            ) : (
              <span
                style={{
                  fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif",
                  fontSize: "15px",
                  fontWeight: "var(--font-weight-medium)" as any,
                  color: "var(--primary-black)",
                }}
              >
                Guardar cambios
              </span>
            )}
          </button>
        </div>
      )}
    </div>
  );
}