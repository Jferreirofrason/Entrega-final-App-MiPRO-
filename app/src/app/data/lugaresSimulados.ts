// Resultados de búsqueda SIMULADOS del prototipo, compartidos por toda
// pantalla de alta de dirección (agendamiento de servicio y garantía): al
// elegir uno, el mapa "confirma" la ubicación y autocompleta los campos de
// zona, que quedan editables. La búsqueda productiva depende de la
// integración de mapas (fuera de alcance).
import { DireccionNueva } from "../logic/solicitudServicio";

export interface LugarSimulado {
  id: string;
  titulo: string;
  detalle: string;
  datos: Partial<DireccionNueva>;
}

export const LUGARES_SIMULADOS: LugarSimulado[] = [
  {
    id: "costa-este",
    titulo: "Costa del Este",
    detalle: "Ciudad de Panamá, Panamá",
    datos: { provincia: "Panamá", distrito: "Panamá", corregimiento: "Juan Díaz", barrio: "Costa del Este" },
  },
  {
    id: "el-cangrejo",
    titulo: "El Cangrejo",
    detalle: "Ciudad de Panamá, Panamá",
    datos: { provincia: "Panamá", distrito: "Panamá", corregimiento: "Bella Vista", barrio: "El Cangrejo" },
  },
  {
    id: "brisas",
    titulo: "Brisas del Golf",
    detalle: "San Miguelito, Panamá",
    datos: { provincia: "Panamá", distrito: "San Miguelito", corregimiento: "Rufina Alfaro", barrio: "Brisas del Golf" },
  },
  {
    id: "coronado",
    titulo: "Coronado",
    detalle: "Chame, Panamá Oeste",
    datos: { provincia: "Panamá Oeste", distrito: "Chame", corregimiento: "Las Lajas", barrio: "Coronado" },
  },
];
