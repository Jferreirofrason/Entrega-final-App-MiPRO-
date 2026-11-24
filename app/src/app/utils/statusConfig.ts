import { Clock, CheckCircle, XCircle, AlertCircle, PlayCircle, PauseCircle, Calendar, RefreshCw, Inbox, LucideIcon } from "lucide-react";

export type AppStatus = "Coordinado" | "Agendado" | "En camino" | "En progreso" | "En pausa" | "Finalizado" | "Cancelado" | string;

export interface StatusConfig {
  bg: string;
  color: string;
  icon: LucideIcon;
}

export const getStatusConfig = (status: AppStatus): StatusConfig => {
  const s = status.toLowerCase();
  switch (s) {
    case 'pendiente sincronizar':
      return { bg: 'rgba(113, 113, 113, 0.1)', color: 'var(--gray-60)', icon: RefreshCw };
    case 'solicitud recibida':
      return { bg: 'rgba(51, 109, 208, 0.1)', color: 'var(--info-blue)', icon: Inbox };
    case 'coordinado':
    case 'visita coordinada': // vocabulario del Home
      return { bg: 'rgba(65, 65, 65, 0.1)', color: 'var(--gray-80)', icon: Calendar };
    case 'agendado':
      return { bg: 'rgba(51, 109, 208, 0.1)', color: 'var(--info-blue)', icon: Calendar };
    case 'en camino':
      return { bg: 'rgba(0, 0, 0, 0.08)', color: 'var(--primary-black)', icon: PlayCircle };
    case 'en progreso':
    case 'en proceso': // reclamos de garantía
    case 'reparando': // legacy fallback
      return { bg: 'rgba(255, 238, 0, 0.2)', color: '#8A7A00', icon: Clock };
    case 'necesitamos información': // reclamos: requiere acción del usuario
      return { bg: 'rgba(255, 238, 0, 0.2)', color: '#8A7A00', icon: AlertCircle };
    case 'no cubierto': // reclamos: resolución sin cobertura
      return { bg: 'rgba(226, 3, 77, 0.1)', color: 'var(--error-red)', icon: XCircle };
    case 'en pausa':
      return { bg: 'rgba(113, 113, 113, 0.1)', color: 'var(--gray-60)', icon: PauseCircle };
    case 'finalizado':
    case 'completado': // legacy fallback
      return { bg: 'rgba(88, 202, 138, 0.1)', color: 'var(--success-green)', icon: CheckCircle };
    case 'cancelado':
      return { bg: 'rgba(226, 3, 77, 0.1)', color: 'var(--error-red)', icon: XCircle };
    default:
      return { bg: 'rgba(113, 113, 113, 0.1)', color: 'var(--gray-60)', icon: AlertCircle };
  }
};
