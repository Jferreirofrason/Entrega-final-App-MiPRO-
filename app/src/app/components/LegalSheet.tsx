import { X } from "lucide-react";

interface LegalSheetProps {
  isOpen: boolean;
  onClose: () => void;
  type: "terms" | "privacy";
}

export function LegalSheet({ isOpen, onClose, type }: LegalSheetProps) {
  if (!isOpen) return null;

  const isTerms = type === "terms";

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Sheet Content */}
      <div 
        className="relative z-10 w-full max-w-lg bg-white rounded-t-[24px] shadow-2xl flex flex-col max-h-[85vh] animate-in slide-in-from-bottom duration-300"
        style={{
          boxShadow: "0 -8px 30px rgba(0, 0, 0, 0.15)",
        }}
      >
        {/* Handle bar for bottom sheet look */}
        <div className="flex justify-center py-2 shrink-0">
          <div className="w-12 h-1.5 bg-gray-200 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-6 pb-4 pt-2 border-b border-gray-100 flex items-center justify-between shrink-0">
          <h3 
            className="font-bebas text-xl tracking-wide text-primary-black uppercase"
            style={{ fontFamily: "'Bebas Neue', Arial, sans-serif", fontSize: "22px" }}
          >
            {isTerms ? "Términos y Condiciones" : "Políticas de Privacidad"}
          </h3>
          <button 
            onClick={onClose}
            className="p-2 -mr-2 rounded-full hover:bg-gray-100 active:scale-95 transition-all cursor-pointer flex items-center justify-center border-none bg-transparent"
            aria-label="Cerrar modal"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="px-6 py-5 overflow-y-auto flex-1 text-gray-600 space-y-4">
          {isTerms ? (
            <div className="text-xs space-y-4 leading-relaxed font-sans" style={{ fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif" }}>
              <p className="font-bold text-sm text-primary-black">
                Última actualización: 11 de junio de 2026
              </p>
              <p>
                Bienvenido a <b>MiPRO</b>. Por favor, lea atentamente estos Términos y Condiciones de Uso antes de registrar su cuenta y utilizar nuestros servicios. Al registrarse, usted acepta y se obliga a cumplir con los presentes términos.
              </p>

              <div>
                <h4 className="font-bold text-primary-black uppercase text-xs tracking-wider mb-1">1. Objeto del Servicio</h4>
                <p>
                  MiPRO es una plataforma tecnológica desarrollada para brindar soporte, agilizar y gestionar la garantía de productos, así como conectar a usuarios con asesores técnicos y profesionales calificados autorizados en la República de Panamá.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-primary-black uppercase text-xs tracking-wider mb-1">2. Registro y Veracidad de Información</h4>
                <p>
                  Para acceder a los servicios, el usuario se compromete a proporcionar información verídica, exacta y actualizada durante el registro. El uso de identidades falsas, números de cédula correspondientes a terceros o pasaportes inválidos constituirá una infracción grave que resultará en la suspensión inmediata de la cuenta.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-primary-black uppercase text-xs tracking-wider mb-1">3. Políticas y Validación de la Garantía</h4>
                <p>
                  La gestión de la garantía de productos está sujeta a los términos específicos establecidos por el fabricante y distribuidor autorizado. La validación inicial del caso técnico se realizará en un plazo estimado de <b>24 a 48 horas hábiles</b> a partir del envío completo del reporte, incluyendo fotos y descripción del problema.
                </p>
                <p className="mt-2 text-primary-black font-semibold">
                  Importante: La garantía quedará sin efecto de forma inmediata si se determina que el equipo ha sido manipulado, desarmado o reparado por personal o talleres técnicos no autorizados por la marca.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-primary-black uppercase text-xs tracking-wider mb-1">4. Modificaciones en el Servicio</h4>
                <p>
                  MiPRO se reserva el derecho de modificar, actualizar o discontinuar bajo cualquier concepto, temporal o permanentemente, partes del servicio con o sin previo aviso, comprometiéndose a mantener el acceso a la información histórica de reportes de garantías ya ingresados en la plataforma.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-primary-black uppercase text-xs tracking-wider mb-1">5. Limitación de Responsabilidad</h4>
                <p>
                  Ni la plataforma ni sus empresas afiliadas o matrices serán responsables de daños indirectos, incidentales o derivados del mal uso de los productos por parte de los clientes, ni de atrasos originados por la falta de disponibilidad de repuestos por parte del fabricante.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-primary-black uppercase text-xs tracking-wider mb-1">6. Jurisdicción y Ley Aplicable</h4>
                <p>
                  Estos términos se regirán e interpretarán de conformidad con las leyes vigentes de la República de Panamá. Cualquier disputa será resuelta ante los tribunales competentes de la Ciudad de Panamá.
                </p>
              </div>
            </div>
          ) : (
            <div className="text-xs space-y-4 leading-relaxed font-sans" style={{ fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif" }}>
              <p className="font-bold text-sm text-primary-black">
                Última actualización: 11 de junio de 2026
              </p>
              <p>
                En <b>MiPRO</b> nos tomamos muy en serio la seguridad y confidencialidad de tus datos. Esta Política de Privacidad describe cómo recopilamos, utilizamos, almacenamos y protegemos la información personal que nos proporcionas al registrarte y utilizar nuestra plataforma.
              </p>

              <div>
                <h4 className="font-bold text-primary-black uppercase text-xs tracking-wider mb-1">1. Información que Recopilamos</h4>
                <p>
                  Al crear tu cuenta y utilizar nuestros servicios, recopilamos los siguientes datos personales:
                </p>
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li>Nombre completo y apellido.</li>
                  <li>Número de identificación nacional (Cédula de identidad personal) o número de Pasaporte.</li>
                  <li>Número de teléfono celular/móvil para contacto directo y alertas de garantía de servicios.</li>
                  <li>Dirección de correo electrónico.</li>
                  <li>Ubicación física o mapeo geográfico para la asignación y despacho de soporte a domicilio.</li>
                  <li>Fotografías, videos e información complementaria que adjuntes para reportar fallos de equipos.</li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-primary-black uppercase text-xs tracking-wider mb-1">2. Finalidad del Tratamiento de Datos</h4>
                <p>
                  Tus datos personales son procesados con los siguientes fines exclusivos:
                </p>
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li>Validar y procesar solicitudes de reclamos de garantía.</li>
                  <li>Coordinar visitas técnicas en tu domicilio, taller o local comercial.</li>
                  <li>Establecer comunicación vía llamadas directas, mensajes de texto o WhatsApp referentes al estatus de tu servicio.</li>
                  <li>Mejorar el rendimiento técnico de nuestros servicios posventa y de atención al cliente.</li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-primary-black uppercase text-xs tracking-wider mb-1">3. Protección y Confidencialidad</h4>
                <p>
                  MiPRO implementa estrictas medidas de seguridad administrativas, técnicas y físicas diseñadas para proteger sus datos personales contra destrucción, pérdida, alteración, acceso indebido o divulgación no autorizada. No compartimos, vendemos ni alquilamos su información personal a terceros con fines comerciales o de marketing sin su previo consentimiento explícito.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-primary-black uppercase text-xs tracking-wider mb-1">4. Transferencia de Datos a Proveedores</h4>
                <p>
                  Para la correcta resolución de tu garantía, es posible que sea necesario compartir los detalles técnicos del equipo junto con tus datos de contacto únicamente con los talleres autorizados de la marca oficial del fabricante en Panamá o las agencias de transporte asignadas para el retiro de los productos.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-primary-black uppercase text-xs tracking-wider mb-1">5. Derechos ARCO del Usuario</h4>
                <p>
                  Usted tiene derecho a <b>Acceder, Rectificar, Cancelar u Oponerse</b> al tratamiento de sus datos personales. Para ejercer cualquiera de estos derechos regulados por la legislación de la República de Panamá, puede ponerse en contacto con nuestro equipo de Soporte Técnico y Oficiales de Datos a través de los canales de atención al cliente provistos en nuestra plataforma.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="p-4 bg-gray-50 border-t border-gray-150 rounded-b-[24px] flex justify-end shrink-0">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-primary-black hover:bg-black text-white font-medium text-xs transition-all active:scale-[0.98] cursor-pointer border-none"
            style={{ fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif" }}
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}
