// Cliente autenticado (mock).
//
// La app no persiste sesión: el login es simulado, así que esta es la única
// fuente del usuario "autenticado". Cuando exista un backend de auth, este
// módulo pasa a leer de esa sesión sin tocar a los consumidores.
// Nota: Perfil y Configuración todavía tienen su propia copia local de estos
// datos; migrarlos queda fuera del alcance de esta tarea.

export interface UsuarioAutenticado {
  firstName?: string;
  lastName?: string;
  telefono?: string;
  /** Foto de perfil (mock); si falta o falla, se muestra la inicial. */
}

export const CURRENT_USER: UsuarioAutenticado = {
  firstName: "María",
  lastName: "González",
  telefono: "+507 6000-0000",
};

/**
 * La cuenta NO tiene foto: el perfil se identifica con la inicial del
 * nombre sobre el amarillo de la marca. La regla de esa inicial vive en
 * `logic/perfil.ts`, con sus pruebas.
 */

/** Nombre para el saludo, o null si no está disponible (el saludo usa su fallback). */
export function nombreParaSaludo(usuario: UsuarioAutenticado): string | null {
  const nombre = usuario.firstName?.trim();
  return nombre ? nombre : null;
}
