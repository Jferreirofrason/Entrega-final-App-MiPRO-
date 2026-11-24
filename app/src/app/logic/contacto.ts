// Cancelación de una solicitud (servicio o garantía): la app NO cancela
// nada automáticamente. La acción secundaria abre WhatsApp con un mensaje
// precompletado; backoffice gestiona la cancelación manualmente.

const WHATSAPP_MIPRO = "50769346656";

export function linkWhatsAppCancelacion(nombreCliente: string, numeroCaso: string): string {
  const mensaje = `Hola, soy ${nombreCliente} y deseo cancelar la solicitud ${numeroCaso}.`;
  return `https://wa.me/${WHATSAPP_MIPRO}?text=${encodeURIComponent(mensaje)}`;
}
