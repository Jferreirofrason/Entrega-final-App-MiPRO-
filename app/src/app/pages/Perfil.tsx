import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Mail, Phone, ChevronRight, Settings, LogOut, X, Headphones, MessageSquare, User, ArrowLeft, CreditCard, Receipt, Trash2, ClipboardList, Package } from "lucide-react";
import { STR } from "../i18n/strings";
import { AvatarDePerfil } from "../components/perfil/AvatarDePerfil";
import { tarjetasGuardadas } from "../data/mediosPago";
import { cargarMisSolicitudes } from "../data/misSolicitudes";
import { cuantasAbiertas } from "../logic/misSolicitudes";
import { PRODUCTS_DB } from "../data/products";

export function Perfil() {
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const user = {
    name: "María González",
    email: "maria.gonzalez@email.com",
    phone: "+507 6123-4567",
    address: "Ciudad de México, CDMX",
  };

  // Cuántas tarjetas hay guardadas, para la segunda línea de la fila. Se
  // lee al entrar: si se borra una desde Métodos de pago, al volver el
  // número ya está al día.
  // Cuántas solicitudes hay abiertas, para la segunda línea del acceso. Se
  // consulta al entrar: es el mismo dato que muestra la lista, no otro.
  const [solicitudesAbiertas, setSolicitudesAbiertas] = useState<number | null>(null);
  const [hayCerradas, setHayCerradas] = useState(false);
  useEffect(() => {
    let vivo = true;
    cargarMisSolicitudes("ok", "ok")
      .then((lista) => {
        if (!vivo) return;
        setSolicitudesAbiertas(cuantasAbiertas(lista));
        setHayCerradas(lista.length > 0);
      })
      // Si falla, la fila igual sirve: se entra y la pantalla explica el
      // error. No se inventa un número.
      .catch(() => {
        if (vivo) setSolicitudesAbiertas(null);
      });
    return () => {
      vivo = false;
    };
  }, []);

  const resumenDeSolicitudes =
    solicitudesAbiertas === null
      ? undefined
      : solicitudesAbiertas === 0
        ? hayCerradas
          ? STR.perfil.misSolicitudesCerradas
          : STR.perfil.misSolicitudesNinguna
        : solicitudesAbiertas === 1
          ? STR.perfil.misSolicitudesUna
          : STR.perfil.misSolicitudesVarias(solicitudesAbiertas);

  // PRODUCTS_DB es un mapa por id, no una lista.
  const cuantosProductos = Object.keys(PRODUCTS_DB).length;
  const resumenDeProductos =
    cuantosProductos === 0
      ? STR.misProductos.accesoNinguno
      : cuantosProductos === 1
        ? STR.misProductos.accesoUno
        : STR.misProductos.accesoVarios(cuantosProductos);

  const cuantasTarjetas = tarjetasGuardadas().length;
  const resumenDeTarjetas =
    cuantasTarjetas === 0
      ? STR.perfil.metodosPagoNinguna
      : cuantasTarjetas === 1
        ? STR.perfil.metodosPagoUna
        : STR.perfil.metodosPagoVarias(cuantasTarjetas);

  const menuSections = [
    {
      // Mi actividad va primero: lo que más se consulta al entrar.
      title: STR.perfil.seccionActividad,
      items: [
        {
          icon: ClipboardList,
          label: STR.perfil.misSolicitudes,
          secundario: resumenDeSolicitudes,
          action: "historial",
          onClick: () => navigate("/historial"),
        },
        {
          icon: Package,
          // Ya NO abre una segunda lista: abre Mis productos recortado a lo
          // cargado a mano. Hay una sola lista de productos en la app.
          label: STR.misProductos.accesoManualTitulo,
          secundario: resumenDeProductos,
          action: "productos-a-mano",
          onClick: () => navigate("/mis-productos?origen=manual"),
        },
      ],
    },
    {
      title: "Cuenta",
      items: [
        { icon: Settings, label: "Configuración", action: "settings", onClick: () => navigate("/configuracion") },
      ],
    },
    {
      title: STR.perfil.seccionPagos,
      items: [
        {
          icon: CreditCard,
          label: STR.perfil.metodosPago,
          secundario: resumenDeTarjetas,
          action: "metodos-pago",
          onClick: () => navigate("/perfil/metodos-pago"),
        },
        {
          icon: Receipt,
          label: STR.perfil.historialPagos,
          secundario: STR.perfil.historialPagosDetalle,
          action: "historial-pagos",
          onClick: () => navigate("/perfil/historial-pagos"),
        },
      ],
    },
    {
      title: "Soporte",
      items: [
        { icon: Headphones, label: "Contactar a soporte", action: "support", onClick: () => navigate("/soporte") },
        { icon: MessageSquare, label: "Enviar sugerencia", action: "feedback", onClick: () => navigate("/sugerencias") },
      ],
    },
  ];

  const handleLogout = () => {
    setIsLoggingOut(true);
    setTimeout(() => {
      setIsLoggingOut(false);
      setShowLogoutModal(false);
      navigate("/welcome");
    }, 1000);
  };

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: 'var(--primary-white)' }}>
      {/* Title section */}
        <header 
          className="flex items-center gap-3 px-6 pt-[20px] pb-4 bg-white sticky top-0 z-20"
          style={{
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
          }}
        >
          <button aria-label="Volver"
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
                fontSize: '20px',
                fontWeight: 'var(--font-weight-normal)',
                letterSpacing: '1px',
                color: 'var(--primary-black)',
                margin: 0,
                textTransform: 'uppercase'
              }}
            >
              Mi Perfil
            </h1>
          </div>
        </header>

      {/* Profile Info */}
      <section className="px-6 pt-6 pb-6">
        {/* El avatar, arriba de todo: es lo primero que se reconoce de un
            perfil. Es la inicial sobre amarillo, no una foto: la app no
            pide ni guarda la foto de nadie. */}
        <div className="mb-4 flex justify-center">
          <AvatarDePerfil tamano={88} />
        </div>
        <div className="mb-4 flex flex-col items-center text-center">
          <h2
            style={{
              fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif",
              fontSize: '18px',
              fontWeight: 'var(--font-weight-medium)',
              color: 'var(--primary-black)',
              marginBottom: '4px',
            }}
          >
            {user.name}
          </h2>
          <div className="flex flex-col items-center gap-1">
            <p
              style={{
                fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif",
                fontSize: '13px',
                fontWeight: 'var(--font-weight-normal)',
                color: 'var(--gray-60)',
              }}
            >
              {user.email}
            </p>
            <p
              style={{
                fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif",
                fontSize: '13px',
                fontWeight: 'var(--font-weight-normal)',
                color: 'var(--gray-60)',
              }}
            >
              {user.phone}
            </p>
          </div>
        </div>
      </section>

      {/* Menu Sections */}
      <div className="px-6 pb-8">
        {menuSections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="mb-6">
            <h3
              className="mb-2"
              style={{
                fontFamily: "'Bebas Neue', Arial, sans-serif",
                fontSize: '18px',
                fontWeight: 'var(--font-weight-normal)',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                color: 'var(--primary-black)',
              }}
            >
              {section.title}
            </h3>
            <div 
              className="rounded-2xl overflow-hidden"
              style={{
                backgroundColor: 'var(--card)',
                border: '1px solid var(--gray-8)',
                boxShadow: 'var(--elevation-sm)',
              }}
            >
              {section.items.map((item, itemIndex) => (
                <button
                  key={itemIndex}
                  onClick={item.onClick}
                  className="w-full flex items-center justify-between px-4 py-3 transition-opacity hover:opacity-70"
                  style={{
                    minHeight: '56px',
                    borderBottom: itemIndex < section.items.length - 1 ? '1px solid var(--gray-8)' : 'none',
                    backgroundColor: 'transparent',
                    border: itemIndex < section.items.length - 1 ? undefined : 'none',
                    cursor: 'pointer',
                  }}
                >
                  <div className="flex items-center gap-3 min-w-0 text-left">
                    <item.icon size={20} strokeWidth={2} color="var(--primary-black)" className="flex-shrink-0" />
                    <div className="min-w-0">
                      <span
                        className="block"
                        style={{
                          fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif",
                          fontSize: '15px',
                          fontWeight: 'var(--font-weight-normal)',
                          color: 'var(--primary-black)',
                        }}
                      >
                        {item.label}
                      </span>
                      {/* Segunda línea, cuando la opción la tiene: dice en
                          qué estado está lo que hay del otro lado. */}
                      {'secundario' in item && item.secundario && (
                        <span
                          className="block"
                          style={{
                            fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif",
                            fontSize: '13px',
                            lineHeight: '18px',
                            color: 'var(--gray-60)',
                          }}
                        >
                          {item.secundario}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <ChevronRight size={20} strokeWidth={2} color="var(--gray-60)" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Eliminar cuenta: una fila aparte al final, en rojo, sin card
            de alerta. Lleva a su pantalla, donde se explica y se confirma;
            desde acá no se elimina nada. */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            backgroundColor: 'var(--card)',
            border: '1px solid var(--gray-8)',
            marginBottom: '16px',
          }}
        >
          <button
            onClick={() => navigate("/perfil/eliminar-cuenta")}
            className="w-full flex items-center justify-between px-4 py-3 transition-opacity hover:opacity-70"
            style={{ minHeight: '56px', backgroundColor: 'transparent', border: 'none', cursor: 'pointer' }}
          >
            <div className="flex items-center gap-3">
              <Trash2 size={20} strokeWidth={2} color="var(--error-red)" />
              <span
                style={{
                  fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif",
                  fontSize: '15px',
                  fontWeight: 'var(--font-weight-normal)',
                  color: 'var(--error-red)',
                }}
              >
                {STR.perfil.eliminarCuenta}
              </span>
            </div>
            <ChevronRight size={20} strokeWidth={2} color="var(--gray-60)" />
          </button>
        </div>

        {/* Logout Button */}
        <button
          onClick={() => setShowLogoutModal(true)}
          className="w-full flex items-center justify-center gap-2 rounded-xl transition-all hover:bg-gray-50 active:scale-[0.98]"
          style={{
            height: "48px",
            backgroundColor: "var(--primary-white)",
            border: "1px solid var(--gray-8)",
            cursor: "pointer",
            marginTop: "8px",
          }}
        >
          <LogOut size={18} strokeWidth={2} color="var(--error-red)" />
          <span
            style={{
              fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif",
              fontSize: "15px",
              fontWeight: "var(--font-weight-medium)" as any,
              color: "var(--error-red)",
            }}
          >
            Cerrar sesión
          </span>
        </button>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div
          className="absolute inset-0 flex items-end justify-center"
          style={{ zIndex: 50 }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
            onClick={() => !isLoggingOut && setShowLogoutModal(false)}
          />

          {/* Modal */}
          <div
            className="relative w-full"
            style={{
              maxWidth: '100%',
              backgroundColor: 'var(--primary-white)',
              borderRadius: '20px 20px 0 0',
              padding: '24px 24px 40px',
              animation: 'slideUp 0.3s ease-out',
            }}
          >
            {/* Drag handle */}
            <div className="flex justify-center" style={{ marginBottom: '16px' }}>
              <div
                style={{
                  width: '40px',
                  height: '4px',
                  borderRadius: '2px',
                  backgroundColor: 'var(--gray-20)',
                }}
              />
            </div>

            {/* Close button */}
            <button aria-label="Cerrar"
              onClick={() => !isLoggingOut && setShowLogoutModal(false)}
              className="absolute flex items-center justify-center"
              style={{
                top: '20px',
                right: '20px',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'var(--gray-8)',
                border: 'none',
                cursor: isLoggingOut ? 'default' : 'pointer',
                opacity: isLoggingOut ? 0.3 : 1,
              }}
            >
              <X size={16} strokeWidth={2} color="var(--primary-black)" />
            </button>

            {/* Icon */}
            <div className="flex justify-center" style={{ marginBottom: '16px' }}>
              <div
                className="flex items-center justify-center"
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(226, 3, 77, 0.08)',
                }}
              >
                <LogOut size={24} strokeWidth={2} color="var(--error-red)" />
              </div>
            </div>

            {/* Title */}
            <h2
              style={{
                fontFamily: "'Bebas Neue', Arial, sans-serif",
                fontSize: '24px',
                fontWeight: 'var(--font-weight-normal)',
                letterSpacing: '1px',
                color: 'var(--primary-black)',
                textAlign: 'center',
                textTransform: 'uppercase',
                margin: 0,
                marginBottom: '8px',
              }}
            >
              ¿Cerrar sesión?
            </h2>

            {/* Description */}
            <p
              style={{
                fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif",
                fontSize: '14px',
                fontWeight: 'var(--font-weight-normal)',
                color: 'var(--gray-60)',
                textAlign: 'center',
                lineHeight: '1.5',
                marginBottom: '28px',
              }}
            >
              Tendrás que iniciar sesión de nuevo para acceder a tu cuenta y tus citas.
            </p>

            {/* Buttons */}
            <div className="flex flex-col gap-3">
              {/* Cancel — primary yellow */}
              <button
                onClick={() => !isLoggingOut && setShowLogoutModal(false)}
                disabled={isLoggingOut}
                className="w-full flex items-center justify-center transition-opacity hover:opacity-90 active:scale-[0.98] disabled:opacity-30"
                style={{
                  height: "52px",
                  borderRadius: "var(--radius)",
                  backgroundColor: "var(--primary-yellow)",
                  border: "none",
                  cursor: isLoggingOut ? "default" : "pointer",
                }}
              >
                <span
                  style={{
                    fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif",
                    fontSize: "15px",
                    fontWeight: "var(--font-weight-medium)" as any,
                    color: "var(--primary-black)",
                  }}
                >
                  Cancelar
                </span>
              </button>

              {/* Confirm logout — black secondary */}
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="w-full flex items-center justify-center gap-2 transition-opacity hover:opacity-80 active:scale-[0.98] disabled:opacity-50"
                style={{
                  height: "52px",
                  borderRadius: "var(--radius)",
                  backgroundColor: "transparent",
                  border: "1px solid var(--gray-20)",
                  cursor: isLoggingOut ? "default" : "pointer",
                }}
              >
                <LogOut size={16} strokeWidth={2} color="var(--error-red)" />
                <span
                  style={{
                    fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif",
                    fontSize: "15px",
                    fontWeight: "var(--font-weight-medium)" as any,
                    color: "var(--error-red)",
                  }}
                >
                  {isLoggingOut ? "Cerrando sesión..." : "Sí, cerrar sesión"}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Animation keyframe via style tag */}
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
