import { MessageCircle, Phone } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from "../ui/drawer";
import { STR } from "../../i18n/strings";

// Bottom sheet de contacto con MiPRO, compartido entre el detalle del
// servicio, el Home y la cancelación de solicitudes (servicios y garantía):
// canales reales (WhatsApp y teléfono), sin botones muertos. Quien lo abre
// decide el texto de apoyo, el link de WhatsApp (con o sin mensaje
// precompletado) y la etiqueta de la acción terciaria.
export function ContactarMiPRO({
  abierto,
  onCambio,
  descripcion,
  linkWhatsApp,
  textoCerrar,
}: {
  abierto: boolean;
  onCambio: (abierto: boolean) => void;
  descripcion?: string;
  /** Link de WhatsApp a usar; por defecto abre el chat sin mensaje. */
  linkWhatsApp?: string;
  /** Etiqueta de la acción terciaria que cierra el sheet (por defecto "Cerrar"). */
  textoCerrar?: string;
}) {
  const meta = { fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif" } as const;

  return (
    <Drawer open={abierto} onOpenChange={onCambio}>
      <DrawerContent
        style={{ backgroundColor: "var(--primary-white)", maxWidth: "393px", margin: "0 auto" }}
      >
        <div className="px-6 pt-2 pb-8">
          <DrawerTitle
            style={{
              fontFamily: "'Bebas Neue', Arial, sans-serif",
              fontSize: "20px",
              fontWeight: "var(--font-weight-normal)",
              letterSpacing: "1px",
              textTransform: "uppercase",
              color: "var(--primary-black)",
              margin: 0,
            }}
          >
            {STR.servicios.contactarCta}
          </DrawerTitle>
          <DrawerDescription style={{ ...meta, fontSize: "13px", lineHeight: "19px", color: "var(--gray-60)", margin: "4px 0 0" }}>
            {descripcion ?? STR.servicios.contactarDetalle}
          </DrawerDescription>
          <div className="flex flex-col gap-3 mt-4">
            <a
              href={linkWhatsApp ?? "https://wa.me/50769346656"}
              target="_blank"
              rel="noreferrer"
              className="w-full flex items-center justify-center gap-2 transition-transform hover:scale-[1.01] active:scale-[0.99]"
              style={{
                height: "48px",
                backgroundColor: "var(--primary-yellow)",
                borderRadius: "12px",
                ...meta,
                fontSize: "14px",
                fontWeight: "var(--font-weight-medium)",
                color: "var(--primary-black)",
                textDecoration: "none",
              }}
            >
              <MessageCircle size={18} strokeWidth={2} aria-hidden="true" />
              {STR.servicios.contactarWhatsApp}
            </a>
            <a
              href="tel:+5073021234"
              className="w-full flex items-center justify-center gap-2 border transition-all active:scale-[0.99]"
              style={{
                height: "48px",
                backgroundColor: "var(--primary-white)",
                borderColor: "var(--gray-20)",
                borderRadius: "12px",
                ...meta,
                fontSize: "14px",
                fontWeight: "var(--font-weight-medium)",
                color: "var(--primary-black)",
                textDecoration: "none",
              }}
            >
              <Phone size={18} strokeWidth={2} aria-hidden="true" />
              {STR.servicios.contactarLlamar}
            </a>
            <button
              onClick={() => onCambio(false)}
              className="w-full border-none"
              style={{
                minHeight: "44px",
                background: "none",
                ...meta,
                fontSize: "13px",
                fontWeight: "var(--font-weight-medium)",
                color: "var(--gray-60)",
                cursor: "pointer",
              }}
            >
              {textoCerrar ?? STR.servicios.contactarCerrar}
            </button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
