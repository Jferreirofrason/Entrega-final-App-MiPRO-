import { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { 
  ArrowLeft, 
  Calendar as CalendarIcon, 
  Save, 
  Check, 
  ChevronsUpDown, 
  X, 
  HelpCircle, 
  Camera, 
  MapPin, 
  ChevronRight, 
  Search,
  Info,
  Star,
  CalendarDays,
  Building,
  Home,
  Lock,
  Compass,
  Loader2,
  Edit2
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { cn } from "@/app/components/ui/utils";
import { ManoMiPRO } from "../components/ManoMiPRO";
import { MarcaCampo } from "../components/garantia/Campo";

export function AgregarProducto() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const isFromWarranty = queryParams.get('fromWarranty') === 'true';

  const [currentStep, setCurrentStep] = useState(1);
  const [purchaseDate, setPurchaseDate] = useState<Date>();
  
  // Step 1: Product info state with dropdown and help toggle support
  const [productType, setProductType] = useState("");
  const [store, setStore] = useState("");
  const [brand, setBrand] = useState("");
  
  const [showSKUHelp, setShowSKUHelp] = useState(false);
  const [showInvoiceHelp, setShowInvoiceHelp] = useState(false);
  const [filterProduct, setFilterProduct] = useState("");
  const [filterStore, setFilterStore] = useState("");
  const [filterBrand, setFilterBrand] = useState("");
  const [openProduct, setOpenProduct] = useState(false);
  const [openStore, setOpenStore] = useState(false);
  const [openBrand, setOpenBrand] = useState(false);
  const [model, setModel] = useState("");
  const [sku, setSku] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [alias, setAlias] = useState("");

  // Step 2: Warranty info state
  const [description, setDescription] = useState("");
  const [attachedPhotos, setAttachedPhotos] = useState<string[]>([]);

  // Step 3: Visit address state
  const [showMapModal, setShowMapModal] = useState(false);
  const [searchMapQuery, setSearchMapQuery] = useState("");
  const [isMapSelected, setIsMapSelected] = useState(false);
  const [useSavedAddress, setUseSavedAddress] = useState(true);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>("1");
  
  // New visual states for the upgraded Step 3
  const [isBuilding, setIsBuilding] = useState(false);
  const [customAlias, setCustomAlias] = useState("");
  const [simulateNoSavedAddresses, setSimulateNoSavedAddresses] = useState(false);
  const [formErrors, setFormErrors] = useState<{ alias?: string; numero?: string; map?: string }>({});
  
  // Loaders for advanced interactions
  const [isGPSLocating, setIsGPSLocating] = useState(false);
  const [isMapLoading, setIsMapLoading] = useState(false);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Draggable Map Modal States
  const [mapOffset, setMapOffset] = useState({ x: -450, y: -450 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

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

  const handleAddPhoto = () => {
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

  const handleSelectMap = () => {
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
    setFormErrors(prev => ({ ...prev, map: undefined }));
  };

  const handleFieldChange = (field: string, value: string) => {
    setAddressDetails(prev => ({ ...prev, [field]: value }));
    if (field === 'numero' && value.trim()) {
      setFormErrors(prev => ({ ...prev, numero: undefined }));
    }
  };

  const [showSuccess, setShowSuccess] = useState(false);

  // Open states for lookups already declared at the top level

  const productTypes = [
    { label: "Aire acondicionado", value: "Aire Acondicionado" },
    { label: "Colchón", value: "Colchón" },
    { label: "Refrigeradora", value: "Refrigeradora" },
    { label: "Calentador", value: "Calentador" },
    { label: "Lavadora", value: "Lavadora" },
    { label: "Abanico", value: "Abanico" },
    { label: "Estufa", value: "Estufa" },
    { label: "Microondas", value: "Microondas" },
  ];

  const stores = [
    { label: "Novey", value: "Novey" },
    { label: "Cochez", value: "Cochez" },
    { label: "Kohler", value: "Kohler" },
    { label: "Otro", value: "Otro" },
  ];

  const brands = [
    { label: "Panasonic", value: "Panasonic" },
    { label: "Serta", value: "Serta" },
    { label: "Samsung", value: "Samsung" },
    { label: "Rheem", value: "Rheem" },
    { label: "LG", value: "LG" },
    { label: "Hunter", value: "Hunter" },
    { label: "Whirlpool", value: "Whirlpool" },
    { label: "Carrier", value: "Carrier" },
    { label: "Mabe", value: "Mabe" },
    { label: "Frigidaire", value: "Frigidaire" },
  ];

  const handleSave = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
      return;
    }

    // Reset errors
    const errors: { alias?: string; numero?: string; map?: string } = {};

    if (useSavedAddress) {
      if (simulateNoSavedAddresses) {
        errors.map = "Debes ingresar una nueva dirección utilizando el mapa.";
      }
    } else {
      if (!isMapSelected) {
        errors.map = "Por favor, ubica tu dirección exacta en el mapa para continuar.";
      }
      if (!customAlias.trim()) {
        errors.alias = "El alias de la dirección es obligatorio.";
      }
      if (!addressDetails.numero.trim()) {
        errors.numero = isBuilding ? "El número de apartamento es obligatorio." : "El número de casa es obligatorio.";
      }
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    // All validation passed. Simulate loading submission delay for premium user feedback
    setIsSubmitting(true);
    setTimeout(() => {
      const selectedName = useSavedAddress 
        ? (savedAddresses.find(a => a.id === selectedAddressId)?.label || "Casa")
        : customAlias;

      const newProduct = {
        id: Date.now(),
        name: selectedName || alias || productType || "Nuevo Producto",
        brand: brand || "Genérica",
        store: store || "Desconocida",
        category: productType || "Otros",
        isNew: true,
        timestamp: Date.now()
      };
      
      // Save to localStorage to simulate persistence for the session
      localStorage.setItem("lastAddedProduct", JSON.stringify(newProduct));
      
      setIsSubmitting(false);
      setShowSuccess(true);
    }, 1200);
  };

  const steps = [
    { id: 1, label: "PRODUCTO", title: "Información del producto" },
    { id: 2, label: "REPORTE", title: "Reporte de falla" },
    { id: 3, label: "DIRECCIÓN", title: "Dirección de visita" }
  ];

  return (
    <div className="flex flex-col h-full bg-white relative">
      {showSuccess ? (
        <div className="absolute inset-0 z-50 auth-gradient flex flex-col animate-in fade-in duration-500" style={{ overflow: 'hidden', overscrollBehavior: 'none', touchAction: 'none' }}>
          {/* Gradient top area with icon and greeting */}
          <div className="flex flex-col items-center pt-10 pb-6 relative z-20 flex-shrink-0">
            <div className="flex items-center justify-center mb-4" style={{ width: '64px', height: '64px' }}>
              <ManoMiPRO />
            </div>
            <h1 style={{ fontFamily: "'Bebas Neue', Arial, sans-serif", fontSize: '20px', letterSpacing: '1px', color: 'var(--primary-white)', margin: 0, lineHeight: '1' }}>
              {isFromWarranty ? "¡SOLICITUD ENVIADA!" : "¡PRODUCTO GUARDADO!"}
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
            <div className="flex-1 overflow-y-auto px-6 pt-6 pb-6">
              <div className="w-full flex flex-col">
                {/* Details */}
                <div className="w-full flex flex-col gap-3 text-left">
                  <p className="text-gray-600 mb-4" style={{ fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif", fontSize: '14px', lineHeight: '1.5' }}>
                    {isFromWarranty 
                      ? "Hemos recibido tu reporte. El equipo técnico de MiPRO lo revisará y te contactará en un plazo de 24 a 48 horas." 
                      : "Tu producto ha sido registrado exitosamente en tu inventario de MiPRO."}
                  </p>
                  
                  <div className="flex items-start gap-3">
                    <Star size={16} strokeWidth={2} color="var(--gray-60)" className="mt-0.5 flex-shrink-0" />
                    <div>
                      <span style={{ fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif", fontSize: '11px', color: 'var(--gray-40)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Producto</span>
                      <p style={{ fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif", fontSize: '14px', fontWeight: 'var(--font-weight-medium)', color: 'var(--primary-black)', marginTop: '2px' }}>
                        {alias || productType || "Nuevo Producto"}
                      </p>
                      {serialNumber && (
                        <p style={{ fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif", fontSize: '12px', color: 'var(--gray-60)', marginTop: '1px' }}>
                          Código de producto: {serialNumber}
                        </p>
                      )}
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
                  
                  {isFromWarranty && (
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
                  )}
                </div>
              </div>
            </div>

            <div 
              className="p-4 bg-white flex-shrink-0 flex items-center justify-center"
              style={{
                boxShadow: '0 10px 30px -5px rgba(0,0,0,0.08)',
                borderTop: '1px solid var(--gray-8)',
                zIndex: 40
              }}
            >
              {/* Desde que el alta vive adentro de Mis productos, termina
                  ahí y no en el Home: es donde está el producto que la
                  persona acaba de cargar. */}
              <button
                onClick={() => navigate('/mis-productos')}
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
                Ver mis productos
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Header with Integrated Stepper */}
          <header className="px-6 pt-6 pb-4 bg-white sticky top-0 z-20 border-b border-gray-50 flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  if (currentStep > 1) {
                    setCurrentStep(currentStep - 1);
                  } else {
                    // La flecha del primer paso vuelve a la lista, que es
                    // de donde se entra: nunca al Home.
                    navigate("/mis-productos");
                  }
                }}
                className="w-11 h-11 rounded-[10px] flex items-center justify-center transition-all hover:scale-105 active:scale-95 border flex-shrink-0"
                style={{
                  backgroundColor: 'var(--primary-white)',
                  borderColor: 'var(--gray-20)',
                  cursor: 'pointer',
                }}
              >
                <ArrowLeft size={20} strokeWidth={2.1} color="var(--primary-black)" />
              </button>
              
              <div className="flex items-center gap-3 overflow-x-auto no-scrollbar flex-1 py-1">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex items-center flex-shrink-0">
                    <button 
                      onClick={() => setCurrentStep(step.id)}
                      className={cn(
                        "flex items-center gap-2 px-1.5 py-1.5 rounded-full transition-all cursor-pointer focus:outline-none border",
                        currentStep === step.id ? "bg-primary-yellow border-primary-yellow pr-4 shadow-md" : "bg-transparent border-transparent"
                      )}
                    >
                      <div 
                        className={cn(
                          "rounded-full flex items-center justify-center font-bold transition-all",
                          currentStep === step.id 
                            ? "w-7 h-7 bg-primary-black text-primary-yellow text-xs shadow-sm" 
                            : currentStep > step.id 
                              ? "w-7 h-7 bg-primary-yellow text-primary-black text-xs shadow-sm" 
                              : "w-7 h-7 bg-white border border-gray-100 text-primary-black text-[11px]"
                        )}
                      >
                        {currentStep > step.id ? <Check size={14} strokeWidth={3} className="text-primary-black" /> : step.id}
                      </div>
                      
                      {currentStep === step.id && (
                        <span 
                          className="text-[11px] font-bold text-primary-black uppercase tracking-wider"
                          style={{ fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif" }}
                        >
                          {step.label}
                        </span>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="absolute bottom-0 left-0 w-full h-[3px] bg-gray-50 overflow-hidden">
              <div 
                className="h-full bg-primary-yellow transition-all duration-500"
                style={{ width: `${(currentStep / steps.length) * 100}%` }}
              />
            </div>
          </header>

          <div className="flex-1 overflow-y-auto">
            {currentStep === 1 && (
              <div className="px-6 py-6 space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                {/* 1. ¿Cuál es el producto? (Lookup) */}
                <div className="space-y-2 flex flex-col text-left">
                  <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tipo de producto</Label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setOpenProduct(!openProduct)}
                      className="w-full h-11 flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl text-sm text-primary-black px-4 py-2 hover:bg-gray-100/50 cursor-pointer"
                    >
                      <span className={productType ? "font-semibold text-primary-black" : "text-gray-400"}>
                        {productType
                          ? productTypes.find((t) => t.value === productType)?.label
                          : "Selecciona un producto..."}
                      </span>
                      <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                    </button>
                    {openProduct && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setOpenProduct(false)} />
                        <div className="absolute top-12 left-0 z-50 w-full bg-white border border-gray-200 rounded-xl shadow-xl max-h-60 overflow-y-auto p-1.5 space-y-1 animate-in fade-in duration-200">
                          <input
                            type="text"
                            placeholder="Buscar producto..."
                            value={filterProduct}
                            onChange={(e) => setFilterProduct(e.target.value)}
                            className="w-full h-9 px-3 bg-gray-50 rounded-lg border border-gray-100 outline-none focus:ring-1 focus:ring-primary-yellow text-xs mb-1"
                          />
                          {productTypes
                            .filter(type => type.label.toLowerCase().includes(filterProduct.toLowerCase()))
                            .map((type) => (
                              <button
                                key={type.value}
                                type="button"
                                onClick={() => {
                                  setProductType(type.value);
                                  setOpenProduct(false);
                                  setFilterProduct("");
                                }}
                                className={cn(
                                  "w-full text-left px-3 py-2 text-xs rounded-lg flex items-center justify-between transition-colors cursor-pointer",
                                  productType === type.value 
                                    ? "bg-primary-yellow/20 text-black font-semibold" 
                                    : "hover:bg-gray-50 text-gray-700"
                                )}
                              >
                                <span>{type.label}</span>
                                {productType === type.value && <Check size={14} className="text-black shrink-0" />}
                              </button>
                            ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 text-left">
                  {/* 2. Lugar de compra (Lookup) */}
                  <div className="space-y-2 flex flex-col">
                    <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Comprado en</Label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setOpenStore(!openStore)}
                        className="w-full h-11 flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl text-sm text-primary-black px-4 py-2 hover:bg-gray-100/50 cursor-pointer"
                      >
                        <span className={store ? "font-semibold text-primary-black" : "text-gray-400"}>
                          {store
                            ? stores.find((s) => s.value === store)?.label
                            : "Selecciona un lugar..."}
                        </span>
                        <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                      </button>
                      {openStore && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setOpenStore(false)} />
                          <div className="absolute top-12 left-0 z-50 w-full bg-white border border-gray-200 rounded-xl shadow-xl max-h-60 overflow-y-auto p-1.5 space-y-1 animate-in fade-in duration-200">
                            <input
                              type="text"
                              placeholder="Buscar tienda..."
                              value={filterStore}
                              onChange={(e) => setFilterStore(e.target.value)}
                              className="w-full h-9 px-3 bg-gray-50 rounded-lg border border-gray-100 outline-none focus:ring-1 focus:ring-primary-yellow text-xs mb-1"
                            />
                            {stores
                              .filter(st => st.label.toLowerCase().includes(filterStore.toLowerCase()))
                              .map((s) => (
                                <button
                                  key={s.value}
                                  type="button"
                                  onClick={() => {
                                    setStore(s.value);
                                    setOpenStore(false);
                                    setFilterStore("");
                                  }}
                                  className={cn(
                                    "w-full text-left px-3 py-2 text-xs rounded-lg flex items-center justify-between transition-colors cursor-pointer",
                                    store === s.value 
                                      ? "bg-primary-yellow/20 text-black font-semibold" 
                                      : "hover:bg-gray-50 text-gray-700"
                                  )}
                                >
                                  <span>{s.label}</span>
                                  {store === s.value && <Check size={14} className="text-black shrink-0" />}
                                </button>
                              ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* 3. Marca del producto (Lookup) */}
                  <div className="space-y-2 flex flex-col">
                    <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Marca</Label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setOpenBrand(!openBrand)}
                        className="w-full h-11 flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl text-sm text-primary-black px-4 py-2 hover:bg-gray-100/50 cursor-pointer"
                      >
                        <span className={brand ? "font-semibold text-primary-black" : "text-gray-400"}>
                          {brand
                            ? brands.find((b) => b.value === brand)?.label
                            : "Selecciona una marca..."}
                        </span>
                        <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                      </button>
                      {openBrand && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setOpenBrand(false)} />
                          <div className="absolute top-12 left-0 z-50 w-full bg-white border border-gray-200 rounded-xl shadow-xl max-h-60 overflow-y-auto p-1.5 space-y-1 animate-in fade-in duration-200">
                            <input
                              type="text"
                              placeholder="Buscar marca..."
                              value={filterBrand}
                              onChange={(e) => setFilterBrand(e.target.value)}
                              className="w-full h-9 px-3 bg-gray-50 rounded-lg border border-gray-100 outline-none focus:ring-1 focus:ring-primary-yellow text-xs mb-1"
                            />
                            {brands
                              .filter(br => br.label.toLowerCase().includes(filterBrand.toLowerCase()))
                              .map((b) => (
                                <button
                                  key={b.value}
                                  type="button"
                                  onClick={() => {
                                    setBrand(b.value);
                                    setOpenBrand(false);
                                    setFilterBrand("");
                                  }}
                                  className={cn(
                                    "w-full text-left px-3 py-2 text-xs rounded-lg flex items-center justify-between transition-colors cursor-pointer",
                                    brand === b.value 
                                      ? "bg-primary-yellow/20 text-black font-semibold" 
                                      : "hover:bg-gray-50 text-gray-700"
                                  )}
                                >
                                  <span>{b.label}</span>
                                  {brand === b.value && <Check size={14} className="text-black shrink-0" />}
                                </button>
                              ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 text-left">
                  {/* 4. Modelo */}
                  <div className="space-y-2 flex flex-col">
                    <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Modelo</Label>
                    <Input 
                      placeholder="Ej.: Deluxe 2000" 
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      className="bg-gray-50 border-gray-200 h-11 px-[12px] py-[8px] rounded-xl"
                    />
                  </div>

                  {/* 5. SKU */}
                  <div className="space-y-2 flex flex-col">
                    <div className="flex items-center gap-2">
                      <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Código de producto</Label>
                      <button 
                        type="button"
                        onClick={() => setShowSKUHelp(!showSKUHelp)}
                        className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer border-none bg-transparent"
                      >
                        <HelpCircle size={14} />
                      </button>
                    </div>
                    {showSKUHelp && (
                      <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-left space-y-1 animate-in slide-in-from-top-1 duration-200">
                        <p className="text-xs font-semibold text-primary-black">¿Dónde encontrar el código?</p>
                        <p className="text-[10px] text-primary-gray leading-tight">Usualmente aparece como un código numérico junto a la descripción del artículo en tu comprobante o factura.</p>
                      </div>
                    )}
                    <Input 
                      placeholder="Por ejemplo, 987654" 
                      value={sku}
                      onChange={(e) => setSku(e.target.value)}
                      className="bg-gray-50 border-gray-200 h-11 px-[12px] py-[8px] rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 text-left">
                  {/* 6. Número de serie */}
                  <div className="space-y-2 flex flex-col">
                    <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Número de serie</Label>
                    <Input 
                      placeholder="Ej.: SN-123456789" 
                      value={serialNumber}
                      onChange={(e) => setSerialNumber(e.target.value)}
                      className="bg-gray-50 border-gray-200 h-11 px-[12px] py-[8px] rounded-xl"
                    />
                  </div>

                  {/* 7. Número de Factura */}
                  <div className="space-y-2 flex flex-col">
                    <div className="flex items-center gap-2">
                      <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">No. de Factura</Label>
                      <button 
                        type="button"
                        onClick={() => setShowInvoiceHelp(!showInvoiceHelp)}
                        className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer border-none bg-transparent"
                      >
                        <HelpCircle size={14} />
                      </button>
                    </div>
                    {showInvoiceHelp && (
                      <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-left space-y-1 animate-in slide-in-from-top-1 duration-200">
                        <p className="text-xs font-semibold text-primary-black">¿Dónde encontrar la Factura?</p>
                        <p className="text-[10px] text-primary-gray leading-tight">El número de factura se encuentra generalmente en la parte superior derecha de tu documento de compra.</p>
                      </div>
                    )}
                    <Input 
                      placeholder="Ej.: FAC-001-2024" 
                      value={invoiceNumber}
                      onChange={(e) => setInvoiceNumber(e.target.value)}
                      className="bg-gray-50 border-gray-200 h-11 px-[12px] py-[8px] rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 text-left">
                  {/* 8. Fecha de compra */}
                  <div className="space-y-2 flex flex-col">
                    <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Fecha de compra</Label>
                    <input
                      type="date"
                      value={purchaseDate ? purchaseDate.toISOString().split('T')[0] : ""}
                      onChange={(e) => {
                        if (e.target.value) {
                           setPurchaseDate(new Date(e.target.value));
                        } else {
                           setPurchaseDate(undefined);
                        }
                      }}
                      className="w-full h-11 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm text-primary-black font-normal outline-none focus:ring-1 focus:ring-primary-yellow transition-all font-sans"
                    />
                  </div>

                  {/* 9. Nombre "Alias" */}
                  <div className="space-y-2 flex flex-col">
                    <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Nombre del equipo (Alias)</Label>
                    <Input 
                      placeholder="Ej.: Aire cuarto de Ana" 
                      value={alias}
                      onChange={(e) => setAlias(e.target.value)}
                      className="bg-gray-50 border-gray-200 h-11 px-[12px] py-[8px] rounded-xl"
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="px-6 py-6 space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex flex-col w-full">
                  <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">¿Qué problema presenta el equipo?</Label>
                  <textarea 
                    placeholder="Describe detalladamente el fallo o defecto..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full rounded-lg p-3 outline-none resize-none transition-colors border"
                    style={{
                      backgroundColor: 'var(--gray-50)',
                      borderColor: 'var(--gray-200)',
                      fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif",
                      fontSize: '14px',
                      color: 'var(--primary-black)',
                      minHeight: '150px'
                    }}
                  />
                </div>

                <div className="flex flex-col w-full">
                  <Label className="flex items-baseline justify-between gap-2 text-xs font-bold text-gray-500 mb-2">
                    Adjuntar fotos o videos
                    <MarcaCampo />
                  </Label>
                  <div className="flex flex-wrap gap-3">
                    {attachedPhotos.map((photo, index) => (
                      <div key={index} className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-100 flex-shrink-0">
                        <img src={photo} alt={`Reference ${index}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        <button 
                          onClick={() => removePhoto(index)}
                          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/50 flex items-center justify-center backdrop-blur-sm border-none cursor-pointer"
                        >
                          <X size={12} color="white" strokeWidth={3} />
                        </button>
                      </div>
                    ))}
                    
                    <button
                      onClick={handleAddPhoto}
                      className="w-20 h-20 rounded-lg flex flex-col items-center justify-center gap-1 border border-dashed transition-all active:scale-95 cursor-pointer bg-white"
                      style={{
                        borderColor: 'var(--gray-300)',
                        color: 'var(--gray-500)'
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
            )}

            {currentStep === 3 && (
              <div className="px-6 py-6 space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                
                {/* Panel de Simulación eliminado */}

                {/* SECTION 1: Mis Direcciones Section */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-gray-500 uppercase font-bebas tracking-widest text-[12px]">
                      Mis Direcciones Guardadas
                    </Label>
                  </div>

                  {simulateNoSavedAddresses ? (
                    /* CA5: Empty State Design */
                    <div className="p-6 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 flex flex-col items-center justify-center text-center animate-in fade-in duration-300">
                      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                        <Home size={22} className="text-gray-400" />
                      </div>
                      <h4 className="text-sm font-bold text-primary-black">No tienes direcciones guardadas</h4>
                      <p className="text-xs text-gray-500 mt-1 max-w-[260px] leading-relaxed">
                        Aún no hemos detectado ubicaciones en tu perfil de cliente. Ubica una nueva dirección abajo.
                      </p>
                      <button
                        type="button"
                        onClick={() => setSimulateNoSavedAddresses(false)}
                        className="mt-3 text-xs text-primary-gray hover:text-black font-bold underline bg-transparent border-none cursor-pointer"
                      >
                        Reactivar direcciones del perfil
                      </button>
                    </div>
                  ) : (
                    /* CA1: Addresses loaded state. Styled radio button card details with inline edit */
                    <div className="grid grid-cols-1 gap-3">
                      {savedAddresses.map((addr) => {
                        const isSelected = selectedAddressId === addr.id && useSavedAddress;
                        const isEditing = editingAddressId === addr.id;

                        if (isEditing) {
                          return (
                            <div 
                              key={addr.id}
                              className="p-4 rounded-xl border border-gray-200 bg-white space-y-3 animate-in fade-in duration-200"
                            >
                              <div className="text-left">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Nombre de Ubicación</label>
                                <input
                                  type="text"
                                  value={editLabel}
                                  onChange={(e) => setEditLabel(e.target.value)}
                                  className="w-full mt-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-primary-black focus:outline-none focus:ring-1 focus:ring-black"
                                />
                              </div>
                              <div className="text-left">
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
                              setFormErrors(prev => ({ ...prev, map: undefined }));
                            }}
                            className="p-4 rounded-xl border transition-all duration-200 cursor-pointer flex gap-4 items-start shadow-sm hover:shadow-md relative group"
                            style={{ 
                              backgroundColor: isSelected ? 'rgba(251, 204, 0, 0.04)' : 'var(--primary-white)',
                              borderColor: isSelected ? 'var(--primary-yellow)' : 'var(--gray-200)',
                            }}
                          >
                            {/* Selected Radio Ring selector */}
                            <div 
                              className="w-5 h-5 rounded-full border-2 mt-0.5 flex-shrink-0 flex items-center justify-center transition-all"
                              style={{ 
                                borderColor: isSelected ? 'var(--primary-yellow)' : 'var(--gray-300)',
                                backgroundColor: isSelected ? 'var(--primary-yellow)' : 'transparent'
                              }}
                            >
                              {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                            </div>

                            <div className="flex-1 min-w-0 pr-8">
                              <p className="text-sm font-bold text-primary-black uppercase tracking-wide">
                                {addr.label}
                              </p>
                              <p className="text-xs text-gray-500 mt-1 leading-normal font-sans" style={{ fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif" }}>
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
                  )}
                  {formErrors.map && useSavedAddress && (
                    <span className="text-[11px] text-red-500 font-medium flex items-center gap-1">
                      {formErrors.map}
                    </span>
                  )}
                </div>

                {/* Visual Separator */}
                <div className="flex items-center gap-3 py-1">
                  <div className="h-[1px] flex-1 bg-gray-155" />
                  <span className="text-[10px] text-gray-300 font-bold uppercase tracking-wider">O</span>
                  <div className="h-[1px] flex-1 bg-gray-155" />
                </div>

                {/* SECTION 2: Ingresar Otra Dirección Section */}
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    <Label className="text-xs font-bold text-gray-500 uppercase font-bebas tracking-widest text-[12px]">
                      Ingresar Otra Dirección
                    </Label>
                    <p className="text-[11px] text-gray-400">Si tu dirección de visita no coincide con tus direcciones guardadas.</p>
                  </div>

                  {/* CA2: High hierarchy button "Ubicar en el mapa" with Loading State feedback */}
                  <button 
                    type="button"
                    onClick={() => {
                      setIsMapLoading(true);
                      setTimeout(() => {
                        setIsMapLoading(false);
                        setShowMapModal(true);
                        setUseSavedAddress(false);
                      }, 600); // Simulated render lag of Map engine
                    }}
                    disabled={isMapLoading}
                    className={`w-full flex items-center justify-center gap-3 p-4 rounded-xl transition-all active:scale-[0.98] border cursor-pointer ${
                      !useSavedAddress && isMapSelected 
                        ? "border-primary-yellow bg-primary-yellow/10 shadow-sm" 
                        : "border-gray-200 bg-white hover:bg-gray-50/50"
                    }`}
                  >
                    {isMapLoading ? (
                      <Loader2 size={18} className="text-black animate-spin" />
                    ) : (
                      <div className="w-8 h-8 rounded-full flex items-center justify-center bg-primary-yellow/15 border border-primary-yellow/30">
                        <MapPin size={18} className="text-black" />
                      </div>
                    )}
                    <div className="flex-1 text-left">
                      <p className="text-sm font-bold text-primary-black">Ubicar en el mapa</p>
                      <p className="text-[10px] text-gray-400">
                        {!useSavedAddress && isMapSelected 
                          ? "Ubicación georreferenciada correctamente" 
                          : "Usa el GPS o buscador para marcar el punto"}
                      </p>
                    </div>
                    <ChevronRight size={16} className="text-gray-400" />
                  </button>

                  {formErrors.map && !useSavedAddress && (
                    <span className="text-[11px] text-red-500 font-medium flex items-center gap-1">
                      {formErrors.map}
                    </span>
                  )}

                  {/* CA3 & CA4: Main Form (displayed after map positioning confirmation) */}
                  {isMapSelected && !useSavedAddress && (
                    <div className="space-y-4 animate-in border-t border-gray-100 pt-4 text-left">
                      
                      <div className="flex items-center gap-2 mb-2 p-2 bg-green-50 rounded-lg border border-green-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-[10px] text-green-700 font-bold uppercase tracking-wider">
                          Ubicación confirmada
                        </span>
                      </div>

                      {/* CA3: Read-Only Autocompleted Fields with Lock icons */}
                      <div className="grid grid-cols-3 gap-3">
                        <div className="flex flex-col gap-1.5 col-span-1">
                          <Label className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1">
                            Provincia <Lock size={10} className="text-gray-400 shrink-0" />
                          </Label>
                          <div className="relative">
                            <input
                              type="text"
                              value={addressDetails.provincia}
                              readOnly
                              className="w-full h-10 px-3 bg-gray-100 border border-gray-200 rounded-lg text-xs font-medium text-gray-500 select-none cursor-not-allowed outline-none"
                              style={{ fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif" }}
                            />
                          </div>
                        </div>

                        <div className="flex flex-col gap-1.5 col-span-1">
                          <Label className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1">
                            Distrito <Lock size={10} className="text-gray-400 shrink-0" />
                          </Label>
                          <div className="relative">
                            <input
                              type="text"
                              value={addressDetails.distrito}
                              readOnly
                              className="w-full h-10 px-3 bg-gray-100 border border-gray-200 rounded-lg text-xs font-medium text-gray-500 select-none cursor-not-allowed outline-none"
                              style={{ fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif" }}
                            />
                          </div>
                        </div>

                        <div className="flex flex-col gap-1.5 col-span-1">
                          <Label className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1">
                            Corregimiento <Lock size={10} className="text-gray-400 shrink-0" />
                          </Label>
                          <div className="relative">
                            <input
                              type="text"
                              value={addressDetails.corregimiento}
                              readOnly
                              className="w-full h-10 px-3 bg-gray-100 border border-gray-200 rounded-lg text-xs font-medium text-gray-500 select-none cursor-not-allowed outline-none"
                              style={{ fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif" }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <Label className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1">
                          Calle / Dirección <Lock size={10} className="text-gray-400 shrink-0" />
                        </Label>
                        <input
                          type="text"
                          value={addressDetails.calle}
                          readOnly
                          className="w-full h-10 px-3 bg-gray-100 border border-gray-200 rounded-lg text-xs font-medium text-gray-500 select-none cursor-not-allowed outline-none"
                          style={{ fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif" }}
                        />
                      </div>

                      {/* CA3: Switch Toggle Component "¿Es Edificio?" (Casa / Edificio) */}
                      <div className="p-3 bg-gray-50 rounded-xl border border-gray-150 flex items-center justify-between">
                        <div className="flex flex-col">
                          <Label className="text-xs font-bold text-primary-black">¿Es un edificio?</Label>
                          <span className="text-[10px] text-gray-500">Toca el botón para cambiar el formato de entrega</span>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <span className={`text-xs font-bold transition-all ${!isBuilding ? "text-black" : "text-gray-400"}`}>
                            Casa
                          </span>
                          
                          <button
                            type="button"
                            onClick={() => {
                              setIsBuilding(!isBuilding);
                              // Clear inputs or reset errors
                              setFormErrors(prev => ({ ...prev, numero: undefined }));
                            }}
                            className={`w-12 h-6.5 rounded-full p-0.5 transition-colors relative flex items-center cursor-pointer ${
                              isBuilding ? "bg-primary-yellow" : "bg-gray-300"
                            }`}
                          >
                            <div
                              className={`w-5.5 h-5.5 bg-white rounded-full shadow-md transform transition-transform duration-250 ${
                                isBuilding ? "translate-x-5.5" : "translate-x-0"
                              }`}
                            />
                          </button>
                          
                          <span className={`text-xs font-bold transition-all ${isBuilding ? "text-black" : "text-gray-400"}`}>
                            Edificio
                          </span>
                        </div>
                      </div>

                      {/* CA4: Manual standard Alphanumeric fields with validation guides */}
                      {isBuilding && (
                        <div className="flex flex-col gap-2 animate-in slide-in-from-top-1">
                          <Label className="text-[10px] font-bold text-gray-500 uppercase">
                            Nombre del Edificio (Opcional)
                          </Label>
                          <Input
                            placeholder="Ej.: P.H. Pacific Plaza, Torre A"
                            value={addressDetails.edificioCasa}
                            onChange={(e) => handleFieldChange("edificioCasa", e.target.value)}
                            className="h-10 text-xs text-primary-black bg-white border border-gray-200"
                          />
                        </div>
                      )}

                      <div className="flex flex-col gap-2">
                        <Label className="text-[10px] font-bold text-gray-500 uppercase flex items-center justify-between">
                          <span>
                            {isBuilding ? "Número de apartamento" : "Número de casa/Lote"}
                            <span className="text-red-500 ml-1">*</span>
                          </span>
                        </Label>
                        <Input
                          placeholder={isBuilding ? "Ej.: Apt 12C, Piso 12" : "Ej.: Casa No. 44, Calle B"}
                          value={addressDetails.numero}
                          onChange={(e) => handleFieldChange("numero", e.target.value)}
                          className={`h-11 text-xs text-primary-black bg-white border ${
                            formErrors.numero ? "border-red-500 ring-1 ring-red-500 focus:ring-red-500 focus:border-red-500" : "border-gray-200"
                          }`}
                        />
                        {formErrors.numero && (
                          <span className="text-[10px] text-red-500 font-medium animate-in fade-in">
                            {formErrors.numero}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-col gap-2">
                        <Label className="text-[10px] font-bold text-gray-500 uppercase flex items-center justify-between">
                          <span>
                            Alias de la dirección
                            <span className="text-red-500 ml-1">*</span>
                          </span>
                        </Label>
                        <Input
                          placeholder="Ej.: Casa de Mamá, Depósito, Local"
                          value={customAlias}
                          onChange={(e) => {
                            setCustomAlias(e.target.value);
                            if (e.target.value.trim()) {
                              setFormErrors(prev => ({ ...prev, alias: undefined }));
                            }
                          }}
                          className={`h-11 text-xs text-primary-black bg-white border ${
                            formErrors.alias ? "border-red-500 ring-1 ring-red-500 focus:ring-red-500" : "border-gray-200"
                          }`}
                        />
                        {formErrors.alias && (
                          <span className="text-[10px] text-red-500 font-medium animate-in fade-in">
                            {formErrors.alias}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-col gap-2">
                        <Label className="text-[10px] font-bold text-gray-500 uppercase flex items-center justify-between">
                          <span>Puntos de referencia de ayuda</span>
                          <span className="text-gray-400 text-[9px] font-normal tracking-wide italic">(Opcional)</span>
                        </Label>
                        <textarea
                          placeholder="Ej.: Casa con cerca blanca, frente al parque, portón de hierro negro con timonel..."
                          value={addressDetails.otros}
                          onChange={(e) => handleFieldChange("otros", e.target.value)}
                          className="w-full text-xs text-primary-black border border-gray-200 bg-white p-3 rounded-lg h-20 outline-none focus:ring-1 focus:ring-primary-yellow resize-none font-sans"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Info Disclaimer */}
                <div className="p-4 rounded-xl flex gap-3 bg-blue-50/50 border border-blue-100">
                  <Info size={16} className="text-blue-500 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-blue-700 leading-normal font-sans" style={{ fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif" }}>
                    <b>Información de visitas:</b> Usaremos esta dirección para coordinar la atención del producto si es necesario.
                  </p>
                </div>

                {/* CA2: IMMERSIVE FULL-SCREEN MAP PICKER MODAL */}
                {showMapModal && (
                  <div className="fixed inset-0 z-[200] flex flex-col bg-[#F5F4EF] animate-in fade-in duration-300 select-none overflow-hidden">
                    
                    {/* Floating Map Suggestions list popup */}
                    {searchMapQuery.trim().length > 1 && (
                      <div className="absolute top-22 left-6 right-6 z-40 bg-white rounded-2xl shadow-xl border border-gray-100 flex flex-col p-2 max-h-[220px] overflow-y-auto animate-in slide-in-from-top-2 duration-300">
                        <p className="text-[10px] font-bold text-gray-400 px-3 py-1.5 uppercase">Direcciones Encontradas</p>
                        
                        {(searchMapQuery.toLowerCase().includes("albrook") || searchMapQuery.toLowerCase().includes("mall")) && (
                          <button
                            type="button"
                            onClick={() => {
                              setIsReverseGeocoding(true);
                              setSearchMapQuery("");
                              // Move Map slightly
                              setMapOffset({ x: -100, y: -100 });
                              setTimeout(() => {
                                setIsReverseGeocoding(false);
                                setAddressDetails({
                                  pais: "Panamá",
                                  provincia: "Panamá",
                                  distrito: "Panamá",
                                  corregimiento: "Ancón",
                                  calle: "Avenida Omar Torrijos",
                                  edificioCasa: "Centro Comercial Albrook Mall",
                                  numero: "Local 54, Pasillo del Dinosaurio",
                                  otros: "Frente al Food Court"
                                });
                              }, 700);
                            }}
                            className="p-3 text-left hover:bg-primary-yellow/15 rounded-xl text-xs flex items-center gap-2 border-none bg-transparent cursor-pointer"
                          >
                            
                            <div className="flex flex-col">
                              <b className="text-primary-black">Albrook Mall Centro Comercial</b>
                              <span className="text-[10px] text-gray-400">Ancón, Provincia de Panamá</span>
                            </div>
                          </button>
                        )}

                        {(searchMapQuery.toLowerCase().includes("costa") || searchMapQuery.toLowerCase().includes("este")) && (
                          <button
                            type="button"
                            onClick={() => {
                              setIsReverseGeocoding(true);
                              setSearchMapQuery("");
                              setMapOffset({ x: -50, y: -650 });
                              setTimeout(() => {
                                setIsReverseGeocoding(false);
                                setAddressDetails({
                                  pais: "Panamá",
                                  provincia: "Panamá",
                                  distrito: "Panamá",
                                  corregimiento: "Juan Díaz",
                                  calle: "Avenida Paseo del Mar",
                                  edificioCasa: "Torre Credicorp Costa del Este",
                                  numero: "Piso 25",
                                  otros: "Cerca de la Farmacia Arrocha"
                                });
                              }, 700);
                            }}
                            className="p-3 text-left hover:bg-primary-yellow/15 rounded-xl text-xs flex items-center gap-2 border-none bg-transparent cursor-pointer"
                          >
                            
                            <div className="flex flex-col">
                              <b className="text-primary-black">Torre Credicorp Costa del Este</b>
                              <span className="text-[10px] text-gray-400">Juan Díaz, Costa del Este, Panamá</span>
                            </div>
                          </button>
                        )}

                        {(searchMapQuery.toLowerCase().includes("casco") || searchMapQuery.toLowerCase().includes("viejo")) && (
                          <button
                            type="button"
                            onClick={() => {
                              setIsReverseGeocoding(true);
                              setSearchMapQuery("");
                              setMapOffset({ x: -800, y: -800 });
                              setTimeout(() => {
                                setIsReverseGeocoding(false);
                                setAddressDetails({
                                  pais: "Panamá",
                                  provincia: "Panamá",
                                  distrito: "Panamá",
                                  corregimiento: "San Felipe",
                                  calle: "Avenida Central",
                                  edificioCasa: "Plaza Mayor Casco Viejo",
                                  numero: "Hostal Casa Colonial",
                                  otros: "Diagonal de la Iglesia San José"
                                });
                              }, 700);
                            }}
                            className="p-3 text-left hover:bg-primary-yellow/15 rounded-xl text-xs flex items-center gap-2 border-none bg-transparent cursor-pointer"
                          >
                            
                            <div className="flex flex-col">
                              <b className="text-primary-black">Plaza Mayor Casco Viejo</b>
                              <span className="text-[10px] text-gray-400">San Felipe, Casco Antiguo, Panamá</span>
                            </div>
                          </button>
                        )}

                        {/* Generic response suggestion */}
                        <button
                          type="button"
                          onClick={() => {
                            setIsReverseGeocoding(true);
                            const q = searchMapQuery;
                            setSearchMapQuery("");
                            setMapOffset({ x: -450, y: -450 });
                            setTimeout(() => {
                              setIsReverseGeocoding(false);
                              setAddressDetails({
                                pais: "Panamá",
                                provincia: "Panamá",
                                distrito: "Panamá",
                                corregimiento: "Bella Vista",
                                calle: q || "Calle 50",
                                edificioCasa: "Torre Financiera",
                                numero: "Piso 4",
                                otros: "Punto guardado del mapa"
                              });
                            }, 700);
                          }}
                          className="p-3 text-left hover:bg-primary-yellow/15 rounded-xl text-xs flex items-center gap-2 border-none bg-transparent cursor-pointer"
                        >
                          
                          <div className="flex flex-col">
                            <b className="text-primary-black">Buscar "{searchMapQuery}"...</b>
                            <span className="text-[10px] text-gray-400">Buscar este término de georreferencia en Panamá</span>
                          </div>
                        </button>
                      </div>
                    )}

                    {/* TOP NAVIGATION FLOATING CONTROLS */}
                    <div className="absolute top-4 left-4 right-4 z-30 flex flex-col gap-3">
                      
                      {/* Close & Header bar overlay */}
                      <div className="flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => setShowMapModal(false)}
                          className="w-10 h-10 rounded-full bg-white shadow-lg border border-gray-150 flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
                        >
                          <ArrowLeft size={18} className="text-primary-black" />
                        </button>

                        <div className="bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full shadow-md border border-gray-150 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary-yellow animate-pulse" />
                          <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest font-sans">
                            Seleccionar Dirección
                          </span>
                        </div>

                        <div className="w-10 h-10 opacity-0" /> {/* Spacer */}
                      </div>

                      {/* Floating Search Bar auto-suggestions input on Map */}
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2">
                          <Search size={18} className="text-gray-400" />
                        </div>
                        <input
                          type="text"
                          placeholder="Buscar dirección o punto de referencia..."
                          value={searchMapQuery}
                          onChange={(e) => setSearchMapQuery(e.target.value)}
                          className="w-full h-12 pl-11 pr-10 rounded-2xl bg-white shadow-xl border border-gray-150 text-sm outline-none focus:ring-2 focus:ring-black"
                        />
                        {searchMapQuery && (
                          <button
                            type="button"
                            onClick={() => setSearchMapQuery("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-black border-none bg-transparent cursor-pointer"
                          >
                            <X size={15} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* GPS Floating Trigger Button */}
                    <div className="absolute bottom-48 right-4 z-30">
                      <button
                        type="button"
                        onClick={() => {
                          setIsGPSLocating(true);
                          setIsReverseGeocoding(true);
                          setMapOffset({ x: -450, y: -450 }); // Reset back to default Central Casa
                          setTimeout(() => {
                            setIsGPSLocating(false);
                            setIsReverseGeocoding(false);
                            setAddressDetails({
                              pais: "Panamá",
                              provincia: "Panamá",
                              distrito: "Panamá",
                              corregimiento: "Bella Vista",
                              calle: "Calle 50",
                              edificioCasa: "Estatua Einstein",
                              numero: "Punto GPS",
                              otros: "Ubicación GPS registrada desde dispositivo móvil"
                            });
                          }, 900);
                        }}
                        className="w-12 h-12 rounded-full bg-primary-yellow text-primary-black shadow-2xl border-none flex items-center justify-center cursor-pointer hover:bg-black hover:text-white transition-all active:scale-90"
                        title="Usar mi ubicación actual"
                      >
                        {isGPSLocating ? (
                          <Loader2 size={20} className="animate-spin text-black" />
                        ) : (
                          <Compass size={22} className="text-black" />
                        )}
                      </button>
                    </div>

                    {/* DYNAMIC TRACKING GRAPHICS - THE DRAGGABLE MAP CANVAS */}
                    <div
                      className="flex-1 w-full relative cursor-grab active:cursor-grabbing overflow-hidden"
                      onMouseDown={(e) => {
                        setIsPanning(true);
                        setPanStart({ x: e.clientX - mapOffset.x, y: e.clientY - mapOffset.y });
                      }}
                      onMouseMove={(e) => {
                        if (!isPanning) return;
                        const newX = e.clientX - panStart.x;
                        const newY = e.clientY - panStart.y;
                        
                        // Bound map translations to maintain view inside Panamá street network
                        setMapOffset({
                          x: Math.max(-1400, Math.min(200, newX)),
                          y: Math.max(-1400, Math.min(200, newY))
                        });
                      }}
                      onMouseUp={() => {
                        setIsPanning(false);
                        // Trigger reverse geocoding simulation on mouse release
                        setIsReverseGeocoding(true);
                        setTimeout(() => setIsReverseGeocoding(false), 500);
                      }}
                      onTouchStart={(e) => {
                        if (e.touches.length === 1) {
                          setIsPanning(true);
                          setPanStart({
                            x: e.touches[0].clientX - mapOffset.x,
                            y: e.touches[0].clientY - mapOffset.y
                          });
                        }
                      }}
                      onTouchMove={(e) => {
                        if (!isPanning || e.touches.length !== 1) return;
                        const newX = e.touches[0].clientX - panStart.x;
                        const newY = e.touches[0].clientY - panStart.y;
                        setMapOffset({
                          x: Math.max(-1400, Math.min(200, newX)),
                          y: Math.max(-1400, Math.min(200, newY))
                        });
                      }}
                      onTouchEnd={() => {
                        setIsPanning(false);
                        setIsReverseGeocoding(true);
                        setTimeout(() => setIsReverseGeocoding(false), 500);
                      }}
                    >
                      {/* Draggable Panning Map Image Grid Layer */}
                      <div
                        className="absolute select-none pointer-events-none transition-transform duration-75"
                        style={{
                          width: "2000px",
                          height: "2000px",
                          transform: `translate(${mapOffset.x}px, ${mapOffset.y}px)`,
                          backgroundColor: "var(--gray-3)"
                        }}
                      >
                        {/* Render beautifully styled SVG streets canvas */}
                        <svg className="w-full h-full opacity-90" viewBox="0 0 2000 2000" fill="none" xmlns="http://www.w3.org/2000/svg">
                          {/* Bay of Panama (Teal ocean using info-blue with opacity) */}
                          <path d="M 0 1500 Q 600 1300 1200 1600 T 2000 1500 L 2000 2000 L 0 2000 Z" fill="var(--info-blue)" fillOpacity="0.15" stroke="var(--info-blue)" strokeOpacity="0.3" strokeWidth="5" />
                          
                          {/* Parks green grids using success-green with opacity */}
                          <rect x="250" y="300" width="220" height="250" rx="20" fill="var(--success-green)" fillOpacity="0.15" stroke="var(--success-green)" strokeOpacity="0.3" strokeWidth="2" />
                          <circle cx="1500" cy="800" r="160" fill="var(--success-green)" fillOpacity="0.15" stroke="var(--success-green)" strokeOpacity="0.3" strokeWidth="2" />
                          <rect x="800" y="450" width="300" height="150" rx="15" fill="var(--success-green)" fillOpacity="0.15" stroke="var(--success-green)" strokeOpacity="0.3" strokeWidth="2" />
                          
                          {/* Albrook Airport runway */}
                          <rect x="100" y="800" width="120" height="600" rx="8" fill="var(--gray-20)" transform="rotate(-15, 100, 800)" />
                          <line x1="200" y1="850" x2="250" y2="1350" stroke="var(--gray-60)" strokeWidth="4" strokeDasharray="15,10" />

                          {/* Primary Highways (thick white roads with gray center alignments) */}
                          <path d="M 0 500 Q 1000 450 2000 550" stroke="var(--primary-white)" strokeWidth="32" strokeLinecap="round" />
                          <path d="M 0 500 Q 1000 450 2000 550" stroke="var(--gray-8)" strokeWidth="24" strokeLinecap="round" />
                          <path d="M 0 500 Q 1000 450 2000 550" stroke="var(--gray-40)" strokeWidth="2" strokeDasharray="8,6" strokeLinecap="round" />

                          <path d="M 900 0 L 1000 2000" stroke="var(--primary-white)" strokeWidth="28" strokeLinecap="round" />
                          <path d="M 900 0 L 1000 2000" stroke="var(--gray-8)" strokeWidth="20" strokeLinecap="round" />

                          <path d="M 1200 400 L 1200 1600" stroke="var(--primary-white)" strokeWidth="24" strokeLinecap="round" />
                          <path d="M 1200 400 L 1200 1600" stroke="var(--gray-8)" strokeWidth="16" strokeLinecap="round" />

                          <path d="M 100 100 L 1900 1300" stroke="var(--primary-white)" strokeWidth="22" strokeLinecap="round" />
                          
                          {/* Secondary streets grids */}
                          <line x1="300" y1="0" x2="300" y2="2000" stroke="var(--primary-white)" strokeWidth="12" />
                          <line x1="600" y1="0" x2="600" y2="2000" stroke="var(--primary-white)" strokeWidth="12" />
                          <line x1="1500" y1="0" x2="1500" y2="2000" stroke="var(--primary-white)" strokeWidth="12" />
                          <line x1="1750" y1="0" x2="1750" y2="2000" stroke="var(--primary-white)" strokeWidth="12" />

                          <line x1="0" y1="200" x2="2000" y2="200" stroke="var(--primary-white)" strokeWidth="12" />
                          <line x1="0" y1="1000" x2="2000" y2="1000" stroke="var(--primary-white)" strokeWidth="12" />
                          <line x1="0" y1="1250" x2="2000" y2="1250" stroke="var(--primary-white)" strokeWidth="12" />

                          {/* Street Grid markings */}
                          <circle cx="950" cy="500" r="45" fill="var(--primary-white)" stroke="var(--gray-20)" strokeWidth="4" />
                          <circle cx="1200" cy="1000" r="35" fill="var(--primary-white)" stroke="var(--gray-20)" strokeWidth="4" />

                          {/* Districts Text Overlay Labels using theme design colors */}
                          <text x="360" y="420" fill="var(--success-green)" fontSize="24" fontWeight="600" letterSpacing="1">PARQUE URBANO</text>
                          <text x="1400" y="810" fill="var(--success-green)" fontSize="22" fontWeight="600" letterSpacing="1">PARQUE OMAR</text>
                          
                          <text x="750" y="320" fill="var(--gray-60)" fontSize="20" fontWeight="bold">BELLA VISTA</text>
                          <text x="1450" y="550" fill="var(--gray-60)" fontSize="20" fontWeight="bold">SAN FRANCISCO</text>
                          <text x="1350" y="1200" fill="var(--gray-60)" fontSize="20" fontWeight="bold">MARBELLA</text>
                          <text x="400" y="1050" fill="var(--gray-60)" fontSize="20" fontWeight="bold">ANCÓN</text>
                          <text x="350" y="1450" fill="var(--info-blue)" fontSize="22" fontWeight="bold" letterSpacing="1">BAHÍA DE PANAMÁ</text>

                          <text x="200" y="480" fill="var(--gray-40)" fontSize="15" transform="rotate(-3, 200, 480)">VÍA ESPAÑA</text>
                          <text x="700" y="980" fill="var(--gray-40)" fontSize="15">CALLE 50</text>
                          <text x="1550" y="1120" fill="var(--gray-40)" fontSize="15" transform="rotate(35, 1550, 1120)">VÍA ISRAEL</text>
                          <text x="965" y="1100" fill="var(--gray-40)" fontSize="15" transform="rotate(90, 965, 1100)">AVENIDA BALBOA</text>
                        </svg>

                        {/* Floating landmark pins inside Draggable Canvas Map */}
                        <div className="absolute top-[960px] left-[1180px] bg-white border border-gray-200 shadow-md px-2 py-1 rounded-lg flex items-center gap-1.5 animate-bounce">
                          <span className="text-xs"></span>
                          <span className="text-[10px] font-bold text-gray-800">Torre Global Bank</span>
                        </div>

                        <div className="absolute top-[480px] left-[780px] bg-white border border-gray-200 shadow-md px-2 py-1 rounded-lg flex items-center gap-1.5">
                          <span className="text-xs"></span>
                          <span className="text-[10px] font-bold text-gray-800">Parque Andrés Bello</span>
                        </div>

                        <div className="absolute top-[1080px] left-[1500px] bg-white border border-gray-200 shadow-md px-2 py-1 rounded-lg flex items-center gap-1.5">
                          <span className="text-xs"></span>
                          <span className="text-[10px] font-bold text-gray-800">Multiplaza Panamá</span>
                        </div>
                      </div>

                      {/* FIXED CENTRAL marker PIN overlaid over draggable panel (Gives Lift-off physical effects) */}
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none flex flex-col items-center">
                        {/* Ring tracking shadow expanding and lifting */}
                        <div
                          className={`w-4 h-2 bg-black/25 rounded-full blur-xs transition-all duration-200 ${
                            isPanning ? "scale-50 opacity-40 translate-y-3" : "scale-100 opacity-90"
                          }`}
                        />
                        
                        {/* Pulse radar expanding ring */}
                        <div className="absolute w-12 h-12 rounded-full border-2 border-primary-yellow animate-ping opacity-25 mt-[-15px]" />

                        {/* Visual Pin Element lifting */}
                        <div 
                          className={`transition-all duration-220 flex flex-col items-center ${
                            isPanning ? "-translate-y-6 scale-110" : "translate-y-0"
                          }`}
                        >
                          {/* Map Pin standard custom design vector */}
                          <div className="w-9 h-9 rounded-full bg-black border-2 border-white shadow-xl flex items-center justify-center relative">
                            <span className="text-white text-xs font-bold"></span>
                          </div>
                          
                          {/* Little needle triangle */}
                          <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[8px] border-t-black mt-[-1px]" />
                        </div>
                      </div>
                    </div>

                    {/* BOTTOM PANEL CONTROLS OVER MAP */}
                    <div className="p-4 bg-white border-t border-gray-200 shadow-3xl z-30 flex flex-col gap-4">
                      
                      {/* Interactive Reverse Geocoding Address Indicator bar */}
                      <div className="flex gap-3 items-start bg-gray-50 p-4 rounded-2xl border border-gray-150 relative">
                        {isReverseGeocoding && (
                          <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex items-center justify-center gap-2 rounded-2xl z-20">
                            <Loader2 size={16} className="text-black animate-spin" />
                            <span className="text-xs font-bold text-gray-500">Obteniendo dirección...</span>
                          </div>
                        )}
                        <div className="w-9 h-9 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0 mt-0.5">
                          <MapPin size={18} className="text-black" />
                        </div>
                        <div className="flex-1 text-left min-w-0">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Dirección Detectada</span>
                          
                          {/* Dynamic map values based on panning offset coordinates */}
                          <p className="text-xs font-bold text-primary-black uppercase truncate mt-0.5">
                            {mapOffset.x > -300 ? "Vía Israel, Multiplaza Panamá" : mapOffset.y > -350 ? "Avenida Balboa, Torre Banco Center" : "Calle 50, Edificio Global Bank"}
                          </p>
                          <p className="text-[11px] text-gray-500 leading-tight block truncate">
                            {mapOffset.x > -300 
                              ? "Corregimiento de San Francisco, Distrito de Panamá." 
                              : mapOffset.y > -350 
                                ? "Corregimiento de Bella Vista, Distrito de Panamá." 
                                : "Corregimiento de Bella Vista, Ciudad de Panamá."}
                          </p>
                        </div>
                      </div>

                      {/* Confirm CTA Triggering standard autocompletes */}
                      <button
                        type="button"
                        onClick={() => {
                          setIsReverseGeocoding(true);
                          setTimeout(() => {
                            setIsReverseGeocoding(false);
                            // Set actual autocompleted fields dynamically
                            const locObj = mapOffset.x > -300 
                              ? {
                                  provincia: "Panamá",
                                  distrito: "Panamá",
                                  corregimiento: "San Francisco",
                                  calle: "Vía Israel, P.H. Multiplaza",
                                  edificioCasa: "Multiplaza Panamá",
                                  numero: "",
                                  otros: "Cerca de Felix B. Maduros"
                                }
                              : mapOffset.y > -350
                                ? {
                                    provincia: "Panamá",
                                    distrito: "Panamá",
                                    corregimiento: "Bella Vista",
                                    calle: "Avenida Balboa, Torre Banco",
                                    edificioCasa: "Torre Banco Center",
                                    numero: "",
                                    otros: "Frente a la Cinta Costera"
                                  }
                                : {
                                    provincia: "Panamá",
                                    distrito: "Panamá",
                                    corregimiento: "Bella Vista",
                                    calle: "Calle 50, Obarrio",
                                    edificioCasa: "Global Bank",
                                    numero: "",
                                    otros: "Frente a Soho Mall"
                                  };
                            
                            setAddressDetails(prev => ({
                              ...prev,
                              provincia: locObj.provincia,
                              distrito: locObj.distrito,
                              corregimiento: locObj.corregimiento,
                              calle: locObj.calle,
                              edificioCasa: locObj.edificioCasa,
                              otros: locObj.otros
                            }));
                            
                            setUseSavedAddress(false);
                            setIsMapSelected(true);
                            setFormErrors(prev => ({ ...prev, map: undefined }));
                            setShowMapModal(false);
                          }, 800);
                        }}
                        className="w-full h-12 rounded-xl bg-primary-yellow text-primary-black font-semibold text-sm active:scale-[0.98] transition-all cursor-pointer shadow-md border-none"
                      >
                        Confirmar esta ubicación
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Bottom Fixed Action - Standardized with Loading states */}
          <div 
            className="p-4 bg-white flex-shrink-0 flex items-center justify-center"
            style={{
              boxShadow: '0 10px 30px -5px rgba(0,0,0,0.08)',
              borderTop: '1px solid var(--gray-8)',
              zIndex: 40
            }}
          >
            <button 
              onClick={handleSave}
              disabled={isSubmitting || isMapLoading}
              className={`w-full h-11 flex items-center justify-center transition-transform hover:scale-[1.01] active:scale-[0.99] border-none ${
                isSubmitting ? "bg-gray-20 text-gray-400 cursor-not-allowed" : ""
              }`}
              style={{
                backgroundColor: isSubmitting ? "var(--gray-20)" : "var(--primary-yellow)",
                color: 'var(--primary-black)',
                boxShadow: '0 10px 30px -5px rgba(0,0,0,0.08)',
                borderRadius: '12px',
                fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif",
                fontSize: '14px',
                fontWeight: 'var(--font-weight-medium)',
                cursor: (isSubmitting || isMapLoading) ? 'not-allowed' : 'pointer'
              }}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin text-black" />
                  <span>Enviando reporte de reclamo...</span>
                </div>
              ) : currentStep === 3 ? (
                isFromWarranty ? "Enviar solicitud" : "Guardar producto"
              ) : (
                "Continuar"
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
