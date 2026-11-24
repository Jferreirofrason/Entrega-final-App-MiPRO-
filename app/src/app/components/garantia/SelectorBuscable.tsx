import { useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "../ui/command";
import { estiloInput } from "./Campo";

// Selector predictivo: se escribe y la lista filtra en vivo. Mismo look que
// los inputs del flujo (design system: 44px, radius 8), así que en reposo no
// se distingue de un campo de texto.
//
// Cómo se abre la lista, que es lo que se rompía antes:
//
// - Abre hacia ABAJO si hay lugar y hacia ARRIBA si no lo hay. Eso lo
//   decide Radix con su detección de colisiones; lo que acá se define es
//   CONTRA QUÉ mide. El límite es el contenedor que scrollea del
//   formulario, no la ventana: así la lista nunca queda por debajo del
//   botón fijo ni detrás de la barra de navegación, que viven fuera de ese
//   contenedor.
// - La altura se acota a `--radix-popover-content-available-height`, el
//   espacio real que quedó de ese lado, y la lista scrollea por dentro. Sin
//   esto, una lista alta se daba vuelta hacia arriba aunque hubiera lugar
//   abajo, tapando los campos ya completados.
// - Si al campo le quedan menos de ESPACIO_MINIMO px por debajo, antes de
//   abrir se desplaza el formulario lo justo para que abrir hacia abajo
//   siga siendo posible. Recién cuando ni así entra, se da vuelta.
export function SelectorBuscable({
  id,
  value,
  onChange,
  opciones,
  placeholder,
  buscarPlaceholder,
  sinResultados,
  error,
}: {
  id: string;
  value: string;
  onChange: (valor: string) => void;
  opciones: readonly string[];
  placeholder: string;
  buscarPlaceholder: string;
  sinResultados: string;
  error?: boolean;
}) {
  const [abierto, setAbierto] = useState(false);
  const disparador = useRef<HTMLButtonElement>(null);
  const [limite, setLimite] = useState<HTMLElement | null>(null);
  const meta = { fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif" } as const;

  const ESPACIO_MINIMO = 220;

  function abrir(siguiente: boolean) {
    if (siguiente) {
      const boton = disparador.current;
      const contenedor = boton?.closest<HTMLElement>(".overflow-y-auto") ?? null;
      setLimite(contenedor);
      if (boton && contenedor) {
        const campo = boton.getBoundingClientRect();
        const marco = contenedor.getBoundingClientRect();
        const libreAbajo = marco.bottom - campo.bottom;
        const libreArriba = campo.top - marco.top;
        // Solo se desplaza si abajo falta lugar Y arriba tampoco sobra:
        // cuando arriba hay espacio de sobra, que se dé vuelta es la
        // respuesta correcta y mover el formulario sería peor.
        if (libreAbajo < ESPACIO_MINIMO && libreArriba < ESPACIO_MINIMO) {
          contenedor.scrollBy({ top: ESPACIO_MINIMO - libreAbajo, behavior: "smooth" });
        }
      }
    }
    setAbierto(siguiente);
  }

  return (
    <Popover open={abierto} onOpenChange={abrir}>
      <PopoverTrigger asChild>
        <button
          ref={disparador}
          id={id}
          type="button"
          className="flex items-center justify-between w-full"
          style={{ ...estiloInput(error), ...meta, fontSize: "14px", cursor: "pointer", textAlign: "left" }}
        >
          <span style={{ color: value ? "var(--foreground)" : "var(--gray-60)" }}>
            {value || placeholder}
          </span>
          <ChevronDown size={16} strokeWidth={2} color="var(--gray-60)" aria-hidden="true" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        side="bottom"
        sideOffset={4}
        collisionBoundary={limite}
        collisionPadding={8}
        className="p-0 border flex flex-col"
        style={{
          width: "var(--radix-popover-trigger-width)",
          maxHeight: "var(--radix-popover-content-available-height)",
          borderRadius: "8px",
          backgroundColor: "var(--primary-white)",
          borderColor: "var(--gray-20)",
          color: "var(--foreground)",
        }}
      >
        <Command
          className="flex flex-col min-h-0"
          style={{ backgroundColor: "var(--primary-white)", color: "var(--foreground)" }}
        >
          <CommandInput
            placeholder={buscarPlaceholder}
            className="text-current placeholder:text-[var(--gray-60)]"
            style={{ ...meta, fontSize: "14px", color: "var(--foreground)" }}
          />
          <CommandList className="max-h-none flex-1 min-h-0">
            <CommandEmpty style={{ ...meta, fontSize: "13px", color: "var(--gray-60)" }}>
              {sinResultados}
            </CommandEmpty>
            <CommandGroup>
              {opciones.map((opcion) => (
                <CommandItem
                  key={opcion}
                  value={opcion}
                  onSelect={() => {
                    onChange(opcion);
                    setAbierto(false);
                  }}
                  className="data-[selected=true]:!bg-[var(--gray-3)] data-[selected=true]:!text-[var(--primary-black)]"
                  style={{ ...meta, fontSize: "14px", color: "var(--foreground)" }}
                >
                  <Check
                    size={16}
                    strokeWidth={2.5}
                    aria-hidden="true"
                    style={{ opacity: value === opcion ? 1 : 0 }}
                  />
                  {opcion}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
