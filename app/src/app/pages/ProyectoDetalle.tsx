import { useParams, useNavigate } from "react-router";
import { ArrowLeft, CalendarDays, Clock, User, MapPin, Phone, Wrench, CheckCircle2 } from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { projects } from "../data/projects";
import { getStatusConfig } from "../utils/statusConfig";

export function ProyectoDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const project = projects.find((p) => p.id === Number(id));

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-6 py-20">
        <p
          style={{
            fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif",
            fontSize: '14px',
            color: 'var(--gray-60)',
          }}
        >
          No encontramos este servicio.
        </p>
        <button
          onClick={() => navigate("/")}
          className="mt-4 px-4 py-2 transition-opacity hover:opacity-80"
          style={{
            backgroundColor: 'var(--primary-yellow)',
            borderRadius: 'var(--radius)',
            fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif",
            fontSize: '14px',
            fontWeight: 'var(--font-weight-medium)',
            color: 'var(--primary-black)',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Volver al inicio
        </button>
      </div>
    );
  }

  const getMilestoneIndex = (status: string) => {
    switch (status) {
      case "Coordinado": return 0;
      case "Agendado": return 1;
      case "En camino": return 2;
      case "En progreso": return 3;
      case "En pausa": return 3;
      case "Finalizado": return 4;
      case "Cancelado": return -1;
      default: return 0;
    }
  };

  const currentIndex = getMilestoneIndex(project.status);

  const milestones = [
    { label: "Coordinado", done: currentIndex >= 0 },
    { label: "Agendado", done: currentIndex >= 1 },
    { label: "En camino", done: currentIndex >= 2 },
    { label: "En progreso", done: currentIndex >= 3 },
    { label: "Finalizado", done: currentIndex >= 4 },
  ];

  return (
    <div className="flex flex-col min-h-full" style={{ backgroundColor: 'var(--primary-white)' }}>
      {/* Header without image */}
      <header 
        className="flex items-center gap-3 px-6 pt-[20px] pb-4 bg-white sticky top-0 z-20"
        style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}
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
              fontSize: '20px',
              fontWeight: 'var(--font-weight-normal)',
              letterSpacing: '1px',
              color: 'var(--primary-black)',
              margin: 0,
              textTransform: 'uppercase',
            }}
          >
            {project.title}
          </h1>
        </div>

        <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: getStatusConfig(project.status).bg }}>
          <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ backgroundColor: getStatusConfig(project.status).color }} />
          <span
            style={{
              fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif",
              fontSize: '11px',
              fontWeight: 'var(--font-weight-medium)',
              color: getStatusConfig(project.status).color,
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
          >
            {project.status}
          </span>
        </div>
      </header>

      {/* Content */}
      <div className="px-6 pt-6 flex flex-col gap-4 pb-8 overflow-y-auto">
        
        {/* 1. Detalles (Date, Time, Address, Profesional) */}
        <div
          style={{
            backgroundColor: 'var(--card)',
            border: '1px solid var(--gray-8)',
            borderRadius: '16px',
            boxShadow: 'var(--elevation-sm)',
            padding: '20px',
          }}
        >
          <h3
            style={{
              fontFamily: "'Bebas Neue', Arial, sans-serif",
              fontSize: '17px',
              fontWeight: 'var(--font-weight-normal)',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              color: '#000000',
              borderColor: '#000000',
              marginBottom: '16px',
            }}
          >
            Detalles de la cita
          </h3>
          <div className="flex flex-col gap-4">
            {/* Date */}
            <div className="flex items-center gap-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: 'var(--gray-3)', border: '1px solid var(--gray-8)' }}
              >
                <CalendarDays size={18} strokeWidth={2} color="var(--primary-black)" />
              </div>
              <div>
                <p
                  style={{
                    fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif",
                    fontSize: '14px',
                    fontWeight: 'var(--font-weight-medium)',
                    color: 'var(--foreground)',
                  }}
                >
                  {project.date}
                </p>
                <p
                  style={{
                    fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif",
                    fontSize: '12px',
                    color: 'var(--gray-60)',
                  }}
                >
                  Fecha programada
                </p>
              </div>
            </div>
            {/* Time */}
            <div className="flex items-center gap-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: 'var(--gray-3)', border: '1px solid var(--gray-8)' }}
              >
                <Clock size={18} strokeWidth={2} color="var(--primary-black)" />
              </div>
              <div>
                <p
                  style={{
                    fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif",
                    fontSize: '14px',
                    fontWeight: 'var(--font-weight-medium)',
                    color: 'var(--foreground)',
                  }}
                >
                  {project.time}
                </p>
                <p
                  style={{
                    fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif",
                    fontSize: '12px',
                    color: 'var(--gray-60)',
                  }}
                >
                  Hora de inicio
                </p>
              </div>
            </div>
            {/* Address */}
            <div className="flex items-center gap-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: 'var(--gray-3)', border: '1px solid var(--gray-8)' }}
              >
                <MapPin size={18} strokeWidth={2} color="var(--primary-black)" />
              </div>
              <div>
                <p
                  style={{
                    fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif",
                    fontSize: '14px',
                    fontWeight: 'var(--font-weight-medium)',
                    color: 'var(--foreground)',
                  }}
                >
                  {project.address}
                </p>
                <p
                  style={{
                    fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif",
                    fontSize: '12px',
                    color: 'var(--gray-60)',
                  }}
                >
                  Ubicación
                </p>
              </div>
            </div>
            {/* Profesional */}
            <div className="flex items-center gap-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: 'var(--gray-3)', border: '1px solid var(--gray-8)' }}
              >
                <User size={18} strokeWidth={2} color="var(--primary-black)" />
              </div>
              <div>
                <p
                  style={{
                    fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif",
                    fontSize: '14px',
                    fontWeight: 'var(--font-weight-medium)',
                    color: 'var(--foreground)',
                  }}
                >
                  {project.handyman}
                </p>
                <p
                  style={{
                    fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif",
                    fontSize: '12px',
                    color: 'var(--gray-60)',
                  }}
                >
                  Tu Profesional
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Detalle del servicio a realizar */}
        <div
          style={{
            backgroundColor: 'var(--card)',
            border: '1px solid var(--gray-8)',
            borderRadius: '16px',
            boxShadow: 'var(--elevation-sm)',
            padding: '20px',
          }}
        >
          <h3
            style={{
              fontFamily: "'Bebas Neue', Arial, sans-serif",
              fontSize: '18px',
              fontWeight: 'var(--font-weight-normal)',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              color: 'var(--primary-black)',
              marginBottom: '12px',
            }}
          >
            Detalles de servicio
          </h3>
          <p
            style={{
              fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif",
              fontSize: '14px',
              fontWeight: 'var(--font-weight-normal)',
              color: 'var(--foreground)',
              lineHeight: '1.6',
            }}
          >
            {project.requestedService}
          </p>
        </div>

        {/* 3. Etapas (Milestones) */}
        <div
          style={{
            backgroundColor: 'var(--card)',
            border: '1px solid var(--gray-8)',
            borderRadius: '16px',
            boxShadow: 'var(--elevation-sm)',
            padding: '20px',
          }}
        >
          <h3
            style={{
              fontFamily: "'Bebas Neue', Arial, sans-serif",
              fontSize: '18px',
              fontWeight: 'var(--font-weight-normal)',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              color: 'var(--primary-black)',
              marginBottom: '16px',
            }}
          >
            Etapas del servicio
          </h3>
          <div className="flex flex-col gap-0">
            {milestones.map((m, i) => (
              <div key={m.label} className="flex items-start gap-4">
                {/* Timeline line + dot */}
                <div className="flex flex-col items-center" style={{ width: '24px' }}>
                  <div
                    className="flex items-center justify-center flex-shrink-0"
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      backgroundColor: m.done ? 'var(--success-green)' : 'var(--gray-8)',
                      transition: 'background-color 0.3s ease',
                    }}
                  >
                    {m.done && <CheckCircle2 size={16} strokeWidth={2} color="var(--primary-white)" />}
                  </div>
                  {i < milestones.length - 1 && (
                    <div
                      style={{
                        width: '2px',
                        height: '28px',
                        backgroundColor: m.done ? 'var(--success-green)' : 'var(--gray-8)',
                        transition: 'background-color 0.3s ease',
                      }}
                    />
                  )}
                </div>
                <span
                  style={{
                    fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif",
                    fontSize: '14px',
                    fontWeight: m.done ? 'var(--font-weight-medium)' : 'var(--font-weight-normal)',
                    color: m.done ? 'var(--foreground)' : 'var(--gray-40)',
                    paddingTop: '2px',
                  }}
                >
                  {m.label}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}