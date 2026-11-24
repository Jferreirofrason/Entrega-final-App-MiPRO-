import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, MoreVertical, Pencil, Plus, Star, Trash2 } from "lucide-react";
import { STR } from "../i18n/strings";
import { AccionHoja, HojaAcciones } from "../components/pago/HojaAcciones";
import { AvisoBreve } from "../components/pago/AvisoBreve";
import { MarcaMedio } from "../components/pago/MarcaMedio";
import { ModalEditarTarjeta } from "../components/pago/ModalEditarTarjeta";
import { ModalEliminarTarjeta } from "../components/pago/ModalEliminarTarjeta";
import { ModalTarjetaNueva } from "../components/pago/ModalTarjetaNueva";
import {
  agregarTarjeta,
  editarTarjeta,
  eliminarTarjeta,
  marcarPredeterminada,
  tarjetasGuardadas,
} from "../data/mediosPago";
import { enmascararTarjeta, type MedioPagoTarjeta } from "../logic/pago";
import type { DatosTarjetaNueva } from "../logic/tarjetas";

// Las tarjetas guardadas, desde Perfil.
//
// Es la misma información que el checkout muestra en el carrusel, pero acá
// se administra en frío: no hay nada que pagar, así que no hay selección.
// Una tarjeta se puede volver predeterminada, editar y eliminar con
// confirmación. Editar es la MISMA ventana del checkout: lo único editable
// es el titular, porque el número y el vencimiento no se pueden revalidar
// sin pasarela. Cambiarlos es dar de alta la tarjeta otra vez, y eso lo
// ofrece el pie de esa misma ventana.
//
// Las filas van agrupadas en un solo bloque con separadores, no una tarjeta
// grande por medio: es una lista de datos guardados, no una vidriera.
//
// ⚠️ Las tarjetas viven en sessionStorage (data/mediosPago.ts). Nunca se
// guarda el número completo ni el código de seguridad: solo los cuatro
// últimos, la marca y el vencimiento.
export function MetodosPago() {
  const navigate = useNavigate();
  const [cargando, setCargando] = useState(true);
  const [tarjetas, setTarjetas] = useState<MedioPagoTarjeta[]>([]);
  const [menuDe, setMenuDe] = useState<MedioPagoTarjeta | null>(null);
  const [eliminando, setEliminando] = useState<MedioPagoTarjeta | null>(null);
  const [editando, setEditando] = useState<MedioPagoTarjeta | null>(null);
  const [altaAbierta, setAltaAbierta] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);

  const meta = { fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif" } as const;

  // La demora está para que el estado de carga exista de verdad: con
  // integración, acá va la llamada al endpoint.
  useEffect(() => {
    const id = window.setTimeout(() => {
      setTarjetas(tarjetasGuardadas());
      setCargando(false);
    }, 400);
    return () => window.clearTimeout(id);
  }, []);

  const usarComoPredeterminada = (id: string) => {
    setTarjetas(marcarPredeterminada(id));
    setMenuDe(null);
    setAviso(STR.metodosPago.predeterminadaLista);
  };

  const guardarEdicion = (titular: string) => {
    if (!editando) return;
    setTarjetas(editarTarjeta(editando.id, titular));
    setEditando(null);
    setAviso(STR.metodosPago.editada);
  };

  const confirmarEliminar = () => {
    if (!eliminando) return;
    setTarjetas(eliminarTarjeta(eliminando.id));
    setEliminando(null);
    setAviso(STR.metodosPago.eliminada);
  };

  const guardarTarjetaNueva = (datos: DatosTarjetaNueva, predeterminada: boolean) => {
    agregarTarjeta(datos, { predeterminada });
    // La lista se vuelve a leer: `agregarTarjeta` devuelve la tarjeta
    // guardada, no la lista, y una marca puede reemplazar a otra.
    setTarjetas(tarjetasGuardadas());
    setAltaAbierta(false);
    setAviso(STR.metodosPago.agregada);
  };

  const titulo = (texto: string) => (
    <h1
      className="truncate"
      style={{
        fontFamily: "'Bebas Neue', Arial, sans-serif",
        fontSize: "20px",
        fontWeight: "var(--font-weight-normal)",
        letterSpacing: "1px",
        color: "var(--primary-black)",
        margin: 0,
        textTransform: "uppercase",
      }}
    >
      {texto}
    </h1>
  );

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: "var(--primary-white)" }}>
      <header
        className="flex items-center gap-3 px-6 pt-[20px] pb-4 bg-white sticky top-0 z-20"
        style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}
      >
        <button
          aria-label={STR.metodosPago.volver}
          onClick={() => navigate("/perfil")}
          className="w-11 h-11 rounded-[10px] flex items-center justify-center transition-all hover:scale-105 active:scale-95 border flex-shrink-0"
          style={{
            backgroundColor: "var(--primary-white)",
            borderColor: "var(--gray-20)",
            cursor: "pointer",
          }}
        >
          <ArrowLeft size={20} strokeWidth={2.1} color="var(--primary-black)" />
        </button>
        <div className="flex-1 min-w-0">{titulo(STR.metodosPago.titulo)}</div>
      </header>

      <div className="flex-1 overflow-y-auto px-6 pt-5 pb-8">
        {cargando && (
          <p style={{ ...meta, fontSize: "14px", lineHeight: "20px", color: "var(--gray-60)", margin: 0 }}>
            {STR.metodosPago.cargando}
          </p>
        )}

        {/* Vacío: dice dónde se agrega una tarjeta de verdad, que es
            pagando un servicio, y además deja hacerlo desde acá. */}
        {!cargando && tarjetas.length === 0 && (
          <div
            className="flex flex-col"
            style={{
              gap: "6px",
              padding: "20px 18px",
              borderRadius: "16px",
              backgroundColor: "var(--gray-3)",
            }}
          >
            <p
              style={{
                ...meta,
                fontSize: "15px",
                lineHeight: "21px",
                fontWeight: "var(--font-weight-medium)",
                color: "var(--primary-black)",
                margin: 0,
              }}
            >
              {STR.metodosPago.vacioTitulo}
            </p>
            <p style={{ ...meta, fontSize: "14px", lineHeight: "20px", color: "var(--gray-60)", margin: 0 }}>
              {STR.metodosPago.vacioTexto}
            </p>
            <button
              type="button"
              onClick={() => setAltaAbierta(true)}
              className="self-start border-none bg-transparent px-0"
              style={{
                ...meta,
                fontSize: "14px",
                fontWeight: "var(--font-weight-medium)",
                color: "var(--info-blue)",
                minHeight: "44px",
                cursor: "pointer",
              }}
            >
              {STR.metodosPago.vacioAccion}
            </button>
          </div>
        )}

        {!cargando && tarjetas.length > 0 && (
          <div
            className="overflow-hidden"
            style={{ borderRadius: "16px", border: "1px solid var(--gray-8)" }}
          >
            {tarjetas.map((t, i) => {
              const nombre = `${t.marca} ${enmascararTarjeta(t.ultimos)}`;
              return (
                <div
                  key={t.id}
                  className="flex items-center"
                  style={{
                    gap: "12px",
                    // 56 px de piso, y crece si el banco necesita dos
                    // líneas en pantallas angostas.
                    minHeight: "56px",
                    padding: "12px 14px",
                    borderTop: i === 0 ? "none" : "1px solid var(--gray-8)",
                  }}
                >
                  <span
                    className="flex shrink-0 items-center justify-center"
                    style={{ width: "44px", height: "30px" }}
                  >
                    <MarcaMedio medio={t} ancho={t.marca === "Visa" ? 38 : 32} />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center" style={{ gap: "6px 8px" }}>
                      <span
                        style={{
                          ...meta,
                          fontSize: "15px",
                          lineHeight: "20px",
                          fontWeight: "var(--font-weight-medium)",
                          color: "var(--primary-black)",
                        }}
                      >
                        {nombre}
                      </span>
                      {t.predeterminada && (
                        <span
                          className="shrink-0"
                          style={{
                            ...meta,
                            fontSize: "11px",
                            lineHeight: "15px",
                            fontWeight: "var(--font-weight-medium)",
                            color: "var(--primary-black)",
                            backgroundColor: "var(--gray-8)",
                            borderRadius: "6px",
                            padding: "3px 8px",
                          }}
                        >
                          {STR.metodosPago.predeterminada}
                        </span>
                      )}
                    </span>
                    <span
                      className="block"
                      style={{ ...meta, fontSize: "13px", lineHeight: "18px", color: "var(--gray-60)" }}
                    >
                      {STR.pago.vence(t.vence)}
                    </span>
                    {/* El banco solo cuando la tarjeta lo trae: no se
                        deduce de la marca ni se reemplaza por el titular. */}
                    {t.banco && (
                      <span
                        className="block"
                        style={{ ...meta, fontSize: "13px", lineHeight: "18px", color: "var(--gray-60)" }}
                      >
                        {t.banco}
                      </span>
                    )}
                  </span>

                  <button
                    type="button"
                    onClick={() => setMenuDe(t)}
                    aria-label={STR.metodosPago.acciones(nombre)}
                    className="flex shrink-0 items-center justify-center border-none bg-transparent"
                    style={{ width: "44px", height: "44px", cursor: "pointer" }}
                  >
                    <MoreVertical size={18} strokeWidth={2} color="var(--gray-60)" aria-hidden="true" />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* El alta, como acción secundaria al final. Abre el mismo
            formulario del checkout, que guarda solo los cuatro últimos. */}
        {!cargando && tarjetas.length > 0 && (
          <button
            type="button"
            onClick={() => setAltaAbierta(true)}
            className="w-full flex items-center text-left"
            style={{
              gap: "12px",
              minHeight: "56px",
              marginTop: "12px",
              padding: "12px 14px",
              borderRadius: "16px",
              backgroundColor: "var(--primary-white)",
              border: "1px solid var(--gray-8)",
              cursor: "pointer",
            }}
          >
            <span
              className="flex shrink-0 items-center justify-center"
              style={{ width: "44px", height: "30px" }}
            >
              <Plus size={20} strokeWidth={2} color="var(--primary-black)" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <span
                className="block"
                style={{
                  ...meta,
                  fontSize: "15px",
                  lineHeight: "20px",
                  fontWeight: "var(--font-weight-medium)",
                  color: "var(--primary-black)",
                }}
              >
                {STR.metodosPago.agregar}
              </span>
              <span
                className="block"
                style={{ ...meta, fontSize: "13px", lineHeight: "18px", color: "var(--gray-60)" }}
              >
                {STR.metodosPago.agregarDetalle}
              </span>
            </span>
          </button>
        )}
      </div>

      <HojaAcciones
        abierto={menuDe !== null}
        onCerrar={() => setMenuDe(null)}
        titulo={menuDe ? `${menuDe.marca} ${enmascararTarjeta(menuDe.ultimos)}` : ""}
      >
        {/* "Establecer como predeterminada" solo si no lo es: una acción
            que no hace nada no se ofrece. */}
        {menuDe && !menuDe.predeterminada && (
          <AccionHoja
            icono={<Star size={18} strokeWidth={2} color="var(--primary-black)" aria-hidden="true" />}
            texto={STR.metodosPago.hacerPredeterminada}
            onAccion={() => usarComoPredeterminada(menuDe.id)}
          />
        )}
        {/* Editar va antes que eliminar: es lo que más se hace y lo menos
            grave. Abre la misma ventana que el checkout. */}
        <AccionHoja
          icono={<Pencil size={18} strokeWidth={2} color="var(--primary-black)" aria-hidden="true" />}
          texto={STR.metodosPago.editar}
          onAccion={() => {
            setEditando(menuDe);
            setMenuDe(null);
          }}
        />
        <AccionHoja
          icono={<Trash2 size={18} strokeWidth={2} color="var(--error-red)" aria-hidden="true" />}
          texto={STR.metodosPago.eliminar}
          tono="destructivo"
          onAccion={() => {
            setEliminando(menuDe);
            setMenuDe(null);
          }}
        />
      </HojaAcciones>

      {/* Editar: la MISMA ventana del checkout, no una copia. */}
      <ModalEditarTarjeta
        tarjeta={editando}
        onCerrar={() => setEditando(null)}
        onGuardar={guardarEdicion}
        onAgregarOtra={() => {
          setEditando(null);
          setAltaAbierta(true);
        }}
      />

      {/* Eliminar pide confirmación: no se borra con un toque. */}
      <ModalEliminarTarjeta
        tarjeta={eliminando}
        eraLaElegida={false}
        onCerrar={() => setEliminando(null)}
        onEliminar={confirmarEliminar}
        copia={{
          titulo: STR.metodosPago.eliminarTitulo,
          texto: STR.metodosPago.eliminarTexto,
        }}
      />

      <ModalTarjetaNueva
        abierto={altaAbierta}
        onCerrar={() => setAltaAbierta(false)}
        onGuardar={guardarTarjetaNueva}
      />

      {/* 64 px es el alto de la barra de pestañas: el aviso se apoya
          arriba de ella y no la tapa. */}
      <AvisoBreve texto={aviso} onCerrar={() => setAviso(null)} offsetInferior={64} />
    </div>
  );
}
