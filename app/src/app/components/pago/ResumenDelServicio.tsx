import { useState } from "react";
import { CalendarDays, ChevronRight, MapPin } from "lucide-react";
import { STR } from "../../i18n/strings";
import { AyudaSheet } from "../garantia/AyudaSheet";

/** Un dato secundario de la solicitud, ya escrito por la pantalla. */
export interface DatoSecundario {
  etiqueta: string;
  valor: string;
}

// Resumen del servicio, arriba de la decisión de pago.
//
// Tres datos y nada más: qué servicio es, cuándo y dónde. El nombre del
// servicio es lo único en negrita; la fecha y la dirección van en peso
// regular, porque acá lo que se decide es con qué se paga.
//
// El encabezado es UNA sola acción: el nombre, "Ver detalle" y el chevron
// abren juntos el mismo detalle. Las dos filas de abajo son información, no
// controles.
//
// La dirección se muestra completa, con sus saltos: es el dato que más se
// corta en pantalla angosta y cortarlo obliga a abrir el detalle para leer
// algo que ya estaba.
//
// "Ver detalle" solo aparece si queda algo secundario que contar (cantidad,
// adicionales, quién recibe, notas, fotos). Sin eso, el encabezado es
// información y no un botón que no lleva a ninguna parte.
export function ResumenDelServicio({
  servicio,
  fecha,
  direccion,
  secundarios = [],
}: {
  servicio: string;
  /** Fecha con su franja, ya armada. */
  fecha?: string | null;
  /** Dirección completa, sin recortar. */
  direccion?: string | null;
  /** Lo que no entra en la tarjeta y se consulta en el detalle. */
  secundarios?: DatoSecundario[];
}) {
  const [abierto, setAbierto] = useState(false);
  const meta = { fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif" } as const;
  const hayDetalle = secundarios.length > 0;

  const rotulo = (texto: string) => (
    <span
      className="block"
      style={{ ...meta, fontSize: "12px", lineHeight: "16px", color: "var(--gray-60)" }}
    >
      {texto}
    </span>
  );

  const encabezado = (
    <>
      <span className="min-w-0 flex-1">
        {rotulo(STR.pago.resumenServicio)}
        <span
          className="block"
          style={{
            ...meta,
            fontSize: "16px",
            lineHeight: "22px",
            fontWeight: "var(--font-weight-semibold)",
            color: "var(--primary-black)",
            margin: "2px 0 0",
          }}
        >
          {servicio}
        </span>
        {hayDetalle && (
          <span
            className="block"
            style={{
              ...meta,
              fontSize: "13px",
              lineHeight: "18px",
              fontWeight: "var(--font-weight-medium)",
              color: "var(--info-blue)",
              margin: "4px 0 0",
            }}
          >
            {STR.pago.verDetalle}
          </span>
        )}
      </span>
      {hayDetalle && (
        <ChevronRight
          size={20}
          strokeWidth={2}
          color="var(--info-blue)"
          aria-hidden="true"
          style={{ flexShrink: 0, alignSelf: "center" }}
        />
      )}
    </>
  );

  // Una fila de dato: el ícono alineado con la primera línea, la etiqueta
  // arriba y el valor debajo.
  const fila = (Icono: typeof CalendarDays, etiqueta: string, valor: string) => (
    <div className="flex items-start" style={{ gap: "12px" }}>
      <Icono
        size={20}
        strokeWidth={2}
        color="var(--gray-40)"
        aria-hidden="true"
        style={{ flexShrink: 0, marginTop: "0px" }}
      />
      <div className="min-w-0 flex-1">
        {rotulo(etiqueta)}
        <span
          className="block"
          style={{
            ...meta,
            fontSize: "14px",
            lineHeight: "20px",
            color: "var(--primary-black)",
            margin: "2px 0 0",
          }}
        >
          {valor}
        </span>
      </div>
    </div>
  );

  return (
    <>
      <div
        style={{
          padding: "16px",
          borderRadius: "16px",
          backgroundColor: "var(--primary-white)",
          border: "1px solid var(--gray-20)",
        }}
      >
        {hayDetalle ? (
          <button
            type="button"
            onClick={() => setAbierto(true)}
            className="flex w-full items-start border-none bg-transparent p-0 text-left"
            style={{ gap: "12px", cursor: "pointer" }}
          >
            {encabezado}
          </button>
        ) : (
          <div className="flex items-start" style={{ gap: "12px" }}>
            {encabezado}
          </div>
        )}

        {(fecha || direccion) && (
          <>
            <div style={{ height: "1px", backgroundColor: "var(--gray-8)", margin: "16px 0" }} />
            <div className="flex flex-col" style={{ gap: "16px" }}>
              {fecha && fila(CalendarDays, STR.pago.resumenFecha, fecha)}
              {direccion && fila(MapPin, STR.pago.resumenDireccion, direccion)}
            </div>
          </>
        )}
      </div>

      {hayDetalle && (
        <AyudaSheet
          abierto={abierto}
          onCerrar={() => setAbierto(false)}
          titulo={STR.pago.detalleTituloSheet}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {secundarios.map((s) => (
              <div key={s.etiqueta}>
                {rotulo(s.etiqueta)}
                <p
                  style={{
                    ...meta,
                    fontSize: "14px",
                    lineHeight: "20px",
                    color: "var(--primary-black)",
                    margin: "2px 0 0",
                  }}
                >
                  {s.valor}
                </p>
              </div>
            ))}
          </div>
        </AyudaSheet>
      )}
    </>
  );
}
