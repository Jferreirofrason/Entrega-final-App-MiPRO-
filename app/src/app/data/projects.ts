export interface Project {
  id: number;
  title: string;
  status: "Coordinado" | "Agendado" | "En camino" | "En progreso" | "En pausa" | "Finalizado" | "Cancelado";
  progress: number;
  date: string;
  time: string;
  handyman: string;
  handymanPhone: string;
  image: string;
  address: string;
  category: string;
  requestedService: string;
  updates: { id: number; text: string; date: string; time: string }[];
  /**
   * Fecha de la visita en ISO 8601, para ordenar citas (campo aditivo).
   * `date`/`time` siguen siendo los textos visibles.
   */
  visitAt?: string;
  /**
   * PROPUESTA DE CONTRATO (gap): para una cita cancelada, el modelo actual no
   * permite saber si llegó a tener técnico asignado antes de cancelarse.
   * El backend debería enviar este booleano (o conservar el técnico en el
   * registro al cancelar). La UI ya lo consume si está presente.
   */
  tuvoTecnicoAsignado?: boolean;
}

export const projects: Project[] = [
  {
    id: 1,
    title: "Instalación de aire acondicionado",
    status: "En progreso",
    progress: 65,
    date: "Lun 10 Mar",
    time: "10:00 a. m.",
    visitAt: "2025-03-10T10:00:00",
    handyman: "Juan Pérez",
    handymanPhone: "+52 55 1234 5678",
    image: "https://images.unsplash.com/photo-1758448018619-4cbe2250b9ad?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBiYXRocm9vbSUyMHJlbm92YXRpb24lMjBtb2Rlcm4lMjBmaXh0dXJlc3xlbnwxfHx8fDE3NzMwODUxNTF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    address: "Av. Reforma 234, Col. Juárez",
    category: "Plomería",
    requestedService: "Renovación completa de baño principal, incluyendo reemplazo de tuberías, instalación de nuevos muebles y accesorios.",
    updates: [
      { id: 1, text: "Instalación de fixtures Kohler iniciada", date: "10 Mar", time: "10:30 a. m." },
      { id: 2, text: "Tubería principal reemplazada", date: "8 Mar", time: "3:00 p. m." },
      { id: 3, text: "Demolición completada", date: "5 Mar", time: "11:00 a. m." },
    ],
  },
  {
    id: 2,
    title: "Pintura interior",
    status: "En camino",
    progress: 30,
    date: "Hoy",
    time: "4:00 p. m.",
    visitAt: "2025-03-09T16:00:00",
    handyman: "Miguel Ángel Torres",
    handymanPhone: "+52 55 9876 5432",
    image: "https://images.unsplash.com/photo-1643804475756-ca849847c78a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob21lJTIwcGFpbnRpbmclMjBpbnRlcmlvciUyMHdhbGxzfGVufDF8fHx8MTc3MzA4NTc1OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    address: "Calle Durango 87, Col. Roma Norte",
    category: "Pintura",
    requestedService: "Pintura de paredes interiores en sala y comedor, aplicando dos capas de pintura vinílica lavable.",
    updates: [
      { id: 1, text: "Preparación de superficies completada", date: "9 Mar", time: "2:00 p. m." },
      { id: 2, text: "Materiales entregados en sitio", date: "7 Mar", time: "10:00 a. m." },
    ],
  },
  {
    id: 3,
    title: "Instalación eléctrica",
    status: "Agendado",
    progress: 0,
    date: "Mié 12 Mar",
    time: "2:30 p. m.",
    visitAt: "2025-03-12T14:30:00",
    handyman: "Carlos Rodríguez",
    handymanPhone: "+52 55 5555 1234",
    image: "https://images.unsplash.com/photo-1767514536570-83d70c024247?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVjdHJpY2FsJTIwaW5zdGFsbGF0aW9uJTIwd2lyaW5nJTIwaG9tZXxlbnwxfHx8fDE3NzMwODU3NTl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    address: "Av. Insurgentes Sur 1500, Col. Del Valle",
    category: "Electricidad",
    requestedService: "Revisión e instalación de cableado eléctrico para nuevo centro de entretenimiento y enchufes adicionales.",
    updates: [
      { id: 1, text: "Visita de diagnóstico agendada", date: "12 Mar", time: "2:30 p. m." },
    ],
  },
  {
    id: 4,
    title: "Remodelación de cocina",
    status: "En progreso",
    progress: 45,
    date: "Lun 10 Mar",
    time: "8:00 a. m.",
    visitAt: "2025-03-10T08:00:00",
    handyman: "Juan Pérez",
    handymanPhone: "+52 55 1234 5678",
    image: "https://images.unsplash.com/photo-1708915965975-2a950db0e215?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBraXRjaGVuJTIwcmVub3ZhdGlvbiUyMHByb2dyZXNzfGVufDF8fHx8MTc3MzA4NTc1OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    address: "Calle Ámsterdam 45, Col. Condesa",
    category: "Reparación",
    requestedService: "Cambio de gabinetes de cocina y reparación de superficie de granito dañada.",
    updates: [
      { id: 1, text: "Instalación de gabinetes en progreso", date: "10 Mar", time: "9:00 a. m." },
      { id: 2, text: "Countertops de granito cortados", date: "8 Mar", time: "1:00 p. m." },
    ],
  },
];
