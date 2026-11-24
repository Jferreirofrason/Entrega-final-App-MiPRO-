import { useParams, useNavigate } from "react-router";
import { ArrowLeft, Shield, AlertCircle, CheckCircle2, Camera, CalendarDays, Star, CreditCard, MapPin, Info, HelpCircle, X, ChevronRight, Search, Edit2 } from "lucide-react";
import { PRODUCTS_DB } from "../data/products";
import { useState } from "react";
import { ManoMiPRO } from "../components/ManoMiPRO";
import { MarcaCampo } from "../components/garantia/Campo";

export function ReclamoGarantia() {
  const { id } = useParams();
  const navigate = useNavigate();
  const product = PRODUCTS_DB[Number(id)];
  const [step, setStep] = useState(1);
  const [showMapModal, setShowMapModal] = useState(false);
  const [searchMapQuery, setSearchMapQuery] = useState("");
  const [isMapSelected, setIsMapSelected] = useState(false);
  const [attachedPhotos, setAttachedPhotos] = useState<string[]>([]);
  const [description, setDescription] = useState("");

  const handleAddPhoto = () => {
    // Mock adding a photo
    const mockPhotos = [
      "https://images.unsplash.com/photo-1585338107529-13afc5f02586?q=80&w=200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1595246140625-573b715d11dc?q=80&w=200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1523413363574-c3c4447df219?q=80&w=200&auto=format&fit=crop"
    ];
    const newPhoto = mockPhotos[attachedPhotos.length % mockPhotos.length];
    setAttachedPhotos([...attachedPhotos, newPhoto]);
  };

  const removePhoto = (index: number) => {
    setAttachedPhotos(attachedPhotos.filter((_, i) => i !== index));
  };

  
  // Address states
  const [useSavedAddress, setUseSavedAddress] = useState(true);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>("1");
  const [addressDetails, setAddressDetails] = useState({
    pais: "Panamá",
    provincia: "Panamá",
    corregimiento: "Bella Vista",
    distrito: "Panamá",
    calle: "Calle 50",
    edificioCasa: "Global Bank",
    numero: "Piso 12",
    otros: ""
  });

  const [savedAddresses, setSavedAddresses] = useState([
    { id: "1", label: "Casa", address: "Calle 50, Edificio Global Bank, Piso 12, Ciudad de Panamá" },
    { id: "2", label: "Oficina", address: "Costa del Este, Business Park, Torre Norte, Oficina 5A" }
  ]);

  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editAddress, setEditAddress] = useState("");

  const handleSelectMap = () => {
    // Mock auto-fill
    setAddressDetails({
      pais: "Panamá",
      provincia: "Panamá",
      corregimiento: "Bella Vista",
      distrito: "Panamá",
      calle: "Calle 50",
      edificioCasa: "Global Bank",
      numero: "Piso 12",
      otros: "Cerca de la Farmacia Arrocha"
    });
    setUseSavedAddress(false);
    setIsMapSelected(true);
  };

  const handleFieldChange = (field: string, value: string) => {
    setAddressDetails(prev => ({ ...prev, [field]: value }));
  };

  const BottomActionBar = ({ children }: { children: React.ReactNode }) => (
    <div 
      className="p-4 bg-white flex-shrink-0 flex items-center justify-center"
      style={{
        boxShadow: '0 10px 30px -5px rgba(0,0,0,0.08)',
        borderTop: '1px solid var(--gray-8)',
        zIndex: 40
      }}
    >
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  );

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6">
        <AlertCircle size={48} color="var(--error-red)" className="mb-4" />
        <h2 className="text-xl font-bold mb-2">Producto no encontrado</h2>
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-2 bg-black text-white rounded-full font-medium"
        >
          Volver
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden relative">
      {step === 1 ? (
        <>
          <header className="flex items-center gap-3 px-6 pt-[20px] pb-4 bg-white sticky top-0 z-20" style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
            <button
              onClick={() => navigate("/")}
              className="w-11 h-11 rounded-[10px] flex items-center justify-center transition-all hover:scale-105 active:scale-95 border flex-shrink-0"
              style={{
                backgroundColor: 'var(--primary-white)',
                borderColor: 'var(--gray-20)',
                cursor: 'pointer',
                zIndex: 30
              }}
            >
              <ArrowLeft size={20} strokeWidth={2.1} color="var(--primary-black)" />
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
                  textTransform: 'uppercase',
                }}
              >
                Gestión de garantía
              </h1>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto px-6">
            <div className="flex flex-col gap-6 pt-4 pb-8">
              {/* Product Summary */}
              <div className="flex items-center gap-4 p-4 rounded-lg" style={{ backgroundColor: 'var(--gray-3)', border: '1px solid var(--gray-8)' }}>
                <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--gray-8)' }}>
                  {product.icon && <product.icon size={24} strokeWidth={1.5} color="var(--primary-black)" />}
                </div>
                <div>
                  <p style={{ fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif", fontSize: '15px', fontWeight: 'var(--font-weight-medium)', color: 'var(--primary-black)', lineHeight: '1.3' }}>
                    {product.name}
                  </p>
                  <p style={{ fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif", fontSize: '13px', color: 'var(--gray-60)', marginTop: '2px' }}>
                    {product.brand} • {product.serialNumber}
                  </p>
                </div>
              </div>

              <div className="flex flex-col w-full">
                <label style={{ fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif", fontSize: '13px', lineHeight: '19px', fontWeight: 'var(--font-weight-medium)', color: 'var(--primary-black)', display: 'block', marginBottom: '6px' }}>
                  Detalles del inconveniente
                </label>
                <textarea 
                  placeholder="Describe detalladamente el fallo o defecto..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-lg p-3 outline-none resize-none transition-colors"
                  style={{
                    backgroundColor: 'var(--primary-white)',
                    border: '1px solid var(--gray-20)',
                    fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif",
                    fontSize: '14px',
                    color: 'var(--primary-black)',
                    minHeight: '100px'
                  }}
                />
              </div>

              <div className="flex flex-col w-full">
                <label className="flex items-baseline justify-between gap-2" style={{ fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif", fontSize: '13px', lineHeight: '19px', fontWeight: 'var(--font-weight-medium)', color: 'var(--primary-black)', marginBottom: '6px' }}>
                  Fotos de referencia
                  <MarcaCampo />
                </label>
                <div className="flex flex-wrap gap-3">
                  {attachedPhotos.map((photo, index) => (
                    <div key={index} className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-100 flex-shrink-0">
                      <img src={photo} alt={`Reference ${index}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      <button 
                        onClick={() => removePhoto(index)}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/50 flex items-center justify-center backdrop-blur-sm"
                      >
                        <X size={12} color="white" strokeWidth={3} />
                      </button>
                    </div>
                  ))}
                  
                  <button
                    onClick={handleAddPhoto}
                    className="w-20 h-20 rounded-lg flex flex-col items-center justify-center gap-1 border border-dashed transition-all active:scale-95"
                    style={{
                      backgroundColor: 'var(--primary-white)',
                      borderColor: 'var(--gray-40)',
                      color: 'var(--gray-60)'
                    }}
                  >
                    <Camera size={20} strokeWidth={1.5} />
                    <span style={{ fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif", fontSize: '10px' }}>
                      Adjuntar
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <BottomActionBar>
            <button 
              onClick={() => setStep(2)}
              className="w-full h-11 rounded-xl flex items-center justify-center transition-transform hover:scale-[1.02]"
              style={{ backgroundColor: 'var(--primary-yellow)', color: 'var(--primary-black)', fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif", fontSize: '14px', fontWeight: 'var(--font-weight-medium)', border: 'none', cursor: 'pointer' }}
            >
              Continuar
            </button>
          </BottomActionBar>
        </>
      ) : step === 2 ? (
        <>
          <header className="flex items-center gap-3 px-6 pt-[20px] pb-4 bg-white sticky top-0 z-20" style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
            <button
              onClick={() => setStep(1)}
              className="w-11 h-11 rounded-[10px] flex items-center justify-center transition-all hover:scale-105 active:scale-95 border flex-shrink-0"
              style={{
                backgroundColor: 'var(--primary-white)',
                borderColor: 'var(--gray-20)',
                cursor: 'pointer',
                zIndex: 30
              }}
            >
              <ArrowLeft size={20} strokeWidth={2.1} color="var(--primary-black)" />
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
                  textTransform: 'uppercase',
                }}
              >
                Dirección de visita
              </h1>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto px-6">
            <div className="flex flex-col gap-6 pt-6 pb-8">
              {/* Saved Addresses Section */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span style={{ fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif", fontSize: '12px', fontWeight: 'var(--font-weight-medium)', color: 'var(--gray-40)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Direcciones guardadas
                  </span>
                </div>
                {savedAddresses.map((addr) => {
                  const isSelected = selectedAddressId === addr.id && useSavedAddress;
                  const isEditing = editingAddressId === addr.id;

                  if (isEditing) {
                    return (
                      <div 
                        key={addr.id}
                        className="p-4 rounded-xl border border-gray-200 bg-white space-y-3 animate-in fade-in duration-200 text-left"
                      >
                        <div>
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Nombre de Ubicación</label>
                          <input
                            type="text"
                            value={editLabel}
                            onChange={(e) => setEditLabel(e.target.value)}
                            className="w-full mt-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-primary-black focus:outline-none focus:ring-1 focus:ring-black"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Dirección Completa</label>
                          <textarea
                            value={editAddress}
                            onChange={(e) => setEditAddress(e.target.value)}
                            className="w-full mt-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-primary-black focus:outline-none focus:ring-1 focus:ring-black h-20 resize-none font-sans"
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingAddressId(null);
                            }}
                            className="px-3 py-1.5 text-xs font-semibold text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-lg border-none cursor-pointer transition-all"
                          >
                            Cancelar
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (editLabel.trim() && editAddress.trim()) {
                                setSavedAddresses(prev => prev.map(a => a.id === addr.id ? { ...a, label: editLabel, address: editAddress } : a));
                                setEditingAddressId(null);
                              }
                            }}
                            className="px-3 py-1.5 text-xs font-semibold text-black bg-primary-yellow hover:bg-black hover:text-white rounded-lg border-none cursor-pointer transition-all"
                          >
                            Guardar
                          </button>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div 
                      key={addr.id}
                      onClick={() => {
                        setSelectedAddressId(addr.id);
                        setUseSavedAddress(true);
                        // Fill with data for the saved address
                        setAddressDetails({
                          pais: "Panamá",
                          provincia: "Panamá",
                          corregimiento: "Bella Vista",
                          distrito: "Panamá",
                          calle: addr.address.split(",")[0] || "",
                          edificioCasa: addr.address.split(",")[1]?.trim() || "",
                          numero: addr.address.split(",")[2]?.trim() || "",
                          otros: addr.label
                        });
                      }}
                      className="p-4 rounded-xl border transition-all cursor-pointer flex gap-3 items-start relative group"
                      style={{ 
                        backgroundColor: isSelected ? 'rgba(255, 204, 0, 0.05)' : 'var(--primary-white)',
                        borderColor: isSelected ? 'var(--primary-yellow)' : 'var(--gray-8)',
                        boxShadow: isSelected ? '0 4px 12px rgba(255, 204, 0, 0.1)' : 'none'
                      }}
                    >
                      <div 
                        className="w-5 h-5 rounded-full border-2 mt-0.5 flex-shrink-0 flex items-center justify-center transition-colors"
                        style={{ 
                          borderColor: isSelected ? 'var(--primary-yellow)' : 'var(--gray-20)',
                          backgroundColor: isSelected ? 'var(--primary-yellow)' : 'transparent'
                        }}
                      >
                        {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                      <div className="flex-1 min-w-0 pr-8 text-left">
                        <p style={{ fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif", fontSize: '14px', fontWeight: 'var(--font-weight-medium)', color: 'var(--primary-black)' }}>
                          {addr.label}
                        </p>
                        <p style={{ fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif", fontSize: '12px', color: 'var(--gray-60)', marginTop: '2px', lineHeight: '1.3' }}>
                          {addr.address}
                        </p>
                      </div>

                      {/* Edit Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingAddressId(addr.id);
                          setEditLabel(addr.label);
                          setEditAddress(addr.address);
                        }}
                        className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-black hover:bg-gray-100 rounded-lg transition-all border-none bg-transparent cursor-pointer"
                        title="Editar Dirección"
                      >
                        <Edit2 size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center gap-3 py-2">
                <div className="h-[1px] flex-1 bg-gray-100" />
                <span style={{ fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif", fontSize: '12px', color: 'var(--gray-40)', textTransform: 'uppercase' }}>O</span>
                <div className="h-[1px] flex-1 bg-gray-100" />
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span style={{ fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif", fontSize: '12px', fontWeight: 'var(--font-weight-medium)', color: 'var(--gray-40)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Nueva dirección
                  </span>
                </div>

                <button 
                  type="button"
                  onClick={() => setShowMapModal(true)}
                  className="w-full flex items-center justify-center gap-2 p-3 rounded-xl transition-all active:scale-[0.98]"
                  style={{ 
                    backgroundColor: 'var(--gray-3)', 
                    border: '1px solid var(--gray-8)',
                    cursor: 'pointer'
                  }}
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--primary-white)', border: '1px solid var(--gray-20)' }}>
                    <MapPin size={18} color="var(--primary-yellow)" />
                  </div>
                  <div className="flex-1 text-left">
                    <p style={{ fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif", fontSize: '13px', fontWeight: 'var(--font-weight-medium)', color: 'var(--primary-black)' }}>
                      Seleccionar ubicación en el mapa
                    </p>
                  </div>
                  <ChevronRight size={16} color="var(--gray-40)" />
                </button>

                {showMapModal && (
                  <div className="fixed inset-0 z-[100] flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowMapModal(false)} />
                    <div 
                      className="mt-auto bg-white rounded-t-[24px] p-6 relative z-10 flex flex-col gap-6"
                      style={{ boxShadow: '0 -8px 30px rgba(0,0,0,0.12)' }}
                    >
                      <div className="flex items-center justify-between">
                        <h3 style={{ fontFamily: "'Bebas Neue', Arial, sans-serif", fontSize: '18px', letterSpacing: '0.5px' }}>
                          Buscar Ubicación
                        </h3>
                        <button onClick={() => setShowMapModal(false)} className="p-2">
                          <X size={20} color="var(--gray-40)" />
                        </button>
                      </div>

                      <div className="flex flex-col gap-3">
                        <button 
                          onClick={() => {
                            handleSelectMap();
                            setShowMapModal(false);
                          }}
                          className="w-full flex items-center gap-3 p-4 rounded-xl transition-all active:scale-[0.98]"
                          style={{ backgroundColor: 'var(--gray-3)', border: '1px solid var(--gray-8)' }}
                        >
                          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--primary-white)' }}>
                            <MapPin size={18} color="var(--primary-yellow)" />
                          </div>
                          <span style={{ fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif", fontSize: '14px', fontWeight: 'var(--font-weight-medium)' }}>
                            Usar mi ubicación actual
                          </span>
                        </button>

                        <div className="relative">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2">
                            <Search size={18} color="var(--gray-40)" />
                          </div>
                          <input 
                            type="text"
                            placeholder="Buscar dirección o punto de referencia"
                            value={searchMapQuery}
                            onChange={(e) => setSearchMapQuery(e.target.value)}
                            className="w-full h-12 pl-10 pr-4 rounded-xl outline-none transition-all"
                            style={{ 
                              backgroundColor: 'var(--gray-3)', 
                              border: '1px solid var(--gray-8)',
                              fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif",
                              fontSize: '14px'
                            }}
                          />
                        </div>

                        {searchMapQuery && (
                          <div className="flex flex-col gap-1 mt-1">
                            <button 
                              onClick={() => {
                                handleSelectMap();
                                setShowMapModal(false);
                              }}
                              className="p-3 text-left hover:bg-gray-50 rounded-lg text-sm border-b border-gray-50"
                            >
                               <b>{searchMapQuery}</b>, Ciudad de Panamá
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Structured Address Fields */}
                {isMapSelected && !useSavedAddress && (
                  <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex flex-col w-full">
                      <label style={{ fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif", fontSize: '12px', fontWeight: 'var(--font-weight-medium)', color: 'var(--primary-black)', marginBottom: '4px' }}>País</label>
                      <input 
                        type="text"
                        disabled={useSavedAddress || !isMapSelected}
                        value={addressDetails.pais}
                        onChange={(e) => { setUseSavedAddress(false); handleFieldChange('pais', e.target.value); }}
                        placeholder="Ej. Panamá"
                        className="w-full rounded-lg h-10 px-3 outline-none transition-colors border disabled:opacity-50 disabled:bg-gray-50"
                        style={{ backgroundColor: 'var(--primary-white)', borderColor: 'var(--gray-20)', fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif", fontSize: '13px', color: 'var(--primary-black)' }}
                      />
                    </div>
                    <div className="flex flex-col w-full">
                      <label style={{ fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif", fontSize: '12px', fontWeight: 'var(--font-weight-medium)', color: 'var(--primary-black)', marginBottom: '4px' }}>Provincia</label>
                      <input 
                        type="text"
                        disabled={useSavedAddress || !isMapSelected}
                        value={addressDetails.provincia}
                        onChange={(e) => { setUseSavedAddress(false); handleFieldChange('provincia', e.target.value); }}
                        className="w-full rounded-lg h-10 px-3 outline-none transition-colors border disabled:opacity-50 disabled:bg-gray-50"
                        style={{ backgroundColor: 'var(--primary-white)', borderColor: 'var(--gray-20)', fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif", fontSize: '13px', color: 'var(--primary-black)' }}
                      />
                    </div>
                    <div className="flex flex-col w-full">
                      <label style={{ fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif", fontSize: '12px', fontWeight: 'var(--font-weight-medium)', color: 'var(--primary-black)', marginBottom: '4px' }}>Corregimiento</label>
                      <input 
                        type="text"
                        disabled={useSavedAddress || !isMapSelected}
                        value={addressDetails.corregimiento}
                        onChange={(e) => { setUseSavedAddress(false); handleFieldChange('corregimiento', e.target.value); }}
                        className="w-full rounded-lg h-10 px-3 outline-none transition-colors border disabled:opacity-50 disabled:bg-gray-50"
                        style={{ backgroundColor: 'var(--primary-white)', borderColor: 'var(--gray-20)', fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif", fontSize: '13px', color: 'var(--primary-black)' }}
                      />
                    </div>
                    <div className="flex flex-col w-full">
                      <label style={{ fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif", fontSize: '12px', fontWeight: 'var(--font-weight-medium)', color: 'var(--primary-black)', marginBottom: '4px' }}>Distrito</label>
                      <input 
                        type="text"
                        disabled={useSavedAddress || !isMapSelected}
                        value={addressDetails.distrito}
                        onChange={(e) => { setUseSavedAddress(false); handleFieldChange('distrito', e.target.value); }}
                        className="w-full rounded-lg h-10 px-3 outline-none transition-colors border disabled:opacity-50 disabled:bg-gray-50"
                        style={{ backgroundColor: 'var(--primary-white)', borderColor: 'var(--gray-20)', fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif", fontSize: '13px', color: 'var(--primary-black)' }}
                      />
                    </div>
                    <div className="flex flex-col w-full col-span-2">
                      <label style={{ fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif", fontSize: '12px', fontWeight: 'var(--font-weight-medium)', color: 'var(--primary-black)', marginBottom: '4px' }}>Calle</label>
                      <input 
                        type="text"
                        disabled={useSavedAddress || !isMapSelected}
                        value={addressDetails.calle}
                        onChange={(e) => { setUseSavedAddress(false); handleFieldChange('calle', e.target.value); }}
                        className="w-full rounded-lg h-10 px-3 outline-none transition-colors border disabled:opacity-50 disabled:bg-gray-50"
                        style={{ backgroundColor: 'var(--primary-white)', borderColor: 'var(--gray-20)', fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif", fontSize: '13px', color: 'var(--primary-black)' }}
                      />
                    </div>
                    <div className="flex flex-col w-full">
                      <label style={{ fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif", fontSize: '12px', fontWeight: 'var(--font-weight-medium)', color: 'var(--primary-black)', marginBottom: '4px' }}>Edificio o Casa</label>
                      <input 
                        type="text"
                        disabled={useSavedAddress || !isMapSelected}
                        value={addressDetails.edificioCasa}
                        onChange={(e) => { setUseSavedAddress(false); handleFieldChange('edificioCasa', e.target.value); }}
                        className="w-full rounded-lg h-10 px-3 outline-none transition-colors border disabled:opacity-50 disabled:bg-gray-50"
                        style={{ backgroundColor: 'var(--primary-white)', borderColor: 'var(--gray-20)', fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif", fontSize: '13px', color: 'var(--primary-black)' }}
                      />
                    </div>
                    <div className="flex flex-col w-full">
                      <label style={{ fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif", fontSize: '12px', fontWeight: 'var(--font-weight-medium)', color: 'var(--primary-black)', marginBottom: '4px' }}>Número</label>
                      <input 
                        type="text"
                        disabled={useSavedAddress || !isMapSelected}
                        value={addressDetails.numero}
                        onChange={(e) => { setUseSavedAddress(false); handleFieldChange('numero', e.target.value); }}
                        className="w-full rounded-lg h-10 px-3 outline-none transition-colors border disabled:opacity-50 disabled:bg-gray-50"
                        style={{ backgroundColor: 'var(--primary-white)', borderColor: 'var(--gray-20)', fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif", fontSize: '13px', color: 'var(--primary-black)' }}
                      />
                    </div>
                    <div className="flex flex-col w-full col-span-2">
                      <label style={{ fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif", fontSize: '12px', fontWeight: 'var(--font-weight-medium)', color: 'var(--primary-black)', marginBottom: '4px' }}>Otros puntos de referencia</label>
                      <textarea 
                        disabled={useSavedAddress || !isMapSelected}
                        value={addressDetails.otros}
                        onChange={(e) => { setUseSavedAddress(false); handleFieldChange('otros', e.target.value); }}
                        placeholder="Color de casa, cerca de..."
                        className="w-full rounded-lg p-3 outline-none resize-none transition-colors border disabled:opacity-50 disabled:bg-gray-50"
                        style={{ backgroundColor: 'var(--primary-white)', borderColor: 'var(--gray-20)', fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif", fontSize: '13px', color: 'var(--primary-black)', minHeight: '60px' }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 rounded-xl flex gap-3" style={{ backgroundColor: 'rgba(0, 102, 255, 0.05)', border: '1px solid rgba(0, 102, 255, 0.1)' }}>
                <Info size={20} className="text-blue-500 shrink-0" />
                <p style={{ fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif", fontSize: '12px', color: 'var(--info-blue)', lineHeight: '1.5' }}>
                  Estos datos nos permiten ubicarte rápidamente para brindarte el mejor soporte técnico.
                </p>
              </div>
            </div>
          </div>

          <BottomActionBar>
            <button 
              onClick={() => setStep(3)}
              disabled={useSavedAddress ? !selectedAddressId : !addressDetails.calle || !addressDetails.provincia}
              className="w-full h-11 rounded-xl flex items-center justify-center transition-transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed border-none shadow-sm"
              style={{ backgroundColor: 'var(--primary-yellow)', color: 'var(--primary-black)', fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif", fontSize: '14px', fontWeight: 'var(--font-weight-medium)', cursor: 'pointer' }}
            >
              Enviar solicitud
            </button>
          </BottomActionBar>
        </>
      ) : (
          <div className="absolute inset-0 z-50 auth-gradient flex flex-col animate-in fade-in duration-500" style={{ overflow: 'hidden', overscrollBehavior: 'none', touchAction: 'none' }}>
            {/* Gradient top area with icon and greeting */}
            <div className="flex flex-col items-center pt-10 pb-6 relative z-20 flex-shrink-0">
              <div className="flex items-center justify-center mb-4" style={{ width: '64px', height: '64px' }}>
                <ManoMiPRO />
              </div>
              <h1 style={{ fontFamily: "'Bebas Neue', Arial, sans-serif", fontSize: '20px', letterSpacing: '1px', color: 'var(--primary-white)', margin: 0, lineHeight: '1' }}>
                ¡SOLICITUD ENVIADA!
              </h1>
            </div>

            {/* White panel flush to bottom */}
            <div
              className="flex-1 flex flex-col relative z-10"
              style={{
                backgroundColor: 'var(--primary-white)',
                borderTopLeftRadius: '24px',
                borderTopRightRadius: '24px',
                minHeight: 0,
                overflow: 'hidden'
              }}
            >
              <div className="flex-1 overflow-y-auto px-6 pt-6 pb-2">
                <div className="w-full flex flex-col">
                  {/* Details */}
                  <div className="w-full flex flex-col gap-3 text-left">
                    <p className="text-gray-600 mb-4" style={{ fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif", fontSize: '14px', lineHeight: '1.5' }}>
                      Hemos recibido tu reporte. El equipo de MiPRO revisará la información y te contactará para explicarte cómo continuar.
                    </p>
                    
                    <div className="flex items-start gap-3">
                      <Star size={16} strokeWidth={2} color="var(--gray-60)" className="mt-0.5 flex-shrink-0" />
                      <div>
                        <span style={{ fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif", fontSize: '11px', color: 'var(--gray-40)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Producto</span>
                        <p style={{ fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif", fontSize: '14px', fontWeight: 'var(--font-weight-medium)', color: 'var(--primary-black)', marginTop: '2px' }}>
                          {product.name}
                        </p>
                        <p style={{ fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif", fontSize: '12px', color: 'var(--gray-60)', marginTop: '1px' }}>
                          Código de producto: {product.serialNumber}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <CalendarDays size={16} strokeWidth={2} color="var(--gray-60)" className="mt-0.5 flex-shrink-0" />
                      <div>
                        <span style={{ fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif", fontSize: '11px', color: 'var(--gray-40)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Fecha de envío</span>
                        <p style={{ fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif", fontSize: '14px', fontWeight: 'var(--font-weight-medium)', color: 'var(--primary-black)', marginTop: '2px' }}>
                          {new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5" style={{ width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--gray-60)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                          <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                      </div>
                      <div>
                        <span style={{ fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif", fontSize: '11px', color: 'var(--gray-40)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Número de caso</span>
                        <p style={{ fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif", fontSize: '14px', fontWeight: 'var(--font-weight-medium)', color: 'var(--primary-black)', marginTop: '2px' }}>
                          #GAR-2024-0892
                        </p>
                      </div>
                    </div>

                    {description && (
                      <div className="flex items-start gap-3">
                        <HelpCircle size={16} strokeWidth={2} color="var(--gray-60)" className="mt-0.5 flex-shrink-0" />
                        <div>
                          <span style={{ fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif", fontSize: '11px', color: 'var(--gray-40)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Comentarios</span>
                          <p style={{ fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif", fontSize: '13px', color: 'var(--primary-black)', marginTop: '2px', lineHeight: '1.4' }}>
                            {description}
                          </p>
                        </div>
                      </div>
                    )}

                    {attachedPhotos.length > 0 && (
                      <div className="flex items-start gap-3">
                        <Camera size={16} strokeWidth={2} color="var(--gray-60)" className="mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <span style={{ fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif", fontSize: '11px', color: 'var(--gray-40)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Fotos adjuntas</span>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {attachedPhotos.map((photo, index) => (
                              <div key={index} className="w-12 h-12 rounded-lg overflow-hidden border border-gray-100 flex-shrink-0">
                                <img src={photo} alt={`Reference ${index}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <BottomActionBar>
                <button
                  onClick={() => navigate('/')}
                  className="w-full h-11 flex items-center justify-center transition-transform hover:scale-[1.02] border-none"
                  style={{
                    backgroundColor: 'var(--primary-yellow)',
                    color: 'var(--primary-black)',
                    boxShadow: '0 10px 30px -5px rgba(0,0,0,0.08)',
                    borderRadius: '12px',
                    fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif",
                    fontSize: '14px',
                    fontWeight: 'var(--font-weight-medium)',
                    cursor: 'pointer'
                  }}
                >
                  Volver al inicio
                </button>
              </BottomActionBar>
            </div>
          </div>
        )}
    </div>
  );
}
