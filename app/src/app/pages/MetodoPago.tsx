import { useEffect, useRef, useState, type ReactNode } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Check, Pencil, Plus, Star, Trash2 } from "lucide-react";
import { STR } from "../i18n/strings";
import { buscarServicioCatalogo } from "../data/catalogo";
import { leerBorradorServicio, limpiarBorradorServicio } from "../data/borradorServicio";
import { buscarDireccion } from "../data/direcciones";
import { crearSolicitud } from "../data/solicitudes";
import {
  agregarTarjeta,
  editarTarjeta,
  eliminarTarjeta,
  marcarPredeterminada,
  tarjetasGuardadas,
} from "../data/mediosPago";
import { OTROS_MEDIOS } from "../data/mediosPago";
import type { MedioPago, MedioPagoTarjeta } from "../logic/pago";
import { tarjetaParaPreseleccionar, type DatosTarjetaNueva } from "../logic/tarjetas";
import {
  DEMORA_PROCESANDO_MS,
  confirmarPago,
  enmascararTarjeta,
  esTarjeta,
  hayImporteFinal,
  medioSeleccionable,
  montoAPagar,
  textoProcesando,
} from "../logic/pago";
import { etiquetaBloque } from "../logic/solicitudServicio";
import { formatearFecha } from "../logic/fechas";
import {
  ResumenDelServicio,
  type DatoSecundario,
} from "../components/pago/ResumenDelServicio";
import {
  ListaMediosPago,
  type MedioEnLista,
} from "../components/pago/ListaMediosPago";
import { CarruselTarjetas } from "../components/pago/CarruselTarjetas";
import { AccionHoja, HojaAcciones } from "../components/pago/HojaAcciones";
import { ModalEditarTarjeta } from "../components/pago/ModalEditarTarjeta";
import { ModalEliminarTarjeta } from "../components/pago/ModalEliminarTarjeta";
import { MarcaMedio } from "../components/pago/MarcaMedio";
import { ModalProcesando } from "../components/pago/ModalProcesando";
import { ModalTarjetaNueva } from "../components/pago/ModalTarjetaNueva";
import { AvisoBreve } from "../components/pago/AvisoBreve";
import { FilaCupon } from "../components/pago/FilaCupon";
import { ModalCupon } from "../components/pago/ModalCupon";
import { PanelTarjetaRegalo } from "../components/pago/PanelTarjetaRegalo";
import { BloqueFacturacion } from "../components/pago/BloqueFacturacion";
import { BloqueCondiciones } from "../components/pago/BloqueCondiciones";
import { ModalYappy } from "../components/pago/ModalYappy";
import { PantallaCmf, type EleccionCmf } from "../components/pago/PantallaCmf";
import { seOfreceCmf, type ElegibilidadCmf } from "../logic/cmf";
import { consultarElegibilidadCmf } from "../data/cmf";
import { VENTANA_DEMO_SEGUNDOS } from "../data/yappy";
import {
  crearSolicitud as crearSolicitudYappy,
  estaVencida,
  hayPendiente,
  puedeIniciar,
  segundosRestantes,
  type SolicitudYappy,
} from "../logic/yappy";
import { CUPONES_DEMO, DEMORA_VALIDACION_MS, REGALOS_DEMO } from "../data/beneficios";
import {
  buscarCupon,
  buscarRegalo,
  faltaParaConfirmar,
  regaloAlcanza,
  totalConDescuento,
  type EstadoCupon,
  type EstadoRegalo,
} from "../logic/beneficios";
import type { DireccionNueva } from "../logic/solicitudServicio";

// Pago de la reserva, entre "Revisa tu solicitud" y la confirmación.
//
// ⚠️ SIMULADO. No hay pasarela y no se cobra. El alta de una tarjeta pide
// datos pero no los guarda ni los tokeniza: de lo que se escribe sobreviven
// la marca, los cuatro últimos dígitos y el vencimiento, y el código de
// seguridad no se guarda nunca (ver logic/tarjetas.ts). Cuándo corresponde
// cobrar y cómo se nombra cada medio está en logic/pago.ts; acá solo está
// la pantalla.
//
// Dos decisiones distintas viven en esta pantalla y no se mezclan:
//   - el radio elige con qué se paga ESTA vez;
//   - "Usar como predeterminada" cambia la preferencia para los PRÓXIMOS
//     pagos, sin tocar la selección de ahora.
// Al abrir, se preselecciona la predeterminada si está vigente.
//
// Composición: el contenido va sobre gris claro y cada método es una tarjeta
// blanca, así la lista se lee como un conjunto de opciones y no como un
// formulario corrido. Tres zonas:
//
//   1. "Elige cómo pagar" y las tarjetas de método, que es la decisión.
//   2. Lo que todavía no está disponible, separado de lo elegible.
//   3. El servicio, con su fecha y su dirección, y el resto a un toque.
//
// El total no está en el cuerpo: vive UNA sola vez, en el pie fijo, pegado
// al botón, que es donde importa saber cuánto se está por pagar. Debajo del
// total se aclara que el precio incluye ITBMS, con el mismo texto que usan
// Configurar servicio y Resumen, así las tres pantallas no se contradicen.
//
// Solo se llega acá cuando la reserva tiene importe final. Si alguien entra
// por URL a un servicio que se cotiza, vuelve al resumen, que es su flujo.
export function MetodoPago() {
  const { id } = useParams();
  const navigate = useNavigate();
  const servicio = id ? buscarServicioCatalogo(id) : null;
  const borrador = id ? leerBorradorServicio(id) : null;

  // Las tarjetas viven en la sesión: agregar una o cambiar la preferencia
  // tiene que seguir valiendo al volver a esta pantalla.
  const [tarjetas, setTarjetas] = useState<MedioPagoTarjeta[]>(() => tarjetasGuardadas());
  // Arranca en la tarjeta predeterminada, si está vigente. Si no hay, queda
  // sin elegir y el botón espera.
  const [elegido, setElegido] = useState<MedioPago | null>(
    () => tarjetaParaPreseleccionar(tarjetasGuardadas(), new Date()),
  );
  const [procesando, setProcesando] = useState(false);
  const [altaAbierta, setAltaAbierta] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);
  // Administración de una tarjeta: el menú y sus dos ventanas.
  const [menuDe, setMenuDe] = useState<MedioPagoTarjeta | null>(null);
  const [editando, setEditando] = useState<MedioPagoTarjeta | null>(null);
  const [eliminando, setEliminando] = useState<MedioPagoTarjeta | null>(null);
  const enCurso = useRef(false);
  // El aviso breve se apoya arriba del pie: necesita saber cuánto mide.
  const pie = useRef<HTMLDivElement>(null);

  // ── Cupón ──
  // Vive en la pantalla y NO en el medio de pago: cambiar de medio no lo
  // pierde, que es lo que pide el flujo.
  const [cuponAbierto, setCuponAbierto] = useState(false);
  const [estadoCupon, setEstadoCupon] = useState<EstadoCupon>("vacio");
  const [cupon, setCupon] = useState<{ codigo: string; descuento: number } | null>(null);

  // ── Tarjeta de regalo ──
  const [codigoRegalo, setCodigoRegalo] = useState("");
  const [estadoRegalo, setEstadoRegalo] = useState<EstadoRegalo>("vacio");
  const [saldoRegalo, setSaldoRegalo] = useState<number | null>(null);

  // ── Facturación y condiciones ──
  // Por defecto se factura a la dirección del servicio, que es lo de
  // siempre. `facturacionOtra` es la casilla; `facturacion`, la dirección
  // cargada cuando la casilla está desmarcada.
  const [facturacionOtra, setFacturacionOtra] = useState(false);
  const [facturacion, setFacturacion] = useState<DireccionNueva | null>(null);
  const [condiciones, setCondiciones] = useState(false);
  // Se encienden recién cuando alguien intenta confirmar sin completar.
  const [mostrarFaltas, setMostrarFaltas] = useState(false);

  // ── Crédito CMF ──
  // La elección vive en la pantalla y guarda con qué importe se calculó: si
  // la compra cambia (un cupón, por ejemplo), el plan deja de valer y hay
  // que elegirlo de nuevo.
  const [cmf, setCmf] = useState<EleccionCmf | null>(null);
  const [pantallaCmf, setPantallaCmf] = useState(false);
  // ⚠️ La elegibilidad de Crédito CMF la informa el BACKEND. Mientras no
  // haya respuesta se arranca en "sin-respuesta", que NO es un sí: el medio
  // no se ofrece hasta que llegue la confirmación.
  const [elegibilidadCmf, setElegibilidadCmf] = useState<ElegibilidadCmf>("sin-respuesta");

  useEffect(() => {
    let vivo = true;
    consultarElegibilidadCmf().then((e) => {
      if (vivo) setElegibilidadCmf(e);
    });
    return () => {
      vivo = false;
    };
  }, []);

  // ── Yappy ──
  // La solicitud vive en la pantalla: cerrar el modal NO la cancela, y el
  // tiempo se cuenta contra su vencimiento, no contra una animación.
  const [yappy, setYappy] = useState<SolicitudYappy | null>(null);
  const [modalYappy, setModalYappy] = useState(false);
  const [ahora, setAhora] = useState(() => Date.now());

  // El reloj corre mientras haya una solicitud esperando, esté el modal
  // abierto o cerrado.
  useEffect(() => {
    if (!yappy || yappy.estado !== "esperando") return;
    const id = window.setInterval(() => setAhora(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [yappy]);

  // Se acabó la ventana: vence. Y vencer NO es aprobar.
  useEffect(() => {
    if (yappy && estaVencida(yappy, ahora)) {
      setYappy({ ...yappy, estado: "vencida" });
      setModalYappy(true);
    }
  }, [yappy, ahora]);

  // Después de tocar la lista, la tarjeta elegida se vuelve a leer de ahí:
  // el estado guarda una copia y quedaría vieja.
  const refrescar = (lista: MedioPagoTarjeta[]) => {
    setTarjetas(lista);
    setElegido((actual) =>
      actual && esTarjeta(actual) ? (lista.find((t) => t.id === actual.id) ?? null) : actual,
    );
  };

  // Cambia la preferencia, no la selección: si se estaba pagando con otra
  // tarjeta, se sigue pagando con esa.
  const usarComoPredeterminada = (idTarjeta: string) => {
    refrescar(marcarPredeterminada(idTarjeta));
    setMenuDe(null);
    setAviso(STR.pago.predeterminadaActualizada);
  };

  const guardarEdicion = (titular: string) => {
    if (!editando) return;
    refrescar(editarTarjeta(editando.id, titular));
    setEditando(null);
    setAviso(STR.pago.tarjetaActualizada);
  };

  // Eliminar no elige otra tarjeta por su cuenta: si la que se va era la
  // elegida para este pago, la selección queda vacía y el botón espera.
  const confirmarEliminar = () => {
    if (!eliminando) return;
    const lista = eliminarTarjeta(eliminando.id);
    setTarjetas(lista);
    if (elegido?.id === eliminando.id) setElegido(null);
    setEliminando(null);
    setAviso(STR.pago.tarjetaEliminada);
  };

  // El alta sí deja la tarjeta nueva elegida para este pago, y actualiza la
  // preferencia solo si se marcó la casilla.
  const guardarTarjetaNueva = (datos: DatosTarjetaNueva, predeterminada: boolean) => {
    const nueva = agregarTarjeta(datos, { predeterminada });
    setTarjetas(tarjetasGuardadas());
    setElegido(nueva);
    setAltaAbierta(false);
    setAviso(predeterminada ? STR.pago.predeterminadaActualizada : STR.pago.tarjetaAgregada);
  };

  const meta = { fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif" } as const;

  if (!servicio || !borrador) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-4 py-20">
        <p style={{ ...meta, fontSize: "14px", color: "var(--gray-60)" }}>
          {STR.agendar.noEncontrado}
        </p>
      </div>
    );
  }

  const monto = montoAPagar(servicio, borrador);
  if (!hayImporteFinal(servicio, borrador) || monto === null) {
    navigate(`/catalogo/${servicio.id}/resumen`, { replace: true });
    return null;
  }

  const direccion = borrador.direccionId ? buscarDireccion(borrador.direccionId) : null;
  const fechaTexto = borrador.fechaPreferida
    ? [
        formatearFecha(`${borrador.fechaPreferida}T12:00:00`),
        etiquetaBloque(borrador.bloque)?.toLowerCase(),
      ]
        .filter(Boolean)
        .join(", ")
    : null;

  // Lo que no entra en la tarjeta del resumen y se consulta en el detalle.
  // Son los mismos datos, con las mismas etiquetas, que ya muestra "Revisa
  // tu solicitud": acá no se agrega información nueva, solo se deja a mano
  // lo que la persona cargó.
  const secundarios: DatoSecundario[] = [];
  if (borrador.cantidad > 1) {
    secundarios.push({ etiqueta: STR.agendar.cantidad, valor: String(borrador.cantidad) });
  }
  if (borrador.incluyeDesinstalacion) {
    secundarios.push({
      etiqueta: STR.agendar.adicionales,
      valor: STR.agendar.desgloseDesinstalacion,
    });
  }
  if (borrador.contacto?.nombre) {
    secundarios.push({
      etiqueta: STR.agendar.recibe,
      valor: [borrador.contacto.nombre, borrador.contacto.telefono].filter(Boolean).join(", "),
    });
  }
  if (borrador.notas) {
    secundarios.push({ etiqueta: STR.agendar.notas, valor: borrador.notas });
  }
  if (borrador.fotos.length > 0) {
    secundarios.push({
      etiqueta: STR.agendar.fotos,
      valor: STR.agendar.fotosResumen(borrador.fotos.length),
    });
  }

  // ── Las cuentas del pie ──
  // El subtotal es el total del servicio; el descuento sale del cupón.
  const subtotal = monto;
  const descuento = cupon?.descuento ?? 0;
  const totalAPagar = totalConDescuento(subtotal, descuento);
  const formatearMonto = (valor: number) =>
    `$${Number.isInteger(valor) ? valor : valor.toFixed(2)}`;

  const esRegalo = elegido?.id === "tarjeta-regalo";
  const esCmf = elegido?.id === "credito-cmf";
  // Un plan calculado con otro importe no vale: hay que confirmarlo de nuevo.
  const planVigente = cmf !== null && cmf.montoCompra === totalAPagar;
  const facturacionCompleta = facturacionOtra ? facturacion !== null : direccion !== null;
  const faltas = faltaParaConfirmar({
    hayMedioElegido: elegido !== null,
    condicionesAceptadas: condiciones,
    facturacionCompleta,
    regalo: esRegalo ? { estado: estadoRegalo } : undefined,
    cmf: esCmf ? { planElegido: planVigente } : undefined,
  });
  const listoParaPagar = faltas.length === 0;

  // ⚠️ Validación de DEMOSTRACIÓN: compara contra la lista de códigos de
  // prueba y espera un rato para que se vea el estado. Cuando haya backend,
  // acá va su llamada (ver los ENDPOINT de logic/beneficios.ts).
  const aplicarCupon = (codigo: string) => {
    setEstadoCupon("validando");
    window.setTimeout(() => {
      const encontrado = buscarCupon(codigo, CUPONES_DEMO);
      if (!encontrado) {
        setEstadoCupon("invalido");
        return;
      }
      setCupon({ codigo: encontrado.codigo, descuento: encontrado.descuento });
      setEstadoCupon("aplicado");
      setCuponAbierto(false);
      setAviso(STR.pago.cuponAplicado(encontrado.codigo));
    }, DEMORA_VALIDACION_MS);
  };

  const quitarCupon = () => {
    setCupon(null);
    setEstadoCupon("vacio");
  };

  const validarRegalo = () => {
    setEstadoRegalo("validando");
    window.setTimeout(() => {
      const encontrado = buscarRegalo(codigoRegalo, REGALOS_DEMO);
      if (!encontrado) {
        setSaldoRegalo(null);
        setEstadoRegalo("invalida");
        return;
      }
      setSaldoRegalo(encontrado.saldo);
      // Sin pago combinado definido, un saldo que no alcanza no habilita
      // el pago: se dice y se espera la definición.
      setEstadoRegalo(regaloAlcanza(encontrado.saldo, totalAPagar) ? "valida" : "saldo-insuficiente");
    }, DEMORA_VALIDACION_MS);
  };

  const esYappy = elegido?.id === "yappy";

  // Crédito CMF entra SOLO con el sí del backend. Sin respuesta o con un no,
  // se va del selector y no queda ningún rastro: ni banner, ni enlace, ni
  // CTA para solicitarlo. El checkout no vende tarjetas de crédito.
  const otrosDisponibles = OTROS_MEDIOS.filter((m) =>
    m.tipo === "credito-cmf" ? seOfreceCmf(elegibilidadCmf) : true,
  );

  // Si el medio elegido deja de ofrecerse (la respuesta llegó y era que no),
  // no se queda elegido por inercia.
  useEffect(() => {
    if (elegido?.tipo === "credito-cmf" && !seOfreceCmf(elegibilidadCmf)) {
      setElegido(null);
      setCmf(null);
    }
  }, [elegibilidadCmf, elegido]);


  // Cobra y confirma la reserva. Para Yappy esto corre SOLO cuando llegó la
  // aprobación; para el resto, apenas se confirma.
  const cobrar = (medio: MedioPago) => {
    if (enCurso.current) return;
    enCurso.current = true;
    setProcesando(true);

    // Espera simulada. Cuando haya pasarela, acá va la llamada real y su
    // manejo de rechazos (ver RESULTADOS_PAGO en logic/pago.ts).
    window.setTimeout(() => {
      // Con CMF, el comprobante lleva la tarjeta y las cuotas: el nombre
      // del medio solo no alcanza para entender con qué se pagó.
      const detalle =
        medio.tipo === "credito-cmf" && cmf
          ? `${cmf.tarjeta.nombre} •••• ${cmf.tarjeta.ultimos} · ${STR.pago.cmfPlanElegido(
              cmf.plan.cuotas,
              formatearMonto(cmf.plan.montoCuota),
            )}`
          : undefined;
      const pago = confirmarPago(medio, totalAPagar, Date.now(), detalle);
      const solicitud = crearSolicitud(servicio.nombre, {
        condiciones: borrador.condiciones,
        incluyeDesinstalacion: borrador.incluyeDesinstalacion,
        cantidad: borrador.cantidad,
        totalEstimado: totalAPagar,
        direccionEtiqueta: direccion?.etiqueta,
        direccionTexto: direccion?.direccion,
        fechaPreferida: borrador.fechaPreferida,
        bloque: borrador.bloque,
        contactoNombre: borrador.contacto?.nombre,
        contactoTelefono: borrador.contacto?.telefono,
        notas: borrador.notas,
        cantidadFotos: borrador.fotos.length,
        pago,
      });
      limpiarBorradorServicio(servicio.id);
      navigate(`/pago-confirmado?id=${solicitud.id}`, { replace: true });
    }, DEMORA_PROCESANDO_MS);
  };

  const confirmar = () => {
    if (!listoParaPagar) {
      // El botón no se queda callado: marca los bloques que faltan y dice
      // cuál es el primero. Antes solo prendía las marcas, y si el bloque
      // quedaba fuera de la pantalla parecía que no pasaba nada.
      setMostrarFaltas(true);
      // Si lo que falta son las cuotas, se abre su pantalla: es más corto
      // que avisar y esperar a que la persona vuelva sola.
      if (faltas[0] === "cmf") {
        setPantallaCmf(true);
        return;
      }
      const texto =
        faltas[0] === "medio"
          ? STR.pago.faltaMedio
          : faltas[0] === "facturacion"
            ? // Con la casilla marcada, lo que falta es la dirección del
              // servicio: el aviso no puede mandar a completar facturación.
              facturacionOtra
              ? STR.pago.facturacionFalta
              : STR.pago.facturacionSinServicio
            : faltas[0] === "regalo"
              ? STR.pago.faltaRegalo
              : STR.pago.condicionesFalta;
      setAviso(texto);
      return;
    }
    if (!elegido) return;

    // Yappy no cobra en el momento: pide autorización y espera. Con una
    // solicitud ya esperando, el botón vuelve a abrir ESA, no pide otra.
    if (esYappy) {
      if (!puedeIniciar(yappy?.estado ?? "inactiva")) {
        setModalYappy(true);
        return;
      }
      setYappy(crearSolicitudYappy(Date.now(), VENTANA_DEMO_SEGUNDOS));
      setAhora(Date.now());
      setModalYappy(true);
      return;
    }

    cobrar(elegido);
  };

  // ⚠️ Solo demostración: sin integración, la aprobación no puede llegar de
  // ningún lado. Esto NO es "pasó el tiempo", es el aviso explícito.
  const yappyAprobado = () => {
    if (!elegido) return;
    setYappy((s) => (s ? { ...s, estado: "aprobada" } : s));
    setModalYappy(false);
    cobrar(elegido);
  };

  const yappyRechazado = () => {
    setYappy((s) => (s ? { ...s, estado: "rechazada" } : s));
  };

  const yappyReintentar = () => {
    setYappy(crearSolicitudYappy(Date.now(), VENTANA_DEMO_SEGUNDOS));
    setAhora(Date.now());
  };

  // Volver a elegir cómo pagar: se cierra la solicitud y se suelta el medio.
  const yappyOtroMetodo = () => {
    setYappy(null);
    setModalYappy(false);
    setElegido(null);
  };

  // Las tarjetas se muestran como tarjetas, en el carrusel. Las billeteras
  // y el financiamiento siguen siendo filas: no son un objeto que la
  // persona tenga guardado, son una forma de pagar.
  //
  // La selección es ÚNICA entre todo: elegir Yappy o CMF deselecciona la
  // tarjeta y al revés, porque es un solo `elegido` para toda la pantalla.
  const NOMBRES: Record<string, { principal: string; secundario: string }> = {
    yappy: { principal: STR.pago.yappyNombre, secundario: STR.pago.yappyDetalle },
    "credito-cmf": { principal: STR.pago.cmfNombre, secundario: STR.pago.cmfDetalle },
    "tarjeta-regalo": { principal: STR.pago.regaloNombre, secundario: STR.pago.regaloDetalle },
  };

  // Lo que el medio elegido necesita resolver abajo: las cuotas de CMF, la
  // solicitud de Yappy que quedó esperando, el código de la tarjeta de
  // regalo. Va debajo del medio elegido, no adentro de una lista, porque la
  // lista ahora vive en el selector.
  const panelDelMedio = (medio: MedioPago): ReactNode =>
      medio.tipo === "credito-cmf" && cmf ? (
        <div className="flex flex-col" style={{ gap: "2px" }}>
          <p
            style={{
              ...meta,
              fontSize: "13px",
              lineHeight: "18px",
              fontWeight: "var(--font-weight-medium)",
              color: "var(--primary-black)",
              margin: 0,
            }}
          >
            {`${cmf.tarjeta.nombre} •••• ${cmf.tarjeta.ultimos}`}
          </p>
          <p style={{ ...meta, fontSize: "13px", lineHeight: "18px", color: "var(--gray-60)", margin: 0 }}>
            {STR.pago.cmfPlanElegido(cmf.plan.cuotas, formatearMonto(cmf.plan.montoCuota))}
          </p>
          {/* Si el plan suma cargos, la compra y el total financiado no son
              lo mismo y se dicen los dos. */}
          {cmf.plan.conCargos && (
            <p style={{ ...meta, fontSize: "12px", lineHeight: "17px", color: "var(--gray-40)", margin: 0 }}>
              {STR.pago.cmfTotalFinanciado(
                formatearMonto(cmf.montoCompra),
                formatearMonto(cmf.plan.total),
              )}
            </p>
          )}
          {!planVigente && (
            <p
              role="alert"
              style={{ ...meta, fontSize: "12px", lineHeight: "17px", color: "var(--error-red)", margin: "2px 0 0" }}
            >
              {STR.pago.cmfImporteCambio}
            </p>
          )}
          <button
            type="button"
            onClick={() => setPantallaCmf(true)}
            className="self-start border-none bg-transparent px-0"
            style={{
              ...meta,
              fontSize: "13px",
              fontWeight: "var(--font-weight-medium)",
              color: "var(--info-blue)",
              minHeight: "36px",
              cursor: "pointer",
            }}
          >
            {STR.pago.cmfCambiar}
          </button>
        </div>
      ) : medio.tipo === "credito-cmf" ? (
        <button
          type="button"
          onClick={() => setPantallaCmf(true)}
          className="self-start border-none bg-transparent px-0"
          style={{
            ...meta,
            fontSize: "13px",
            fontWeight: "var(--font-weight-medium)",
            color: "var(--info-blue)",
            minHeight: "36px",
            cursor: "pointer",
          }}
        >
          {STR.pago.cmfElegirPlan}
        </button>
      ) : medio.tipo === "yappy" && hayPendiente(yappy?.estado ?? "inactiva") ? (
        // Cerrar el modal no cancela nada: desde acá se vuelve a consultar.
        <div className="flex flex-col" style={{ gap: "4px" }}>
          <p
            style={{ ...meta, fontSize: "13px", lineHeight: "18px", color: "var(--primary-black)", margin: 0 }}
          >
            {STR.pago.yappyPendiente}
          </p>
          <button
            type="button"
            onClick={() => setModalYappy(true)}
            className="self-start border-none bg-transparent px-0"
            style={{
              ...meta,
              fontSize: "13px",
              fontWeight: "var(--font-weight-medium)",
              color: "var(--info-blue)",
              minHeight: "36px",
              cursor: "pointer",
            }}
          >
            {STR.pago.yappyVerPendiente}
          </button>
        </div>
      ) : medio.tipo === "tarjeta-regalo" ? (
        <PanelTarjetaRegalo
          codigo={codigoRegalo}
          estado={estadoRegalo}
          saldo={saldoRegalo}
          total={totalAPagar}
          onCambiarCodigo={(c) => {
            setCodigoRegalo(c);
            if (estadoRegalo !== "vacio") setEstadoRegalo("vacio");
          }}
          onValidar={validarRegalo}
          onReiniciar={() => {
            setCodigoRegalo("");
            setSaldoRegalo(null);
            setEstadoRegalo("vacio");
          }}
          formatearMonto={formatearMonto}
        />
      ) : undefined;

  const enLista = (medio: MedioPago): MedioEnLista => ({
    id: medio.id,
    logo: <MarcaMedio medio={medio} ancho={40} />,
    principal: NOMBRES[medio.tipo]?.principal ?? "",
    secundario: NOMBRES[medio.tipo]?.secundario,
    discreto: medio.tipo === "credito-cmf" && !esTarjeta(medio) ? medio.nota : undefined,
    disponible: medioSeleccionable(medio),
    panel: panelDelMedio(medio),
  });

  // Encabezado de sección. La acción, cuando va, queda a la derecha del
  // título: administrar tus tarjetas es una cosa y elegir cómo pagar es
  // otra, y así no se confunde con un medio de pago más.
  const subtitulo = (texto: string, accion?: ReactNode) => (
    <div className="flex items-center justify-between gap-3" style={{ margin: "0 0 10px" }}>
      <h3
        style={{
          ...meta,
          fontSize: "13px",
          lineHeight: "18px",
          fontWeight: "var(--font-weight-medium)",
          color: "var(--gray-60)",
          margin: 0,
        }}
      >
        {texto}
      </h3>
      {accion}
    </div>
  );

  return (
    <div className="relative flex flex-col h-full" style={{ backgroundColor: "var(--primary-white)" }}>
      <header
        className="px-4 pt-[20px] pb-3 bg-white sticky top-0 z-20 flex-shrink-0"
        style={{ borderBottom: "1px solid var(--gray-8)" }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            aria-label={STR.pago.volver}
            disabled={procesando}
            className="w-11 h-11 rounded-[10px] flex items-center justify-center transition-opacity hover:opacity-80 border flex-shrink-0"
            style={{
              backgroundColor: "var(--primary-white)",
              borderColor: "var(--gray-20)",
              cursor: procesando ? "default" : "pointer",
            }}
          >
            <ArrowLeft size={20} strokeWidth={2} color="var(--primary-black)" aria-hidden="true" />
          </button>
          <h1
            className="truncate flex-1"
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
            {STR.pago.titulo}
          </h1>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 pt-5 pb-10">
        {/* Primero QUÉ se está pagando. La dirección de acá es la del
            servicio; la de facturación es otra cosa y vive más abajo. */}
        <div style={{ marginBottom: "24px" }}>
          <ResumenDelServicio
            servicio={servicio.nombre}
            fecha={fechaTexto}
            direccion={direccion?.direccion ?? null}
            secundarios={secundarios}
          />
        </div>

        <h2
          id="titulo-medios"
          style={{
            ...meta,
            fontSize: "17px",
            lineHeight: "22px",
            fontWeight: "var(--font-weight-semibold)",
            color: "var(--primary-black)",
            margin: "0 0 14px",
          }}
        >
          {STR.pago.eligeComoPagar}
        </h2>

        {/* La selección vive en la pantalla, no en una hoja: las tarjetas
            en su carrusel y las billeteras como filas, con un solo
            radiogroup para todo, así elegir una apaga la otra.

            La predeterminada viene elegida de entrada
            (tarjetaParaPreseleccionar), así que en la mayoría de los pagos
            no hay nada que tocar: la lista está a la vista para quien
            quiera cambiar, no para obligar a decidir. */}
        <div role="radiogroup" aria-labelledby="titulo-medios">
          {subtitulo(
            STR.pago.tusTarjetas,
            // ⚠️ El alta es de demostración y no guarda el número completo
            // ni el código de seguridad (ver ModalTarjetaNueva.tsx).
            <button
              type="button"
              onClick={() => setAltaAbierta(true)}
              className="flex shrink-0 items-center border-none bg-transparent px-0"
              style={{ gap: "4px", minHeight: "44px", cursor: "pointer" }}
            >
              <Plus size={16} strokeWidth={2.5} color="var(--info-blue)" aria-hidden="true" />
              <span
                style={{
                  ...meta,
                  fontSize: "13px",
                  lineHeight: "18px",
                  fontWeight: "var(--font-weight-medium)",
                  color: "var(--info-blue)",
                }}
              >
                {STR.pago.agregarCorto}
              </span>
            </button>,
          )}

          {tarjetas.length > 0 ? (
            <CarruselTarjetas
              tarjetas={tarjetas}
              elegidaId={elegido?.id ?? null}
              onElegir={setElegido}
              onAbrirMenu={setMenuDe}
            />
          ) : (
            // Sin tarjetas guardadas no queda un hueco: se dice qué falta y
            // el alta está justo arriba.
            <div
              style={{
                padding: "16px 14px",
                borderRadius: "16px",
                backgroundColor: "var(--gray-3)",
              }}
            >
              <p
                style={{
                  ...meta,
                  fontSize: "14px",
                  lineHeight: "20px",
                  fontWeight: "var(--font-weight-medium)",
                  color: "var(--primary-black)",
                  margin: 0,
                }}
              >
                {STR.pago.sinTarjetas}
              </p>
              <p
                style={{ ...meta, fontSize: "13px", lineHeight: "18px", color: "var(--gray-60)", margin: "2px 0 0" }}
              >
                {STR.pago.sinTarjetasAyuda}
              </p>
            </div>
          )}

          {/* Yappy, CMF y la tarjeta de regalo. Crédito CMF entra SOLO si el
              backend dice que está habilitado: con un no, o sin respuesta,
              el medio no aparece y tampoco hay banner para solicitarlo. */}
          <div style={{ marginTop: "24px" }}>
            {subtitulo(STR.pago.otrosMetodos)}
            <ListaMediosPago
              medios={otrosDisponibles.map(enLista)}
              elegidoId={elegido?.id ?? null}
              onElegir={(id) => {
                const medio = otrosDisponibles.find((m) => m.id === id);
                if (!medio) return;
                setElegido(medio);
                // Elegir CMF abre su flujo de financiación.
                if (medio.tipo === "credito-cmf" && !cmf) setPantallaCmf(true);
              }}
            />
          </div>
        </div>

        {/* El banner de la tarjeta digital CMF NO va en el checkout: si el
            backend dice que la persona tiene el crédito, el medio aparece en
            el selector y alcanza con eso; si dice que no, no se le ofrece
            solicitarla mientras está por pagar. El componente queda en
            components/pago/BloqueCmf.tsx para donde se decida ponerlo. */}

        {/* Cupón, facturación y condiciones: las tres cosas del checkout
            que no dependen del medio elegido. El cupón sobrevive a cambiar
            de medio porque vive en la pantalla. */}
        <div className="flex flex-col" style={{ gap: "12px", marginTop: "24px" }}>
          <FilaCupon
            codigo={cupon?.codigo ?? null}
            descuento={descuento}
            onAbrir={() => {
              setEstadoCupon("vacio");
              setCuponAbierto(true);
            }}
            onQuitar={quitarCupon}
            formatearMonto={formatearMonto}
          />

          <BloqueFacturacion
            direccionDelServicio={direccion?.direccion ?? null}
            onIrAlServicio={() => navigate(`/catalogo/${servicio.id}/direccion`)}
            usarOtra={facturacionOtra}
            onUsarOtra={setFacturacionOtra}
            facturacion={facturacion}
            onCambiarFacturacion={setFacturacion}
            mostrarFalta={mostrarFaltas}
          />

          <BloqueCondiciones
            aceptadas={condiciones}
            onCambiar={setCondiciones}
            mostrarFalta={mostrarFaltas}
          />
        </div>
      </div>

      {/* Pie fijo: cuánto se paga y el botón, juntos. */}
      <div
        ref={pie}
        className="px-4 pt-2.5 pb-3 bg-white flex-shrink-0"
        style={{ borderTop: "1px solid var(--gray-8)" }}
      >
        {/* Con cupón, el pie muestra la cuenta: subtotal, descuento y
            total. Sin cupón, solo el total. */}
        {cupon && (
          <div className="flex flex-col" style={{ gap: "2px", marginBottom: "6px" }}>
            <div className="flex items-baseline justify-between gap-3">
              <span style={{ ...meta, fontSize: "13px", lineHeight: "18px", color: "var(--gray-60)" }}>
                {STR.pago.subtotal}
              </span>
              <span style={{ ...meta, fontSize: "13px", lineHeight: "18px", color: "var(--gray-60)" }}>
                {formatearMonto(subtotal)}
              </span>
            </div>
            <div className="flex items-baseline justify-between gap-3">
              <span style={{ ...meta, fontSize: "13px", lineHeight: "18px", color: "var(--gray-60)" }}>
                {`${STR.pago.descuento} · ${cupon.codigo}`}
              </span>
              <span
                style={{
                  ...meta,
                  fontSize: "13px",
                  lineHeight: "18px",
                  fontWeight: "var(--font-weight-medium)",
                  color: "var(--success-green)",
                }}
              >
                {`-${formatearMonto(descuento)}`}
              </span>
            </div>
          </div>
        )}

        <div className="flex items-baseline justify-between gap-3" style={{ marginBottom: "2px" }}>
          <span style={{ ...meta, fontSize: "14px", lineHeight: "20px", color: "var(--gray-60)" }}>
            {STR.pago.totalEtiqueta}
          </span>
          <span
            style={{
              ...meta,
              fontSize: "22px",
              lineHeight: "1.1",
              fontWeight: 700,
              color: "var(--primary-black)",
            }}
          >
            {formatearMonto(totalAPagar)}
          </span>
        </div>
        {/* El mismo texto de Configurar servicio y Resumen. ⚠️ Sin
            porcentaje: el que corresponde a servicios está pendiente de
            validación, y acá no se calcula nada. */}
        <p
          style={{
            ...meta,
            fontSize: "12px",
            lineHeight: "16px",
            color: "var(--gray-60)",
            margin: "0 0 8px",
          }}
        >
          {STR.agendar.itbms}
        </p>
        <button
          onClick={confirmar}
          disabled={!elegido || procesando}
          className="w-full transition-transform hover:scale-[1.01] active:scale-[0.99] border-none"
          style={{
            height: "48px",
            backgroundColor: elegido ? "var(--primary-yellow)" : "var(--gray-8)",
            borderRadius: "12px",
            ...meta,
            fontSize: "16px",
            fontWeight: "var(--font-weight-medium)",
            color: elegido ? "var(--primary-black)" : "var(--gray-80)",
            cursor: elegido && !procesando ? "pointer" : "default",
          }}
        >
          {STR.pago.confirmar}
        </button>
      </div>

      {/* El menú de la tarjeta. Abrirlo no la elige ni cobra nada: las
          acciones de acá solo administran el medio guardado. */}
      <HojaAcciones
        abierto={menuDe !== null}
        onCerrar={() => setMenuDe(null)}
        titulo={menuDe ? `${menuDe.marca} ${enmascararTarjeta(menuDe.ultimos)}` : ""}
      >
        <AccionHoja
          icono={<Pencil size={18} strokeWidth={2} color="var(--primary-black)" aria-hidden="true" />}
          texto={STR.pago.editarTarjeta}
          onAccion={() => {
            setEditando(menuDe);
            setMenuDe(null);
          }}
        />
        {menuDe?.predeterminada ? (
          <AccionHoja
            icono={<Check size={18} strokeWidth={2} color="var(--gray-60)" aria-hidden="true" />}
            texto={STR.pago.yaEsPredeterminada}
            tono="estado"
          />
        ) : (
          <AccionHoja
            icono={<Star size={18} strokeWidth={2} color="var(--primary-black)" aria-hidden="true" />}
            texto={STR.pago.hacerPredeterminada}
            onAccion={() => menuDe && usarComoPredeterminada(menuDe.id)}
          />
        )}
        <AccionHoja
          icono={<Trash2 size={18} strokeWidth={2} color="var(--error-red)" aria-hidden="true" />}
          texto={STR.pago.eliminarTarjeta}
          tono="destructivo"
          onAccion={() => {
            setEliminando(menuDe);
            setMenuDe(null);
          }}
        />
      </HojaAcciones>

      <ModalEditarTarjeta
        tarjeta={editando}
        onCerrar={() => setEditando(null)}
        onGuardar={guardarEdicion}
        onAgregarOtra={() => {
          setEditando(null);
          setAltaAbierta(true);
        }}
      />

      <ModalEliminarTarjeta
        tarjeta={eliminando}
        eraLaElegida={elegido?.id === eliminando?.id}
        onCerrar={() => setEliminando(null)}
        onEliminar={confirmarEliminar}
      />

      {pantallaCmf && (
        <PantallaCmf
          montoCompra={totalAPagar}
          eleccionPrevia={cmf}
          onCerrar={() => setPantallaCmf(false)}
          onUsarPlan={(eleccion) => {
            // No paga: deja el plan elegido y vuelve al checkout.
            setCmf(eleccion);
            setPantallaCmf(false);
          }}
          onOtroMetodo={() => {
            setCmf(null);
            setPantallaCmf(false);
            setElegido(null);
          }}
          formatearMonto={formatearMonto}
          onEnlaceSinConfigurar={() => setAviso(STR.pago.cmfEnlaceSinConfigurar)}
        />
      )}

      <ModalYappy
        estado={modalYappy ? (yappy?.estado ?? "inactiva") : "inactiva"}
        segundos={yappy ? segundosRestantes(yappy.venceEn, ahora) : 0}
        onCerrar={() => setModalYappy(false)}
        onReintentar={yappyReintentar}
        onOtroMetodo={yappyOtroMetodo}
        onDemoAprobar={yappyAprobado}
        onDemoRechazar={yappyRechazado}
      />

      <ModalCupon
        abierto={cuponAbierto}
        estado={estadoCupon}
        onCerrar={() => setCuponAbierto(false)}
        onAplicar={aplicarCupon}
      />

      <ModalTarjetaNueva
        abierto={altaAbierta}
        onCerrar={() => setAltaAbierta(false)}
        onGuardar={guardarTarjetaNueva}
      />

      <AvisoBreve
        texto={aviso}
        onCerrar={() => setAviso(null)}
        offsetInferior={pie.current?.offsetHeight ?? 0}
      />

      <ModalProcesando
        abierto={procesando}
        texto={elegido ? textoProcesando(elegido.tipo) : STR.pago.procesandoTitulo}
      />
    </div>
  );
}
